const pool = require('../config/db');

// Listar todas as oficinas (Aberto para qualquer usuário logado ver)
const listarOficinas = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM oficinas ORDER BY nome ASC');
        res.status(200).json({ oficinas: rows });
    } catch (error) {
        console.error("Erro ao listar oficinas:", error.message);
        res.status(500).json({ erro: 'Erro ao buscar oficinas.' });
    }
};

// Cadastrar nova oficina (O bloqueio de admin já é feito pelo middleware nas rotas)
const criarOficina = async (req, res) => {
    try {
        const { nome, cnpj, endereco, especialidade } = req.body;

        const novaOficina = await pool.query(
            'INSERT INTO oficinas (nome, cnpj, endereco, especialidade) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, cnpj, endereco, especialidade]
        );

        res.status(201).json({ mensagem: 'Oficina cadastrada!', oficina: novaOficina.rows[0] });
    } catch (error) {
        console.error("Erro ao criar oficina:", error.message);
        res.status(500).json({ erro: 'Erro ao cadastrar oficina.' });
    }
};

// Deletar oficina (Faltava no código)
const deletarOficina = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM oficinas WHERE id = $1', [id]);
        res.status(200).json({ mensagem: 'Oficina removida com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar oficina:", error.message);
        res.status(500).json({ erro: 'Erro ao remover oficina.' });
    }
};

// Atualizar oficina (Faltava no código)
const atualizarOficina = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cnpj, endereco, especialidade } = req.body;
        await pool.query(
            'UPDATE oficinas SET nome = $1, cnpj = $2, endereco = $3, especialidade = $4 WHERE id = $5',
            [nome, cnpj, endereco, especialidade, id]
        );
        res.status(200).json({ mensagem: 'Oficina atualizada com sucesso.' });
    } catch (error) {
        console.error("Erro ao atualizar oficina:", error.message);
        res.status(500).json({ erro: 'Erro ao atualizar oficina.' });
    }
};

// Exportamos com os nomes EXATOS que o arquivo oficinasRoutes.js está pedindo
module.exports = { 
    listarOficinas, 
    criarOficina, 
    deletarOficina, 
    atualizarOficina 
};
