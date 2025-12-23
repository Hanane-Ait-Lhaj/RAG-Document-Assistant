import express from "express";
import cors from "cors";
import ingestionService from './services/ingestionService.js';
import queryService from './services/queryService.js';

export default class Server {
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.config();
    this.routes();
  }

  config() {
    this.app.use(express.static('public'));
    this.app.use(express.json());
    this.app.use(cors());
  }

  routes() {    
    this.app.post('/api/ingest', async (req, res) => {
      try {
        await ingestionService.ingestDocuments();
        res.json({ message: 'Documents ingested successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/query', async (req, res) => {
      try {
        const { question } = req.body;
        const answer = await queryService.query(question);
        res.json({ answer });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'OK' });
    });
  }

  start(callback) {
    if (callback == undefined) {
      callback = () => console.log(`Server running on port ${this.port}...`);
    }
    this.app.listen(this.port, callback);
  }
}