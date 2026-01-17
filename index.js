require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const logar = require('./controllers/logar');
const cadastrar = require('./controllers/cadastrar');
const deslogar = require('./controllers/deslogar');
const verificar = require('./controllers/verificarAutenticacao');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.post('/login', logar);
app.post('/cadastro', cadastrar);
app.post('/logout', deslogar);
app.get('/verificar', verificar);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
