// ==========================================
// MÓDULO: AUTENTICACIÓN Y SESIONES (GITHUB PAGES)
// ==========================================

// ⚠️ ASEGÚRATE DE PEGAR AQUÍ TU URL REAL DE GOOGLE APPS SCRIPT
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzQ7aiHWjjjKpC-G07mPpgHj3Zn67mY0bRAAOE1xyKcPqzCwcQYSF2YqGMWZY3gcqHx/exec"; 

function handleLogin(event) {
    event.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (URL_WEB_APP.includes("AQUÍ_PEGA")) {
        alert("Por favor configure su URL de Apps Script real en el archivo auth.js");
        return;
    }

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
        alert("Error de conexión con el servidor. Verifique que la URL de Apps Script sea correcta y la implementación esté actualizada.");
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
