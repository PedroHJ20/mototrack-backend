const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ==========================================
// ROTA DE CADASTRO (SIGNUP)
// ==========================================
const signup = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, role',
            [nome, email, senhaHash]
        );

        // Pegando o primeiro (e único) usuário criado da lista
        const newUser = result.rows;

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: newUser
        });

    } catch (error) {
        console.error("Erro no cadastro:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }
        res.status(500).json({ error: 'Erro interno no servidor ao cadastrar.' });
    }
};


// ==========================================
// ROTA DE LOGIN
// ==========================================
const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        // Pegando o usuário na posição 0 da lista
        const user = result.rows;

        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role 
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: 'Erro interno no servidor ao fazer login.' });
    }
};

module.exports = {
    signup,
    login
};
