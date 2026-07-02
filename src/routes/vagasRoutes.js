const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaControllers');
const {autenticar, verificarPermissao} = require('../middleware/authMiddleware')

router.get('/', vagaController.buscarTodos);
router.get('/:id', vagaController.buscarPorId);

router.post('/create', autenticar, verificarPermissao, vagaController.criarVaga);
router.put('/update/:id', autenticar, verificarPermissao, vagaController.editarVaga);
router.delete('/delete/:id', autenticar, verificarPermissao, vagaController.deletarVaga);

module.exports = router;