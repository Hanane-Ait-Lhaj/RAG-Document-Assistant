#!/bin/bash

# Start Ollama in background
echo "Starting Ollama..."
ollama serve &

# Start Chroma container in detached mode (only if not already running)
echo "Starting Chroma ..."
docker start chroma 2>/dev/null || \
docker run -d --name chroma -p 8000:8000 -v chroma_data:/chroma/chroma chromadb/chroma:latest

# Start the app
echo "Starting Node.Js server..."
npm install
node index.js