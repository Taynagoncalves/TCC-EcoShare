
DROP DATABASE IF EXISTS ecoshare;
CREATE DATABASE ecoshare
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE ecoshare;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  cep VARCHAR(20),
  endereco VARCHAR(150),
  numero VARCHAR(20),
  complemento VARCHAR(50),
  telefone VARCHAR(20),
  pontos INT DEFAULT 0,
  tipo ENUM('usuario','admin') DEFAULT 'usuario',
  status ENUM('ativo','bloqueado') DEFAULT 'ativo',
  reset_token VARCHAR(255),
  reset_expires DATETIME,
  notificacoes_ativas BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE bairros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

INSERT INTO bairros (nome) VALUES
('14 de Novembro'),('Alto Alegre'),('Alto da Glória'),('Bairro Universitário'),
('Bela Vista'),('Brasmadeira'),('Brasília'),('Cajati'),('Cancelli'),
('Cascavel Velho'),('Centro'),('Claudemir'),('Coqueiral'),('Country'),
('Cristo Rei'),('Fag'),('Floresta'),('Guarujá'),('Interlagos'),
('Jardim Alvorada'),('Jardim América'),('Jardim Canadá'),('Jardim Colônia'),
('Jardim Cristal'),('Jardim Esmeralda'),('Jardim Europa'),('Jardim Itália'),
('Jardim Melissa'),('Jardim Nova Itália'),('Jardim Palmeiras'),
('Jardim Presidente'),('Jardim Riviera'),('Jardim Santa Cruz'),
('Jardim São Paulo'),('Morumbi'),('Neva'),('Parque São Paulo'),
('Periolo'),('Pioneiros Catarinenses'),('Portal da Luz'),
('Recanto Tropical'),('Região do Lago'),('Santa Cruz'),
('Santa Felicidade'),('Santos Dumont'),('São Cristóvão'),
('São Salvador'),('Tarumã'),('Universitário'),
('Vila A'),('Vila B'),('Vila C'),('Vila D'),
('Vila Tolentino'),('West Side');


CREATE TABLE doacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_material VARCHAR(100) NOT NULL,
  quantidade INT NOT NULL,
  tipo_material ENUM('metal','papel','plastico','vidro','outros') NOT NULL,
  bairro_id INT NOT NULL,
  dias_semana VARCHAR(100),
  horarios VARCHAR(100),
  descricao TEXT,
  imagem VARCHAR(255),
  usuario_id INT,
  status ENUM('ativo','andamento','concluido') DEFAULT 'ativo',
  pontos INT DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bairro_id) REFERENCES bairros(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;


CREATE TABLE solicitacoes_coleta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doacao_id INT NOT NULL,
  solicitante_id INT NOT NULL,
  doador_id INT NOT NULL,
  status ENUM('pendente','confirmada','recusada','concluida') DEFAULT 'pendente',
  criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_solicitacao (doacao_id, solicitante_id),
  FOREIGN KEY (doacao_id) REFERENCES doacoes(id),
  FOREIGN KEY (solicitante_id) REFERENCES usuarios(id),
  FOREIGN KEY (doador_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;


CREATE TABLE lojas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  pontos INT NOT NULL,
  imagem VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE resgates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  loja_id INT NOT NULL,
  pontos_usados INT NOT NULL,
  codigo VARCHAR(20),
  usado BOOLEAN DEFAULT false,
  usado_em TIMESTAMP NULL,
  resgatado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (loja_id) REFERENCES lojas(id)
) ENGINE=InnoDB;


CREATE TABLE cupons_resgatados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  loja_id INT NOT NULL,
  codigo VARCHAR(20) NOT NULL,
  usado ENUM('nao','sim') DEFAULT 'nao',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unico_resgate (usuario_id, loja_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (loja_id) REFERENCES lojas(id)
) ENGINE=InnoDB;


CREATE TABLE notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50),
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;


ALTER TABLE solicitacoes_coleta
MODIFY status ENUM(
  'pendente',
  'confirmada',
  'recusada',
  'cancelada',
  'concluida'
) DEFAULT 'pendente';

ALTER TABLE usuarios
ADD COLUMN foto VARCHAR(255) DEFAULT NULL;

ALTER TABLE lojas ADD endereco VARCHAR(255);
