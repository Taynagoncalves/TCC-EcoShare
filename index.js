require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connection = require('./models/db');
const app = express();

/* MIDDLEWARES GERAIS */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ARQUIVOS ESTÁTICOS */
app.use('/css', express.static(path.join(__dirname, 'src/css')));
app.use('/js', express.static(path.join(__dirname, 'src/js')));
app.use('/icons', express.static(path.join(__dirname, 'src/icons')));
app.use('/imagens', express.static(path.join(__dirname, 'src/imagens')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MIDDLEWARE AUTH 
const verificarAutenticacao = require('./controllers/verificarAutenticacao');
const verificarAdmin = require('./controllers/verificarAdmin');

/*ROTAS DE AUTENTICAÇÃO */
app.post('/login', require('./controllers/logar'));
app.post('/cadastro', require('./controllers/cadastrar'));
app.post('/logout', require('./controllers/deslogar'));
app.post('/esqueci-senha', require('./controllers/esqueciSenha'));
app.post('/redefinir-senha', require('./controllers/redefinirSenha'));
app.use('/notificacoes', require('./controllers/notificacaoRoutes'));

/*rotas de funcionalidades */

app.use('/', require('./controllers/doacoesRoutes'));
app.use('/', require('./controllers/denunciaRoutes'));
app.use('/', require('./controllers/bairrosRoutes'));
app.use('/', require('./controllers/coletaRoutes'));
app.use('/', require('./controllers/usuarioRoutes'));
app.use('/', require('./controllers/resgateRoutes'));
app.use('/', require('./controllers/lojasRoutes'));
app.use('/', require('./controllers/notificacaoRoutes'));

/*rotas paginas html*/

// Página "Início"
app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/inicio.html'));
});

app.get('/', (req, res) => {
  res.redirect('/inicio');
});

// Página "Login"
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});

// Página "Cadastro"
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/cadastro.html'));
});

// Página "Tela Home" 
app.get('/telahome', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/telahome.html'));
});

// Página "Adicionar Doação"
app.get('/adicionar-doacao', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/adicionar-doacao.html'));
});

// Página "Minhas Publicações"
app.get('/minhas-publicacoes', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/minhas-publicacoes.html'));
});

// Página "Configurações"
app.get('/configuracoes', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/configuracoes.html'));
});

// Página "Solicitações de Coleta"
app.get('/solicitacoes-coleta', verificarAutenticacao, (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/solicitacao-coleta.html')
  );
});

// Página "Notificações"
app.get('/notificacao', verificarAutenticacao, (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/notificacao.html')
  );
});

// Página "Coletas em Andamento"
app.get('/coletas-andamento', verificarAutenticacao, (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/coletas-andamento.html')
  );
});

// Página "Resgate"
app.get('/resgate', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/resgate.html'));
});

// Página "Histórico"
app.get('/historico', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/historico.html'));
});

// Página "Perfil"
app.get('/perfil', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/perfil.html'));
});

// Página "Admin Lojas"
app.get('/admin-lojas', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/admin-lojas.html'));
});

// Página "Esqueci minha senha"
app.get('/esqueci-senha', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/esqueci-senha.html')
  );
});

// Página "Redefinir senha"
app.get('/redefinir-senha', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'src/html/redefinir-senha.html')
  );
});

/* rotas da pagina Admin */
// Página "Admin Lojas"
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
// Página "Admin Dashboard"
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

// Rota para obter dados do usuário logado
app.get('/usuario-logado', verificarAutenticacao, (req, res) => {
  res.json({
    id: req.usuario.id,
    nome: req.usuario.nome,
    tipo: req.usuario.tipo
  });
});

// Página "Admin Usuários"
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

// Página "Admin Doações"
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

/*server*/
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
