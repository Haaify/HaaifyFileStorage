const express = require('express');
const multer = require('multer');
const { uploadBuffer, uploadFromUrl } = require('../controllers/uploadController');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10 MB
});

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        let file = req.file;
        let { url, folder } = req.body;

        if (file) {
            await uploadBuffer(file.buffer, file.originalname, folder, res);

        } else if (url) {
            await uploadFromUrl(url, folder, res);

        } else {
            return res.status(400).send('Nenhum arquivo ou URL fornecido.');
        }

    } catch (err) {
        console.error('Erro ao processar a requisição:', err);
        res.status(500).send('Erro ao processar a requisição.');
    }
});

module.exports = router;
