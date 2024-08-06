const express = require('express');
const { deleteFoldersByName } = require('../controllers/deleteFolderController');

const router = express.Router();

router.delete('/delete-folder', async (req, res) => {
    const { folderName } = req.body;

    if (!folderName) {
        return res.status(400).send({ error: 'folderName is required' });
    }

    try {
        await deleteFoldersByName(folderName);
        res.status(200).send({ message: `Folders with name containing '${folderName}' have been deleted.` });
    } catch (err) {
        console.error('Error deleting folders:', err);
        res.status(500).send({ error: 'Failed to delete folders' });
    }
});

module.exports = router;
