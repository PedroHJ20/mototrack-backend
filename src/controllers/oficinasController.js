const pool = require('../config/db');

// 1. Criar (POST)
const criarOficina = async (req, res) => {
    const { nome, endereco, especialidade } = req.body;
    try {
        const novaOficina = await pool.query(
            'INSERT INTO oficinas (nome, endereco, especialidade) VALUES ($1, $2, $3) RETURNING *',
            [nome, endereco, especialidade]
        );
        // Retornamos rows porque inserimos apenas 1 item
        res.status(201).json({ mensagem: 'Oficina cadastrada!', oficina: novaOficina.rows });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao cadastrar oficina.' });
    }
};

// 2. Listar (GET)
const listarOficinas = async (req, res) => {
    try {
        const oficinas = await pool.query('SELECT * FROM oficinas ORDER BY criado_em DESC');
        res.json(oficinas.rows); // Aqui devolvemos a lista inteira (rows)
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar oficinas.' });
    }
};

// 3. Atualizar (PUT)
const atualizarOficina = async (req, res) => {
    const { id } = req.params;
    const { nome, endereco, especialidade } = req.body;

    try {
        const oficinaAtualizada = await pool.query(
            'UPDATE oficinas SET nome = $1, endereco = $2, especialidade = $3 WHERE id = $4 RETURNING *',
            [nome, endereco, especialidade, id]
        );

        if (oficinaAtualizada.rows.length === 0) {
            return res.status(404).json({ erro: 'Oficina não encontrada.' });
        }

        res.json({ mensagem: 'Oficina atualizada com sucesso!', oficina: oficinaAtualizada.rows });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar oficina.' });
    }
};

// 4. Deletar (DELETE)
const deletarOficina = async (req, res) => {
    const { id } = req.params;

    try {
        const oficinaDeletada = await pool.query('DELETE FROM oficinas WHERE id = $1 RETURNING *', [id]);

        if (oficinaDeletada.rows.length === 0) {
            return res.status(404).json({ erro: 'Oficina não encontrada.' });
        }

        res.json({ mensagem: 'Oficina removida com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao deletar oficina.' });
    }
};

module.exports = { criarOficina, listarOficinas, atualizarOficina, deletarOficina };