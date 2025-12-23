import { Chroma } from '@langchain/community/vectorstores/chroma';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers';
import { Ollama } from "@langchain/ollama";
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CHROMA_HOST, CHROMA_PORT } from '../config/config.js';

class QueryService {
    constructor() {
        this.embeddings = new HuggingFaceTransformersEmbeddings({
            model: 'Xenova/all-MiniLM-L6-v2'
        });

        // Local Ollama LLM
        this.llm = new Ollama({
            model: "llama3.2",
            temperature: 0.7
            // baseUrl: "http://localhost:11434"  // default, only change if Ollama runs elsewhere
        });

        this.vectorStore = null;
        this.retrievalChain = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            console.log('Initializing query service...');
            this.vectorStore = await Chroma.fromExistingCollection(
                this.embeddings,
                {
                    collectionName: 'course-documents',
                    host: CHROMA_HOST,
                    port: CHROMA_PORT
                }
            );

            const prompt = ChatPromptTemplate.fromTemplate(
                `Use the following context to answer the user's question. If you don't know the answer, just say you don't know.
        
        Context: {context}
        
        Question: {input}`
            );

            const combineDocsChain = await createStuffDocumentsChain({
                llm: this.llm,
                prompt,
            });

            const retriever = this.vectorStore.asRetriever({ k: 6 });

            this.retrievalChain = await createRetrievalChain({
                combineDocsChain,
                retriever,
            });

            this.initialized = true;
            console.log(' Query service initialized successfully');
        } catch (error) {
            console.error(' Error initializing query service:', error);
            throw new Error('Failed to initialize. Make sure Chroma and Ollama are running.');
        }
    }

    async query(question) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            console.log(`Querying: "${question}"`);
            const response = await this.retrievalChain.invoke({ input: question });
            console.log(`Response: ${response.answer.substring(0, 100)}...`);
            return response.answer;
        } catch (error) {
            console.error('Query error:', error);
            return 'Sorry, I encountered an error processing your question.';
        }
    }
}

export default new QueryService();