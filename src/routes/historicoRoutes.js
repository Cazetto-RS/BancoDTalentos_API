const express = require('express');
const router = express.Router();
const HistoricoController = require('../controllers/historicoControllers');
const {autenticar} = require('../middleware/authMiddleware');

router.post('/experiencias', autenticar, HistoricoController.salvarExperiencias);
router.post('/formacoes', autenticar, HistoricoController.salvarFormacoes);

router.put('/experiencias/editar/:id', autenticar, HistoricoController.editarExperiencias);
router.put('/formacoes/editar/:id', autenticar, HistoricoController.editarFormacoes);

router.delete('/experiencias/deletar/:id', autenticar, HistoricoController.deletarExperiencias);
router.delete('/formacoes/deletar/:id', autenticar, HistoricoController.deletarFormacoes);

module.exports = router;