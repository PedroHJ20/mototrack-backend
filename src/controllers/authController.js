const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ==========================================
// ROTA DE CADASTRO
// ==========================================
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

        res.status(201).json({ message: 'Usuário criado com sucesso!', user: result.rows });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        if (error.code === '23505') return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        res.status(500).json({ error: 'Erro interno no servidor ao cadastrar.' });
    }
};

// ==========================================
// ROTA DE LOGIN (BLINDADA)
// ==========================================
const login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

        // Força bruta: pedimos a coluna 'senha' explicitamente
        const result = await pool.query('SELECT id, nome, email, senha, role FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

        const user = result.rows;

        // O Failsafe: vasculha o objeto procurando o Hash
        const hashDoBanco = user.senha || user.password || user.senha_hash;

        // Se o banco negou a entrega do Hash, não crashamos o app. Paramos aqui graciosamente.
        if (!hashDoBanco) {
            console.error("ERRO CRÍTICO: O banco não devolveu o Hash. Objeto recebido:", user);
            return res.status(500).json({ error: 'Erro de conexão interna com as credenciais.' });
        }

        // Agora é seguro comparar
        const isMatch = await bcrypt.compare(senha, hashDoBanco);

        if (!isMatch) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: { id: user.id, nome: user.nome, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

module.exports = { signup, login };
