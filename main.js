// ==========================================
// MÓDULO PRINCIPAL: NAVEGACIÓN Y SINCRONIZACIÓN
// ==========================================

function mostrarSeccion(idSeccion, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    
    const seccionActiva = document.getElementById('sec-' + idSeccion);
    if (seccionActiva) seccionActiva.classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

function mostrarIndicadorCarga(mostrar) {
    const indicador = document.getElementById('loading-indicator');
    if (indicador) indicador.style.display = mostrar ? 'flex' : 'none';
}

function sincronizarDatosGlobales() {
    mostrarIndicadorCarga(true);
    google.script.run
        .withSuccessHandler(function(data) {
            mostrarIndicadorCarga(false);
            // data debe contener tanto el inventario como las ventas para calcular niveles exactos
            if (data && data.inventario && data.ventas) {
                actualizarNivelesTanquesUI(data.inventario, data.ventas);
            }
        })
        .withFailureHandler(err => {
            mostrarIndicadorCarga(false);
            console.error("Error sincronizando:", err);
        })
        .obtenerDatosGlobalesBackend();
}
