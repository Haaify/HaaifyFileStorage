const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const constS3Client = new S3Client({
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.access_key_id,
    secretAccessKey: process.env.secret_access_key,
  },
});

const deleteFoldersByName = async (paramTargetFolder) => {
  try {

    let letListParams = {
      Bucket: 'haaifylink',
      Delimiter: '/',
    };

    let letRootFolders = await constS3Client.send(new ListObjectsV2Command(letListParams));

    for (let letFolder of letRootFolders.CommonPrefixes) {
      let letSubFolderParams = {
        Bucket: 'haaifylink',
        Prefix: letFolder.Prefix,
        Delimiter: '/',
      };

      let letSubFolders = await constS3Client.send(new ListObjectsV2Command(letSubFolderParams));


      if (letSubFolders.CommonPrefixes) {
        let letFoldersToDelete = letSubFolders.CommonPrefixes
          .map(prefix => prefix.Prefix)
          .filter(prefix => prefix.includes(paramTargetFolder));

        console.log(`Folders found for deletion: ${letFoldersToDelete.join(', ')}`);

        if (letFoldersToDelete.length === 0) {
          continue;
        }

        for (let letFolderPath of letFoldersToDelete) {
          await deleteObjectsInFolder(letFolderPath);
        }
      }
    }

  } catch (err) {
    console.error('Error listing or deleting folders:', err);
  }
};

const deleteObjectsInFolder = async (paramFolderPath) => {
  try {
    let letListParams = {
      Bucket: 'haaifylink',
      Prefix: paramFolderPath,
    };

    let letListedObjects = await constS3Client.send(new ListObjectsV2Command(letListParams));

    if (!letListedObjects.Contents || letListedObjects.Contents.length === 0) {
      console.log(`No objects found in folder: ${paramFolderPath}`);
      return;
    }

    let letDeleteParams = {
      Bucket: 'haaifylink',
      Delete: { Objects: [] },
    };

    letListedObjects.Contents.forEach(({ Key }) => {
      letDeleteParams.Delete.Objects.push({ Key });
    });

    console.log('Objects to delete:', letDeleteParams.Delete.Objects);

    let letDeleteResponse = await constS3Client.send(new DeleteObjectsCommand(letDeleteParams));

    console.log(`Deleted objects in folder: ${paramFolderPath}`, letDeleteResponse);

    if (letListedObjects.IsTruncated) {
      await deleteObjectsInFolder(paramFolderPath);
    }
  } catch (err) {
    console.error('Error deleting objects:', err);
  }
};

module.exports = { deleteFoldersByName };
