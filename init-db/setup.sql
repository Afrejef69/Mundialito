CREATE TABLE IF NOT EXISTS grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_grupo VARCHAR(20) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    CONSTRAINT check_formato_grupo CHECK (nombre_grupo LIKE 'Grupo %')
);

CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_pais VARCHAR(100) NOT NULL UNIQUE,
    codigo_fifa CHAR(3) NOT NULL UNIQUE,
    director_tecnico VARCHAR(100) NOT NULL,
    ranking_fifa INT NOT NULL,
    cantidad_jugadores INT NOT NULL,
    grupo_id INT,
    CONSTRAINT check_codigo_fifa CHECK (LENGTH(codigo_fifa) = 3),
    CONSTRAINT check_cantidad_jugadores CHECK (cantidad_jugadores BETWEEN 23 AND 26),
    CONSTRAINT check_ranking CHECK (ranking_fifa > 0),
    CONSTRAINT fk_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL
);