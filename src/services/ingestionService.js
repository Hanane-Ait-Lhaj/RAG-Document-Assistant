import { Chroma } from '@langchain/community/vectorstores/chroma';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers';
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { ChromaClient } from 'chromadb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IngestionService {
    constructor() {
        this.embeddings = new HuggingFaceTransformersEmbeddings({
            model: 'Xenova/all-MiniLM-L6-v2',
        });
        this.vectorStore = null;
    }

    async ingestDocuments() {
        try {
            const docsPath = path.join(__dirname, '../../documents');
            console.log(`Looking for PDFs in: ${docsPath}`);

            if (!fs.existsSync(docsPath)) {
                throw new Error(`Documents directory not found at: ${docsPath}`);
            }

            const files = fs.readdirSync(docsPath).filter(f => f.toLowerCase().endsWith('.pdf'));
            console.log(`Found PDFs: ${files.join(', ') || 'none'}`);

            if (files.length === 0) {
                throw new Error('No PDF files found in documents folder');
            }

            let allDocuments = [];

            for (const file of files) {
                const filePath = path.join(docsPath, file);
                console.log(`Loading PDF: ${file}`);

                try {
                    const loader = new PDFLoader(filePath);
                    const docs = await loader.load();
                    allDocuments = allDocuments.concat(docs);
                    console.log(`Loaded ${docs.length} pages from ${file}`);
                } catch (error) {
                    console.error(`Error loading ${file}:`, error.message);
                }
            }

            if (allDocuments.length === 0) {
                throw new Error('No content loaded from any PDF');
            }

            const cleanedDocuments = this._cleanMetadata(allDocuments);

            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const splitDocs = await splitter.splitDocuments(cleanedDocuments);
            console.log(`Split into ${splitDocs.length} chunks`);

            const client = new ChromaClient({
                host: 'localhost',
                port: 8000
            });
            try {
                await client.deleteCollection({ name: 'course-documents' });
                console.log('Old collection deleted');
            } catch (e) {
                // Ignore if collection doesn't exist
            }

            this.vectorStore = await Chroma.fromDocuments(
                splitDocs,
                this.embeddings,
                {
                    collectionName: 'course-documents',
                    host: 'localhost',
                    port: 8000
                }
            );

            console.log(`✅ Successfully ingested ${splitDocs.length} chunks from ${files.length} PDFs into ChromaDB`);
            return true;
        } catch (error) {
            console.error('❌ Ingestion error:', error.message || error);
            throw error;
        }
    }

    _cleanMetadata(docs) {
        return docs.map(doc => {
            const cleanedMetadata = {};
            for (const [key, value] of Object.entries(doc.metadata || {})) {
                if (value === null ||
                    typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean') {
                    cleanedMetadata[key] = value;
                } else {
                    console.log(`Removing invalid metadata key: ${key} (type: ${typeof value})`);
                }
            }
            if (doc.metadata?.source) {
                cleanedMetadata.source = String(doc.metadata.source);
            }
            return {
                ...doc,
                metadata: cleanedMetadata
            };
        });
    }
}

export default new IngestionService();