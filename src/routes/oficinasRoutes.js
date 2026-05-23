const express = require('express');
const router = express.Router();
const oficinasController = require('../controllers/oficinasController');

// Importação dos Middlewares de Segurança
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// ==========================================
// ROTAS DE OFICINAS
// ==========================================

// GET /oficinas
// Qualquer utilizador logado pode ver a lista de oficinas parceiras
router.get('/', verifyToken, oficinasController.listarOficinas);

// POST /oficinas
// APENAS ADMIN: Adiciona uma nova oficina à rede
router.post('/', verifyToken, isAdmin, oficinasController.criarOficina);

// DELETE /oficinas/:id
// APENAS ADMIN: Remove uma oficina da rede
router.delete('/:id', verifyToken, isAdmin, oficinasController.deletarOficina);

// PUT /oficinas/:id (Opcional, mas recomendado para o futuro)
// APENAS ADMIN: Atualiza os dados de uma oficina existente
router.put('/:id', verifyToken, isAdmin, oficinasController.atualizarOficina);

module.exports = router;