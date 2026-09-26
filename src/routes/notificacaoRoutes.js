const router = require('express').Router();
const controller = require('../controllers/notificacaoControllers');
const { autenticar } = require('../middleware/authMiddleware');
const validar = require('../middleware/validateMiddleware');
const { notificacao } = require('../schemas');

router.use(autenticar);
router.get('/', controller.listar);
router.put('/ler-todas', controller.marcarTodasLidas);
router.put('/:id/ler', validar(notificacao.id), controller.marcarLida);

module.exports = router;
