// Elementos DOM
const contenedorLogin = document.getElementById('contenedor-login');
const aplicacionPrincipal = document.getElementById('aplicacion-principal');
const mensajeBienvenida = document.getElementById('mensaje-bienvenida');
const entradaNombre = document.getElementById('entrada-nombre');
const botonLogin = document.getElementById('boton-login');
const errorLogin = document.getElementById('error-login');
const botonLogout = document.getElementById('boton-logout');
const contenedorLibros = document.getElementById('contenedor-libros');
const listaLibros = document.getElementById('lista-libros');
const tituloGenero = document.getElementById('titulo-genero');
const volverMenu = document.getElementById('volver-menu');
const contenedorCalificacion = document.getElementById('contenedor-calificacion');
const libroACalificar = document.getElementById('libro-a-calificar');
const entradaComentario = document.getElementById('entrada-comentario');
const enviarCalificacion = document.getElementById('enviar-calificacion');
const cancelarCalificacion = document.getElementById('cancelar-calificacion');
const contenedorLibroAleatorio = document.getElementById('contenedor-libro-aleatorio');
const infoLibroAleatorio = document.getElementById('info-libro-aleatorio');
const calificarLibroAleatorio = document.getElementById('calificar-libro-aleatorio');
const volverAleatorio = document.getElementById('volver-aleatorio');
const contenedorMensaje = document.getElementById('contenedor-mensaje');
const textoMensaje = document.getElementById('texto-mensaje');
const cerrarMensaje = document.getElementById('cerrar-mensaje');

// VARIABLES
let conectado = false;
let nombre = null;
let libroActual = null;
let generoActual = null;
let calificacionActual = 0;
const estrellas = document.querySelectorAll('.estrella');

// EVENT LISTENERS
botonLogin.addEventListener('click', manejarLogin);

entradaNombre.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') manejarLogin();
});

botonLogout.addEventListener('click', manejarLogout);

volverMenu.addEventListener('click', () => {
    mostrarLibrosPorGenero('todos');
});

document.querySelectorAll('.boton-menu[data-genero]').forEach(boton => {
    boton.addEventListener('click', (e) => {
        const genero = e.target.dataset.genero;
        if (genero === 'aleatorio') {
            document.getElementById('contenedor-menu').classList.add('oculto');
            mostrarLibroAleatorio();
        } else {
            mostrarLibrosPorGenero(genero);
        }
    });
});

estrellas.forEach(estrella => {
    estrella.addEventListener('click', manejarClickEstrella);
});

enviarCalificacion.addEventListener('click', enviarCalificacionLibro);

cancelarCalificacion.addEventListener('click', () => {
    if (generoActual === 'aleatorio') {
        alternarVista('aleatorio');
    } else {
        alternarVista('libros');
    }
});

calificarLibroAleatorio.addEventListener('click', () => {
    mostrarFormularioCalificacion(libroActual);
});

volverAleatorio.addEventListener('click', () => {
    alternarVista('menu');
    // Explicitly show menu when returning
    document.getElementById('contenedor-menu').classList.remove('oculto');
});

cerrarMensaje.addEventListener('click', () => contenedorMensaje.classList.add('oculto'));

