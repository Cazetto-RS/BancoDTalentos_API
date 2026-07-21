const express = require('express');
const router = express.Router();
const AreasInteresseControllers = require('../controllers/AreasInteresseControllers');
const {autenticar, verificarPermissao} = require('../middleware/authMiddleware');

router.get('/', autenticar, AreasInteresseControllers.buscarTodas);

router.post('/criar', autenticar, verificarPermissao, AreasInteresseControllers.criar);
router.put('/atualizar/:id', autenticar, verificarPermissao, AreasInteresseControllers.editar);
router.delete('/deletar/:id', autenticar, verificarPermissao, AreasInteresseControllers.deletar);

module.exports = router;