const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

// Importa o banco de dados
const pool = require('./src/config/db');

// Importa os arquivos de rotas (Apenas uma vez e no caminho certo)
const authRoutes = require('./src/routes/authRoutes');
const motocicletasRoutes = require('./src/routes/motocicletasRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES GLOBAIS ---
app.use(cors()); 
app.use(express.json()); 

// --- VINCULAÇÃO DAS ROTAS ---
app.use('/auth', authRoutes);             
app.use('/motocicletas', motocicletasRoutes); 
// Abaixo da rota de motocicletas, adicione esta:
app.use('/manutencoes', require('./src/routes/manutencaoRoutes'));

app.get('/', (req, res) => {
    res.send('🏍️ API MotoTrack online e rodando perfeitamente!');
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log('==================================================');
    console.log(`[MotoTrack] Servidor ativo e rodando na porta ${PORT}`);
    console.log('==================================================');
});