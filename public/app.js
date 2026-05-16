document.getElementById('formEquipo').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre_pais = document.getElementById('nombre_pais').value;
    const codigo_fifa = document.getElementById('codigo_fifa').value;
    const director_tecnico = document.getElementById('director_tecnico').value;
    const ranking_fifa = parseInt(document.getElementById('ranking_fifa').value);
    const cantidad_jugadores = parseInt(document.getElementById('cantidad_jugadores').value);

    const editingId = e.target.dataset.editingId;

    const url = editingId ? `/api/equipos/${editingId}` : '/api/equipos';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            nombre_pais, 
            codigo_fifa, 
            director_tecnico, 
            ranking_fifa, 
            cantidad_jugadores,
            grupo_id: null
        })
    });

    const result = await res.json();

    if (res.ok) {
        alert(result.message);
        delete e.target.dataset.editingId;
        document.querySelector('#formEquipo button[type="submit"]').textContent = "Guardar equipo";

        document.getElementById('formEquipo').reset();
        listarEquipos();
    } else {
        alert("Error del servidor: " + result.error);
    }

});

document.getElementById('formGrupo').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre_grupo = document.getElementById('nombre_grupo').value;
    const descripcion = document.getElementById('descripcion').value;
    
    const editingId = e.target.dataset.editingId;
    
    const url = editingId ? `/api/grupos/${editingId}` : '/api/grupos';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre_grupo,
            descripcion
        })
    });

    const result = await res.json();

    if (res.ok) {
        alert(result.message);
        delete e.target.dataset.editingId;
        document.querySelector('#formGrupo button[type="submit"]').textContent = "Guardar Grupo";

        document.getElementById('formGrupo').reset();
        listarGrupos();
    } else {
        alert("Error del servidor: " + result.error);
    }
});

async function listarEquipos() {
    const res = await fetch('/api/equipos');
    const data = await res.json();
    const tbody = document.querySelector('#tablaEquipos tbody');
    tbody.innerHTML = data.map(e => `
        <tr>
            <td>${e.nombre_pais}</td>
            <td>${e.codigo_fifa}</td>
            <td>
                <button class="btn-edit" onclick="cargarEquipoEnFormulario(${JSON.stringify(e).replace(/"/g, '&quot;')})">Actualizar Equipo</button>
                <button class="btn-delete" onclick="eliminarEquipo(${e.id})">Eliminar Equipo</button>
            </td>
        </tr>
    `).join('');
}

async function listarGrupos() {
    const res = await fetch('/api/grupos-detalles');
    const data = await res.json();
    const tbody = document.querySelector('#tablaGrupos tbody');
    tbody.innerHTML = data.map(e => `
        <tr>
            <td>${e.nombre_grupo}</td>
            <td>
                <button class="btn-edit" onclick="cargarGrupoEnFormulario(${JSON.stringify(e).replace(/"/g, '&quot;')})">Actualizar Grupo</button>
                <button class="btn-delete" onclick="eliminarGrupo(${e.id})">Eliminar Grupo</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnGenerar').addEventListener('click', async () => {
    const num = document.getElementById('numGruposSolicitados').value;
    
    const res = await fetch('/api/realizar-sorteo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ numGruposSolicitados: parseInt(num) })
    });

    const result = await res.json();
    if (res.ok) {
        alert(result.message);
        mostrarVistaPrevia();
        document.getElementById('btnGuardarSorteo').style.display = 'block';
    } else {
        alert(result.error);
    }
});

async function mostrarVistaPrevia() {
    const res = await fetch('/api/sorteo');
    const data = await res.json();
    const container = document.getElementById('vistaPreviaSorteo');
    
    const grupos = data.reduce((acc, curr) => {
        if (!acc[curr.nombre_grupo]) acc[curr.nombre_grupo] = [];
        acc[curr.nombre_grupo].push(curr.nombre_pais);
        return acc;
    }, {});

    container.innerHTML = Object.entries(grupos).map(([nombre, equipos]) => `
        <div class="grupo-box">
            <h3>${nombre}</h3>
            <ul>${equipos.map(e => `<li>${e}</li>`).join('')}</ul>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    listarEquipos();
    listarGrupos();
});

async function eliminarEquipo(id) {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return;
    
    const res = await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
    const result = await res.json();

    if (res.ok) {
        alert(result.message);
        listarEquipos();
    } else {
        alert("Error: " + result.error);
    }
}

async function eliminarGrupo(id) {
    if (!confirm("¿Estas seguro de eliminar este grupo? Los equipos quedarán libres.")) return;

    const res = await fetch(`/api/grupos/${id}`, { method: 'DELETE' });
    const result = await res.json();

    if (res.ok) {
        alert(result.message);
        listarGrupos();
        listarEquipos();
    } else {
        alert("Error: " + result.error);
    }
}

function cargarEquipoEnFormulario(equipo) {
    document.getElementById('nombre_pais').value = equipo.nombre_pais;
    document.getElementById('codigo_fifa').value = equipo.codigo_fifa;
    document.getElementById('director_tecnico').value = equipo.director_tecnico;
    document.getElementById('ranking_fifa').value = equipo.ranking_fifa;
    document.getElementById('cantidad_jugadores').value = equipo.cantidad_jugadores;

    document.getElementById('formEquipo').dataset.editingId = equipo.id;
    document.querySelector('#formEquipo button[type="submit"]').textContent = "Confirmar Actualización";
}

function cargarGrupoEnFormulario(grupo) {
    document.getElementById('nombre_grupo').value = grupo.nombre_grupo;
    document.getElementById('descripcion').value = grupo.descripcion;

    document.getElementById('formGrupo').dataset.editingId = grupo.id;
    document.querySelector('#formGrupo button[type="submit"]').textContent = "Confirmar Actualización";
}

document.getElementById('btnGuardarSorteo').addEventListener('click', () => {
    alert("Distribución guardada permanentemente en la base de datos.");
    location.reload();
});