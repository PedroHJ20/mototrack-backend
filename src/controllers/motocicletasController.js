const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'chave_mestra_apresentacao_unicap_2026';

// 🔥 A Torneira Fechada: Lê o Token estritamente. Se falhar, devolve vazio.
const obterIdUsuario = (req) => {
    let id = req.usuarioId || req.userId;
    if (!id && req.headers.authorization) {
        try {
            const token = req.headers.authorization.replace('Bearer ', '').trim();
            if (token && token !== 'undefined' && token !== 'null') {
                const decoded = jwt.verify(token, SECRET);
                id = decoded.id; // Extrai o ID real do dono da conta
            }
        } catch (error) {
            console.error("Token inválido ou expirado bloqueado pelo sistema.");
        }
    }
    return id; // Sem o "|| 1". Se não for válido, retorna undefined e bloqueia a ação.
};

const adicionarMoto = async (req, res) => {
    try {
        const { marca, modelo, ano, placa } = req.body;
        const usuario_id = obterIdUsuario(req);

        // Bloqueio absoluto se não houver dono
        if (!usuario_id) return res.status(401).json({ erro: 'Sessão inválida. Faça login novamente.' });
        if (!marca || !modelo) return res.status(400).json({ erro: 'Marca e modelo são obrigatórios.' });

        const novaMoto = await pool.query({
            text: 'INSERT INTO motocicletas (usuario_id, marca, modelo, ano, placa) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            values: [usuario_id, marca, modelo, ano || null, placa || null]
        });

        res.status(201).json({ mensagem: 'Moto adicionada com sucesso!', moto: novaMoto.rows });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ erro: 'Esta placa já está cadastrada.' });
        res.status(500).json({ erro: 'Erro interno ao salvar a moto.' });
    }
};

const listarMotos = async (req, res) => {
    try {
        const usuario_id = obterIdUsuario(req);
        
        // Se a identidade falhar, devolve erro 401 em vez de mostrar a garagem do ID 1
        if (!usuario_id) return res.status(401).json({ erro: 'Não autorizado.' });

        const { rows } = await pool.query('SELECT * FROM motocicletas WHERE usuario_id = $1 ORDER BY criado_em DESC', [usuario_id]);
        
        let motos = rows;
        if (rows.length > 0 && Array.isArray(rows)) motos = rows; 

        res.status(200).json({ motos: motos });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar as motos.' });
    }
};

const excluirMoto = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = obterIdUsuario(req);

        if (!usuario_id) return res.status(401).json({ erro: 'Sessão inválida.' });

        const resultado = await pool.query('DELETE FROM motocicletas WHERE id = $1 AND usuario_id = $2 RETURNING *', [id, usuario_id]);
        
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Moto não encontrada ou não pertence a você.' });
        res.status(200).json({ mensagem: 'Moto excluída com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir a moto.' });
    }
};

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

        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Moto não encontrada ou não pertence a você.' });
        res.status(200).json({ mensagem: 'Moto atualizada!', moto: resultado.rows });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar a moto.' });
    }
};

module.exports = { adicionarMoto, listarMotos, excluirMoto, atualizarMoto };
