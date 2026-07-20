const express = require('express');
const router = express.Router();
const habilidadesCandidatosController = require ('../controllers/habilidadesCandidatoControllers');
const {autenticar} = require('../middleware/authMiddleware');

router.post('/vincular', autenticar, habilidadesCandidatosController.salvarHabilidades);
router.get('/buscar', autenticar, habilidadesCandidatosController.listarHabilidades);
router.delete('/desvincular/:id', autenticar, habilidadesCandidatosController.desvincularHabilidade);

module.exports = router;