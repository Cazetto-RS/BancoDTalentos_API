const express = require('express');
const router = express.Router();
const AreasInteresseControllers = require('../controllers/areasInteresseControllers');
const {autenticar, verificarPermissao} = require('../middleware/authMiddleware');
const validar = require('../middleware/validateMiddleware');
const { catalogo } = require('../schemas');

router.get('/', autenticar, AreasInteresseControllers.buscarTodas);

router.post('/criar', autenticar, verificarPermissao, validar(catalogo.criarArea), AreasInteresseControllers.criar);
router.put('/atualizar/:id', autenticar, verificarPermissao, validar(catalogo.editarArea), AreasInteresseControllers.editar);
router.delete('/deletar/:id', autenticar, verificarPermissao, validar(catalogo.areaId), AreasInteresseControllers.deletar);

module.exports = router;
