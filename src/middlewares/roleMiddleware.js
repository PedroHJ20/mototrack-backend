const isAdmin = (req, res, next) => {
    // Agora ele verifica req.role ou req.usuarioRole, que foi o que definimos no authMiddleware
    if (req.role === 'admin' || req.usuarioRole === 'admin') {
        next(); // Usuário é Admin, permite prosseguir para a rota
    } else {
        return res.status(403).json({ message: "Acesso negado. Esta área é restrita para Administradores." });
    }
};

module.exports = { isAdmin };
