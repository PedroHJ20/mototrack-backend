const express = require('express');
const router = express.Router();
const { registrarManutencao, listarManutencoesMoto, atualizarManutencao, deletarManutencao } = require('../controllers/manutencoesController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/', verificarToken, registrarManutencao);
router.get('/moto/:moto_id', verificarToken, listarManutencoesMoto);
router.put('/:id', verificarToken, atualizarManutencao);
router.delete('/:id', verificarToken, deletarManutencao);

module.exports = router;