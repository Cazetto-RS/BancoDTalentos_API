const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioControllers');
const {autenticar, verificarAdmin} = require('../middleware/authMiddleware')

// Rotas públicas
router.post('/registrar', usuarioController.registrarCandidato);
router.post('/login', usuarioController.login);

// Rotas privadas
router.get('/', autenticar, usuarioController.buscarTodos);
router.get('/nome', autenticar, usuarioController.buscarPorNome);
router.get('/:id', autenticar, usuarioController.buscarPorId);

// Rotas exclusivas para admins
router.post('/admin/criar-usuario', autenticar, verificarAdmin, usuarioController.registrarPorAdmin);


module.exports = router