const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ==========================================
// ROTA DE CADASTRO (SIGNUP)
// ==========================================
const signup = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if (!senha) return res.status(400).json({ error: 'A senha é obrigatória.' });

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // ATENÇÃO: A coluna no banco é 'senha_hash', então o INSERT deve usar esse nome
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, role',
            [nome, email, senhaHash]
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: result.rows // Aceder ao primeiro elemento
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
        if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

        // Selecionamos a coluna correta 'senha_hash'
        const result = await pool.query('SELECT id, nome, email, senha_hash, role FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        // Corrigido: Pegar o primeiro item do array
        const user = result.rows; 
        
        // Comparar com a coluna correta
        const isMatch = await bcrypt.compare(senha, user.senha_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
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
