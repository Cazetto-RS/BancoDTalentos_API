const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioControllers');
const {autenticar, verificarAdmin} = require('../middleware/authMiddleware')
const validar = require('../middleware/validateMiddleware');
const { usuario } = require('../schemas');

// Rotas públicas
router.post('/registrar', validar(usuario.registrar), usuarioController.registrarCandidato);
router.post('/login', validar(usuario.login), usuarioController.login);

// Rotas privadas
router.put('/atualizar/:id', autenticar, validar(usuario.atualizar), usuarioController.atualizarInformacoes);
router.delete('/deletar/:id', autenticar, validar(usuario.deletar), usuarioController.deletarUsuario);

// Rotas exclusivas para admins
router.get('/', autenticar, verificarAdmin, usuarioController.buscarTodos);
router.get('/nome', autenticar, verificarAdmin, validar(usuario.nome), usuarioController.buscarPorNome);
router.post('/admin/criar-usuario', autenticar, verificarAdmin, validar(usuario.criarFuncionario), usuarioController.registrarPorAdmin);
router.post('/logout', autenticar, usuarioController.logout);
router.get('/:id', autenticar, verificarAdmin, validar(usuario.id), usuarioController.buscarPorId);


module.exports = router
