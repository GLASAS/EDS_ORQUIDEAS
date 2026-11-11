// ==========================================
// MÓDULO: AUTENTICACIÓN Y SESIONES
// ==========================================

function handleLogin(event) {
    event.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    mostrarIndicadorCarga(true);
    google.script.run
        .withSuccessHandler(function(respuesta) {
            mostrarIndicadorCarga(false);
            if (respuesta.success) {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('app-main').style.display = 'flex';
                document.getElementById('user-info').innerText = respuesta.nombreUsuario;
                sincronizarDatosGlobales();
            } else {
                alert("Error de acceso: " + respuesta.message);
            }
        })
        .withFailureHandler(function(error) {
            mostrarIndicadorCarga(false);
            alert("Error en el servidor: " + error.message);
        })
        .validarLoginBackend(cedula, password);
}

function cerrarSesion() {
    if (confirm("¿Desea salir del sistema?")) {
        document.getElementById('app-main').style.display = 'none';
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('form-login').reset();
    }
}

function mostrarModalRecuperacion(e) {
    e.preventDefault();
    document.getElementById('modal-recuperacion').style.display = 'flex';
}

function ocultarModalRecuperacion(e) {
    e.preventDefault();
    document.getElementById('modal-recuperacion').style.display = 'none';
}
