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
- Fully containerized with Docker Compose

## Prerequisites

- [Docker](https://www.docker.com/get-started/) (with Docker Compose)
- At least ~10 GB free disk space (for images, model, and data)

## Quick Start (Docker – Recommended)

1. Clone or download this project

2. Place your PDFs in the `documents/` folder

3. Start the services:

```bash
docker compose up --build -d
```

4. **Pull the LLM model** (required once):

```bash
docker compose exec ollama ollama pull llama3.2
```

   > This downloads the ~2 GB model and stores it persistently in the `ollama_data` volume.

5. Open your browser: **http://localhost:3000** (or the port you configured)

6. Click **"Ingest PDFs from /documents"** (only needed once or when adding new PDFs)

7. Start asking questions!

### Stop the app

```bash
docker compose down
```

### Full reset (delete ingested data and model)

```bash
docker compose down -v
```

## Manual Start (without Docker)

1. Start ChromaDB:

```bash
docker run -d --name chroma -p 8000:8000 -v chroma_data:/chroma/chroma chromadb/chroma:latest
```

2. Start Ollama:

```bash
ollama serve
```

   In another terminal, pull the model (once):

```bash
ollama pull llama3.2
```

3. Run the backend:

```bash
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
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Customization

- **Change LLM**: Edit `src/services/queryService.js` → change `model: "llama3.2:latest"` to any model you have pulled in Ollama (e.g., `llama3.2:1b`, `phi3:mini`, `gemma2:2b`)
- **Add more PDFs**: Drop them in `documents/` and click "Ingest PDFs" again
- **Change style**: Edit `public/css/style.css` (palette: #ece2d0, #d5b9b2, #cebebe, #a26769, #6d2e46)

## Storage Optimization Tips

- The app image is optimized (~1 GB after rebuild)
- Use `llama3.2:1b` instead of `llama3.2:latest` for lower storage (~1.3 GB model)
- Clean unused Docker data:

```bash
docker system prune -f
```

## Troubleshooting

- **First response slow?** Normal – embedding model and Ollama load once
- **No answer?** Make sure PDFs are ingested first and the model is pulled
- **Port already in use?** Change ports in `docker-compose.yml`
- **Out of memory?** Try a smaller model like `llama3.2:1b`

## Credits

- LangChain.js
- Ollama
- ChromaDB
- Xenova/Transformers.js
