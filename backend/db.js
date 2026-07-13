const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err) => {
  if (err) {
    console.error("❌ Gagal koneksi ke Neon:", err.message);
  } else {
    console.log("✅ Berhasil koneksi ke Neon Database");
  }
});

module.exports = pool;