// FUNCIONES:

    // FUNCIÓN INICIAR SESIÓN
    function manejarLogin() {
        const nombreIngresado = entradaNombre.value.trim();
        const esValido = /^\p{L}+$/u.test(nombreIngresado);
        
        if (!nombreIngresado) {
            mostrarError("Por favor ingresa tu nombre");
            return;
        }
        
        if (!esValido) {
            mostrarError("Nombre inválido. Solo letras por favor.");
            return;
        }
        
        nombre = nombreIngresado.charAt(0).toUpperCase() + nombreIngresado.slice(1).toLowerCase();
        conectado = true;
        
        // UI Update
        mensajeBienvenida.textContent = `¡Hola ${nombre}! 👋​`;
        contenedorLogin.classList.add('oculto');
        aplicacionPrincipal.classList.remove('oculto');
        
        // Show menu and all books immediately
        document.getElementById('contenedor-menu').classList.remove('oculto');
        mostrarLibrosPorGenero('todos');
        
        console.log("Usuario:", nombre);
    }

    // FUNCIÓN CERRAR SESIÓN
    function manejarLogout() {
        conectado = false;
        const nombreIngresado = entradaNombre.value.trim();
        nombre = nombreIngresado.charAt(0).toUpperCase() + nombreIngresado.slice(1).toLowerCase();
        entradaNombre.value = '';
        aplicacionPrincipal.classList.add('oculto');
        contenedorLogin.classList.remove('oculto');
        mostrarMensaje(`¡Nos vemos la próxima, ${nombre}!`);
        console.log(`${nombre} abandonó la app.`);
    }

    // FUNCIÓN MOSTRAR ERROR
    function mostrarError(mensaje) {
        errorLogin.textContent = mensaje;
        errorLogin.classList.add('activo');
        setTimeout(() => {
            errorLogin.classList.remove('activo');
        }, 3000);
    }

    // FUNCIÓN PARA MOSTRAR LIBROS FILTRADOS POR GÉNERO
    function mostrarLibrosPorGenero(genero) {
        generoActual = genero;
        const mapaGeneros = {
            'romance': 'Romance',
            'terror': 'Terror',
            'aventura': 'Aventura',
            'coyuntura': 'Coyuntura',
            'policiales': 'Policiales',
            'ciencia ficción': 'Ciencia ficción',
            'otros': 'Otros',
            'todos': 'Todos los libros'
        };
        
        const librosGenero = genero === 'todos' 
        ? libros 
        : libros.filter(libro => libro.genero.trim().toLowerCase() === genero.toLowerCase());
    
        if (librosGenero.length === 0) {
            mostrarMensaje(`No hay libros disponibles en el género ${mapaGeneros[genero] || genero}`);
            return;
        }
        
        tituloGenero.textContent = genero === 'todos' 
        ? 'Todos los libros disponibles' 
        : `Libros de ${mapaGeneros[genero] || genero}`;
        listaLibros.innerHTML = '';
        
        librosGenero.forEach((libro, indice) => {
            const elementoLibro = document.createElement('div');
            elementoLibro.className = 'elemento-libro';
            
            // UI - IMAGEN E INFORMACIÓN DE CADA LIBRO
            const imagenHTML = libro.imagen 
                ? `<div class="contenedor-imagen-libro">
                    <img src="${libro.imagen}" alt="${libro.titulo}" class="imagen-libro" onerror="this.src='libro-default.jpg'">
                </div>`
                : '<div class="marcador-imagen-libro">No hay imagen disponible.</div>';
            
                elementoLibro.innerHTML = `
                ${imagenHTML}
                <div class="info-libro">
                    <h4>${libro.titulo}</h4>
                    <p>Autor: ${libro.autor}</p>
                    ${libro.calificaciones && libro.calificaciones.length > 0 ? 
                        `<p>Calificación promedio: ${calcularPromedioCalificaciones(libro.calificaciones).toFixed(1)} ★ 
                        (${libro.calificaciones.length} calificaciones)</p>` : 
                        '<p>Sin calificaciones aún</p>'}
                    ${libro.comentarios && libro.comentarios.length > 0 ? 
                        `<div class="comentarios-libro">
                            <h5>Comentarios:</h5>
                            ${libro.comentarios.map(com => `
                                <div class="comentario">
                                    <strong>${com.usuario || 'Anónimo'}:</strong>
                                    <p>${com.texto}</p>
                                    <small>${com.fecha ? new Date(com.fecha).toLocaleDateString() : ''}</small>
                                </div>
                            `).join('')}
                        </div>` : ''}
                    <button class="boton-calificar-libro" data-indice="${indice}">Calificar este libro</button>
                </div>
            `;
            listaLibros.appendChild(elementoLibro);
        });
        
        document.querySelectorAll('.boton-calificar-libro').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const indice = e.target.dataset.indice;
                mostrarFormularioCalificacion(librosGenero[indice]);
            });
        });
        
        contenedorLibros.classList.remove('oculto');
        document.getElementById('contenedor-menu').classList.remove('oculto');
    }

    // FUNCIÓN LIBRO ALEATORIO
    function mostrarLibroAleatorio() {
        const libroAleatorio = libros[Math.floor(Math.random() * libros.length)];
        libroActual = libroAleatorio;
        generoActual = 'aleatorio';
        
        // Clear previous content
        infoLibroAleatorio.innerHTML = '';
        
        // Build book display
        const imagenHTML = libroAleatorio.imagen 
            ? `<div class="imagen-libro-aleatorio">
                <img src="${libroAleatorio.imagen}" alt="${libroAleatorio.titulo}">
            </div>`
            : '<div class="marcador-imagen-libro">No hay imagen disponible</div>';
        
        infoLibroAleatorio.innerHTML = `
            ${imagenHTML}
            <div class="detalles-libro-aleatorio">
                <h4>${libroAleatorio.titulo}</h4>
                <p><strong>Autor:</strong> ${libroAleatorio.autor}</p>
                <p><strong>Género:</strong> ${libroAleatorio.genero}</p>
                ${libroAleatorio.calificaciones?.length > 0 ? 
                    `<p><strong>Calificación promedio:</strong> ${calcularPromedioCalificaciones(libroAleatorio.calificaciones).toFixed(1)} ★</p>` : 
                    '<p><strong>Sin calificaciones aún</strong></p>'}
            </div>
        `;
        
        // Show only random book container
        contenedorLibros.classList.add('oculto');
        contenedorLibroAleatorio.classList.remove('oculto');
    }

    // FUNCIÓN PARA COMPLETAR FORMULARIO DE CLASIFICACIONES
    function mostrarFormularioCalificacion(libro) {
        libroActual = libro;
        libroACalificar.innerHTML = `¿Qué te pareció <strong>"${libro.titulo}"</strong>?`;
        entradaComentario.value = '';
        calificacionActual = 0;
        actualizarEstrellas();
        alternarVista('calificacion');
    }

    // FUNCIÓN PARA PERMITIR AL USUARIO SELECCIONAR LA CANTIDAD DE ESTRELLAS
    function manejarClickEstrella(e) {
        calificacionActual = parseInt(e.target.dataset.calificacion);
        actualizarEstrellas();
    }

    // FUNCIÓN PARA ILUMINAR LAS ESTRELLAS CUANDO EL USUARIO HAGA CLICK
    function actualizarEstrellas() {
        estrellas.forEach(estrella => {
            const calificacion = parseInt(estrella.dataset.calificacion);
            estrella.style.color = calificacion <= calificacionActual ? '#ffd700' : '#ccc';
        });
    }

    // FUNCIÓN QUE TOMA LAS CALIFICACIONES DE LOS USUARIOS Y LAS ALMACENA
    function enviarCalificacionLibro() {
        if (calificacionActual === 0) {
            mostrarMensaje("Por favor selecciona una calificación");
            return;
        }
        
        if (!libroActual.calificaciones) {
            libroActual.calificaciones = [];
        }
        
        libroActual.calificaciones.push(calificacionActual);
        
        const comentario = entradaComentario.value.trim();
        if (comentario) {
            if (!libroActual.comentarios) {
                libroActual.comentarios = [];
            }
            libroActual.comentarios.push({
                usuario: nombre,
                texto: comentario,
                fecha: new Date().toISOString()
            });
        }
        
        // Save to localStorage immediately
        guardarDatosBiblioteca();
        
        mostrarMensaje(`¡Gracias por tu calificación, ${nombre}!`);
        
        if (generoActual === 'aleatorio') {
            alternarVista('aleatorio');
        } else {
            mostrarLibrosPorGenero(generoActual);
        }
    }

    function alternarVista(vista) {
        // Hide all views except menu
        document.querySelectorAll('#aplicacion-principal > div').forEach(div => {
            if (div.id !== 'contenedor-menu') {
                div.classList.add('oculto');
            }
        });
        
        // Show selected view
        if (vista === 'menu') {
            document.getElementById('contenedor-menu').classList.remove('oculto');
        } else if (vista === 'libros') {
            contenedorLibros.classList.remove('oculto');
        } else if (vista === 'calificacion') {
            contenedorCalificacion.classList.remove('oculto');
        } else if (vista === 'aleatorio') {
            contenedorLibroAleatorio.classList.remove('oculto');
        }
    }

    // FUNCIÓN PARA MOSTRAR MENSAJES
    function mostrarMensaje(mensaje) {
        textoMensaje.textContent = mensaje;
        contenedorMensaje.classList.remove('oculto');
    }

    // FUNCIÓN QUE CALCULA EL PROMEDIO DE LAS CALIFICACIONES
    function calcularPromedioCalificaciones(calificaciones) {
        if (!calificaciones || calificaciones.length === 0) return 0;
        const suma = calificaciones.reduce((total, calificacion) => total + calificacion, 0);
        return suma / calificaciones.length;
    }

    // FUNCIONES QUE MANEJAN EL ALMACENAMIENTO DE DATOS
    const CLAVE_ALMACENAMIENTO = "datosBibliotecaLibros";

    function guardarDatosBiblioteca() {
        const datosAGuardar = {
            libros: libros,
            ultimaActualizacion: new Date().toISOString()
        };
        localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datosAGuardar));
        console.log("Datos guardados en LocalStorage:", datosAGuardar);
    }

    function cargarDatosBiblioteca() {
        const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);
        if (datosGuardados) {
            try {
                const datosParseados = JSON.parse(datosGuardados);
                
                // Merge ratings and comments while preserving original book data
                libros.forEach(libro => {
                    const libroGuardado = datosParseados.libros.find(
                        l => l.titulo === libro.titulo && l.autor === libro.autor
                    );
                    
                    if (libroGuardado) {
                        // Merge ratings if they exist
                        if (libroGuardado.calificaciones) {
                            libro.calificaciones = libroGuardado.calificaciones;
                        }
                        // Merge comments if they exist
                        if (libroGuardado.comentarios) {
                            libro.comentarios = libroGuardado.comentarios;
                        }
                    }
                });
                
                console.log("Datos cargados desde LocalStorage");
                return true;
            } catch (e) {
                console.error("Error al analizar datos guardados", e);
                return false;
            }
        }
        return false;
    }

