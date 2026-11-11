// ==========================================
// MÓDULO: AUTENTICACIÓN Y SESIONES (GITHUB PAGES)
// ==========================================

// REEMPLAZA ESTA URL CON TU URL DE IMPLEMENTACIÓN DE GOOGLE APPS SCRIPT
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzQ7aiHWjjjKpC-G07mPpgHj3Zn67mY0bRAAOE1xyKcPqzCwcQYSF2YqGMWZY3gcqHx/exec";

function handleLogin(event) {
    event.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    mostrarIndicadorCarga(true);

    // Conexión mediante Fetch API hacia Google Apps Script Web App
    fetch(URL_WEB_APP, {
        method: "POST",
        mode: "cors", // O 'no-cors' si el servidor redirige, pero idealmente CORS configurado
        headers: {
            "Content-Type": "text/plain;charset=utf-8" // Usar text/plain evita bloqueos CORS preflight en Apps Script
        },
        body: JSON.stringify({
            accion: "login",
            cedula: cedula,
            password: password
        })
    })
    .then(response => response.json())
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
        console.error("Error de red:", error);
        alert("Error de conexión con el servidor. Verifique la URL de Apps Script.");
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
