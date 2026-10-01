const API_URL = "https://script.google.com/macros/s/AKfycbzQVbNjKCj9NC4QXB6TR4UXX8rjJRjVk1fGxQ2rlITZyE-GGBvHQcyyuq870kjFv1C_/exec";

let surtidoresGlobal = [];
let productosGlobal = [];
let usuarioActual = null;
let filtroActualDashboard = 'hoy';

async function ejecutarAPI(payload) {
    let loader = document.getElementById('loading-indicator');
    if (loader) loader.style.display = 'flex';

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
    toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> <div><b>${tipo === 'error' ? 'Atención' : 'Notificación'}</b><div style="margin-top: 2px;">${mensaje}</div></div>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function sincronizarDatosGlobales() {
    mostrarNotificacion("Actualizando datos desde la nube...", "success");
    cargarDashboard();
    cargarSurtidoresSelect();
    cargarProductosTabla();
    cargarCatalogosCompra();
    verificarEstadoCaja();
    cargarClientesTabla();
    cargarUsuariosTabla();
    cargarReportesyAlertas();
    cargarHistorialPrecios();
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
        sincronizarDatosGlobales();
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
    document.querySelectorAll('.sidebar nav a').forEach(a => {
        if(!a.classList.contains('btn-salir-modulo')) a.classList.remove('active');
    });
    
    if (seccionId === 'dashboard') {
        document.getElementById('sec-dashboard').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Dashboard de Combustibles";
        cargarDashboard();
    } else if (seccionId === 'ventas') {
        document.getElementById('sec-ventas').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Registro de Ventas en Pista";
        cargarSurtidoresSelect();
    } else if (seccionId === 'precios') {
        document.getElementById('sec-precios').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Actualización de Precios";
        cargarHistorialPrecios();
    } else if (seccionId === 'productos') {
        document.getElementById('sec-productos').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Inventario de Productos";
        cargarProductosTabla();
    } else if (seccionId === 'compras') {
        document.getElementById('sec-compras').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Órdenes de Compra";
        cargarCatalogosCompra();
    } else if (seccionId === 'caja') {
        document.getElementById('sec-caja').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Control de Caja y Buzón";
        verificarEstadoCaja();
    } else if (seccionId === 'gastos') {
        document.getElementById('sec-gastos').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Gastos Operativos";
    } else if (seccionId === 'clientes') {
        document.getElementById('sec-clientes').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Directorio Clientes";
        cargarClientesTabla();
    } else if (seccionId === 'usuarios') {
        document.getElementById('sec-usuarios').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Gestión de Usuarios";
        cargarUsuariosTabla();
    } else if (seccionId === 'reportes') {
        document.getElementById('sec-reportes').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Reportes & Alertas";
        cargarReportesyAlertas();
    } else if (seccionId === 'inventario') {
        document.getElementById('sec-inventario').classList.add('active');
        document.getElementById('titulo-seccion').innerText = "Inv. Combustible";
    }
    if (event && event.currentTarget && !event.currentTarget.classList.contains('btn-salir-modulo')) {
        event.currentTarget.classList.add('active');
    }
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
        
        document.getElementById('dash-ventas-dinero').innerText = "$" + Math.round(v.dineroTotal).toLocaleString();
        document.getElementById('dash-ventas-efectivo').innerText = "$" + Math.round(v.efectivo).toLocaleString();
        document.getElementById('dash-ventas-tarjeta').innerText = "$" + Math.round(v.tarjeta).toLocaleString();
        document.getElementById('dash-ventas-credito').innerText = "$" + Math.round(v.credito).toLocaleString();
        document.getElementById('dash-ventas-galones').innerText = Math.round(v.galones) + " Gal";
        document.getElementById('dash-ventas-conteo').innerText = v.conteo;

        let container = document.getElementById('dashboard-cards');
        container.innerHTML = "";
        
        res.combustibles.forEach(c => {
            let color = c.colorEstado;
            let capMax = Math.round(Number(c.CapacidadMaxima) || 5000);
            let stockActualRedondeado = Math.round(Number(c.StockActual) || 0);
            let cantidadSugeridaRedondeada = Math.round(Number(c.cantidadSugerida) || 0);
            let diasCoberturaRedondeados = Math.round(Number(c.diasCobertura) || 0);
            let stockMinimoRedondeado = Math.round(Number(c.StockMinimo) || 0);
            let stockSeguridadRedondeado = Math.round(Number(c.StockSeguridad) || 0);
            let consumoDiarioRedondeado = Math.round(Number(c.consumoDiarioEstimado) || 0);
            let porcentajeRedondeado = Math.round(Number(c.porcentajeLlenado) || 0);

            let esCorriente = c.Nombre.toLowerCase().includes('corriente');
            let esAcpm = c.Nombre.toLowerCase().includes('acpm');
            let alertaRoja = false;

            if (esCorriente && cantidadSugeridaRedondeada >= 4300) alertaRoja = true;
            if (esAcpm && cantidadSugeridaRedondeada >= 1100) alertaRoja = true;

            let estiloSugerida = alertaRoja ? 'color: var(--red); font-weight: bold;' : 'color: var(--accent);';

            let html = `
                <div class="card ${color} tanque-card">
                    <h3>${c.Nombre} <span class="badge ${color}">${c.estadoAlerta}</span></h3>
                    <div class="tanque-visual-container">
                        <div class="cilindro-tanque" title="Nivel: ${porcentajeRedondeado}%">
                            <div class="cilindro-liquido ${color}" style="height: ${porcentajeRedondeado}%;"></div>
                        </div>
                        <div style="flex: 1;">
                            <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">${stockActualRedondeado} ${c.Unidad}</p>
                            <p style="font-size: 0.85rem; color: #64748b;">Capacidad: ${capMax} Gal</p>
                            <p style="font-size: 0.85rem; color: #64748b;">Autonomía: <b>${diasCoberturaRedondeados} días</b></p>
                        </div>
                    </div>
                    <div class="card-body" style="border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        <p>Consumo Diario Est.: <span>${consumoDiarioRedondeado} ${c.Unidad}</span></p>
                        <p>Stock Mínimo / Seg.: <span>${stockMinimoRedondeado} / ${stockSeguridadRedondeado}</span></p>
                        <p>Cantidad Sugerida Pedido: <span style="${estiloSugerida}">${cantidadSugeridaRedondeada} ${c.Unidad}</span></p>
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
            select.innerHTML += `<option value="${s.ID}">${s.IslaID} - ${s.Nombre} (${s.CombustibleNombre})</option>`;
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
        document.getElementById('info-precio').innerText = Math.round(Number(surt.PrecioVenta));
        calcularTotalVentaPreview();
    }
}

function calcularTotalVentaPreview() {
    let idSeleccionado = document.getElementById('venta-surtidor').value;
    let surt = surtidoresGlobal.find(s => s.ID === idSeleccionado);
    let galones = parseFloat(document.getElementById('venta-galones').value) || 0;
    
    if (surt) {
        let total = Math.round(galones * Number(surt.PrecioVenta));
        document.getElementById('info-total-preview').innerText = "$" + total.toLocaleString();
    }
}

async function handleVenta(event) {
    event.preventDefault();
    let surtID = document.getElementById('venta-surtidor').value;
    let galones = document.getElementById('venta-galones').value;
    let medioPago = document.getElementById('venta-mediopago').value;
    let obs = document.getElementById('venta-obs').value;
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        let res = await ejecutarAPI({ accion: 'registrarVentaPorGalones', surtidorID: surtID, cantidadGalones: galones, medioPago, usuario: nombreUsuario, observaciones: obs });
        mostrarNotificacion(`Venta registrada. Galones: ${Math.round(res.cantidadGalones)} - Total: $${Math.round(res.totalVenta).toLocaleString()}`, 'success');
        document.getElementById('form-venta').reset();
        document.getElementById('info-total-preview').innerText = "$0";
        mostrarSeccion('dashboard');
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function handleActualizarPrecio(event) {
    event.preventDefault();
    let combustibleID = document.getElementById('precio-combustible-id').value;
    let nuevoPrecio = Math.round(Number(document.getElementById('precio-nuevo-valor').value));
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        let res = await ejecutarAPI({ accion: 'actualizarPrecioCombustible', combustibleID, nuevoPrecio, usuario: nombreUsuario });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('form-actualizar-precio').reset();
        cargarHistorialPrecios();
        sincronizarDatosGlobales();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function cargarHistorialPrecios() {
    try {
        let historial = await ejecutarAPI({ accion: 'obtenerHistorialPrecios' });
        let tbody = document.querySelector('#tabla-historial-precios tbody');
        tbody.innerHTML = "";
        if (!historial || historial.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>No hay registros de cambios de precios.</td></tr>";
            return;
        }
        historial.forEach(h => {
            tbody.innerHTML += `
                <tr>
                    <td>${h.fechaHora}</td>
                    <td><b>${h.combustibleNombre}</b></td>
                    <td>$${Math.round(Number(h.precioAnterior)).toLocaleString()}</td>
                    <td><b style="color: var(--accent);">$${Math.round(Number(h.precioNuevo)).toLocaleString()}</b></td>
                    <td>${h.usuario}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

async function cargarProductosTabla() {
    try {
        let prods = await ejecutarAPI({ accion: 'obtenerProductos' });
        productosGlobal = prods;
        let tbody = document.querySelector('#tabla-productos tbody');
        tbody.innerHTML = "";
        if (!prods || prods.length === 0) {
            tbody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>No hay productos registrados.</td></tr>";
            return;
        }
        prods.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.Codigo}</td>
                    <td><b>${p.Nombre}</b></td>
                    <td>${p.Categoria}</td>
                    <td>$${Math.round(Number(p.PrecioVenta)).toLocaleString()}</td>
                    <td><b>${Math.round(Number(p.Stock))} ${p.Unidad}</b></td>
                    <td>${Math.round(Number(p.StockMinimo))}</td>
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
            selectItem.innerHTML += `<option value="${c.ID}">${c.Nombre} (Stock actual: ${Math.round(c.StockActual)})</option>`;
        });
    } else {
        productosGlobal.forEach(p => {
            selectItem.innerHTML += `<option value="${p.ID}">${p.Nombre} (Stock actual: ${Math.round(p.Stock)})</option>`;
        });
    }
}

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
    } catch (err) {
        console.error(err);
    }
}

