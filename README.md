# Gestión de Grupos - Mundial 2026

Sistema básico de gestión y automatización de sorteos para selecciones de fútbol con asignación equitativa y aleatoria en grupos del Mundial. Este proyecto fue diseñado como una solución técnica local que integra un servidor en Node.js, una interfaz web limpia (HTML/CSS/JS) y persistencia de datos.

## Características Principales

- **Registro de Equipos:** Validación estricta de códigos FIFA (3 letras) y plantillas de jugadores (mínimo 23, máximo 26).
- **Gestión de Grupos:** Creación y control de grupos con formato estandarizado (Ej: "Grupo A").
- **Sorteo Automatizado:** Algoritmo que mezcla de forma aleatoria los equipos registrados y los distribuye de forma equitativa entre la cantidad de grupos solicitados.
- **Interfaz Dinámica:** Consumo de APIs internas mediante peticiones asíncronas (`fetch`) desde el frontend.

---

## Tecnologías Utilizadas

- **Backend:** Node.js, Express.js, CORS, Dotenv.
- **Frontend:** HTML5, CSS3 (Diseño responsivo con CSS Grid), JavaScript Vanila (ES6).
- **Base de Datos:** Relacional (Estructura SQL para persistencia de entidades).

---

## Estructura del Proyecto

```text
├── public/                 # Archivos estáticos del Frontend
│   ├── index.html          # Interfaz de usuario principal
│   ├── style.css           # Estilos y diseño responsivo
│   └── app.js              # Lógica de consumo de API y manipulación del DOM
├── server.js               # Servidor principal y API REST (Node/Express)
├── package.json            # Dependencias y scripts del proyecto
└── README.md               # Documentación del sistema

## Ejecución del Proyecto
Instalación y Configuración Local
Sigue estos pasos desde tu terminal para clonar y ejecutar el proyecto en tu entorno de desarrollo local:

1. Clonar el repositorio e instalar dependencias
Bash

# Instalar los paquetes de Node especificados en el package.json
npm install
    express
    cors
    mariadb
    dotenv
    sqlite3
2. Configurar las Variables de Entorno
Crea un archivo .env en la raíz del proyecto para alojar las credenciales confidenciales de tu entorno:

Guiate de .env.local

3. Ejecutar el Servidor
Para iniciar el servidor local de Express:

Bash

node server.js
Una vez levantado, abre tu navegador web e ingresa a:
👉 http://localhost:3000
```
