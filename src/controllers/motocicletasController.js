const pool = require('../config/db');

// 1. Adicionar Moto
const adicionarMoto = async (req, res) => {
    try {
        const { marca, modelo, ano, placa } = req.body;
        const usuario_id = req.usuarioId;

        if (!marca || !modelo) {
            return res.status(400).json({ erro: 'Marca e modelo são obrigatórios.' });
        }

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
        const usuario_id = req.usuarioId;

        const { rows } = await pool.query(
            'SELECT * FROM motocicletas WHERE usuario_id = $1 ORDER BY criado_em DESC',
            [usuario_id]
        );

        res.status(200).json({ motos: rows });
    } catch (error) {
        console.error("💥 Erro ao buscar motos:", error.message);
        res.status(500).json({ erro: 'Erro interno ao buscar as motos.' });
    }
};

// 3. Excluir Moto
const excluirMoto = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuarioId;

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

// 🔥 4. NOVA FUNÇÃO: Atualiza os dados da moto no banco
const atualizarMoto = async (req, res) => {
    try {
        const { id } = req.params; // ID da moto que vem na URL
        const { marca, modelo, ano, placa } = req.body; // Novos dados vindos do formulário
        const usuario_id = req.usuarioId; // ID do dono (segurança)

        if (!marca || !modelo) {
            return res.status(400).json({ erro: 'Marca e modelo são obrigatórios.' });
        }

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
        // Tratamento caso o usuário tente mudar a placa para uma que já existe em outra moto
        if (error.code === '23505') {
            return res.status(400).json({ erro: 'Esta placa já está sendo usada em outra moto.' });
        }
        res.status(500).json({ erro: 'Erro interno ao atualizar a moto.' });
    }
};

// Tudo exportado sem chances de erro no Express!
module.exports = { adicionarMoto, listarMotos, excluirMoto, atualizarMoto };