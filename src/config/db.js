const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Diminuí o tempo para 5 segundos. Se não responder rápido, ele quebra e avisa!
  connectionTimeoutMillis: 5000, 
});

// --- TESTE DE CONEXÃO IMEDIATO ---
console.log("⏳ Tentando acordar o banco de dados NeonDB...");

pool.connect((err, client, release) => {
  if (err) {
    console.error('\n❌ ERRO FATAL: O Back-end não conseguiu se conectar ao NeonDB!');
    console.error('Motivo do bloqueio:', err.message, '\n');
  } else {
    console.log('✅ SUCESSO! Banco de Dados acordado e conectado perfeitamente.\n');
    release(); // Libera a conexão de teste
  }
});

module.exports = pool;