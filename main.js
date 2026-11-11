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

    fetch(URL_WEB_APP, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "obtenerDatosGlobales" })
    })
    .then(response => response.json())
    .then(data => {
        mostrarIndicadorCarga(false);
        if (data && data.success) {
            cacheDatosGlobales = data;
            
            // 1. Resumen de ventas en dashboard
            if (typeof procesarResumenVentasDashboard === 'function') {
                procesarResumenVentasDashboard(data.ventas);
            }
            
            // 2. Niveles de tanques (botellas)
            if (typeof actualizarNivelesTanquesUI === 'function') {
                actualizarNivelesTanquesUI(data.inventario, data.ventas);
            }

            // 3. Historial de precios y auditoría
            if (typeof actualizarHistorialPreciosUI === 'function') {
                actualizarHistorialPreciosUI(data.historialPrecios);
            }

            // 4. Módulo de Compras y Abastecimiento
            if (typeof inicializarModuloCompras === 'function') {
                inicializarModuloCompras(data.proveedores, data.productos);
            }

        } else {
            console.error("Error al obtener datos:", data.message);
        }
    })
    .catch(error => {
        mostrarIndicadorCarga(false);
        console.error("Error de red en sincronización:", error);
    });
}
