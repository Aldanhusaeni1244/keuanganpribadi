const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Gagal mengambil data" });
  }
});

app.post("/api/transactions", async (req, res) => {
  const { category, description, amount, type } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO transactions (category, description, amount, type) VALUES ($1, $2, $3, $4) RETURNING *",
      [category, description, amount, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Gagal menambah transaksi" });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM transactions WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    res.json({ message: "Transaksi berhasil dihapus", deleted: result.rows[0] });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Gagal menghapus transaksi" });
  }
});

app.delete("/api/transactions", async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions");
    res.json({ message: "Semua transaksi berhasil direset" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Gagal reset transaksi" });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Server berjalan di http://localhost:" + PORT);
});
