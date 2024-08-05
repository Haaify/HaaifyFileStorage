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
    console.log(`Attempting to delete objects in folder: ${folderPath}`);

    const listParams = {
      Bucket: 'haaifylink',
      Prefix: folderPath,
    };

    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    console.log('ListObjectsV2Command response:', listedObjects);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log(`No objects found in folder: ${folderPath}`);
      return;
    }

    const deleteParams = {
      Bucket: 'haaifylink',
      Delete: { Objects: [] },
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    console.log('Objects to delete:', deleteParams.Delete.Objects);

    const deleteResponse = await s3Client.send(new DeleteObjectsCommand(deleteParams));

    console.log(`Deleted objects in folder: ${folderPath}`, deleteResponse);

    // Recursively delete if there are more objects
    if (listedObjects.IsTruncated) {
      console.log(`More objects to delete in folder: ${folderPath}`);
      await deleteObjectsInFolder(folderPath);
    }
  } catch (err) {
    console.error('Error deleting objects:', err);
  }
};

// Função principal para buscar e deletar folders por data
const deleteFoldersByDate = async (targetDate) => {
  try {
    console.log(`Starting folder deletion process for date: ${targetDate}`);

    const listParams = {
      Bucket: 'haaifylink',
      Delimiter: '/',
    };

    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    console.log('ListObjectsV2Command for root folders response:', listedObjects);

    // Filtrar folders com a data desejada
    const foldersToDelete = listedObjects.CommonPrefixes
      .map(prefix => prefix.Prefix)
      .filter(prefix => prefix.includes(targetDate));

    console.log(`Folders found for deletion: ${foldersToDelete.join(', ')}`);

    if (foldersToDelete.length === 0) {
      console.log(`No folders found with the date: ${targetDate}`);
      return;
    }

    for (const folderPath of foldersToDelete) {
      await deleteObjectsInFolder(folderPath);
    }

    console.log('Folder deletion process complete.');
  } catch (err) {
    console.error('Error listing or deleting folders:', err);
  }
};

module.exports = { deleteFoldersByDate };
