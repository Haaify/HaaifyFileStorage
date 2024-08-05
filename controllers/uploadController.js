const { formatarData, formatarHorario } = require('../utils/format');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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
    if (!file) {
      return res.status(400).send('Nenhum arquivo enviado.');
    }

    let paramFolder = req.query.folder || 'Default';

    const fileName = `${paramFolder}/${formatarData()}/${formatarHorario()}-${file.originalname}`.replace(/ /g, "_");

    const uploadParams = {
      Bucket: 'haaifylink',
      Key: fileName,
      Body: file.buffer,
      ACL: 'private',
      Metadata: {
        'x-amz-meta-my-key': 'your-value'
      }
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    res.status(200).send(`Arquivo enviado com sucesso: ${fileName}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao enviar o arquivo.');
  }
};

module.exports = { uploadFile };
