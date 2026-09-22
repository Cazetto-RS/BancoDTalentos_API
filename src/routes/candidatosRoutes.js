const express = require('express');
const router = express.Router();
const CandidatosController = require('../controllers/candidatoControllers');
const {autenticar, verificarCandidato} = require('../middleware/authMiddleware');
const validar = require('../middleware/validateMiddleware');
const { candidato } = require('../schemas');

router.post('/perfil-base', autenticar, verificarCandidato, validar(candidato.perfil), CandidatosController.salvarPerfilBase);
router.get('/meu-perfil', autenticar, verificarCandidato, CandidatosController.buscarPerfilBase);
router.get('/buscar-cultura', autenticar, verificarCandidato, CandidatosController.buscarCultura);
router.post('/cultura', autenticar, verificarCandidato, validar(candidato.cultura), CandidatosController.salvarCultura);

module.exports = router;
