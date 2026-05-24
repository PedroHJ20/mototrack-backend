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

        // A coluna no banco chama-se 'senha'
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, role',
            [nome, email, senhaHash]
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: result.rows
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
// ==========================================
// ROTA DE LOGIN (VERSÃO DIAGNÓSTICO)
// ==========================================
const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const user = result.rows;
        
        // LOG DIAGNÓSTICO: Isto vai mostrar exatamente o que existe dentro do objeto 'user'
        console.log("DEBUG: Objeto completo do usuário:", JSON.stringify(user));
        console.log("DEBUG: Chaves encontradas:", Object.keys(user));

        // Tentar aceder à senha de várias formas possíveis caso o nome da coluna esteja estranho
        const senhaDoBanco = user.senha || user.Senha || user.SENHA || user.password;
        
        if (!senhaDoBanco) {
            return res.status(500).json({ error: 'Erro: Não encontrei a coluna da senha no banco. Verifique os logs do Render.' });
        }

        const isMatch = await bcrypt.compare(senha, senhaDoBanco);

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
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};
