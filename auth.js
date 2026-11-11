// ==========================================
// MÓDULO: AUTENTICACIÓN Y SESIONES (GITHUB PAGES)
// ==========================================

// URL real de tu Web App de Google Apps Script configurada correctamente
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbwTQ3BunU1MM6nU87Y75NmG0xEGUIYbb9pxG6nplhGtoMjIznaneh1-6sma2ibKaEpV/exec"; 

function handleLogin(event) {
    event.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    mostrarIndicadorCarga(true);

    fetch(URL_WEB_APP, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
            accion: "login",
            cedula: cedula,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) throw new Error("Error HTTP: " + response.status);
        return response.json();
    })
    .then(respuesta => {
        mostrarIndicadorCarga(false);
        if (respuesta.success) {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('app-main').style.display = 'flex';
            document.getElementById('user-info').innerText = respuesta.nombreUsuario;
            if (typeof sincronizarDatosGlobales === 'function') {
                sincronizarDatosGlobales();
            }
        } else {
            alert("Error de acceso: " + (respuesta.message || "Credenciales inválidas"));
        }
    })
    .catch(error => {
        mostrarIndicadorCarga(false);
        console.error("Error detallado:", error);
        alert("Error de conexión con el servidor. Verifique que la implementación en Apps Script esté actualizada.");
    });
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
