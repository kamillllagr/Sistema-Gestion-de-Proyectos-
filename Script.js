// Cuando el documento HTML se carga completamente, se ejecuta la función cargarProyectos
// Esto asegura que el DOM esté listo antes de intentar manipularlo
document.addEventListener('DOMContentLoaded', cargarProyectos);

// Función para agregar un nuevo proyecto
function agregarProyecto() {
    // Aqui se btiene el valor del campo de texto donde se ingresa el nombre del proyecto
    const nombre = document.getElementById('proyectoNombre').value.trim();

    // Si el campo está vacío, muestra una alerta 
    if (nombre === '') return alert('Ingresa un nombre para el proyecto.');

    // Obtiene la lista de proyectos almacenados en localStorage
    const proyectos = obtenerProyectosDesdeLocalStorage();

    // Verifica si ya existe un proyecto con el mismo nombre
    if (proyectos.some(p => p.nombre === nombre)) {
        alert('Ese proyecto ya existe.');
        return;
    }

    // Crea un nuevo proyecto con un nombre y una lista vacía de tareas
    const nuevoProyecto = { nombre, tareas: [] };

    // Agrega el nuevo proyecto a la lista de proyectos
    proyectos.push(nuevoProyecto);

    // Guarda la lista actualizada de proyectos en localStorage
    guardarProyectosEnLocalStorage(proyectos);

    // Renderiza el nuevo proyecto en la interfaz
    renderizarProyecto(nuevoProyecto);

    // Limpia el campo de texto
    document.getElementById('proyectoNombre').value = '';

    // Actualiza el contador de tareas completadas y pendientes
    actualizarEstadoTareas();
}

// Función para mostrar un proyecto en la interfaz
function renderizarProyecto(proyecto) {
    // Obtiene el contenedor donde se mostrarán los proyectos
    const proyectosDiv = document.getElementById('proyectos');

    // Crea un contenedor para el proyecto
    const contenedor = document.createElement('div');
    contenedor.className = 'proyecto';

    // Crea un encabezado con el nombre del proyecto
    const encabezado = document.createElement('h3');
    encabezado.textContent = proyecto.nombre;

    // Botón para eliminar el proyecto
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar Proyecto';
    btnEliminar.onclick = () => {
        eliminarProyecto(proyecto.nombre); // Elimina el proyecto de localStorage
        contenedor.remove(); // Elimina el proyecto de la interfaz
        actualizarEstadoTareas(); // Actualiza el contador de tareas
    };

    // Campos de entrada para agregar tareas al proyecto
    const inputTarea = document.createElement('input');
    inputTarea.placeholder = 'Nueva tarea'; // Campo para la descripción de la tarea

    const inputResponsable = document.createElement('input');
    inputResponsable.placeholder = 'Responsable'; // Campo para el responsable de la tarea

    const inputFecha = document.createElement('input');
    inputFecha.type = 'date'; // Campo para la fecha de vencimiento

    const inputHora = document.createElement('input');
    inputHora.type = 'time'; // Campo para la hora de vencimiento

    // Selector para la prioridad de la tarea
    const selectorPrioridad = document.createElement('select');
    selectorPrioridad.innerHTML = `
        <option value="baja">Baja</option>
        <option value="media">Media</option>
        <option value="alta">Alta</option>
    `;

    // Botón para agregar una nueva tarea
    const btnAgregarTarea = document.createElement('button');
    btnAgregarTarea.textContent = 'Agregar Tarea';
    btnAgregarTarea.onclick = () => {
        // Obtiene los valores de los campos de entrada
        const descripcion = inputTarea.value.trim();
        const responsable = inputResponsable.value.trim();
        const fecha = inputFecha.value;
        const hora = inputHora.value;
        const prioridad = selectorPrioridad.value;

        // Verifica que todos los campos estén completos
        if (!descripcion || !responsable || !fecha || !hora) {
            alert('Completa todos los campos.');
            return;
        }

        // Crea un objeto para la nueva tarea
        const tarea = { 
            descripcion, 
            responsable, 
            fechaVencimiento: `${fecha} ${hora}`, 
            prioridad, 
            completada: false, 
            comentarios: [] 
        };

        // Agrega la tarea al proyecto
        proyecto.tareas.push(tarea);

        // Actualiza el proyecto en localStorage
        actualizarProyectoEnLocalStorage(proyecto);

        // Muestra la tarea en la interfaz
        renderizarTarea(tarea, listaTareas, proyecto);

        // Limpia los campos de entrada
        inputTarea.value = '';
        inputResponsable.value = '';
        inputFecha.value = '';

        // Actualiza el contador de tareas
        actualizarEstadoTareas();
    };

    // Lista para mostrar las tareas del proyecto
    const listaTareas = document.createElement('ul');
    proyecto.tareas.forEach(t => renderizarTarea(t, listaTareas, proyecto));

    // Agrega todos los elementos al contenedor del proyecto
    contenedor.append(encabezado, btnEliminar, inputTarea, inputResponsable, inputFecha, inputHora, selectorPrioridad, btnAgregarTarea, listaTareas);

    // Agrega el contenedor del proyecto al DOM
    proyectosDiv.appendChild(contenedor);
}

