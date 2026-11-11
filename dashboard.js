// ==========================================
// MÓDULO: DASHBOARD
// ==========================================

let filtroDashboardActual = 'hoy';

function cambiarFiltroDashboard(filtro, event) {
    document.querySelectorAll('.filtro-ventas-bar .btn-filtro').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    filtroDashboardActual = filtro;
    renderizarDashboard();
}

function renderizarDashboard() {
    // Lógica para procesar métricas según el filtro de tiempo seleccionado
    console.log("Filtrando dashboard por:", filtroDashboardActual);
}
