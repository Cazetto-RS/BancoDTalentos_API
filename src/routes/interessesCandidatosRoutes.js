const express = require('express');
const router = express.Router();
const InteressesCandidatoController = require('../controllers/interessesCandidatosControllers');
const { autenticar, verificarCandidato } = require('../middleware/authMiddleware');
const validar = require('../middleware/validateMiddleware');
const { catalogo } = require('../schemas');

router.use(autenticar, verificarCandidato);

router.post('/vincular', validar(catalogo.interesses), InteressesCandidatoController.salvarInteresses);
router.get('/', InteressesCandidatoController.listarInteresses);
router.delete('/desvincular/:id', validar(catalogo.areaId), InteressesCandidatoController.desvincularArea);

module.exports = router;