// Función para mostrar una tarea en la interfaz
function renderizarTarea(tarea, lista, proyecto) {
    // Crea un elemento de lista para la tarea
    const item = document.createElement('li');
    item.className = tarea.prioridad; // Aplica la clase según la prioridad
    if (tarea.completada) item.classList.add('completada'); // Marca la tarea como completada si corresponde

    // Muestra la descripción de la tarea
    const descripcion = document.createElement('p');
    descripcion.textContent = `Descripción: ${tarea.descripcion}`;

    // Muestra el responsable de la tarea
    const responsable = document.createElement('p');
    responsable.textContent = `Responsable: ${tarea.responsable}`;

    // Muestra la fecha y hora de vencimiento
    const fecha = document.createElement('p');
    const fechaHora = new Date(tarea.fechaVencimiento);
    const opcionesFormato = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    fecha.textContent = `Fecha de vencimiento: ${fechaHora.toLocaleString('es-ES', opcionesFormato)}`;

    // Botón para marcar o desmarcar la tarea como completada
    const btnCompletar = document.createElement('button');
    btnCompletar.textContent = tarea.completada ? 'Desmarcar' : 'Marcar';
    btnCompletar.className = 'completar';
    btnCompletar.onclick = () => {
        tarea.completada = !tarea.completada; // Cambia el estado de completada
        actualizarProyectoEnLocalStorage(proyecto); // Actualiza el proyecto en localStorage
        item.classList.toggle('completada'); // Cambia la clase en la interfaz
        btnCompletar.textContent = tarea.completada ? 'Desmarcar' : 'Marcar'; // Cambia el texto del botón
        actualizarEstadoTareas(); // Actualiza el contador de tareas
    };

    // Botón para eliminar la tarea
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.className = 'eliminar';
    btnEliminar.onclick = () => {
        const index = proyecto.tareas.indexOf(tarea);
        if (index !== -1) {
            proyecto.tareas.splice(index, 1); // Elimina la tarea del proyecto
            actualizarProyectoEnLocalStorage(proyecto); // Actualiza el proyecto en localStorage
            item.remove(); // Elimina la tarea de la interfaz
            actualizarEstadoTareas(); // Actualiza el contador de tareas
        }
    };

    // Contenedor para los botones de la tarea
    const botonesDiv = document.createElement('div');
    botonesDiv.className = 'botones-tarea';
    botonesDiv.append(btnCompletar, btnEliminar);

    // Contenedor para los comentarios de la tarea
    const comentariosDiv = document.createElement('div');
    comentariosDiv.className = 'comentarios';

    const titulo = document.createElement('p');
    titulo.textContent = 'Comentarios:';
    comentariosDiv.appendChild(titulo);

    const listaComentarios = document.createElement('ul');
    tarea.comentarios.forEach(comentario => {
        const li = crearComentarioItem(comentario, tarea, proyecto, listaComentarios);
        listaComentarios.appendChild(li);
    });

    const inputComentario = document.createElement('input');
    inputComentario.placeholder = 'Agregar comentario';

    const btnComentario = document.createElement('button');
    btnComentario.textContent = 'Añadir Comentario';
    btnComentario.onclick = () => {
        const texto = inputComentario.value.trim();
        if (!texto) return;

        tarea.comentarios.push(texto);
        actualizarProyectoEnLocalStorage(proyecto);
        const li = crearComentarioItem(texto, tarea, proyecto, listaComentarios);
        listaComentarios.appendChild(li);
        inputComentario.value = '';
    };

    comentariosDiv.append(listaComentarios, inputComentario, btnComentario);

    // Agrega todos los elementos al elemento de lista de la tarea
    item.append(descripcion, responsable, fecha, botonesDiv, comentariosDiv);
    lista.appendChild(item);
}

// Función para crear un elemento de comentario
function crearComentarioItem(texto, tarea, proyecto, contenedor) {
    const li = document.createElement('li');
    li.textContent = texto;

    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'X';
    btnEliminar.onclick = () => {
        const index = tarea.comentarios.indexOf(texto);
        if (index !== -1) {
            tarea.comentarios.splice(index, 1);
            actualizarProyectoEnLocalStorage(proyecto);
            li.remove();
        }
    };

    li.appendChild(btnEliminar);
    return li;
}

// Función para cargar los proyectos desde localStorage y mostrarlos en la interfaz
function cargarProyectos() {
    const proyectos = obtenerProyectosDesdeLocalStorage();
    proyectos.forEach(renderizarProyecto); // Renderiza cada proyecto
    actualizarEstadoTareas(); // Actualiza el contador de tareas
}

// Función para actualizar un proyecto en localStorage
function actualizarProyectoEnLocalStorage(proyectoActualizado) {
    const proyectos = obtenerProyectosDesdeLocalStorage().map(p =>
        p.nombre === proyectoActualizado.nombre ? proyectoActualizado : p
    );
    guardarProyectosEnLocalStorage(proyectos);
}

// Función para eliminar un proyecto de localStorage
function eliminarProyecto(nombre) {
    const proyectos = obtenerProyectosDesdeLocalStorage().filter(p => p.nombre !== nombre);
    guardarProyectosEnLocalStorage(proyectos);
}

// Función para guardar la lista de proyectos en localStorage
function guardarProyectosEnLocalStorage(proyectos) {
    localStorage.setItem('proyectos', JSON.stringify(proyectos));
}

// Función para obtener la lista de proyectos desde localStorage
function obtenerProyectosDesdeLocalStorage() {
    return JSON.parse(localStorage.getItem('proyectos')) || [];
}

// Función para actualizar el contador de tareas completadas y pendientes
function actualizarEstadoTareas() {
    const proyectos = obtenerProyectosDesdeLocalStorage();
    let completadas = 0, pendientes = 0;
    proyectos.forEach(p => p.tareas.forEach(t => t.completada ? completadas++ : pendientes++));
    document.getElementById('TareasT').textContent = `Completadas: ${completadas} --- Pendientes: ${pendientes}`;
}

