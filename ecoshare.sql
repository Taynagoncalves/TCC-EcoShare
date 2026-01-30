CREATE DATABASE ecoshare
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  cep VARCHAR(20),
  endereco VARCHAR(150),
  numero VARCHAR(20),
  complemento VARCHAR(50),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE bairros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL
);
INSERT INTO bairros (nome) VALUES
('14 de Novembro'),
('Alto Alegre'),
('Alto da Glória'),
('Bairro Universitário'),
('Bela Vista'),
('Brasmadeira'),
('Brasília'),
('Cajati'),
('Cancelli'),
('Cascavel Velho'),
('Centro'),
('Claudemir'),
('Coqueiral'),
('Country'),
('Cristo Rei'),
('Fag'),
('Floresta'),
('Guarujá'),
('Interlagos'),
('Jardim Alvorada'),
('Jardim América'),
('Jardim Canadá'),
('Jardim Colônia'),
('Jardim Cristal'),
('Jardim Esmeralda'),
('Jardim Europa'),
('Jardim Itália'),
('Jardim Melissa'),
('Jardim Nova Itália'),
('Jardim Palmeiras'),
('Jardim Presidente'),
('Jardim Riviera'),
('Jardim Santa Cruz'),
('Jardim São Paulo'),
('Morumbi'),
('Neva'),
('Parque São Paulo'),
('Periolo'),
('Pioneiros Catarinenses'),
('Portal da Luz'),
('Recanto Tropical'),
('Região do Lago'),
('Santa Cruz'),
('Santa Felicidade'),
('Santos Dumont'),
('São Cristóvão'),
('São Salvador'),
('Tarumã'),
('Universitário'),
('Vila A'),
('Vila B'),
('Vila C'),
('Vila D'),
('Vila Tolentino'),
('West Side');

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
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (bairro_id) REFERENCES bairros(id)
);
CREATE TABLE solicitacoes_coleta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doacao_id INT NOT NULL,
  solicitante_id INT NOT NULL,
  doador_id INT NOT NULL,
  status ENUM('pendente', 'confirmada', 'recusada') DEFAULT 'pendente',
  criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (doacao_id) REFERENCES doacoes(id),
  FOREIGN KEY (solicitante_id) REFERENCES usuarios(id),
  FOREIGN KEY (doador_id) REFERENCES usuarios(id)
);


-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ecoshare
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bairros`
--

DROP TABLE IF EXISTS `bairros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bairros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bairros`
--

LOCK TABLES `bairros` WRITE;
/*!40000 ALTER TABLE `bairros` DISABLE KEYS */;
INSERT INTO `bairros` VALUES (1,'14 de Novembro'),(2,'Alto Alegre'),(3,'Alto da Glória'),(4,'Bairro Universitário'),(5,'Bela Vista'),(6,'Brazmadeira'),(7,'Brasmadeira'),(8,'Brasília'),(9,'Cajati'),(10,'Cancelli'),(11,'Cascavel Velho'),(12,'Centro'),(13,'Claudemir'),(14,'Coqueiral'),(15,'Country'),(16,'Cristo Rei'),(17,'Fag'),(18,'Floresta'),(19,'Guarujá'),(20,'Interlagos'),(21,'Jardim Alvorada'),(22,'Jardim América'),(23,'Jardim Canadá'),(24,'Jardim Colônia'),(25,'Jardim Cristal'),(26,'Jardim Esmeralda'),(27,'Jardim Europa'),(28,'Jardim Itália'),(29,'Jardim Melissa'),(30,'Jardim Nova Itália'),(31,'Jardim Palmeiras'),(32,'Jardim Presidente'),(33,'Jardim Riviera'),(34,'Jardim Santa Cruz'),(35,'Jardim São Paulo'),(36,'Morumbi'),(37,'Neva'),(38,'Parque São Paulo'),(39,'Periolo'),(40,'Pioneiros Catarinenses'),(41,'Portal da Luz'),(42,'Recanto Tropical'),(43,'Região do Lago'),(44,'Santa Cruz'),(45,'Santa Felicidade'),(46,'Santos Dumont'),(47,'São Cristóvão'),(48,'São Salvador'),(49,'Tarumã'),(50,'Universitário'),(51,'Vila A'),(52,'Vila B'),(53,'Vila C'),(54,'Vila D'),(55,'Vila Tolentino'),(56,'West Side');
/*!40000 ALTER TABLE `bairros` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-25 23:32:30
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ecoshare
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cupons_resgatados`
--

