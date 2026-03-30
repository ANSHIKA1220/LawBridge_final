import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Indian Kanoon API Helper
const searchKanoon = async (query: string) => {
  try {
    // Using POST as GET often returns 405 for search endpoints in some API versions
    // or requires specific query params. POST is safer for search.
    const response = await axios.post("https://api.indiankanoon.org/search/", 
      `formInput=${encodeURIComponent(query)}&pagenum=0`, 
      {
        headers: {
          "Authorization": `Token ${process.env.KANOON_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
      }
    );
    return response.data.results?.slice(0, 3) || [];
  } catch (error) {
    console.error("Kanoon API Error:", error);
    return [];
  }
};

// Research Endpoint (Kanoon Proxy)
app.post("/api/research", async (req, res) => {
  const { query } = req.body;
  const cases = await searchKanoon(query);
  res.json({ cases: cases.map((c: any) => ({ title: c.title, url: `https://indiankanoon.org/doc/${c.tid}/`, snippet: c.headline })) });
});

// Mock Auth
app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  res.json({ user: { email, role, name: email.split("@")[0] }, token: "mock-jwt" });
});

// Vite Integration
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export default app;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Law Bridge Server running on http://localhost:${PORT}`);
  });
}
