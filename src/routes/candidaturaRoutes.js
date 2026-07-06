const express = require('express');
const router = express.Router();
const candidaturaControllers = require ('../controllers/candidaturasControllers');
const {autenticar, verificarPermissao} = require('../middleware/authMiddleware');

router.post('/inscrever', autenticar, candidaturaControllers.inscrever);
router.get('/minhas-candidaturas', autenticar, candidaturaControllers.listarMinhasCandidaturas);

router.get('/', autenticar, verificarPermissao, candidaturaControllers.listarTodasCandidaturas);
router.get('/vaga/:vagaId', autenticar, verificarPermissao, candidaturaControllers.listarCandidatosPorVaga);
router.put('/atualizar-status/:id', autenticar, verificarPermissao, candidaturaControllers.atualizarStatusCandidato);

module.exports = router;