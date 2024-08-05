const { formatarData, formatarHorario } = require('../utils/format');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path'); // Importar o módulo path
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));


// Configuração do cliente S3
const s3 = new S3Client({
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.access_key_id,
    secretAccessKey: process.env.secret_access_key
  }
});

// Função para lidar com o upload de arquivos
const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const { url, folder } = req.body;

    // Identificar se é um arquivo ou um URL
    if (file) {
      // Caso seja um arquivo enviado diretamente
      await uploadBuffer(file.buffer, file.originalname, folder, res);
    } else if (url) {
      // Caso seja um URL fornecido no corpo
      await uploadFromUrl(url, folder, res);
    } else {
      return res.status(400).send('Nenhum arquivo ou URL fornecido.');
    }

  } catch (err) {
    console.error('Erro ao processar a requisição:', err);
    res.status(500).send('Erro ao processar a requisição.');
  }
};

// Função para fazer upload a partir de um buffer de arquivo
const uploadBuffer = async (buffer, originalName, folder, res) => {
  try {
    const fileName = `${folder || 'Default'}/${formatarData()}/${formatarHorario()}-${originalName}`.replace(/ /g, "_");

    const uploadParams = {
      Bucket: 'haaifylink',
      Key: fileName,
      Body: buffer,
      ACL: 'private',
      Metadata: {
        'x-amz-meta-my-key': 'your-value',
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    res.status(200).send(`Arquivo enviado com sucesso: ${fileName}`);
  } catch (err) {
    console.error('Erro ao enviar o arquivo:', err);
    res.status(500).send('Erro ao enviar o arquivo.');
  }
};

// Função para fazer upload a partir de um URL
const uploadFromUrl = async (url, folder, res) => {
  try {
    // Baixar o arquivo usando fetch
    const response = await fetch(url);

    // Verificar o código de status HTTP
    if (!response.ok) {
      res.status(400).send('Falha ao baixar o arquivo. Verifique o URL e tente novamente.');
      return;
    }

    // Obter o tipo MIME da resposta
    const contentType = response.headers.get('content-type');

    // Gerar um nome único para o arquivo
    const fileName = `${folder || 'Default'}/${formatarData()}/${formatarHorario()}-${uuidv4()}-${path.basename(url)}`.replace(/ /g, '_');

    // Obter o buffer do arquivo
    const fileBuffer = await response.buffer();

    // Fazer o upload do buffer diretamente para o S3
    const uploadParams = {
      Bucket: 'haaifylink',
      Key: fileName,
      Body: fileBuffer,
      ACL: 'private',
      ContentType: contentType, // Use o tipo MIME obtido
      Metadata: {
        'x-amz-meta-my-key': 'your-value',
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    res.status(200).send(`Arquivo enviado com sucesso: ${fileName}`);
  } catch (err) {
    console.error('Erro ao baixar o arquivo:', err);
    res.status(500).send('Erro ao baixar o arquivo.');
  }
};

module.exports = { uploadFile };
