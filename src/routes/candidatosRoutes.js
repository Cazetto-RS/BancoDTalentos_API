const express = require('express');
const router = express.Router();
const CandidatosController = require('../controllers/candidatoControllers');
const {autenticar} = require('../middleware/authMiddleware');

router.post('/perfil-base', autenticar, CandidatosController.salvarPerfilBase);
router.get('/meu-perfil', autenticar, CandidatosController.buscarPerfilBase);
router.get('/buscar-cultura', autenticar, CandidatosController.buscarCultura);
router.post('/cultura', autenticar, CandidatosController.salvarCultura);

module.exports = router;