// ARRAY DE OBJETOS: LIBROS
const libros = [

    // GENERO POLICIALES
    { 
        titulo: "La comunidad", 
        autor: "Helene Flood",
        imagen: "assets/books/la-comunidad--helene-flood.webp",
        genero: "Policiales",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "La historia del loco", 
        autor: "John Katzenbach",
        imagen: "assets/books/john-katzenbach--la-historia-del-loco.webp",
        genero: "Policiales",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Leviatán",
        autor: "Paul Auster",
        imagen: "assets/books/paul-auster--leviatan.webp",
        genero: "Policiales",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "La apariencia de las cosas",
        autor: "Elizabeth Brundage",
        imagen: "assets/books/elizabeth-brundage--la-apariencia-de-las-cosas.webp",
        genero: "Policiales"
    },

    // GENERO TERROR
    { 
        titulo: "Los juegos de Gerald", 
        autor: "Stephen King",
        imagen: "assets/books/geralds-game-stephen-king.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    {
        titulo: "El Perfume",
        autor: "Patrick Süskind",
        imagen: "assets/books/patrick-suskind--el-perfume.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    {
        titulo: "Backwater I",
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--blackwater-1.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    {
        titulo: "Backwater II",
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--blackwater-2.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    {
        titulo: "Backwater III",
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--blackwater-3.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    {
        titulo: "Backwater IV",
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--blackwater-4.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    {
        titulo: "Backwater V",
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--blackwater-5.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    {
        titulo: "Backwater VI",
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--blackwater-6.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Carrie", 
        autor: "Stephen King",
        imagen: "assets/books/stephen-king--carrie.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "IT", 
        autor: "Stephen King",
        genero: "Terror",
        imagen: "assets/books/stephen-king--it.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Todo Oscuro, sin estrellas", 
        autor: "Stephen King",
        imagen: "assets/books/stephen-king--todo-oscuro-sin-estrellas.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Katie", 
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--katie.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Agujas Doradas", 
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--agujas-doradas.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Los Elementales", 
        autor: "Michael McDowell",
        imagen: "assets/books/michael-mcdowell--los-elementales.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Colección de cuentos de los Hermanos Grimm", 
        autor: "Hermanos Grimm",
        imagen: "assets/books/hermanos-Grimm--cuentos-de-los-hermanos-Grimm.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "La casa de los suicidios", 
        autor: "Charlie Donlea",
        imagen: "assets/books/charlie-donlea--la-casa-de-los-suicidios.webp",
        genero: "Terror",
        ratings: [],
        comentarios: []
    },
    
    // GENERO AVENTURA
    { 
        titulo: "Los juegos del hambre", 
        autor: "Suzanne Collins",
        imagen: "assets/books/suzanne-collins-los-juegos-del-hambre.webp",
        genero: "Aventura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "En llamas", 
        autor: "Suzanne Collins",
        imagen: "assets/books/suzanne-collins--en-llamas.webp",
        genero: "Aventura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Sinsajo", 
        autor: "Suzanne Collins",
        imagen: "assets/books/suzanne-collins--sinsajo.webp",
        genero: "Aventura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Balada de pájaros cantores y serpientes", 
        autor: "Suzanne Collins",
        imagen: "assets/books/suzanne-collins--balada.webp",
        genero: "Aventura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Amanecer en la cosecha", 
        autor: "Suzanne Collins",
        imagen: "assets/books/suzanne-collins--amanecer-en-la-cosecha.webp",
        genero: "Aventura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "El Bucle", 
        autor: "F. F. Alberti",
        imagen: "assets/books/ff-alberti--el-bucle.webp",
        genero: "Aventura",
        ratings: [],
        comentarios: []
    },

    // GENERO COYUNTURA
    { 
        titulo: "El segundo sexo", 
        autor: "Simone de Beauvoir",
        imagen: "assets/books/simone-de-beauvoir--el-segundo-sexo.webp",
        genero: "Coyuntura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Las caras del monstruo", 
        autor: "Julia Mengolini",
        imagen: "assets/books/julia-mengolini--las-caras-del-monstruo.webp",
        genero: "Coyuntura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Brujas, caza de brujas y mujeres", 
        autor: "Silvia Federici",
        imagen: "assets/books/silvia-federici--brujas-caza-de-brujas-y-mujeres.webp",
        genero: "Coyuntura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "La revolución de las hijas", 
        autor: "Luciana Peker",
        imagen: "assets/books/luciana-peker--la-revolucion-de-las-hijas.webp",
        genero: "Coyuntura",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Enojate hermana",
        autor: "Malena Pichot",
        imagen: "assets/books/malena-pichot--enojate-hermana.webp",
        genero: "Coyuntura",
        ratings: [],
        comentarios: []
    },

    // GENERO CIENCIA FICCION
    { 
        titulo: "Un mundo feliz", 
        autor: "Aldous Huxley",
        genero: "Ciencia ficción",
        imagen: "assets/books/aldous-huxley--un-mundo-feliz.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "El Eternauta", 
        autor: "Héctor Germán Oesterheld",
        imagen: "assets/books/el-eternauta--hector-german-oesterheld.webp",
        genero: "Ciencia ficción",
        ratings: [],
        comentarios: []
    },

    // GENERO ROMANCE
    { 
        titulo: "Orgullo y prejuicio", 
        autor: "Jane Austen",
        genero: "romance",
        imagen: "assets/books/jane-austen--pride-and-prejudice.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Cumbres Borrascosas", 
        autor: "Emily Brontë",
        genero: "romance",
        imagen: "assets/books/emily-bronte--cumbres-borrascosas.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Lo que dicen tus ojos", 
        autor: "Florencia Bonelli",
        genero: "romance",
        imagen: "assets/books/florencia-bonelli--lo-que-dicen-tus-ojos.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Caballo de fuego - París", 
        autor: "Florencia Bonelli",
        genero: "romance",
        imagen: "assets/books/florencia-bonelli--caballo-de-fuego-paris.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Caballo de fuego - Congo", 
        autor: "Florencia Bonelli",
        genero: "romance",
        imagen: "assets/books/florencia-bonelli--caballo-de-fuego-congo.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Caballo de fuego - Gaza", 
        autor: "Florencia Bonelli",
        genero: "romance",
        imagen: "assets/books/florencia-bonelli--caballo-de-fuego-gaza.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Los siete maridos de Evelyn Hugo", 
        autor: "Taylor Jenkins Reid",
        genero: "romance",
        imagen: "assets/books/taylor-jenkins-reid--los-7-maridos-de-evelyn-hugo.webp",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Crepúsculo", 
        autor: "Stephenie Meyer",
        imagen: "assets/books/stephenie-meyer--twilight.webp",
        genero: "romance",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Luna nueva", 
        autor: "Stephenie Meyer",
        imagen: "assets/books/stephenie-meyer--new-moon.webp",
        genero: "romance",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Eclipse", 
        autor: "Stephenie Meyer",
        imagen: "assets/books/stephenie-meyer--eclipse.webp",
        genero: "romance",
        ratings: [],
        comentarios: []
    },
    { 
        titulo: "Amanecer", 
        autor: "Stephenie Meyer",
        imagen: "assets/books/stephenie-meyer--breaking-dawn.webp",
        genero: "romance",
        ratings: [],
        comentarios: []
    }
    // OTROS
    ,
    { 
        titulo: "Rebelión en la granja", 
        autor: "George Orwell",
        imagen: "assets/books/george-orwell--rebelion-en-la-granja.webp",
        genero: "otros",
        ratings: [],
        comentarios: []
    }

]

// INICIALIZACIÓN DEL CÓDIGO
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosBiblioteca();
    
    // Check if we have existing data
    const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!datosGuardados) {
        // If no data exists, initialize with our default books
        guardarDatosBiblioteca();
    }
});
