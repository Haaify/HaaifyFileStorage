const express = require('express');
const { createServer } = require('http');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 8080;
const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).json({ message: 'ok' });
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.body);
        return res.status(400).send({ error: 'Invalid JSON' });
    }
    next();
});

//  '/api/upload'
const uploadRoutes = require('./API/routes/uploadRoutes');
app.use('/api', uploadRoutes);

//  '/api/delete-folder'
const deleteRoutes = require('./API/routes/deleteRoutes');
app.use('/api', deleteRoutes);

//delete folders from 3 months ago
const { deleteFoldersByName } = require('./Scheduler/routineFunctions/deleteFolder');
cron.schedule('0 0 * * *', () => { //'Executando todo dias as meia noite'
    deleteFoldersByName()
});
