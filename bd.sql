CREATE DATABASE IF NOT EXISTS meu_projeto;
USE meu_projeto;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ocorrencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,       -- 'Assalto', 'Iluminação', 'Via deserta', 'Posto Seguro'
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    verificado BOOLEAN DEFAULT FALSE,
    votos INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
 
CREATE TABLE IF NOT EXISTS postos_seguros (
    id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo ENUM('policial', 'hospital') NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco VARCHAR(255),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

SELECT * FROM ocorrencias;
SELECT * FROM meu_projeto.usuarios;