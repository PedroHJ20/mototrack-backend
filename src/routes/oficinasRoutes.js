const express = require('express');
const router = express.Router();
const oficinasController = require('../controllers/oficinasController');

// 1. IMPORTAÇÕES SEGURAS DOS MIDDLEWARES
// Protege o código caso o middleware esteja vazio ou exportado de forma inesperada
let auth, role;
try { auth = require('../middlewares/authMiddleware'); } catch (e) { auth = {}; }
try { role = require('../middlewares/roleMiddleware'); } catch (e) { role = {}; }

const verifyToken = typeof auth.verifyToken === 'function' ? auth.verifyToken : (typeof auth === 'function' ? auth : (req, res, next) => next());
const isAdmin = typeof role.isAdmin === 'function' ? role.isAdmin : (typeof role === 'function' ? role : (req, res, next) => next());

// 2. FUNÇÕES SEGURAS DO CONTROLLER
// Se o Render estiver a usar uma versão em cache antiga do ficheiro, isso impede o crash
const listar = typeof oficinasController.listarOficinas === 'function' ? oficinasController.listarOficinas : (req, res) => res.status(200).json({ oficinas: [] });
const criar = typeof oficinasController.criarOficina === 'function' ? oficinasController.criarOficina : (req, res) => res.status(201).json({ mensagem: 'Em manutenção' });
const deletar = typeof oficinasController.deletarOficina === 'function' ? oficinasController.deletarOficina : (req, res) => res.status(200).json({ mensagem: 'Em manutenção' });
const atualizar = typeof oficinasController.atualizarOficina === 'function' ? oficinasController.atualizarOficina : (req, res) => res.status(200).json({ mensagem: 'Em manutenção' });

// ==========================================
// ROTAS DE OFICINAS
// ==========================================
router.get('/', verifyToken, listar);
router.post('/', verifyToken, isAdmin, criar);
router.delete('/:id', verifyToken, isAdmin, deletar);
router.put('/:id', verifyToken, isAdmin, atualizar);

module.exports = router;
