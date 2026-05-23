const express = require('express');
const router = express.Router();
const oficinasController = require('../controllers/oficinasController');

// Define as URLs para acessar as oficinas
router.post('/', oficinasController.criarOficina);
router.get('/', oficinasController.listarOficinas);

// O ":id" avisa o Node que vamos passar um número na URL (ex: /oficinas/1)
router.put('/:id', oficinasController.atualizarOficina);
router.delete('/:id', oficinasController.deletarOficina);

module.exports = router;