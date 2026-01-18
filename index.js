require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// ==================
// CONTROLLERS
// ==================
const logar = require('./controllers/logar');
const cadastrar = require('./controllers/cadastrar');
const deslogar = require('./controllers/deslogar');
const verificar = require('./controllers/verificarAutenticacao');
const esqueciSenha = require('./controllers/esqueciSenha');
const redefinirSenha = require('./controllers/redefinirSenha');

const app = express();

// ==================
// MIDDLEWARES
// ==================
app.use(express.json());
app.use(cookieParser());

// Arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'src')));

// ==================
// ROTAS DA API
// ==================
app.post('/login', logar);
app.post('/cadastro', cadastrar);
app.post('/logout', deslogar);
app.get('/verificar', verificar);

app.post('/esqueci-senha', esqueciSenha);
app.post('/redefinir-senha', redefinirSenha);

// ==================
// ROTAS HTML
// ==================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'inicio.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'login.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'cadastro.html'));
});

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'inicio.html'));
});

app.get('/esqueci-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'esqueci-senha.html'));
});

app.get('/redefinir-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'redefinir-senha.html'));
});

app.get('/telahome', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'telahome.html'));
});

// ==================
// SERVIDOR
// ==================
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
