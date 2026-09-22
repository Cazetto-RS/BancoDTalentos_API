const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaControllers');
const {autenticar, verificarPermissao} = require('../middleware/authMiddleware')
const validar = require('../middleware/validateMiddleware');
const { vaga } = require('../schemas');

router.get('/', vagaController.buscarTodos);
router.get('/admin/todas', autenticar, verificarPermissao, vagaController.buscarTodasAdmin);
router.get('/:id', validar(vaga.id), vagaController.buscarPorId);

router.post('/create', autenticar, verificarPermissao, validar(vaga.criar), vagaController.criarVaga);
router.put('/update/:id', autenticar, verificarPermissao, validar(vaga.editar), vagaController.editarVaga);
router.delete('/delete/:id', autenticar, verificarPermissao, validar(vaga.id), vagaController.deletarVaga);

module.exports = router;
