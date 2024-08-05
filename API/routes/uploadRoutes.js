const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/uploadController');

const router = express.Router();

// Configurar o armazenamento do multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10 MB
});

// Definir a rota POST para upload
router.post('/upload', upload.single('file'), uploadFile);

module.exports = {router};
