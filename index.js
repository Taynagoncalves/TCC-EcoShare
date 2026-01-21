require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

/* =========================
   MIDDLEWARES GERAIS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   ARQUIVOS ESTÁTICOS
========================= */
app.use('/css', express.static(path.join(__dirname, 'src/css')));
app.use('/js', express.static(path.join(__dirname, 'src/js')));
app.use('/icons', express.static(path.join(__dirname, 'src/icons')));
app.use('/imagens', express.static(path.join(__dirname, 'src/imagens')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   MIDDLEWARE AUTH
========================= */
const verificarAutenticacao = require('./controllers/verificarAutenticacao');

/* =========================
   ROTAS DE AUTENTICAÇÃO
========================= */
app.post('/login', require('./controllers/logar'));
app.post('/cadastro', require('./controllers/cadastrar'));
app.post('/logout', require('./controllers/deslogar'));
app.post('/esqueci-senha', require('./controllers/esqueciSenha'));
app.post('/redefinir-senha', require('./controllers/redefinirSenha'));

/* =========================
   ROTAS DE DOAÇÕES
========================= */
app.use('/', require('./controllers/doacoesRoutes'));

/* =========================
   ROTAS DE DENÚNCIA
========================= */
app.use('/', require('./controllers/denunciaRoutes'));

app.use('/', require('./controllers/bairrosRoutes'));
app.use('/', require('./controllers/coletaRoutes'));

/* =========================
   ROTAS DE PÁGINAS (HTML)
========================= */
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/cadastro.html'));
});

app.get('/telahome', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/telahome.html'));
});

app.get('/adicionar-doacao', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/adicionar-doacao.html'));
});

app.get('/minhas-publicacoes', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/minhas-publicacoes.html'));
});

app.get('/configuracoes', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/configuracoes.html'));
});
app.get('/solicitacoes-coleta', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/solicitacao-coleta.html')
  );
});
app.get('/esqueci-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/esqueci-senha.html'));
});
app.get('/redefinir-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/redefinir-senha.html'));
});
app.get('/notificacao', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/notificacao.html')
  );
});
app.get('/coletas-andamento', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/coletas-andamento.html')
  );
});


/* =========================
   SERVIDOR
========================= */
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