DROP TABLE IF EXISTS `cupons_resgatados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupons_resgatados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `loja_id` int NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `usado` enum('nao','sim') COLLATE utf8mb4_general_ci DEFAULT 'nao',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unico_resgate` (`usuario_id`,`loja_id`),
  KEY `loja_id` (`loja_id`),
  CONSTRAINT `cupons_resgatados_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `cupons_resgatados_ibfk_2` FOREIGN KEY (`loja_id`) REFERENCES `lojas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons_resgatados`
--

LOCK TABLES `cupons_resgatados` WRITE;
/*!40000 ALTER TABLE `cupons_resgatados` DISABLE KEYS */;
INSERT INTO `cupons_resgatados` VALUES (1,1,2,'A1KYOIL','nao','2026-01-24 21:37:12'),(2,2,2,'APLI6E1','nao','2026-01-24 21:39:14'),(3,1,4,'TTWNHUU','nao','2026-01-24 21:40:58'),(4,1,5,'AKZNJ9D','nao','2026-01-25 20:20:54'),(5,1,6,'AXNNFHE','nao','2026-01-25 20:20:58'),(6,2,7,'AFNLSSP','nao','2026-01-25 20:38:07'),(7,1,7,'ATET5ER','nao','2026-01-25 21:41:14'),(8,1,8,'T95OOH3','nao','2026-01-25 21:45:02'),(9,2,8,'TNS16IK','nao','2026-01-25 21:45:40'),(10,1,9,'4QEEXFR','nao','2026-01-25 21:48:29'),(11,1,10,'3VU7QVF','nao','2026-01-25 21:50:22'),(12,1,11,'T3IC11A','nao','2026-01-25 21:53:03'),(13,1,12,'1CLR7GL','nao','2026-01-25 21:58:42'),(14,1,13,'1OLM9M6','nao','2026-01-25 22:02:46'),(15,1,14,'DGD38F6','nao','2026-01-25 22:05:12'),(16,1,15,'13DGXH9','nao','2026-01-25 22:07:50'),(17,1,16,'2L5J901','nao','2026-01-25 22:11:23');
/*!40000 ALTER TABLE `cupons_resgatados` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-25 23:32:30
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ecoshare
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `doacoes`
--

DROP TABLE IF EXISTS `doacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome_material` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `quantidade` int NOT NULL,
  `tipo_material` enum('metal','papel','plastico','vidro','outros') COLLATE utf8mb4_general_ci NOT NULL,
  `bairro_id` int NOT NULL,
  `dias_semana` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `horarios` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descricao` text COLLATE utf8mb4_general_ci,
  `imagem` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('ativo','andamento','concluido') COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `pontos` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `bairro_id` (`bairro_id`),
  CONSTRAINT `doacoes_ibfk_1` FOREIGN KEY (`bairro_id`) REFERENCES `bairros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doacoes`
--

