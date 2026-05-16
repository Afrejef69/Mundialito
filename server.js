require('dotenv').config();
const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'))

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

app.post('/api/equipos', async (req, res) => {
    let conn;
    const {nombre_pais, codigo_fifa, director_tecnico, ranking_fifa, cantidad_jugadores, grupo_id} = req.body;

    if (codigo_fifa.length !== 3) return res.status(400).json({ error: "El codigo FIFA debe tener 3 letras"});
    if (cantidad_jugadores < 23 || cantidad_jugadores > 26) {
        return res.status(400).json({ error: "La cantidad de jugadores registrados debe estar entre 23 y 26"});
    }

    try {
        conn = await pool.getConnection();
        const sql = `INSERT INTO equipos
            (nombre_pais, codigo_fifa, director_tecnico, ranking_fifa, cantidad_jugadores, grupo_id) VALUES (?, ?, ?, ?, ?, ?)`;
        await conn.query(sql, [nombre_pais, codigo_fifa.toUpperCase(), director_tecnico, ranking_fifa, cantidad_jugadores, grupo_id]);
        res.status(201).json({ message: "Equipo registrado exitosamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/equipos', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM equipos");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/equipos/:id', async (req, res) => {
    let conn;
    const { id } = req.params;
    const { nombre_pais, codigo_fifa, director_tecnico, ranking_fifa, cantidad_jugadores, grupo_id } = req.body;

    if (codigo_fifa.length !== 3) return res.status(400).json({ error: "El codigo FIFA debe tener 3 letras"});
    if (cantidad_jugadores < 23 || cantidad_jugadores > 26) {
        return res.status(400).json({ error: "La cantidad de jugadores registrados debe estar entre 23 y 26"});
    }
    
    try {
        conn = await pool.getConnection();
        const sql = `UPDATE equipos SET
            nombre_pais = ?, codigo_fifa = ?, director_tecnico = ?,
            ranking_fifa = ?, cantidad_jugadores = ?, grupo_id = ?
            WHERE id = ?`;
        await conn.query(sql, [nombre_pais, codigo_fifa.toUpperCase(), director_tecnico, ranking_fifa, cantidad_jugadores, grupo_id, id]);
        res.json({ message: "Datos del equipo actualizados" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.delete('/api/equipos/:id', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("DELETE FROM equipos WHERE id = ?", [req.params.id]);
        res.json({ message: "Equipo eliminado del sistema" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/grupos', async (req, res) => {
    let conn;
    const { nombre_grupo, descripcion } = req.body;
    if (!/^Grupo [A-Z]$/.test(nombre_grupo)) {
        return res.status(400).json({ error: "Formato inválido. Ejemplo: 'Grupo A'"});
    }

    try {
        conn = await pool.getConnection();
        await conn.query("INSERT INTO grupos (nombre_grupo, descripcion) VALUES (?, ?)", [nombre_grupo, descripcion]);
        res.status(201).json({ message: "Grupo creado con éxito"});
    } catch (err) {
        res.status(500).json({ error: err.code === 'ER_DUP_ENTRY' ? "El grupo ya existe" : err.message});
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/grupos', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM grupos ORDER BY nombre_grupo ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/grupos/:id', async (req, res) => {
    let conn;
    const { id } = req.params;
    const { nombre_grupo, descripcion } = req.body;

    if (!/^Grupo [A-Z]$/. test(nombre_grupo)) {
        return res.status(400).json({ error: "Formato inválido. Ejemplo: 'Grupo A'"});
    }
    try {
        conn = await pool.getConnection();
        await conn.query("UPDATE grupos SET nombre_grupo = ?, descripcion = ? WHERE id = ?", [nombre_grupo, descripcion, id]);
        res.json({ message: "Grupo actualizado correctamente" });
    }catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.delete('/api/grupos/:id', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("DELETE FROM grupos WHERE id = ?", [req.params.id]);
        res.json({ message: "Grupo eliminado. Los equipos asignados ahora están sin grupo." })
    }catch (err) {
        res.status(500).json({ error: "No se puede eliminar el grupo: " + err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/realizar-sorteo', async (req, res) =>{
    const { numGruposSolicitados } = req.body;
    let conn;

    try{
        conn = await pool.getConnection();

        const gruposDB = await conn.query("SELECT id FROM grupos");
        const equiposDB = await conn.query("SELECT id FROM equipos");

        if (numGruposSolicitados < 2) {
            return res.status(400).json({ error: "Debe haber más de 1 grupo para el sorteo."});
        }

        if (numGruposSolicitados > gruposDB.length) {
            return res.status(400).json({ error: `Solo tienes ${gruposDB.length} grupos registrados.`});
        }

        const totalEquipos = equiposDB.length;
        if (totalEquipos % numGruposSolicitados !== 0) {
            return res.status(400).json({ error: `No es equitativo. ${totalEquipos} equipos entre ${numGruposSolicitados} grupos dejaría equipos fuera`});
        }

        const equiposMezclados = equiposDB.sort(() => Math.random() - 0.5);
        const equiposPorGrupo = totalEquipos / numGruposSolicitados;

        await conn.query("UPDATE equipos SET grupo_id = NULL");

        for (let i = 0; i < numGruposSolicitados; i++) {
            const grupoId = gruposDB[i].id;
            const loteEquipos = equiposMezclados.slice(i * equiposPorGrupo, (i + 1) * equiposPorGrupo);
            for (let equipo of loteEquipos) {
                await conn.query("UPDATE equipos SET grupo_id = ? WHERE id = ?", [grupoId,equipo.id]);
            }
        }
        res.json({ message: `Sorteo completado: ${numGruposSolicitados} gupos con ${equiposPorGrupo} equipos cada uno.`});
    } catch (err) {
        res.status(500).json({ error: "Error en el proceso de sorteo: " + err.message});
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/grupos-detalles', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM grupos ORDER BY nombre_grupo ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/sorteo', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`
            SELECT e.nombre_pais, e.codigo_fifa, e.director_tecnico, g.nombre_grupo 
            FROM equipos e
            INNER JOIN grupos g ON e.grupo_id = g.id
            ORDER BY g.nombre_grupo ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Mundialista en: http://localhost:${PORT}`);
});