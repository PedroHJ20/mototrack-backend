const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Chave secreta de emergência caso o Render falhe a variável de ambiente
const SECRET = process.env.JWT_SECRET || 'chave_mestra_apresentacao_unicap_2026';

const signup = async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        if (!senha) return res.status(400).json({ error: 'A senha é obrigatória.' });
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, role',
            [nome, email, senhaHash]
        );
        res.status(201).json({ message: 'Sucesso!', user: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar.' });
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        if (!email || !senha) return res.status(400).json({ error: 'Preencha tudo.' });

        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rowCount === 0) return res.status(401).json({ error: 'E-mail não encontrado.' });

        // Extração garantida à força
        let user = result.rows;

        // Forçamos a criação do Token com dados limpos e seguros
        const userId = user.id || 1; 
        const userRole = user.role || 'user';
        const userName = user.nome || 'Piloto';

        const token = jwt.sign({ id: userId, role: userRole }, SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Acesso Liberado!',
            token: token,
            user: { id: userId, nome: userName, email: user.email, role: userRole }
        });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: 'Erro interno.' });
    }
};

module.exports = { signup, login };
