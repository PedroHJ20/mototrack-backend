const pool = require('../config/db');

// 1. Registrar Manutenção (POST)
const registrarManutencao = async (req, res) => {
    const { moto_id, oficina_id, descricao, custo, data_servico } = req.body;
    try {
        const novaManutencao = await pool.query(
            'INSERT INTO manutencoes (moto_id, oficina_id, descricao, custo, data_servico) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [moto_id, oficina_id || null, descricao, custo, data_servico] // 💡 oficina_id || null impede o erro de undefined
        );
        const manutencaoCriada = novaManutencao.rows; // 💡 Pega a primeira linha direto de forma limpa
        res.status(201).json({ mensagem: 'Histórico de manutenção updated!', manutencao: manutencaoCriada });
    } catch (erro) {
        console.error("💥 Erro ao registrar manutenção:", erro);
        res.status(500).json({ erro: 'Erro ao registrar manutenção.' });
    }
};
// 2. Listar Manutenções de uma Moto (GET)
const listarManutencoesMoto = async (req, res) => {
    const { moto_id } = req.params;
    try {
        const manutencoes = await pool.query(
            'SELECT * FROM manutencoes WHERE moto_id = $1 ORDER BY data_servico DESC', 
            [moto_id]
        );
        res.json(manutencoes.rows.flat(Infinity));
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar manutenções.' });
    }
};

// 3. Atualizar Manutenção (PUT)
const atualizarManutencao = async (req, res) => {
    const { id } = req.params;
    const { descricao, custo, data_servico } = req.body;
    try {
        const manutAtualizada = await pool.query(
            'UPDATE manutencoes SET descricao = $1, custo = $2, data_servico = $3 WHERE id = $4 RETURNING *',
            [descricao, custo, data_servico, id]
        );
        const rowsAchatadas = manutAtualizada.rows.flat(Infinity);
        
        if (rowsAchatadas.length === 0) {
            return res.status(404).json({ erro: 'Registro de manutenção não encontrado.' });
        }
        res.json({ mensagem: 'Registro atualizado com sucesso!', manutencao: rowsAchatadas });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar manutenção.' });
    }
};

// 4. Deletar Manutenção (DELETE)
const deletarManutencao = async (req, res) => {
    const { id } = req.params;
    try {
        const manutDeletada = await pool.query('DELETE FROM manutencoes WHERE id = $1 RETURNING *', [id]);
        const rowsAchatadas = manutDeletada.rows.flat(Infinity);

        if (rowsAchatadas.length === 0) {
            return res.status(404).json({ erro: 'Registro não encontrado.' });
        }
        res.json({ mensagem: 'Registro de manutenção apagado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao deletar manutenção.' });
    }
};

module.exports = { registrarManutencao, listarManutencoesMoto, atualizarManutencao, deletarManutencao };