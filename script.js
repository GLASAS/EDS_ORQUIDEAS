const API_URL = "https://script.google.com/macros/s/AKfycbxzMg9c0uiR4oq2bs26POlnvKh1rrye8GBshQn_Xsg_6RNKep2CjVeL-j32Nyv_QnSl/exec";

let usuarioActual = null;

async function ejecutarAPI(payload) {
    let loader = document.getElementById('loading-indicator');
    if (loader) loader.style.display = 'flex';
    try {
        let respuesta = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        let resultado = await respuesta.json();
        if (resultado.success) return resultado.data;
        else throw new Error(resultado.message);
    } catch (error) {
        throw error;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    let icon = tipo === 'error' ? '❌' : '✅';
    let toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> <div><b>${tipo === 'error' ? 'Atención' : 'Notificación'}</b><div>${mensaje}</div></div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function sincronizarDatosGlobales() {
    mostrarNotificacion("Actualizando datos del sistema...", "success");
    cargarDashboard();
    cargarSurtidoresVentas();
    cargarCuentasPorPagar();
    verificarEstadoCaja();
    cargarClientesTabla();
    cargarProveedoresTabla();
}

async function handleLogin(event) {
    event.preventDefault();
    let cedula = document.getElementById('login-cedula').value;
    let password = document.getElementById('login-password').value;
    try {
        let user = await ejecutarAPI({ accion: 'verificarUsuario', cedula, password });
        usuarioActual = user;
        document.getElementById('user-info').innerText = `${user.nombre} (${user.rol})`;
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-main').style.display = 'flex';
        mostrarNotificacion(`Bienvenido, ${user.nombre}`, 'success');
        sincronizarDatosGlobales();
    } catch (err) {
        mostrarNotificacion(err.message.replace(/^Error:\s*/i, ''), 'error');
    }
}

function cerrarSesion() {
    usuarioActual = null;
    document.getElementById('app-main').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    mostrarNotificacion("Sesión cerrada.", 'success');
}

function mostrarSeccion(seccionId, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar nav a').forEach(a => { if(!a.classList.contains('btn-salir-modulo')) a.classList.remove('active'); });

    if (seccionId === 'dashboard') {
        document.getElementById('sec-dashboard').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Dashboard General";
        cargarDashboard();
    } else if (seccionId === 'ventas-pista') {
        document.getElementById('sec-ventas-pista').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Registro de Ventas en Pista";
        cargarSurtidoresVentas();
    } else if (seccionId === 'cuentas-pagar') {
        document.getElementById('sec-cuentas-pagar').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Cuentas por Pagar y Vencimientos";
        cargarCuentasPorPagar();
    } else if (seccionId === 'caja') {
        document.getElementById('sec-caja').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Control de Caja y Buzón";
        verificarEstadoCaja();
    } else if (seccionId === 'gastos') {
        document.getElementById('sec-gastos').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Registro de Gastos Operativos";
    } else if (seccionId === 'clientes') {
        document.getElementById('sec-clientes').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Directorio y Registro de Clientes";
        cargarClientesTabla();
    } else if (seccionId === 'proveedores') {
        document.getElementById('sec-proveedores').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Directorio y Registro de Proveedores";
        cargarProveedoresTabla();
    }
    if (event && event.currentTarget && !event.currentTarget.classList.contains('btn-salir-modulo')) {
        event.currentTarget.classList.add('active');
    }
}

// Dashboard
async function cargarDashboard() {
    try {
        let data = await ejecutarAPI({ accion: 'obtenerDashboard' });
        let cont = document.getElementById('dashboard-tanques-container');
        if (!cont) return;
        cont.innerHTML = "";
        if (data.combustibles) {
            data.combustibles.forEach(c => {
                cont.innerHTML += `
                    <div class="card ${c.colorEstado}">
                        <h3>${c.Nombre} <span class="badge ${c.colorEstado}">${c.estadoAlerta}</span></h3>
                        <p style="font-size: 1.5rem; font-weight: bold; margin-bottom: 10px;">${c.StockActual.toLocaleString()} ${c.Unidad}</p>
                        <p>Nivel de Llenado: <b>${c.porcentajeLlenado}%</b></p>
                        <p>Sugerido a Pedir: <b>${c.cantidadSugerida.toLocaleString()} ${c.Unidad}</b></p>
                    </div>
                `;
            });
        }
    } catch (err) { console.error(err); }
}

// Ventas Pista
async function cargarSurtidoresVentas() {
    try {
        let surtidores = await ejecutarAPI({ accion: 'obtenerSurtidores' });
        let select = document.getElementById('venta-surtidor');
        if (!select) return;
        select.innerHTML = "";
        surtidores.forEach(s => {
            select.innerHTML += `<option value="${s.ID}">${s.Nombre} (${s.CombustibleNombre}) - Precio: $${s.PrecioVenta}</option>`;
        });
    } catch (err) { console.error(err); }
}

async function handleRegistrarVenta(event) {
    event.preventDefault();
    let surtidorID = document.getElementById('venta-surtidor').value;
    let cantidadGalones = Number(document.getElementById('venta-galones').value);
    let medioPago = document.getElementById('venta-pago').value;
    let observaciones = document.getElementById('venta-obs').value;
    try {
        let res = await ejecutarAPI({ accion: 'registrarVentaPorGalones', surtidorID, cantidadGalones, medioPago, observaciones, usuario: usuarioActual.nombre });
        mostrarNotificacion(`Venta registrada con éxito. Total: $${res.totalVenta.toLocaleString()}`, 'success');
        document.getElementById('form-venta-pista').reset();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

// Cuentas por Pagar
async function cargarCuentasPorPagar() {
    try {
        let cuentas = await ejecutarAPI({ accion: 'obtenerCuentasPorPagar' });
        let tbody = document.querySelector('#tabla-cuentas-pagar tbody');
        let alertasContainer = document.getElementById('alertas-cuentas-container');
        if (!tbody) return;

        tbody.innerHTML = "";
        alertasContainer.innerHTML = "";
        let hayAlertasUrgentes = false;

        if (!cuentas || cuentas.length === 0) {
            tbody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>No hay cuentas por pagar registradas.</td></tr>";
            alertasContainer.innerHTML = "<p style='color: #64748b;'>No hay alertas de vencimiento próximas.</p>";
            return;
        }

        cuentas.forEach(c => {
            let badgeEstado = c.estado === 'PAGADO' ? '<span class="badge green">Pagado</span>' : '<span class="badge yellow">Pendiente</span>';
            let botonAccion = c.estado === 'PENDIENTE' ? `<button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="marcarPagada('${c.id}')">Pagar</button>` : '-';
            
            if (c.alertaUrgente && c.estado === 'PENDIENTE') {
                hayAlertasUrgentes = true;
                alertasContainer.innerHTML += `
                    <div class="form-info-box" style="border-left-color: var(--red); background: #fef2f2; margin-bottom: 10px;">
                        <p><span class="badge red">⚠️ ALERTA DE VENCIMIENTO</span> <b>${c.concepto}</b> (${c.tercero})</p>
                        <p style="margin-top: 5px; color: var(--red); font-weight: bold;">${c.mensajeAlerta} Límite: ${c.fechaLimite} - Valor: $${Math.round(c.valor).toLocaleString()}</p>
                    </div>
                `;
            }

            tbody.innerHTML += `
                <tr>
                    <td><b>${c.tercero}</b></td>
                    <td>${c.concepto}</td>
                    <td>$${Math.round(c.valor).toLocaleString()}</td>
                    <td>${c.fechaLimite}</td>
                    <td>${c.diasRestantes} días</td>
                    <td>${badgeEstado}</td>
                    <td>${botonAccion}</td>
                </tr>
            `;
        });

        if (!hayAlertasUrgentes) {
            alertasContainer.innerHTML = "<p style='color: var(--green); font-weight: 500;'>✅ No hay cuentas próximas a vencer en los próximos 2 días.</p>";
        }
    } catch (err) { console.error(err); }
}

async function handleRegistrarCuenta(event) {
    event.preventDefault();
    let tercero = document.getElementById('cxp-tercero').value;
    let concepto = document.getElementById('cxp-concepto').value;
    let valor = Math.round(Number(document.getElementById('cxp-valor').value));
    let fechaLimite = document.getElementById('cxp-fecha').value;
    try {
        let res = await ejecutarAPI({ accion: 'registrarCuentaPorPagar', tercero, concepto, valor, fechaLimite, usuario: usuarioActual.nombre });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('form-cxp').reset();
        cargarCuentasPorPagar();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

async function marcarPagada(id) {
    if (!confirm("¿Confirma que esta cuenta ya fue pagada?")) return;
    try {
        let res = await ejecutarAPI({ accion: 'pagarCuenta', id });
        mostrarNotificacion(res.mensaje, 'success');
        cargarCuentasPorPagar();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

// Gastos
async function handleRegistrarGasto(event) {
    event.preventDefault();
    let categoria = document.getElementById('gasto-categoria').value;
    let descripcion = document.getElementById('gasto-descripcion').value;
    let valor = Number(document.getElementById('gasto-valor').value);
    let formaPago = document.getElementById('gasto-pago').value;
    let soporte = document.getElementById('gasto-soporte').value;
    try {
        let res = await ejecutarAPI({ accion: 'registrarGasto', categoria, descripcion, valor, formaPago, responsable: usuarioActual.nombre, soporte });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('form-gasto').reset();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

// Clientes
async function cargarClientesTabla() {
    try {
        let clientes = await ejecutarAPI({ accion: 'obtenerClientes' });
        let tbody = document.querySelector('#tabla-clientes tbody');
        if (!tbody) return;
        tbody.innerHTML = "";
        if (!clientes || clientes.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>No hay clientes registrados.</td></tr>";
            return;
        }
        clientes.forEach(c => {
            tbody.innerHTML += `<tr><td><b>${c.Nombre}</b></td><td>${c.NIT_CC}</td><td>${c.Telefono}</td><td>${c.Email}</td><td>${c.TipoCliente}</td></tr>`;
        });
    } catch (err) { console.error(err); }
}

async function handleRegistrarCliente(event) {
    event.preventDefault();
    let nombre = document.getElementById('cli-nombre').value;
    let nitCC = document.getElementById('cli-nit').value;
    let telefono = document.getElementById('cli-tel').value;
    let email = document.getElementById('cli-email').value;
    let tipoCliente = document.getElementById('cli-tipo').value;
    try {
        let res = await ejecutarAPI({ accion: 'registrarCliente', nombre, nitCC, telefono, email, tipoCliente });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('form-cliente').reset();
        cargarClientesTabla();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

// Proveedores
async function cargarProveedoresTabla() {
    try {
        let proveedores = await ejecutarAPI({ accion: 'obtenerProveedores' });
        let tbody = document.querySelector('#tabla-proveedores tbody');
        if (!tbody) return;
        tbody.innerHTML = "";
        if (!proveedores || proveedores.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>No hay proveedores registrados.</td></tr>";
            return;
        }
        proveedores.forEach(p => {
            tbody.innerHTML += `<tr><td><b>${p.Nombre}</b></td><td>${p.NIT}</td><td>${p.Telefono}</td><td>${p.Email}</td><td>${p.Direccion}</td></tr>`;
        });
    } catch (err) { console.error(err); }
}

async function handleRegistrarProveedor(event) {
    event.preventDefault();
    let nombre = document.getElementById('prov-nombre').value;
    let nit = document.getElementById('prov-nit').value;
    let contacto = document.getElementById('prov-contacto').value;
    let telefono = document.getElementById('prov-tel').value;
    let email = document.getElementById('prov-email').value;
    let direccion = document.getElementById('prov-dir').value;
    try {
        let res = await ejecutarAPI({ accion: 'registrarProveedor', nombre, nit, contacto, telefono, email, direccion });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('form-proveedor').reset();
        cargarProveedoresTabla();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

// Caja
async function verificarEstadoCaja() {
    try {
        let res = await ejecutarAPI({ accion: 'obtenerEstadoCaja' });
        let lbl = document.getElementById('lbl-estado-caja');
        let divAbrir = document.getElementById('div-abrir-caja');
        let divCerrar = document.getElementById('div-cerrar-caja');
        let divBuzon = document.getElementById('div-buzon-seguridad');

        if (res.estado === "ABIERTA") {
            lbl.innerHTML = `ABIERTA (Iniciada el ${new Date(res.fechaApertura).toLocaleString()})<br>` +
                            `Base en Caja: <b>$${Math.round(res.baseInicial).toLocaleString()}</b> | ` +
                            `Sobres en Buzón: <b>$${Math.round(res.totalSobresBuzon).toLocaleString()} (${res.cantidadSobres} sobres)</b>`;
            if (divAbrir) divAbrir.style.display = "none";
            if (divCerrar) divCerrar.style.display = "block";
            if (divBuzon) divBuzon.style.display = "block";
        } else {
            lbl.innerText = "CERRADA (Sin turno activo)";
            if (divAbrir) divAbrir.style.display = "block";
            if (divCerrar) divCerrar.style.display = "none";
            if (divBuzon) divBuzon.style.display = "none";
        }
    } catch (err) { console.error(err); }
}

async function handleAbrirCaja(event) {
    event.preventDefault();
    let base = Math.round(Number(document.getElementById('caja-base').value));
    try {
        await ejecutarAPI({ accion: 'abrirCaja', baseInicial: base, usuario: usuarioActual.nombre });
        mostrarNotificacion("Caja abierta con éxito.", 'success');
        verificarEstadoCaja();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

async function handleRegistrarSobre(event) {
    event.preventDefault();
    let valorSobre = Math.round(Number(document.getElementById('sobre-valor').value));
    try {
        let res = await ejecutarAPI({ accion: 'registrarSobreSeguridad', valorSobre, usuario: usuarioActual.nombre });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('form-sobre-seguridad').reset();
        verificarEstadoCaja();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}

async function handleCerrarCaja(event) {
    event.preventDefault();
    let real = Math.round(Number(document.getElementById('caja-real').value));
    try {
        let res = await ejecutarAPI({ accion: 'cerrarCaja', totalReal: real, usuario: usuarioActual.nombre });
        mostrarNotificacion(`Caja cerrada. Esperado: $${Math.round(res.totalEsperado).toLocaleString()} | Diferencia: $${Math.round(res.diferencia).toLocaleString()}`, 'success');
        verificarEstadoCaja();
    } catch (err) { mostrarNotificacion(err.message, 'error'); }
}
