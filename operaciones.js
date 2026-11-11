// ==========================================
// MÓDULO: OPERACIONES (GASTOS Y CXP)
// ==========================================

function handleGasto(event) {
    event.preventDefault();
    const datosGasto = {
        categoria: document.getElementById('gasto-categoria').value,
        descripcion: document.getElementById('gasto-desc').value,
        valor: parseFloat(document.getElementById('gasto-valor').value),
        formaPago: document.getElementById('gasto-pago').value,
        responsable: document.getElementById('gasto-resp').value,
        soporte: document.getElementById('gasto-soporte').value
    };

    google.script.run
        .withSuccessHandler(res => {
            if (res.success) {
                alert("Gasto registrado con éxito.");
                document.getElementById('form-gasto').reset();
                sincronizarDatosGlobales();
            }
        })
        .registrarGastoBackend(datosGasto);
}

function handleRegistrarCuenta(event) {
    event.preventDefault();
    const cxp = {
        tercero: document.getElementById('cxp-tercero').value,
        concepto: document.getElementById('cxp-concepto').value,
        valor: parseFloat(document.getElementById('cxp-valor').value),
        fechaLimite: document.getElementById('cxp-fecha').value
    };

    google.script.run
        .withSuccessHandler(res => {
            if (res.success) {
                alert("Cuenta por pagar registrada.");
                document.getElementById('form-cxp').reset();
                sincronizarDatosGlobales();
            }
        })
        .registrarCxpBackend(cxp);
}
