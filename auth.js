// ==========================================
// MÓDULO: AUTENTICACIÓN Y SESIONES (GITHUB PAGES)
// ==========================================

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbxlRgsTiAZi-kiHkUmlrPeBZq1rw-dXvy8wmFlky-z91WGNtpKfU6bLX6fcyq6v0FgM/exec"; 

function handleLogin(event) {
    event.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    mostrarIndicadorCarga(true);

    // Usamos GET con parámetros para evitar completamente los bloqueos POST de CORS en Apps Script
    const urlConParametros = `${URL_WEB_APP}?accion=login&cedula=${encodeURIComponent(cedula)}&password=${encodeURIComponent(password)}`;

    // Alternativa robusta con fetch
    fetch(URL_WEB_APP, {
        method: "POST",
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
        // Fallback si el navegador bloquea por CORS, intentamos leer por modo transparente o validamos la implementación
        mostrarIndicadorCarga(false);
        console.error("Error:", error);
        alert("Error de conexión. Asegúrate de haber hecho una 'Nueva versión' en la implementación de Apps Script.");
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
