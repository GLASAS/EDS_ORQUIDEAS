// ==========================================
// MÓDULO: VENTAS EN PISTA
// ==========================================

function handleVenta(event) {
    event.preventDefault();
    const surtidor = document.getElementById('venta-surtidor').value;
    const galones = parseFloat(document.getElementById('venta-galones').value);
    const medioPago = document.getElementById('venta-mediopago').value;
    const obs = document.getElementById('venta-obs').value;

    const datosVenta = { surtidor, galones, medioPago, observaciones: obs };

    mostrarIndicadorCarga(true);
    google.script.run
        .withSuccessHandler(function(res) {
            mostrarIndicadorCarga(false);
            if (res.success) {
                alert("¡Venta registrada con éxito!");
                document.getElementById('form-venta').reset();
                document.getElementById('info-total-preview').innerText = "$0";
                sincronizarDatosGlobales();
            } else {
                alert("Error al registrar venta: " + res.message);
            }
        })
        .withFailureHandler(err => {
            mostrarIndicadorCarga(false);
            alert("Error de conexión: " + err.message);
        })
        .registrarVentaBackend(datosVenta);
}

function calcularTotalVentaPreview() {
    const galones = parseFloat(document.getElementById('venta-galones').value) || 0;
    const precioUnitario = parseFloat(document.getElementById('info-precio').innerText) || 0;
    const total = galones * precioUnitario;
    document.getElementById('info-total-preview').innerText = "$" + total.toLocaleString('es-CO', {minimumFractionDigits: 2});
}
