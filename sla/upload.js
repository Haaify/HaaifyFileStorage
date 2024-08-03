const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const port = 3000;
const spacesEndpoint = 'nyc3.cdn.digitaloceanspaces.com';

// Configuração do cliente S3
const s3 = new S3Client({
    endpoint: `https://${spacesEndpoint}`,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.access_key_id,
      secretAccessKey: process.env.secret_access_key
    }
  });

// Configuração do armazenamento com Multer
const storage = multer.memoryStorage(); // Armazena em memória

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 MB por arquivo
});

// Rota para upload de arquivos
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('Nenhum arquivo enviado.');
        }

        const dateStr = new Date().toISOString().replace(/:/g, '-');
        const fileName = `fileStorage/${dateStr}-${file.originalname}`.replace(/ /g, "_");

        const uploadParams = {
            Bucket: 'haaifylink', // Substitua pelo seu nome de bucket
            Key: fileName,
            Body: file.buffer,
            ACL: 'private',
            Metadata: {
                "x-amz-meta-my-key": "your-value"
            }
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        res.status(200).send(`Arquivo enviado com sucesso: ${fileName}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao enviar o arquivo.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});