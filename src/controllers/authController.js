const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Verifica se o caminho do seu banco de dados está correto

// ==========================================
// ROTA DE CADASTRO (SIGNUP)
// ==========================================
const signup = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Gera o "sal" e criptografa a senha antes de salvar
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // Insere o usuário no banco de dados. 
        // O NeonDB automaticamente vai colocar role = 'user' por causa do nosso comando SQL.
        // O "RETURNING *" faz o banco já devolver os dados recém-criados.
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, role',
            [nome, email, senhaHash]
        );

        const newUser = result.rows;

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: newUser
        });

    } catch (error) {
        console.error("Erro no cadastro:", error);
        
        // Trata o erro específico de e-mail duplicado do PostgreSQL
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
        // 1. Busca o usuário no banco de dados pelo e-mail
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        // Se a lista de resultados for vazia, o e-mail não existe
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const user = result.rows;

        // 2. Compara a senha digitada com a senha criptografada do banco
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        // 3. Senha correta! Gerar o Token JWT com o ID e a ROLE (Nível de Acesso)
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role // <- AQUI ESTÁ A MÁGICA DE SEGURANÇA!
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // O token expira em 1 dia
        );

        // 4. Retorna o token e os dados do usuário para o Front-end salvar
        res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role // Devolvemos a role para o Front-end mostrar o botão de ADM
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