async function handleAbrirCaja(event) {
    event.preventDefault();
    let base = Math.round(Number(document.getElementById('caja-base').value));
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        await ejecutarAPI({ accion: 'abrirCaja', baseInicial: base, usuario: nombreUsuario });
        mostrarNotificacion("Caja abierta con éxito.", 'success');
        verificarEstadoCaja();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function handleRegistrarSobre(event) {
    event.preventDefault();
    let valorSobre = Math.round(Number(document.getElementById('sobre-valor').value));
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        let res = await ejecutarAPI({ accion: 'registrarSobreSeguridad', valorSobre: valorSobre, usuario: nombreUsuario });
        mostrarNotificacion(res.mensaje, 'success');
        document.getElementById('form-sobre-seguridad').reset();
        verificarEstadoCaja();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function handleCerrarCaja(event) {
    event.preventDefault();
    let real = Math.round(Number(document.getElementById('caja-real').value));
    let nombreUsuario = usuarioActual ? usuarioActual.nombre : "Administrador";

    try {
        let res = await ejecutarAPI({ accion: 'cerrarCaja', totalReal: real, usuario: nombreUsuario });
        mostrarNotificacion(`Caja cerrada. Esperado: $${Math.round(res.totalEsperado).toLocaleString()} | Diferencia: $${Math.round(res.diferencia).toLocaleString()}`, 'success');
        verificarEstadoCaja();
    } catch (err) {
        mostrarNotificacion(err.message, 'error');
    }
}

async function cargarClientesTabla() {
    try {
        let clientes = await ejecutarAPI({ accion: 'obtenerClientes' });
        let tbody = document.querySelector('#tabla-clientes tbody');
        if(!tbody) return;
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
        if(!tbody) return;
        tbody.innerHTML = "";
        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>No hay usuarios registrados.</td></tr>";
            return;
        }
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

    try {
        let res = await ejecutarAPI({ accion: 'registrarUsuario', nombre, cedula, password: pass, rol, fechaExpedicion: fechaExp });
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
        document.getElementById('rep-ventas-dinero').innerText = "$" + Math.round(rep.totalVentasDinero).toLocaleString();
        document.getElementById('rep-ventas-galones').innerText = Math.round(rep.totalGalonesVendidos) + " Gal";
        document.getElementById('rep-ventas-conteo').innerText = rep.conteoVentas;
        document.getElementById('rep-gastos').innerText = "$" + Math.round(rep.totalGastosDinero).toLocaleString();
        document.getElementById('rep-compras').innerText = "$" + Math.round(rep.totalComprasDinero).toLocaleString();
    } catch (err) {
        console.error(err);
    }
}
