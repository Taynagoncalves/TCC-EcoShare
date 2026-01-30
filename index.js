require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./models/db');

const app = express();

/* middlewares gerais */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* arquivos estáticos */
app.use('/css', express.static(path.join(__dirname, 'src/css')));
app.use('/js', express.static(path.join(__dirname, 'src/js')));
app.use('/icons', express.static(path.join(__dirname, 'src/icons')));
app.use('/imagens', express.static(path.join(__dirname, 'src/imagens')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* middlewares de autenticação */
const verificarAutenticacao = require('./controllers/verificarAutenticacao');
const verificarAdmin = require('./controllers/verificarAdmin');

/* rotas de autenticação */
app.post('/login', require('./controllers/logar'));
app.post('/cadastro', require('./controllers/cadastrar'));
app.post('/logout', require('./controllers/deslogar'));
app.post('/esqueci-senha', require('./controllers/esqueciSenha'));
app.post('/redefinir-senha', require('./controllers/redefinirSenha'));

/* rotas de funcionalidades */
app.use('/doacoes', require('./controllers/doacoesRoutes'));
app.use('/denuncias', require('./controllers/denunciaRoutes'));
app.use('/bairros', require('./controllers/bairrosRoutes'));
app.use('/coletas', require('./controllers/coletaRoutes'));
app.use('/usuarios', require('./controllers/usuarioRoutes'));
app.use('/resgates', require('./controllers/resgateRoutes'));
app.use('/lojas', require('./controllers/lojasRoutes'));
app.use('/notificacoes', require('./controllers/notificacaoRoutes'));

/* rotas de páginas html */
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
  res.sendFile(path.join(__dirname, 'src/html/solicitacao-coleta.html'));
});

app.get('/notificacao', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/notificacao.html'));
});

app.get('/coletas-andamento', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/coletas-andamento.html'));
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

app.get('/cupons-resgatados', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/cupons-resgatados.html'));
});

app.get('/esqueci-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/esqueci-senha.html'));
});

app.get('/redefinir-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/redefinir-senha.html'));
});

/* rotas admin */
app.get(
  '/admin/lojas',
  verificarAutenticacao,
  verificarAdmin,
  (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/admin-lojas.html'));
  }
);

app.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/admin-dashboard.html'));
  }
);

app.get(
  '/admin/usuarios/painel',
  verificarAutenticacao,
  verificarAdmin,
  (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/admin-usuarios.html'));
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


/* rota para obter dados do usuário logado */
app.get('/usuario-logado', verificarAutenticacao, (req, res) => {
  res.json({
    id: req.usuario.id,
    nome: req.usuario.nome,
    tipo: req.usuario.tipo
  });
});

/* servidor */
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`servidor rodando em http://localhost:${port}`);
});
