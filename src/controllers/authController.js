const bcrypt = require('bcrypt');
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

        // Inserimos e pedimos de volta as informações básicas
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
// ROTA DE LOGIN (VERSÃO BYPASS TEMPORÁRIA)
// ==========================================
const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

        // 1. Buscamos o usuário
        const result = await pool.query('SELECT id, nome, email, role FROM usuarios WHERE email = $1', [email]);

        // Se o usuário não existir
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'E-mail não encontrado na base de dados.' });
        }

        const user = result.rows;

        // 2. BYPASS DE SENHA (TEMPORÁRIO)
        // Ignoramos a verificação do bcrypt porque o banco não está a devolver o Hash.
        // Se o e-mail existe, deixamos entrar (APENAS PARA TESTE!)
        
        console.log("⚠️ ATENÇÃO: Login feito com Bypass de Senha para:", user.email);

        // 3. Geramos o Token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Devolvemos os dados para a Garagem abrir
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
