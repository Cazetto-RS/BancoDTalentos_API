const express = require('express');
const router = express.Router();
const HistoricoController = require('../controllers/historicoControllers');
const {autenticar, verificarCandidato} = require('../middleware/authMiddleware');
const validar = require('../middleware/validateMiddleware');
const { historico } = require('../schemas');

router.use(autenticar, verificarCandidato);

router.post('/experiencias/create', validar(historico.criarExperiencia), HistoricoController.salvarExperiencias);
router.post('/formacoes/create', validar(historico.criarFormacao), HistoricoController.salvarFormacoes);

router.put('/experiencias/editar/:id', validar(historico.editarExperiencia), HistoricoController.editarExperiencias);
router.put('/formacoes/editar/:id', validar(historico.editarFormacao), HistoricoController.editarFormacoes);

router.delete('/experiencias/deletar/:id', validar(historico.id), HistoricoController.deletarExperiencias);
router.delete('/formacoes/deletar/:id', validar(historico.id), HistoricoController.deletarFormacoes);

router.get('/experiencias', HistoricoController.buscarExperiencias)
router.get('/formacoes', HistoricoController.buscarFormacoes)

module.exports = router;
