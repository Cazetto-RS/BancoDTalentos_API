const express = require('express');
const router = express.Router();
const HabilidadesControllers = require('../controllers/habilidadesControllers');
const {autenticar, verificarPermissao} = require('../middleware/authMiddleware');

router.get('/', autenticar, HabilidadesControllers.buscarTodas);
router.post('/criar', autenticar ,verificarPermissao, HabilidadesControllers.criar);
router.put('/atualizar/:id', autenticar ,verificarPermissao, HabilidadesControllers.editar);
router.delete('/deletar/:id', autenticar ,verificarPermissao, HabilidadesControllers.deletar);

module.exports = router;