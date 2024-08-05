const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.access_key_id,
    secretAccessKey: process.env.secret_access_key,
  },
});

const deleteObjectsInFolder = async (folderPath) => {
  try {
    const listParams = {
      Bucket: 'haaifylink',
      Prefix: folderPath,
    };

    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

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

    if (listedObjects.IsTruncated) {
      await deleteObjectsInFolder(folderPath);
    }
  } catch (err) {
    console.error('Error deleting objects:', err);
  }
};

const deleteFoldersByDate = async (targetDate) => {
  try {

    const listParams = {
      Bucket: 'haaifylink',
      Delimiter: '/',
    };

    const rootFolders = await s3Client.send(new ListObjectsV2Command(listParams));

    for (const folder of rootFolders.CommonPrefixes) {
      const subFolderParams = {
        Bucket: 'haaifylink',
        Prefix: folder.Prefix,
        Delimiter: '/',
      };

      const subFolders = await s3Client.send(new ListObjectsV2Command(subFolderParams));


      if (subFolders.CommonPrefixes) {
        const foldersToDelete = subFolders.CommonPrefixes
          .map(prefix => prefix.Prefix)
          .filter(prefix => prefix.includes(targetDate));

        console.log(`Folders found for deletion: ${foldersToDelete.join(', ')}`);

        if (foldersToDelete.length === 0) {
          continue;
        }

        for (const folderPath of foldersToDelete) {
          await deleteObjectsInFolder(folderPath);
        }
      } else {
      }
    }

  } catch (err) {
    console.error('Error listing or deleting folders:', err);
  }
};

module.exports = { deleteFoldersByDate };
