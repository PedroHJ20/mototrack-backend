const express = require('express');
const router = express.Router();

// Importa as quatro funções do controlador
const { adicionarMoto, listarMotos, excluirMoto, atualizarMoto } = require('../controllers/motocicletasController');

const verificarToken = require('../middlewares/authMiddleware'); 

router.post('/', verificarToken, adicionarMoto);
router.get('/', verificarToken, listarMotos);
router.delete('/:id', verificarToken, excluirMoto);

// 🔥 NOVA Rota PUT: Espera o ID da moto na URL (ex: PUT /motocicletas/3)
router.put('/:id', verificarToken, atualizarMoto);

module.exports = router;