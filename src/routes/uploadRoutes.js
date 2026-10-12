const express = require('express');
const UploadControllers = require('../controllers/uploadControllers');
const upload = require('../middleware/uploadMiddleware');
const { autenticar, verificarCandidato } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/url', autenticar, UploadControllers.gerarUrl);
router.post('/:tipo', autenticar, verificarCandidato, upload.single('arquivo'), UploadControllers.enviar);
router.delete('/', autenticar, verificarCandidato, UploadControllers.remover);

module.exports = router;
