FROM node:22.20.0-slim
WORKDIR /app

# Copier package.json d'abord (cache Docker)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copier le code
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]