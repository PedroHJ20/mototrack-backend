const pool = require('../config/db');
const jwt = require('jsonwebtoken'); // Adicionamos o JWT para o nosso Failsafe

// 🔥 FUNÇÃO BLINDADA: Tenta pegar o ID do middleware. Se falhar, abre o Token na força.
const obterIdUsuario = (req) => {
    let id = req.usuarioId || req.userId || (req.user && req.user.id);
    
    if (!id && req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(' ');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            id = decoded.id; // Extrai o ID direto do cofre
        } catch (error) {
            console.error("Failsafe do Token falhou:", error.message);
        }
    }
    return id;
};

// 1. Adicionar Moto
const adicionarMoto = async (req, res) => {
    try {
        const { marca, modelo, ano, placa } = req.body;
        const usuario_id = obterIdUsuario(req);

        if (!usuario_id) return res.status(401).json({ erro: 'Sessão inválida. Faça login novamente.' });
        if (!marca || !modelo) return res.status(400).json({ erro: 'Marca e modelo são obrigatórios.' });

        const novaMoto = await pool.query({
            text: 'INSERT INTO motocicletas (usuario_id, marca, modelo, ano, placa) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            values: [usuario_id, marca, modelo, ano || null, placa || null]
        });

        res.status(201).json({ 
            mensagem: 'Moto adicionada com sucesso!', 
            moto: novaMoto.rows 
        });

    } catch (error) {
        console.error("💥 Erro ao adicionar moto:", error.message);
        if (error.code === '23505') {
            return res.status(400).json({ erro: 'Esta placa já está cadastrada.' });
        }
        res.status(500).json({ erro: 'Erro interno ao salvar a moto.' });
    }
};

// 2. Listar Motos
const listarMotos = async (req, res) => {
    try {
        const usuario_id = obterIdUsuario(req);
        
        if (!usuario_id) return res.status(401).json({ erro: 'Sessão inválida.' });

        const { rows } = await pool.query(
            'SELECT * FROM motocicletas WHERE usuario_id = $1 ORDER BY criado_em DESC',
            [usuario_id]
        );

        // Se o banco retornar 1 objeto aninhado em vez de array puro, garantimos o formato
        let motos = rows;
        if (rows.length > 0 && Array.isArray(rows)) {
            motos = rows; 
        }

        res.status(200).json({ motos: motos });
    } catch (error) {
        console.error("💥 Erro ao buscar motos:", error.message);
        res.status(500).json({ erro: 'Erro interno ao buscar as motos.' });
    }
};

// 3. Excluir Moto
const excluirMoto = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = obterIdUsuario(req);

        if (!usuario_id) return res.status(401).json({ erro: 'Sessão inválida.' });

        const resultado = await pool.query(
            'DELETE FROM motocicletas WHERE id = $1 AND usuario_id = $2 RETURNING *',
            [id, usuario_id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Moto não encontrada ou não pertence a você.' });
        }

        res.status(200).json({ mensagem: 'Moto excluída com sucesso!' });
    } catch (error) {
        console.error("💥 Erro ao excluir moto:", error.message);
        res.status(500).json({ erro: 'Erro interno ao excluir a moto.' });
    }
};

// 4. Atualizar Moto
const atualizarMoto = async (req, res) => {
    try {
        const { id } = req.params; 
        const { marca, modelo, ano, placa } = req.body; 
        const usuario_id = obterIdUsuario(req);

        if (!usuario_id) return res.status(401).json({ erro: 'Sessão inválida.' });
        if (!marca || !modelo) return res.status(400).json({ erro: 'Marca e modelo são obrigatórios.' });

        const resultado = await pool.query(
            'UPDATE motocicletas SET marca = $1, modelo = $2, ano = $3, placa = $4 WHERE id = $5 AND usuario_id = $6 RETURNING *',
            [marca, modelo, ano || null, placa || null, id, usuario_id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Moto não encontrada ou não pertence a você.' });
        }

        res.status(200).json({ 
            mensagem: 'Moto atualizada com sucesso!', 
            moto: resultado.rows 
        });
    } catch (error) {
        console.error("💥 Erro ao atualizar moto:", error.message);
        if (error.code === '23505') {
            return res.status(400).json({ erro: 'Esta placa já está sendo usada em outra moto.' });
        }
        res.status(500).json({ erro: 'Erro interno ao atualizar a moto.' });
    }
};

module.exports = { adicionarMoto, listarMotos, excluirMoto, atualizarMoto };
