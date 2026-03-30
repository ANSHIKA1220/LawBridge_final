import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Indian Kanoon API Helper
const searchKanoon = async (query: string) => {
  try {
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

export default app;