LOCK TABLES `doacoes` WRITE;
/*!40000 ALTER TABLE `doacoes` DISABLE KEYS */;
INSERT INTO `doacoes` VALUES (1,'papelao',21,'papel',2,'seg, ter','8:00 as 12:00','otimo estado','1769187003716.png',1,'2026-01-23 16:50:03','ativo',0),(2,'plastico',232,'papel',4,'seg, ter','8:00 as 12:00','eddd','1769187631419.jpg',2,'2026-01-23 17:00:31','ativo',0),(3,'plastico',2113,'metal',3,'seg, ter','8:00 as 12:00','rfddf','1769196512478.png',1,'2026-01-23 19:28:32','ativo',0),(4,'aaaa',21,'metal',2,'seg, ter','8:00 as 12:00','dd','1769197556613.png',1,'2026-01-23 19:45:56','ativo',0),(5,'tay',22222222,'vidro',10,'seg, ter','8:00 as 12:00','ddddddddddddd','1769197912637.png',2,'2026-01-23 19:51:52','ativo',0),(6,'teste',11,'metal',2,'seg, ter','8:00 as 12:00','dddddd','1769199022280.png',2,'2026-01-23 20:10:22','ativo',0),(7,'papelao',11,'metal',3,'seg, ter','8:00 as 12:00','dsss','1769274963203.jpg',1,'2026-01-24 17:16:03','ativo',0),(8,'hhhhhhhhhhhh',21212,'metal',2,'seg, ter','8:00 as 12:00','sssssssssss','1769275498531.png',1,'2026-01-24 17:24:58','ativo',0),(9,'papelao1111111111',12,'metal',2,'seg, ter','8:00 as 12:00','ssssssssss','1769276522727.png',1,'2026-01-24 17:42:02','ativo',0),(10,'aaaaaaaa122222222',1,'metal',2,'seg, ter','8:00 as 12:00','aaaaaaaaaa','1769286196882.jpg',2,'2026-01-24 20:23:16','ativo',0),(11,'plastico777777777777777777777777777',20,'papel',2,'seg, ter','8:00 as 12:00','aaaaaaaaaaaaa','1769290681116.png',2,'2026-01-24 21:38:01','ativo',0),(12,'plastico',12,'papel',3,'seg, ter','8:00 as 12:00','aaa','1769312832558.png',2,'2026-01-25 03:47:12','ativo',0),(13,'wwwwwwwwwww',212,'metal',7,'seg, ter','8:00 as 12:00','ssss','1769368939078.png',1,'2026-01-25 19:22:19','ativo',0),(14,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',1212,'metal',3,'seg, ter','8:00 as 12:00','aaa','1769371281449.png',2,'2026-01-25 20:01:21','ativo',0),(15,'2w131`312',11221,'papel',2,'seg','8:00 as 12:00','ddsdsd','1769372661881.png',2,'2026-01-25 20:24:21','ativo',0),(16,'1111111111111111',11,'metal',3,'seg, ter','8:00 as 12:00','12112','1769377124535.png',2,'2026-01-25 21:38:44','ativo',0),(17,'plastico',1221,'metal',8,'seg, ter','8:00 as 12:00',NULL,'1769377221421.png',1,'2026-01-25 21:40:21','ativo',0);
/*!40000 ALTER TABLE `doacoes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-25 23:32:30
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ecoshare
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `lojas`
--

DROP TABLE IF EXISTS `lojas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lojas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_general_ci,
  `pontos` int NOT NULL,
  `imagem` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lojas`
--

LOCK TABLES `lojas` WRITE;
/*!40000 ALTER TABLE `lojas` DISABLE KEYS */;
INSERT INTO `lojas` VALUES (2,'avenidao','ok',12,'1769282747819.png','2026-01-24 19:25:47'),(4,'TAYNA','SILVA',1221,'1769287292203.png','2026-01-24 20:41:32'),(5,'adidas','ddddd',100,'1769290959866.png','2026-01-24 21:42:39'),(6,'aaaaaaaaaaaaaa','2112',212,'1769372076341.png','2026-01-25 20:14:36'),(7,'aaaaaaaaaaaaaa1121','12121',1,'1769373482089.png','2026-01-25 20:38:02'),(8,'teste','a',2,'1769377496918.png','2026-01-25 21:44:56'),(9,'44444','qq',12,'1769377703562.png','2026-01-25 21:48:23'),(10,'3333','a',12,'1769377817028.png','2026-01-25 21:50:17'),(11,'tttttttt','1',123,'1769377972186.png','2026-01-25 21:52:52'),(12,'11111111','aa',12,'1769378315754.png','2026-01-25 21:58:35'),(13,'11','11',1,'1769378560894.png','2026-01-25 22:02:40'),(14,'ddddddddd','1',12,'1769378705271.png','2026-01-25 22:05:05'),(15,'1111111111','1',32,'1769378861226.png','2026-01-25 22:07:41'),(16,'222','11',13,'1769379070623.png','2026-01-25 22:11:10'),(17,'1111','22',22,'1769379471336.png','2026-01-25 22:17:51'),(18,'11','11',50,'1769379590154.png','2026-01-25 22:19:50'),(19,'1111','dwads',23,'1769394158594.png','2026-01-26 02:22:38'),(20,'avenidao','11',213,'1769394356127.png','2026-01-26 02:25:56'),(21,'Tayná Gonçalves','231',22,'1769394399211.png','2026-01-26 02:26:39');
/*!40000 ALTER TABLE `lojas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-25 23:32:31
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ecoshare
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `resgates`
--

DROP TABLE IF EXISTS `resgates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resgates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `loja_id` int NOT NULL,
  `pontos_usados` int NOT NULL,
  `resgatado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `codigo` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `usado` tinyint(1) DEFAULT '0',
  `usado_em` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `loja_id` (`loja_id`),
  CONSTRAINT `resgates_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `resgates_ibfk_2` FOREIGN KEY (`loja_id`) REFERENCES `lojas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resgates`
--

LOCK TABLES `resgates` WRITE;
/*!40000 ALTER TABLE `resgates` DISABLE KEYS */;
INSERT INTO `resgates` VALUES (1,1,2,12,'2026-01-24 19:25:57','AYC80P',0,NULL),(2,1,2,12,'2026-01-24 19:26:17','A1DRPT',0,NULL),(3,1,2,12,'2026-01-24 19:31:28','AVWGG7',0,NULL),(4,1,2,12,'2026-01-24 20:02:48','AHLOGB',0,NULL),(5,1,2,12,'2026-01-24 20:02:51','AL4MWC',0,NULL),(6,2,2,12,'2026-01-24 20:24:16','AR6JOE',0,NULL),(7,1,2,12,'2026-01-24 20:35:28','AWJ4UY',0,NULL),(8,1,2,12,'2026-01-24 20:35:32','ATQ065',0,NULL),(9,1,4,1221,'2026-01-24 20:43:14','T8O4U3',0,NULL),(10,1,4,1221,'2026-01-24 20:43:21','TWCKSG',0,NULL),(11,1,2,12,'2026-01-24 20:52:05','AG0AU8',0,NULL),(12,1,17,22,'2026-01-25 22:17:56','1Y6L0UG',0,NULL),(13,1,7,1,'2026-01-25 22:46:41','AL5C3W7',0,NULL),(14,1,8,2,'2026-01-25 22:46:46','T7GGFPE',0,NULL),(15,1,9,12,'2026-01-25 22:46:49','40VM6QR',0,NULL),(16,1,13,1,'2026-01-25 22:46:54','1SZFXTS',0,NULL),(17,1,10,12,'2026-01-25 22:47:05','3DEG04D',0,NULL),(18,1,18,50,'2026-01-25 23:23:33','1I8WWEZ',0,NULL),(19,1,21,22,'2026-01-26 02:30:53','T5OFSO4',0,NULL);
/*!40000 ALTER TABLE `resgates` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-25 23:32:31
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ecoshare
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `solicitacoes_coleta`
--

DROP TABLE IF EXISTS `solicitacoes_coleta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitacoes_coleta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doacao_id` int NOT NULL,
  `solicitante_id` int NOT NULL,
  `doador_id` int NOT NULL,
  `status` enum('pendente','confirmada','recusada','concluida') COLLATE utf8mb4_general_ci DEFAULT 'pendente',
  `criada_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_solicitacao` (`doacao_id`,`solicitante_id`),
  KEY `solicitante_id` (`solicitante_id`),
  KEY `doador_id` (`doador_id`),
  CONSTRAINT `solicitacoes_coleta_ibfk_1` FOREIGN KEY (`doacao_id`) REFERENCES `doacoes` (`id`),
  CONSTRAINT `solicitacoes_coleta_ibfk_2` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `solicitacoes_coleta_ibfk_3` FOREIGN KEY (`doador_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitacoes_coleta`
--

LOCK TABLES `solicitacoes_coleta` WRITE;
/*!40000 ALTER TABLE `solicitacoes_coleta` DISABLE KEYS */;
INSERT INTO `solicitacoes_coleta` VALUES (1,1,2,1,'concluida','2026-01-23 17:00:51'),(2,2,1,2,'concluida','2026-01-23 17:15:58'),(5,3,2,1,'concluida','2026-01-23 19:28:56'),(7,4,2,1,'concluida','2026-01-23 19:46:21'),(10,5,1,2,'concluida','2026-01-23 19:52:07'),(12,6,1,2,'concluida','2026-01-23 20:10:45'),(15,7,2,1,'concluida','2026-01-24 17:16:30'),(16,8,2,1,'concluida','2026-01-24 17:26:04'),(17,9,2,1,'concluida','2026-01-24 17:42:16'),(19,10,1,2,'concluida','2026-01-24 20:23:37'),(20,11,1,2,'concluida','2026-01-24 21:38:35'),(21,12,1,2,'concluida','2026-01-25 03:47:23'),(23,13,2,1,'concluida','2026-01-25 19:22:38'),(24,14,1,2,'concluida','2026-01-25 20:01:32'),(25,15,1,2,'concluida','2026-01-25 20:24:33'),(26,16,1,2,'concluida','2026-01-25 21:38:55'),(28,17,2,1,'concluida','2026-01-25 21:40:32');
/*!40000 ALTER TABLE `solicitacoes_coleta` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-25 23:32:31
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ecoshare
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `senha` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `data_nascimento` date DEFAULT NULL,
  `cep` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `endereco` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `complemento` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_token` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pontos` int NOT NULL DEFAULT '0',
  `tipo` enum('usuario','admin') COLLATE utf8mb4_general_ci DEFAULT 'usuario',
  `status` enum('ativo','bloqueado') COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Tayná Gonçalves','taynagon7302@gmail.com','$2b$10$hDNJilCl/D0cnuxXGVAXquG0Tr3HjyMua0h6GD5XR9CzRU1xz9Yke','1999-11-11','85814-510','da Garça','87','Casa','2026-01-23 16:45:21','99215226-377b-4b5e-b874-de88ab9b3abf','2026-01-23 18:17:00','45999723256',28,'admin','ativo'),(2,'Dimitri Silva','miticompu@hotmail.com','$2b$10$HR8tZpPmt2Ii68TI60QTWeoDLrq0yr3GU1JIcMe3TGibf0ZTiTAJm','1999-11-11','85814-510','da Garça','87','Casa','2026-01-23 16:49:23',NULL,NULL,'45998060728',0,'admin','ativo');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-25 23:32:31
CREATE TABLE notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50),
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
ALTER TABLE usuarios ADD notificacoes_ativas BOOLEAN DEFAULT true;
