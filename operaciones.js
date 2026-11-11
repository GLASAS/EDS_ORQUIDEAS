// ==========================================
// GESTIÓN DE CREACIÓN DE USUARIOS
// ==========================================

function handleCrearUsuario(event) {
    event.preventDefault();

    const nombre = document.getElementById('nuevo-nombre').value;
    const cedula = document.getElementById('nuevo-cedula').value;
    const password = document.getElementById('nuevo-pass').value;
    const fechaExpedicion = document.getElementById('nuevo-fecha-exp').value;
    const rol = document.getElementById('nuevo-rol').value;

    const datosUsuario = {
        nombre,
        cedula,
        password,
        fechaExpedicion,
        rol
    };

    if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(true);

    const urlDestino = typeof URL_WEB_APP !== 'undefined' ? URL_WEB_APP : (window.URL_WEB_APP || "");

    fetch(urlDestino, {
        method: "POST",
        body: JSON.stringify({
            accion: "crearUsuario",
            datosUsuario: datosUsuario
        })
    })
    .then(response => response.json())
    .then(res => {
        if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(false);
        if (res.success) {
            alert("¡Usuario creado y registrado en Google Drive con éxito!");
            document.getElementById('form-nuevo-usuario').reset();
            if (typeof sincronizarDatosGlobales === 'function') {
                sincronizarDatosGlobales();
            }
        } else {
            alert("Error al crear usuario: " + res.message);
        }
    })
    .catch(err => {
        if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(false);
        console.error("Error:", err);
        alert("Error de conexión al intentar guardar el usuario.");
    });
}
