const express = require('express');
const { createServer } = require('http');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 8080;
const server = createServer(app);
app.use(express.json());
server.listen(PORT, () => { 
    console.log(`Servidor rodando na porta ${PORT}`);
});


app.use((err, req, res, next) => {// Middleware to handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.body);
        return res.status(400).send({ error: 'Invalid JSON' });
    }
    next();
});


app.get('/', async (req, res) => {
    try {
        res.status(200).json({ message: "ok" });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ error: 'Invalid' });
    }
});
