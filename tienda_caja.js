// ==========================================
// MÓDULO: TIENDA Y CAJA
// ==========================================

function handleVentaTienda(event) {
    event.preventDefault();
    const productoId = document.getElementById('vt-producto').value;
    const cantidad = parseInt(document.getElementById('vt-cantidad').value);
    const medioPago = document.getElementById('vt-mediopago').value;

    google.script.run
        .withSuccessHandler(res => {
            if (res.success) {
                alert("Venta de tienda registrada con éxito.");
                document.getElementById('form-venta-tienda').reset();
                sincronizarDatosGlobales();
            } else {
                alert("Error: " + res.message);
            }
        })
        .registrarVentaTiendaBackend({ productoId, cantidad, medioPago });
}

function handleAbrirCaja(event) {
    event.preventDefault();
    const base = parseFloat(document.getElementById('caja-base').value);
    google.script.run
        .withSuccessHandler(res => {
            if (res.success) {
                alert("Caja abierta correctamente.");
                sincronizarDatosGlobales();
            }
        })
        .abrirCajaBackend(base);
}

function handleCerrarCaja(event) {
    event.preventDefault();
    const efectivoReal = parseFloat(document.getElementById('caja-real').value);
    google.script.run
        .withSuccessHandler(res => {
            if (res.success) {
                alert("Caja cerrada. Arqueo completado.");
                sincronizarDatosGlobales();
            }
        })
        .cerrarCajaBackend(efectivoReal);
}
