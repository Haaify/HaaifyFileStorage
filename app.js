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

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.body);
    return res.status(400).send({ error: 'Invalid JSON' });
  }
  next();
});

app.get('/', async (req, res) => {
  try {
    res.status(200).json({ message: 'ok' });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Invalid' });
  }
});

//'/api/upload'
const {uploadRoutes} = require('./routes/uploadRoutes');
app.use('/api', uploadRoutes);

//'/api/delete-folder'
const {deleteRoutes} = require('./routes/deleteRoutes');
app.use('/api', deleteRoutes);

//delete folders from 3 months ago
const {getDateFrom3MonthsAgo} = require('./Scheduler/utils/format');
const {deleteFoldersByName} = require('./Scheduler/deleteFolder');
cron.schedule('0 0 * * *', () => {
  console.log('Executando todo dias as meia noite');
  deleteFoldersByName(getDateFrom3MonthsAgo())
});
