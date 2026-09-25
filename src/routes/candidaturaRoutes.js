const express = require('express');
const router = express.Router();
const candidaturaControllers = require ('../controllers/candidaturasControllers');
const {autenticar, verificarPermissao, verificarCandidato} = require('../middleware/authMiddleware');
const validar = require('../middleware/validateMiddleware');
const { candidatura } = require('../schemas');

router.post('/inscrever', autenticar, verificarCandidato, validar(candidatura.inscrever), candidaturaControllers.inscrever);
router.get('/minhas-candidaturas', autenticar, verificarCandidato, candidaturaControllers.listarMinhasCandidaturas);

router.get('/', autenticar, verificarPermissao, candidaturaControllers.listarTodasCandidaturas);
router.get('/vaga/:vagaId', autenticar, verificarPermissao, validar(candidatura.vagaId), candidaturaControllers.listarCandidatosPorVaga);
router.put('/atualizar-status/:id', autenticar, verificarPermissao, validar(candidatura.atualizar), candidaturaControllers.atualizarStatusCandidato);

module.exports = router;
