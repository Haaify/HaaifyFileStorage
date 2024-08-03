// Importando os módulos necessários

const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const multer = require('multer');

// Configurando o endpoint do DigitalOcean Spaces
const spacesEndpoint = 'nyc3.cdn.digitaloceanspaces.com';

// Criando um cliente S3 para o DigitalOcean Spaces
const s3 = new S3Client({
  endpoint: `https://${spacesEndpoint}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.access_key_id,
    secretAccessKey: process.env.secret_access_key
  }
});

// Configurando o middleware de upload de arquivos usando multer e multer-s3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'haaifylink',
    acl: 'public-read',
    key: function (_request, file, cb) {
      // Formatação do nome do arquivo
      const fileName = `fileStorage/${new Date().toISOString()}-${file.originalname}`.replace(" ", "_");
      cb(null, fileName);
    }
  })
}).array('files', 10);

// Função para enviar arquivos para o DigitalOcean Spaces e retornar as URLs
async function sendFileSpaceDigitalOcean(req) {
  // Verificação se os arquivos foram enviados
  if (!req.files || !Array.isArray(req.files)) {
    throw new Error('No files uploaded');
  }

  // Mapeamento dos arquivos para suas URLs no espaço
  const fileUrls = req.files.map(file => {
    const fileUrl = `https://${file.bucket}.${spacesEndpoint}/${file.key}`;
    console.log('File uploaded successfully:', fileUrl);
    return fileUrl;
  });

  // Retorno das URLs dos arquivos
  return fileUrls;
}

module.exports = {
  upload,
  sendFileSpaceDigitalOcean
};

