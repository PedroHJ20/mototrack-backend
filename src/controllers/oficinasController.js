const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'chave_mestra_apresentacao_unicap_2026';

// Failsafe para identificar o Admin
const obterInfoUsuario = (req) => {
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.replace('Bearer ', '').trim();
            const decoded = jwt.verify(token, SECRET);
            return decoded;
        } catch (error) {
            return null;
        }
    }
    return null;
};

// Listar todas as oficinas
const listarOficinas = async (req, res) => {
    try {
        const user = obterInfoUsuario(req);
        
        // Se não for admin, bloqueia
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
        }

        const { rows } = await pool.query('SELECT * FROM oficinas ORDER BY nome ASC');
        res.status(200).json({ oficinas: rows });
    } catch (error) {
        console.error("Erro ao listar oficinas:", error.message);
        res.status(500).json({ erro: 'Erro ao buscar oficinas.' });
    }
};

// Cadastrar nova oficina
const cadastrarOficina = async (req, res) => {
    try {
        const user = obterInfoUsuario(req);
        if (!user || user.role !== 'admin') return res.status(403).json({ erro: 'Acesso negado.' });

        const { nome, cnpj, endereco, especialidade } = req.body;

        const novaOficina = await pool.query(
            'INSERT INTO oficinas (nome, cnpj, endereco, especialidade) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, cnpj, endereco, especialidade]
        );

        res.status(201).json({ mensagem: 'Oficina cadastrada!', oficina: novaOficina.rows[0] });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cadastrar oficina.' });
    }
};

module.exports = { listarOficinas, cadastrarOficina };
