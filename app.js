const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createServer } = require('http');

const app = express();
const PORT = process.env.PORT || 8080;
const server = createServer(app);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

app.use(express.json());
server.listen(PORT, () => { 
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use((err, req, res, next) => {// Middleware to handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.body);
        return res.status(400).send({ error: 'Invalid JSON' });
    }
    next();
});

app.get('/', async (req, res) => {
    try {
        res.status(200).json({ message: "ok" });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ error: 'Invalid' });
    }
});

const spacesEndpoint = 'nyc3.cdn.digitaloceanspaces.com';

const s3 = new S3Client({
    endpoint: `https://${spacesEndpoint}`,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.access_key_id,
      secretAccessKey: process.env.secret_access_key
    }
  });

const storage = multer.memoryStorage(); 

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('Nenhum arquivo enviado.');
        }

        const dateStr = new Date().toISOString().replace(/:/g, '-');
        const fileName = `fileStorage/${dateStr}-${file.originalname}`.replace(/ /g, "_");

        const uploadParams = {
            Bucket: 'haaifylink', 
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




