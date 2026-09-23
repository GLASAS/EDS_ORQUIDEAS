// IMPORTANTE: Reemplaza esta URL con la URL de tu Aplicación Web de Google Apps Script que termina en /exec
const API_URL = "https://script.google.com/macros/s/TU_URL_DE_APPS_SCRIPT_AQUI/exec";

let surtidoresGlobal = [];
let productosGlobal = [];
let usuarioActual = null;
let filtroActualDashboard = 'hoy';

async function llamarAPI(datos) {
    try {
        let response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', // Necesario para Apps Script Web App libre de CORS
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(datos)
        });
        // Nota con no-cors no se puede leer el body directamente, por lo que usamos una estrategia de GET/POST con CORS o JSONP si es necesario, 
        // O alternativamente configuramos el despliegue web de Apps Script.
    } catch (e) {
        console.error(e);
    }
}

// Versión simplificada mediante peticiones GET/POST estándar con fetch
async function ejecutarAPI(payload) {
    try {
        let respuesta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        let resultado = await respuesta.json();
        if (resultado.success) {
            return resultado.data;
        } else {
            throw new Error(resultado.message);
        }
    } catch (error) {
        throw error;
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
    toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> <div><b>${tipo === 'error' ? 'Atención' : 'Notificación'}</b><div style="margin-top: 2px;">${mensaje}</div></div>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

async function handleLogin(event) {
    event.preventDefault();
    let cedula = document.getElementById('login-cedula').value;
    let password = document.getElementById('login-password').value;

    try {
        let user = await ejecutarAPI({ accion: 'verificarUsuario', cedula, password });
        usuarioActual = user;
        document.getElementById('user-info').innerText = `${user.nombre} (${user.rol})`;
        document.getElementById('gasto-resp').value = user.nombre;
        
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-main').style.display = 'flex';
        document.getElementById('form-login').reset();

        mostrarNotificacion(`Bienvenido al sistema, ${user.nombre}`, 'success');

        cargarDashboard();
        cargarSurtidoresSelect();
        cargarProductosTabla();
        cargarCatalogosCompra();
        verificarEstadoCaja();
        cargarClientesTabla();
        cargarUsuariosTabla();
        cargarReportesyAlertas();
    } catch (err) {
        let mensajeLimpio = err.message.replace(/^Error:\s*/i, '');
        mostrarNotificacion(mensajeLimpio, 'error');
    }
}

function mostrarModalRecuperacion(event) {
    event.preventDefault();
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('modal-recuperacion').style.display = 'flex';
}

function ocultarModalRecuperacion(event) {
    event.preventDefault();
    document.getElementById('modal-recuperacion').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
}

async function handleCambiarPassword(event) {
    event.preventDefault();
    let cedula = document.getElementById('rec-cedula').value;
    let fecha = document.getElementById('rec-fecha').value;
    let nuevoPass = document.getElementById('rec-nuevo-pass').value;

    try {
        let res = await ejecutarAPI({ accion: 'cambiarPassword', cedula, fechaExpedicion: fecha, nuevaPassword: nuevoPass });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('modal-recuperacion').style.display = 'none';
        document.getElementById('login-container').style.display = 'flex';
    } catch (err) {
        let mensajeLimpio = err.message.replace(/^Error:\s*/i, '');
        mostrarNotificacion(mensajeLimpio, 'error');
    }
}

function cerrarSesion() {
    usuarioActual = null;
    document.getElementById('app-main').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    mostrarNotificacion("Sesión cerrada correctamente.", 'success');
}

function mostrarSeccion(seccionId, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    
    if (seccionId === 'dashboard') {
        document.getElementById('sec-dashboard').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Dashboard de Combustibles";
        cargarDashboard();
    } else if (seccionId === 'ventas') {
        document.getElementById('sec-ventas').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Registro de Ventas en Pista";
        cargarSurtidoresSelect();
    } else if (seccionId === 'productos') {
        document.getElementById('sec-productos').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Inventario de Productos de Tienda";
        cargarProductosTabla();
    } else if (seccionId === 'compras') {
        document.getElementById('sec-compras').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Órdenes de Compra y Abastecimiento";
        cargarCatalogosCompra();
    } else if (seccionId === 'caja') {
        document.getElementById('sec-caja').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Control de Caja y Turnos";
        verificarEstadoCaja();
    } else if (seccionId === 'gastos') {
        document.getElementById('sec-gastos').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Registro de Gastos Operativos";
    } else if (seccionId === 'clientes') {
        document.getElementById('sec-clientes').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Directorio de Clientes";
        cargarClientesTabla();
    } else if (seccionId === 'usuarios') {
        document.getElementById('sec-usuarios').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Gestión de Usuarios del Sistema";
        cargarUsuariosTabla();
    } else if (seccionId === 'reportes') {
        document.getElementById('sec-reportes').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Reportes Financieros y Alertas";
        cargarReportesyAlertas();
    } else if (seccionId === 'inventario') {
        document.getElementById('sec-inventario').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Control de Inventario Combustible";
    }
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

function cambiarFiltroDashboard(filtro, event) {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    filtroActualDashboard = filtro;
    cargarDashboard();
}

async function cargarDashboard() {
    try {
        let res = await ejecutarAPI({ accion: 'obtenerDashboard', filtroVentas: filtroActualDashboard });
        let v = res.ventasResumen;
        document.getElementById('dash-ventas-dinero').innerText = "$" + v.dinero.toLocaleString();
        document.getElementById('dash-ventas-galones').innerText = v.galones.toFixed(2) + " Gal";
        document.getElementById('dash-ventas-conteo').innerText = v.conteo;

        let container = document.getElementById('dashboard-cards');
        container.innerHTML = "";
        
        res.combustibles.forEach(c => {
            let color = c.colorEstado;
            let html = `
                <div class="card ${color} tanque-card">
                    <h3>${c.Nombre} <span class="badge ${color}">${c.estadoAlerta}</span></h3>
                    <div class="tanque-visual-container">
                        <div class="cilindro-tanque" title="Nivel: ${c.porcentajeLlenado}%">
                            <div class="cilindro-liquido ${color}" style="height: ${c.porcentajeLlenado}%;"></div>
                        </div>
                        <div style="flex: 1;">
                            <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">${c.StockActual} ${c.Unidad}</p>
                            <p style="font-size: 0.85rem; color: #64748b;">Capacidad: ${c.CapacidadMaxima || 5000} Gal</p>
                            <p style="font-size: 0.85rem; color: #64748b;">Autonomía: <b>${c.diasCobertura} días</b></p>
                        </div>
                    </div>
                    <div class="card-body" style="border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        <p>Consumo Diario Est.: <span>${c.consumoDiarioEstimado} ${c.Unidad}</span></p>
                        <p>Stock Mínimo / Seg.: <span>${c.StockMinimo} / ${c.StockSeguridad}</span></p>
                        <p>Cantidad Sugerida Pedido: <span style="color: var(--accent);">${c.cantidadSugerida} ${c.Unidad}</span></p>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });
    } catch (err) {
        console.error(err);
    }
}

async function cargarSurtidoresSelect() {
    try {
        let surts = await ejecutarAPI({ accion: 'obtenerSurtidores' });
        surtidoresGlobal = surts;
        let select = document.getElementById('venta-surtidor');
        select.innerHTML = '<option value="">-- Seleccione un Surtidor --</option>';
        surts.forEach(s => {
            select.innerHTML += `<option value="${s.ID}">${s.Nombre} (${s.CombustibleNombre} - Isla: ${s.IslaID})</option>`;
        });
        actualizarInfoSurtidor();
    } catch (err) {
        console.error(err);
    }
}

function actualizarInfoSurtidor() {
    let idSeleccionado = document.getElementById('venta-surtidor').value;
    let surt = surtidoresGlobal.find(s => s.ID === idSeleccionado);
    if (surt) {
        document.getElementById('info-comb').innerText = surt.CombustibleNombre;
        document.getElementById('info-lectura-actual').innerText = surt.LecturaActual;
        document.getElementById('info-precio').innerText = surt.PrecioVenta;
        document.getElementById('venta-lectura-final').min = surt.LecturaActual;
    }
}

async function handleVenta(event) {
    event.preventDefault();
    let surtID = document.getElementById('venta-surtidor').value;
    let lecturaFinal = document.getElementById('venta-lectura-final').value;
    let medioPago = document.getElementById('venta-mediopago').value;
    let obs = document.getElementById('venta-obs').value;
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        let res = await ejecutarAPI({ accion: 'registrarVenta', surtidorID, lecturaFinal, medioPago, usuario: nombreUsuario, observaciones: obs });
        mostrarNotificacion(`Venta registrada con éxito. Galones: ${res.cantidadGalones.toFixed(2)} - Total: $${res.totalVenta.toLocaleString()}`, 'success');
        document.getElementById('form-venta').reset();
        mostrarSeccion('dashboard');
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function cargarProductosTabla() {
    try {
        let prods = await ejecutarAPI({ accion: 'obtenerProductos' });
        productosGlobal = prods;
        let tbody = document.querySelector('#tabla-productos tbody');
        tbody.innerHTML = "";
        prods.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.Codigo}</td>
                    <td><b>${p.Nombre}</b></td>
                    <td>${p.Categoria}</td>
                    <td>$${Number(p.PrecioVenta).toLocaleString()}</td>
                    <td><b>${p.Stock} ${p.Unidad}</b></td>
                    <td>${p.StockMinimo}</td>
                    <td>${p.Ubicacion}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

async function cargarCatalogosCompra() {
    try {
        let provs = await ejecutarAPI({ accion: 'obtenerProveedores' });
        let selectProv = document.getElementById('compra-proveedor');
        selectProv.innerHTML = '<option value="">-- Seleccione Proveedor --</option>';
        provs.forEach(p => {
            selectProv.innerHTML += `<option value="${p.ID}">${p.Nombre} (NIT: ${p.NIT})</option>`;
        });

        let prods = await ejecutarAPI({ accion: 'obtenerProductos' });
        productosGlobal = prods;
        actualizarItemsCompraSelect();
    } catch (err) {
        console.error(err);
    }
}

async function actualizarItemsCompraSelect() {
    let tipo = document.getElementById('compra-tipo-item').value;
    let selectItem = document.getElementById('compra-item');
    selectItem.innerHTML = "";

    if (tipo === "COMBUSTIBLE") {
        let res = await ejecutarAPI({ accion: 'obtenerDashboard' });
        res.combustibles.forEach(c => {
            selectItem.innerHTML += `<option value="${c.ID}">${c.Nombre} (Stock actual: ${c.StockActual})</option>`;
        });
    } else {
        productosGlobal.forEach(p => {
            selectItem.innerHTML += `<option value="${p.ID}">${p.Nombre} (Stock actual: ${p.Stock})</option>`;
        });
    }
}

async function handleCompra(event) {
    event.preventDefault();
    let proveedorID = document.getElementById('compra-proveedor').value;
    let tipoItem = document.getElementById('compra-tipo-item').value;
    let itemID = document.getElementById('compra-item').value;
    let cantidad = document.getElementById('compra-cantidad').value;
    let precio = document.getElementById('compra-precio').value;
    let fecha = document.getElementById('compra-fecha').value;
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    let items = [{ tipoItem, itemID, cantidad, precioUnitario: precio }];

    try {
        let res = await ejecutarAPI({ accion: 'registrarCompra', proveedorID, fechaEsperada: fecha, items, usuario: nombreUsuario });
        mostrarNotificacion(`Orden registrada. ID: ${res.compraID} - Total: $${res.total.toLocaleString()}`, 'success');
        document.getElementById('form-compra').reset();
        mostrarSeccion('dashboard');
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function verificarEstadoCaja() {
    try {
        let res = await ejecutarAPI({ accion: 'obtenerEstadoCaja' });
        let lbl = document.getElementById('lbl-estado-caja');
        let divAbrir = document.getElementById('div-abrir-caja');
        let divCerrar = document.getElementById('div-cerrar-caja');

        if (res.estado === "ABIERTA") {
            lbl.innerText = "ABIERTA (Iniciada el " + new Date(res.fechaApertura).toLocaleString() + " con base de $" + res.baseInicial.toLocaleString() + ")";
            divAbrir.style.display = "none";
            divCerrar.style.display = "block";
        } else {
            lbl.innerText = "CERRADA (Sin turno activo)";
            divAbrir.style.display = "block";
            divCerrar.style.display = "none";
        }
    } catch (err) {
        console.error(err);
    }
}

async function handleAbrirCaja(event) {
    event.preventDefault();
    let base = document.getElementById('caja-base').value;
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        await ejecutarAPI({ accion: 'abrirCaja', baseInicial: base, usuario: nombreUsuario });
        mostrarNotificacion("Caja abierta con éxito.", 'success');
        verificarEstadoCaja();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function handleCerrarCaja(event) {
    event.preventDefault();
    let real = document.getElementById('caja-real').value;
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        let res = await ejecutarAPI({ accion: 'cerrarCaja', totalReal: real, usuario: nombreUsuario });
        mostrarNotificacion(`Caja cerrada. Esperado: $${res.totalEsperado.toLocaleString()} | Diferencia: $${res.diferencia.toLocaleString()}`, 'success');
        verificarEstadoCaja();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function handleGasto(event) {
    event.preventDefault();
    let cat = document.getElementById('gasto-categoria').value;
    let desc = document.getElementById('gasto-desc').value;
    let val = document.getElementById('gasto-valor').value;
    let pago = document.getElementById('gasto-pago').value;
    let resp = document.getElementById('gasto-resp').value;
    let soporte = document.getElementById('gasto-soporte').value;
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        await ejecutarAPI({ accion: 'registrarGasto', categoria: cat, descripcion: desc, valor: val, formaPago: pago, responsable: resp, soporte, usuario: nombreUsuario });
        mostrarNotificacion("Gasto registrado con éxito.", 'success');
        document.getElementById('form-gasto').reset();
        mostrarSeccion('dashboard');
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function cargarClientesTabla() {
    try {
        let clientes = await ejecutarAPI({ accion: 'obtenerClientes' });
        let tbody = document.querySelector('#tabla-clientes tbody');
        tbody.innerHTML = "";
        clientes.forEach(c => {
            tbody.innerHTML += `<tr><td><b>${c.Nombre}</b></td><td>${c.NIT_CC}</td><td>${c.Telefono}</td><td>${c.Email}</td><td>${c.TipoCliente}</td></tr>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function cargarUsuariosTabla() {
    try {
        let usuarios = await ejecutarAPI({ accion: 'obtenerUsuarios' });
        let tbody = document.querySelector('#tabla-usuarios tbody');
        tbody.innerHTML = "";
        usuarios.forEach(u => {
            tbody.innerHTML += `<tr><td>${u.id}</td><td><b>${u.nombre}</b></td><td>${u.cedula}</td><td>${u.rol}</td><td><span class="badge green">${u.estado}</span></td></tr>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function handleCrearUsuario(event) {
    event.preventDefault();
    let nombre = document.getElementById('nuevo-nombre').value;
    let cedula = document.getElementById('nuevo-cedula').value;
    let pass = document.getElementById('nuevo-pass').value;
    let fechaExp = document.getElementById('nuevo-fecha-exp').value;
    let rol = document.getElementById('nuevo-rol').value;
    let adminNombre = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        let res = await ejecutarAPI({ accion: 'registrarUsuario', nombre, cedula, password: pass, rol, fechaExpedicion: fechaExp, usuarioAdmin: adminNombre });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('form-nuevo-usuario').reset();
        cargarUsuariosTabla();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function cargarReportesyAlertas() {
    try {
        let rep = await ejecutarAPI({ accion: 'obtenerReportes' });
        document.getElementById('rep-ventas-dinero').innerText = "$" + rep.totalVentasDinero.toLocaleString();
        document.getElementById('rep-ventas-galones').innerText = rep.totalGalonesVendidos.toFixed(2) + " Gal";
        document.getElementById('rep-ventas-conteo').innerText = rep.conteoVentas;
        document.getElementById('rep-gastos').innerText = "$" + rep.totalGastosDinero.toLocaleString();
        document.getElementById('rep-compras').innerText = "$" + rep.totalComprasDinero.toLocaleString();

        let alertas = await ejecutarAPI({ accion: 'obtenerAlertas' });
        let container = document.getElementById('lista-alertas-container');
        container.innerHTML = "";
        if (alertas.length === 0) {
            container.innerHTML = "<p>No hay alertas activas en este momento.</p>";
            return;
        }
        alertas.forEach(a => {
            container.innerHTML += `<div class="form-info-box" style="border-left-color: var(--red); margin-bottom: 10px;"><p><span class="badge red">${a.nivel}</span></p><p style="margin-top: 5px;">${a.mensaje}</p></div>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function inicializarDatos() {
    try {
        let msg = await ejecutarAPI({ accion: 'inicializarSistema' });
        mostrarNotificacion(msg, 'success');
        cargarDashboard();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function handleMovimiento(event) {
    event.preventDefault();
    let combustibleID = document.getElementById('mov-combustible').value;
    let tipoMovimiento = document.getElementById('mov-tipo').value;
    let cantidad = document.getElementById('mov-cantidad').value;
    let observaciones = document.getElementById('mov-obs').value;
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        let res = await ejecutarAPI({ accion: 'registrarMovimientoInventario', combustibleID, tipoMovimiento, cantidad, observaciones, usuario: nombreUsuario });
        mostrarNotificacion(`Movimiento registrado. Nuevo stock: ${res.nuevoStock}`, 'success');
        document.getElementById('form-movimiento').reset();
        mostrarSeccion('dashboard');
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}
