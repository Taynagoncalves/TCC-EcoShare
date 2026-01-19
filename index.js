require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

/* =======================
   CONTROLLERS AUTH
======================= */
const logar = require('./controllers/logar');
const cadastrar = require('./controllers/cadastrar');
const deslogar = require('./controllers/deslogar');
const verificarAutenticacao = require('./controllers/verificarAutenticacao');
const esqueciSenha = require('./controllers/esqueciSenha');
const redefinirSenha = require('./controllers/redefinirSenha');

/* =======================
   ROTAS
======================= */
const doacoesRoutes = require('./controllers/doacoesRoutes');
const bairrosRoutes = require('./controllers/bairrosRoutes');

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   ARQUIVOS ESTÁTICOS
======================= */
app.use(express.static(path.join(__dirname, 'src')));
app.use('/uploads', express.static(path.join(__dirname, 'src/imagens/uploads')));

/* =======================
   ROTAS AUTH (API)
======================= */
app.post('/login', logar);
app.post('/cadastro', cadastrar);
app.post('/logout', deslogar);

app.post('/esqueci-senha', esqueciSenha);
app.post('/redefinir-senha', redefinirSenha);

/* =======================
   ROTA DE VERIFICAÇÃO (API)
======================= */
app.get('/verificar', (req, res) => {
  if (req.cookies.token) {
    res.json({ autenticado: true });
  } else {
    res.json({ autenticado: false });
  }
});

/* =======================
   ROTAS DE API
======================= */
app.use(doacoesRoutes);
app.use(bairrosRoutes);

/* =======================
   ROTAS HTML
======================= */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/inicio.html'));
});

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/inicio.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/cadastro.html'));
});

app.get('/esqueci-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/esqueci-senha.html'));
});

app.get('/redefinir-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/redefinir-senha.html'));
});

app.get('/telahome', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/telahome.html'));
});

app.get('/adicionar-doacao', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/adicionar-doacao.html'));
});

app.get('/configuracoes', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/configuracoes.html'));
});

app.get('/minhas-publicacoes', verificarAutenticacao, (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/minhas-publicacoes.html')
  );
});

/* =======================
   SERVIDOR
======================= */
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
