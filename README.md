# RAG Document Assistant

A **fully local, private, and offline** Retrieval-Augmented Generation (RAG) assistant that lets you chat with your PDF course materials.

- **Embeddings**: Local via Transformers.js (`Xenova/all-MiniLM-L6-v2`)
- **Vector Database**: ChromaDB
- **LLM**: Local via Ollama (`llama3.2:latest` – 3B model, fast & capable)
- **Frontend**: Simple, elegant static web UI served from `public/`
- **No cloud dependencies** – everything runs on your machine
- **Storage usage**: ~8–9 GB total (after optimization)

Perfect for studying course notes, research papers, or any PDF documents privately.

## Features

- Drop PDFs in `documents/` → ingest them into the vector database
- Ask natural language questions about the content
- Get accurate, context-grounded answers powered by Llama 3.2
- Beautiful, responsive web interface with warm vintage-inspired colors
- Fully containerized with Docker Compose (one command to start)

## Prerequisites

- [Docker](https://www.docker.com/get-started/) (with Docker Compose)
- At least ~10 GB free disk space (for images, model, and data)

## Quick Start (Docker – Recommended)

1. **Clone or download** this project

2. **Place your PDFs** in the `documents/` folder

3. **Start everything** with one command:

```bash
docker compose up --build
```

   - First run will:
     - Download Ollama + Llama 3.2 model (~2 GB)
     - Download ChromaDB and Node.js images
     - Build your app image
   - Subsequent runs are much faster

4. Open your browser: **http://localhost:3000**

5. Click **"Ingest PDFs from /documents"** (only needed once or when you add new PDFs)

6. Start asking questions!

### Stop the app

```bash
docker compose down
```

### Full reset (delete ingested data and downloaded model)

```bash
docker compose down -v
```

## Manual Start (without Docker)

1. Start ChromaDB:

```bash
docker run -d --name chroma -p 8000:8000 -v chroma_data:/chroma/chroma chromadb/chroma:latest
```

2. Start Ollama (in a separate terminal):

```bash
ollama serve
```

3. Run the backend:

```bash
cd backend
npm install
node src/server.js
```

4. Open **http://localhost:3000**

## Project Structure

```
RAG-Document-Assistant/
├── public/                # Static frontend (index.html, css/style.css, js/index.js)
├── src/
│   ├── services/          # ingestionService.js & queryService.js
│   └── server.js          # Express server
├── documents/             # Put your PDFs here
├── index.js
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Customization

- **Change LLM**: Edit `src/services/queryService.js` → change `model: "llama3.2:latest"` to any model you have in Ollama (e.g., `llama3.2:1b`, `phi3:mini`, `gemma2:2b`)
- **Add more PDFs**: Drop them in `documents/` and click "Ingest PDFs" again
- **Change style**: Edit `public/css/style.css` (palette: #ece2d0, #d5b9b2, #cebebe, #a26769, #6d2e46)

## Storage Optimization Tips

- Your custom app image is now optimized (~1 GB after rebuild)
- Use `llama3.2:1b` instead of `llama3.2:latest` for lower storage (~1.3 GB model)
- Clean unused Docker data:

```bash
docker system prune -f
```

## Troubleshooting

- **First response slow?** Normal – embedding model and Ollama load once
- **No answer?** Make sure PDFs are ingested first
- **Port already in use?** Change ports in `docker-compose.yml`
- **Out of memory?** Try a smaller model like `llama3.2:1b`

## Credits

- LangChain.js
- Ollama
- ChromaDB
- Xenova/Transformers.js
