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
        
        // Passamos o ID do usuário
        req.usuarioId = decodificado.id; 
        
        // 🔥 A CORREÇÃO SALVADORA:
        // Passamos a permissão (role) adiante para que o middleware de Admin possa ler e liberar o acesso!
        // Deixei em duas variáveis comuns (role e usuarioRole) para garantir que o seu sistema encontre de qualquer jeito.
        req.role = decodificado.role;
        req.usuarioRole = decodificado.role;

        next(); // Chave perfeita! Acesso liberado!
    } catch (erro) {
        console.error("🕵️ ❌ ERRO FATAL:", erro.message);
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

module.exports = verificarToken;
