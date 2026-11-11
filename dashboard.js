// ==========================================
// MÓDULO: DASHBOARD (VENTAS Y FILTROS)
// ==========================================

let filtroDashboardActual = 'hoy';
let cacheDatosGlobales = null;

function cambiarFiltroDashboard(filtro, event) {
    document.querySelectorAll('.filtro-ventas-bar .btn-filtro').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    filtroDashboardActual = filtro;
    if (cacheDatosGlobales) {
        procesarResumenVentasDashboard(cacheDatosGlobales.ventas);
    }
}

function procesarResumenVentasDashboard(datosVentas) {
    if (!datosVentas || datosVentas.length <= 1) return;

    let dineroTotal = 0;
    let efectivo = 0;
    let tarjeta = 0;
    let credito = 0;
    let galonesAcpm = 0;
    let galonesGasolina = 0;
    let transacciones = 0;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo o lunes inicial

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    for (let i = 1; i < datosVentas.length; i++) {
        const fila = datosVentas[i];
        const fechaVenta = new Date(fila[1]); // Columna B (FechaHora)
        if (isNaN(fechaVenta.getTime())) continue;

        let incluir = false;
        fechaVenta.setHours(0, 0, 0, 0);

        if (filtroDashboardActual === 'hoy') {
            incluir = (fechaVenta.getTime() === hoy.getTime());
        } else if (filtroDashboardActual === 'ayer') {
            incluir = (fechaVenta.getTime() === ayer.getTime());
        } else if (filtroDashboardActual === 'semana') {
            incluir = (fechaVenta >= inicioSemana && fechaVenta <= hoy);
        } else if (filtroDashboardActual === 'mes') {
            incluir = (fechaVenta >= inicioMes && fechaVenta <= hoy);
        }

        if (incluir) {
            transacciones++;
            const combustibleId = String(fila[3]).trim(); // Columna D
            const galones = parseFloat(fila[4]) || 0;       // Columna E (Galid)
            const totalVenta = parseFloat(fila[6]) || 0;    // Columna G (VItotalventa)
            const medioPago = String(fila[8]).trim();       // Columna I (MedioPago)

            dineroTotal += totalVenta;

            if (medioPago.toLowerCase().includes('efectivo')) {
                efectivo += totalVenta;
            } else if (medioPago.toLowerCase().includes('tarjeta')) {
                tarjeta += totalVenta;
            } else if (medioPago.toLowerCase().includes('credito')) {
                credito += totalVenta;
            }

            if (combustibleId === 'C001' || combustibleId.includes('ACPM')) {
                galonesAcpm += galones;
            } else {
                galonesGasolina += galones;
            }
        }
    }

    // Pintar en las tarjetas del Dashboard
    document.getElementById('dash-ventas-dinero').innerText = "$" + dineroTotal.toLocaleString('es-CO', {minimumFractionDigits: 2});
    document.getElementById('dash-ventas-efectivo').innerText = "$" + efectivo.toLocaleString('es-CO', {minimumFractionDigits: 2});
    document.getElementById('dash-ventas-tarjeta').innerText = "$" + tarjeta.toLocaleString('es-CO', {minimumFractionDigits: 2});
    document.getElementById('dash-ventas-credito').innerText = "$" + credito.toLocaleString('es-CO', {minimumFractionDigits: 2});
    document.getElementById('dash-galones-acpm').innerText = galonesAcpm.toFixed(2) + " Gal";
    document.getElementById('dash-galones-gasolina').innerText = galonesGasolina.toFixed(2) + " Gal";
    document.getElementById('dash-ventas-conteo').innerText = transacciones;
}
