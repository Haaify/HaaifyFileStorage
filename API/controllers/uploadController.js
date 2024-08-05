const { formatarData, formatarHorario } = require('../utils/format');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path'); // Importar o módulo path
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const constS3Client = new S3Client({
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.access_key_id,
    secretAccessKey: process.env.secret_access_key
  }
});

const uploadBuffer = async (paramBuffer, paramOriginalName, paramFolder, res) => {
  try {
    let letFileName = `${paramFolder || 'Default'}/${formatarData()}/${formatarHorario()}-${paramOriginalName}`.replace(/ /g, "_");

    let letUploadParams = {
      Bucket: 'haaifylink',
      Key: letFileName,
      Body: paramBuffer,
      ACL: 'public-read',
      Metadata: {
        'x-amz-meta-my-key': 'your-value',
      },
    };

    let letCommand = new PutObjectCommand(letUploadParams);

    await constS3Client.send(letCommand);

    res.status(200).send(`Arquivo enviado com sucesso: ${letFileName}`);
  } catch (err) {
    console.error('Erro ao enviar o arquivo:', err);
    res.status(500).send('Erro ao enviar o arquivo.');
  }
};

// Função para fazer upload a partir de um URL
const uploadFromUrl = async (paramUrl, paramFolder, res) => {
  try {
    let letResponse = await fetch(paramUrl);

    if (!letResponse.ok) {
      res.status(400).send('Falha ao baixar o arquivo. Verifique o URL e tente novamente.');
      return;
    }

    let letContentType = letResponse.headers.get('content-type');

    let letFileName = `${paramFolder || 'Default'}/${formatarData()}/${formatarHorario()}-${uuidv4()}-${path.basename(paramUrl)}`.replace(/ /g, '_');

    let letFileBuffer = await letResponse.arrayBuffer();

    let letUploadParams = {
      Bucket: 'haaifylink',
      Key: letFileName,
      Body: letFileBuffer,
      ACL: 'public-read',
      ContentType: letContentType,
      Metadata: {
        'x-amz-meta-my-key': 'your-value',
      },
    };

    let letCommand = new PutObjectCommand(letUploadParams);
    let letSave = await constS3Client.send(letCommand);
 
    res.status(200).send({message: `Arquivo enviado com sucesso`, save: letSave});
  } catch (err) {
    console.error('Erro ao baixar o arquivo:', err);
    res.status(403).send('Erro ao baixar o arquivo.');
  }
};

module.exports = { uploadBuffer, uploadFromUrl};
