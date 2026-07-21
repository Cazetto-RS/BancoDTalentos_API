const express = require('express');
const router = express.Router();
const InteressesCandidatoController = require('../controllers/interessesCandidatosControllers');
const { autenticar } = require('../middleware/authMiddleware');

router.post('/vincular', autenticar, InteressesCandidatoController.salvarInteresses);
router.get('/', autenticar, InteressesCandidatoController.listarInteresses);
router.delete('/desvincular/:id', autenticar, InteressesCandidatoController.desvincularArea);

module.exports = router;