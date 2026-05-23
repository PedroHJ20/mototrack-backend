const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
    let tokenHeader = req.headers['authorization'];
    
    if (!tokenHeader) {
        return res.status(403).json({ erro: 'Nenhum token fornecido.' });
    }

    // 🔥 O ESMAGADOR DE ESPAÇOS:
    // Transforma em texto absoluto, arranca a palavra "Bearer" e destrói 
    // qualquer espaço invisível, tabulação ou quebra de linha com o .trim()
    const tokenLimpo = String(tokenHeader).replace(/Bearer/i, '').trim();

    if (!tokenLimpo || tokenLimpo === 'undefined' || tokenLimpo === 'null') {
        return res.status(401).json({ erro: 'Token vazio após a limpeza.' });
    }

    try {
        const decodificado = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        
        req.usuarioId = decodificado.id; 
        next(); // Chave perfeita! Acesso liberado para a garagem!
    } catch (erro) {
        console.error("🕵️ ❌ ERRO FATAL:", erro.message);
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

module.exports = verificarToken;