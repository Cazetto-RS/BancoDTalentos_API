const express = require('express');
const router = express.Router();
const habilidadesCandidatosController = require ('../controllers/habilidadesCandidatoControllers');
const {autenticar, verificarCandidato} = require('../middleware/authMiddleware');
const validar = require('../middleware/validateMiddleware');
const { catalogo } = require('../schemas');

router.use(autenticar, verificarCandidato);

router.post('/vincular', validar(catalogo.habilidadesCandidato), habilidadesCandidatosController.salvarHabilidades);
router.get('/buscar', habilidadesCandidatosController.listarHabilidades);
router.delete('/desvincular/:id', validar(catalogo.habilidadeId), habilidadesCandidatosController.desvincularHabilidade);

module.exports = router;
