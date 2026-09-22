const express = require('express');
const router = express.Router();
const HabilidadesControllers = require('../controllers/habilidadesControllers');
const {autenticar, verificarPermissao} = require('../middleware/authMiddleware');
const validar = require('../middleware/validateMiddleware');
const { catalogo } = require('../schemas');

router.get('/', autenticar, HabilidadesControllers.buscarTodas);
router.post('/criar', autenticar, verificarPermissao, validar(catalogo.criarHabilidade), HabilidadesControllers.criar);
router.put('/atualizar/:id', autenticar, verificarPermissao, validar(catalogo.editarHabilidade), HabilidadesControllers.editar);
router.delete('/deletar/:id', autenticar, verificarPermissao, validar(catalogo.habilidadeId), HabilidadesControllers.deletar);

module.exports = router;
