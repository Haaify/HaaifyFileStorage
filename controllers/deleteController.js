const { formatarData, formatarHorario } = require('../utils/format');
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

// Configurar o cliente S3
const s3Client = new S3Client({
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.access_key_id,
    secretAccessKey: process.env.secret_access_key,
  },
});

// Função para deletar todos os objetos dentro de um folder
const deleteObjectsInFolder = async (folderPath) => {
  try {
    const listParams = {
      Bucket: 'haaifylink',
      Prefix: folderPath,
    };

    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

    const deleteParams = {
      Bucket: 'haaifylink',
      Delete: { Objects: [] },
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    await s3Client.send(new DeleteObjectsCommand(deleteParams));
    console.log(`Deleted objects in folder: ${folderPath}`);

    // Recursively delete if there are more objects
    if (listedObjects.IsTruncated) await deleteObjectsInFolder(folderPath);
  } catch (err) {
    console.error('Error deleting objects:', err);
  }
};

// Função principal para buscar e deletar folders por data
const deleteFoldersByDate = async (targetDate) => {
  try {
    const listParams = {
      Bucket: 'haaifylink',
      Delimiter: '/',
    };

    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    // Filtrar folders com a data desejada
    const foldersToDelete = listedObjects.CommonPrefixes
      .map(prefix => prefix.Prefix)
      .filter(prefix => prefix.includes(targetDate));

    console.log(`Folders found for deletion: ${foldersToDelete.join(', ')}`);

    for (const folderPath of foldersToDelete) {
      await deleteObjectsInFolder(folderPath);
    }

    console.log('Folder deletion complete.');
  } catch (err) {
    console.error('Error listing or deleting folders:', err);
  }
};

module.exports = { deleteFoldersByDate };
