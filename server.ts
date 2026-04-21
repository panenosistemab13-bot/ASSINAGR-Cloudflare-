import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Database from 'better-sqlite3';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Implementando armazenamento simulando Cloudflare KV localmente com SQLite
// Em produção na Cloudflare, seria acessado via env.ASSINATURAS
const dbPath = path.join(__dirname, 'kv_store.sqlite');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS kv_assinaturas (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS maps (
    destination TEXT PRIMARY KEY,
    image_data TEXT
  );
`);

// API simulando acesso ao env.ASSINATURAS
const ASSINATURAS = {
  async get(key: string) {
    const row = db.prepare('SELECT value FROM kv_assinaturas WHERE key = ?').get(key) as { value: string } | undefined;
    return row ? JSON.parse(row.value) : null;
  },
  async put(key: string, value: string) {
    db.prepare('INSERT OR REPLACE INTO kv_assinaturas (key, value) VALUES (?, ?)').run(key, value);
  },
  async delete(key: string) {
    db.prepare('DELETE FROM kv_assinaturas WHERE key = ?').run(key);
  },
  async list() {
    const rows = db.prepare('SELECT value FROM kv_assinaturas ORDER BY created_at DESC').all() as { value: string }[];
    return rows.map(r => JSON.parse(r.value));
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/contracts", async (req, res) => {
    try {
      const contracts = await ASSINATURAS.list();
      res.json(contracts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    const { id, data } = req.body;
    try {
      const contract = {
        id,
        dados: data,
        signature: null,
        signed_at: null,
        created_at: new Date().toISOString(),
        onbase_status: false
      };
      await ASSINATURAS.put(id, JSON.stringify(contract));
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create contract" });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const contract = await ASSINATURAS.get(id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts/:id/sign", async (req, res) => {
    const { id } = req.params;
    const { signature } = req.body;
    try {
      const contract = await ASSINATURAS.get(id);
      if (contract) {
        contract.signature = signature;
        contract.signed_at = new Date().toISOString();
        await ASSINATURAS.put(id, JSON.stringify(contract));
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to sign contract" });
    }
  });

  app.post("/api/contracts/:id/onbase", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const contract = await ASSINATURAS.get(id);
      if (contract) {
        contract.onbase_status = status;
        await ASSINATURAS.put(id, JSON.stringify(contract));
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update onbase status" });
    }
  });

  app.delete("/api/contracts", async (req, res) => {
    try {
      db.prepare('DELETE FROM kv_assinaturas').run();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to clear contracts" });
    }
  });

  app.delete("/api/contracts/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await ASSINATURAS.delete(id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete contract" });
    }
  });

  // Map Images API (Simulated)
  app.get("/api/maps", async (req, res) => {
    try {
      const maps = db.prepare('SELECT * FROM maps').all();
      res.json(maps);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch maps" });
    }
  });

  app.post("/api/maps", async (req, res) => {
    const { destination, image_data } = req.body;
    try {
      db.prepare('INSERT OR REPLACE INTO maps (destination, image_data) VALUES (?, ?)').run(destination, image_data);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save map" });
    }
  });

  app.delete("/api/maps/:destination", async (req, res) => {
    const { destination } = req.params;
    try {
      db.prepare('DELETE FROM maps WHERE destination = ?').run(destination);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete map" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
