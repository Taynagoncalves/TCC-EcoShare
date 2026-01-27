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
const verificarAdmin = require('./controllers/verificarAdmin');

/* =========================
   ROTAS DE AUTENTICAÇÃO
========================= */
app.post('/login', require('./controllers/logar'));
app.post('/cadastro', require('./controllers/cadastrar'));
app.post('/logout', require('./controllers/deslogar'));
app.post('/esqueci-senha', require('./controllers/esqueciSenha'));
app.post('/redefinir-senha', require('./controllers/redefinirSenha'));
app.use('/notificacoes', require('./controllers/notificacaoRoutes'));

/* =========================
   ROTAS DE FUNCIONALIDADES
========================= */
app.use('/', require('./controllers/doacoesRoutes'));
app.use('/', require('./controllers/denunciaRoutes'));
app.use('/', require('./controllers/bairrosRoutes'));
app.use('/', require('./controllers/coletaRoutes'));
app.use('/', require('./controllers/usuarioRoutes'));
app.use('/', require('./controllers/resgateRoutes'));
app.use('/', require('./controllers/lojasRoutes'));
app.use('/', require('./controllers/notificacaoRoutes'));


/* =========================
   🔐 ROTAS ADMIN — LOJAS PARCEIRAS
========================= */
app.use('/', require('./controllers/lojasRoutes'));

/* =========================
   ROTAS DE PÁGINAS (HTML)
========================= */
app.get('/', (req, res) => {
  res.redirect('/inicio');
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

app.get('/solicitacoes-coleta', verificarAutenticacao, (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/solicitacao-coleta.html')
  );
});

app.get('/notificacao', verificarAutenticacao, (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/notificacao.html')
  );
});

app.get('/coletas-andamento', verificarAutenticacao, (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/coletas-andamento.html')
  );
});

app.get('/resgate', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/resgate.html'));
});

app.get('/historico', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/historico.html'));
});

app.get('/perfil', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/perfil.html'));
});

app.get('/admin-lojas', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/admin-lojas.html'));
});

// Página "Esqueci minha senha"
app.get('/esqueci-senha', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/esqueci-senha.html')
  );
});
app.get('/redefinir-senha', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/redefinir-senha.html')
  );
});

/* =========================
   🔐 PÁGINA ADMIN (HTML)
========================= */
app.get(
  '/admin/lojas',
  verificarAutenticacao,
  verificarAdmin,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, 'src/html/admin-lojas.html')
    );
  }
);

app.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, 'src/html/admin-dashboard.html')
    );
  }
);
app.get('/usuario-logado', verificarAutenticacao, (req, res) => {
  res.json({
    id: req.usuario.id,
    nome: req.usuario.nome,
    tipo: req.usuario.tipo
  });
});
app.get(
  '/admin/usuarios/painel',
  verificarAutenticacao,
  verificarAdmin,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, 'src/html/admin-usuarios.html')
    );
  }
);
app.get(
  '/admin/doacoes',
  verificarAutenticacao,
  verificarAdmin,
  (req, res) => {
    res.sendFile(
      path.join(__dirname, 'src/html/admin-doacoes.html')
    );
  }
);

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
