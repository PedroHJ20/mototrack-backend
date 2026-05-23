const isAdmin = (req, res, next) => {
    // O req.user é preenchido pelo seu middleware de verificação de token JWT existente
    if (req.user && req.user.role === 'admin') {
        next(); // Usuário é Admin, permite prosseguir para a rota
    } else {
        return res.status(403).json({ message: "Acesso negado. Esta área é restrita para Administradores." });
    }
};

module.exports = { isAdmin };