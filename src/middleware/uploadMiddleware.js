const multer = require('multer');

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, callback) => {
        const accepted = new Set([
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]);

        if (!accepted.has(file.mimetype)) {
            const error = new Error('Formato de arquivo não permitido.');
            error.statusCode = 400;
            error.code = 'INVALID_FILE_TYPE';
            return callback(error);
        }

        return callback(null, true);
    }
});

module.exports = upload;
