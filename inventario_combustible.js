// ==========================================
// MÓDULO: INVENTARIO, NIVELES Y PRECIOS DE COMBUSTIBLE
// ==========================================

function actualizarNivelesTanquesUI(datosInventario, datosVentas) {
    const ventasPorCombustible = {};
    
    if (datosVentas && datosVentas.length > 1) {
        for (let i = 1; i < datosVentas.length; i++) {
            const combustibleId = String(datosVentas[i][3]).trim().toUpperCase();
            const galones = parseFloat(datosVentas[i][4]) || 0;
            if (combustibleId) {
                ventasPorCombustible[combustibleId] = (ventasPorCombustible[combustibleId] || 0) + galones;
            }
        }
    }

    let datosC001 = { id: "C001", nombre: "ACPM", stockBase: 0, capacidadMax: 2300 };
    let datosC002 = { id: "C002", nombre: "Gasolina Corriente", stockBase: 0, capacidadMax: 6300 };

    if (datosInventario && datosInventario.length > 1) {
        for (let j = 1; j < datosInventario.length; j++) {
            const idComb = String(datosInventario[j][2]).trim().toUpperCase();
            const cantidadFila = parseFloat(datosInventario[j][4]) || 0;

            if (idComb.includes('C001')) {
                datosC001.stockBase += cantidadFila;
            } else if (idComb.includes('C002')) {
                datosC002.stockBase += cantidadFila;
            }
        }
    }

    if (datosC001.stockBase <= 0) datosC001.stockBase = datosC001.capacidadMax;
    if (datosC002.stockBase <= 0) datosC002.stockBase = datosC002.capacidadMax;

    let vendidoC001 = 0;
    let vendidoC002 = 0;

    for (let key in ventasPorCombustible) {
        if (key.includes('C001')) vendidoC001 += ventasPorCombustible[key];
        if (key.includes('C002')) vendidoC002 += ventasPorCombustible[key];
    }

    const contenedorCards = document.getElementById('dashboard-cards');
    if (!contenedorCards) return;
    contenedorCards.innerHTML = '';
    contenedorCards.style.cssText = "display: flex; flex-wrap: wrap; gap: 25px; justify-content: center; align-items: flex-start;";

    const tanquesUnificados = [
        { ...datosC002, vendido: vendidoC002 },
        { ...datosC001, vendido: vendidoC001 }
    ];

    tanquesUnificados.forEach(tanque => {
        const stockExacto = Math.max(0, tanque.stockBase - tanque.vendido);
        let porcentaje = (stockExacto / tanque.capacidadMax) * 100;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0) porcentaje = 0;

        let colorNivel = "#10b981";
        let alertaTexto = "✅ Nivel Óptimo";

        if (tanque.id === "C002") {
            if (stockExacto < 1000) {
                colorNivel = "#ef4444"; 
                alertaTexto = "🚨 Reserva Crítica";
            } else if (stockExacto >= 1000 && stockExacto <= 2500) {
                colorNivel = "#f59e0b"; 
                alertaTexto = "⚠️ Zona de Abastecimiento";
            }
        } else if (tanque.id === "C001") {
            if (stockExacto < 600) {
                colorNivel = "#ef4444"; 
                alertaTexto = "🚨 Reserva Crítica";
            } else if (stockExacto >= 600 && stockExacto <= 1200) {
                colorNivel = "#f59e0b"; 
                alertaTexto = "⚠️ Zona de Abastecimiento";
            }
        }

        const cardHTML = `
            <div style="background: #ffffff; border-top: 6px solid ${colorNivel}; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 25px; width: 260px; text-align: center; display: flex; flex-direction: column; align-items: center;">
                <h3 style="margin: 0 0 2px 0; color: #1e293b; font-size: 1.2rem; font-weight: 700;">🛢️ ${tanque.nombre}</h3>
                <span style="font-size: 0.8rem; color: #64748b; margin-bottom: 15px; font-weight: 600;">(${tanque.id})</span>
                <div style="position: relative; width: 85px; height: 180px; background: #f1f5f9; border: 4px solid #334155; border-radius: 12px 12px 18px 18px; overflow: hidden; box-shadow: inset 0 5px 15px rgba(0,0,0,0.15); margin: 5px 0 15px 0;">
                    <div style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 28px; height: 8px; background: #1e293b; border-radius: 3px; z-index: 3;"></div>
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${porcentaje}%; background: ${colorNivel}; transition: height 0.7s ease-in-out; opacity: 0.9;">
                        <div style="position: absolute; top: 0; left: 8px; width: 6px; height: 100%; background: rgba(255,255,255,0.35); border-radius: 3px;"></div>
                    </div>
                    <div style="position: absolute; width: 100%; top: 50%; transform: translateY(-50%); text-align: center; z-index: 2;">
                        <span style="font-weight: 800; font-size: 0.95rem; color: #0f172a; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">${porcentaje.toFixed(1)}%</span>
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 0.75rem; font-weight: bold; color: ${colorNivel}; background: #f8fafc; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">${alertaTexto}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 1.2rem; font-weight: bold; color: #0f172a;">${stockExacto.toFixed(0)} <span style="font-size: 0.85rem; color: #64748b;">Galones</span></span>
                </div>
                <div style="width: 100%; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: 5px; font-size: 0.8rem; color: #64748b;">
                    Capacidad Total: <b>${tanque.capacidadMax.toLocaleString()} Gal</b>
                </div>
            </div>
        `;
        contenedorCards.innerHTML += cardHTML;
    });
}

// ==========================================
// RENDERIZAR TABLA DE HISTORIAL DE PRECIOS
// ==========================================
function actualizarHistorialPreciosUI(datosHistorial) {
    const tbody = document.querySelector('#tabla-historial-precios tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!datosHistorial || datosHistorial.length <= 1) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">No hay registros de cambios de precios.</td></tr>`;
        return;
    }

    // Recorrer desde el final (más reciente primero)
    for (let i = datosHistorial.length - 1; i >= 1; i--) {
        const fila = datosHistorial[i];
        if (!fila[0]) continue;

        const fechaHora = fila[0];
        const combustibleNombre = fila[2] || fila[1];
        const precioAnterior = parseFloat(fila[3]) || 0;
        const precioNuevo = parseFloat(fila[4]) || 0;
        const usuario = fila[5] || "Sistema";

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fechaHora}</td>
            <td><b>${combustibleNombre}</b></td>
            <td>$${precioAnterior.toLocaleString()}</td>
            <td style="color: #10b981; font-weight: bold;">$${precioNuevo.toLocaleString()}</td>
            <td>${usuario}</td>
        `;
        tbody.appendChild(tr);
    }
}

// ==========================================
// MANEJADOR PARA ACTUALIZAR PRECIOS
// ==========================================
function handleActualizarPrecio(event) {
    event.preventDefault();

    const combustibleId = document.getElementById('precio-combustible-id').value;
    const nuevoPrecio = parseFloat(document.getElementById('precio-nuevo-valor').value);

    const datosPrecio = {
        combustibleId: combustibleId,
        nuevoPrecio: nuevoPrecio,
        usuario: (typeof usuarioLogueado !== 'undefined' ? usuarioLogueado : "Carlos Corredor Zapata")
    };

    if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(true);

    const urlDestino = typeof URL_WEB_APP !== 'undefined' ? URL_WEB_APP : (window.URL_WEB_APP || "");

    fetch(urlDestino, {
        method: "POST",
        body: JSON.stringify({
            accion: "actualizarPrecio",
            datosPrecio: datosPrecio
        })
    })
    .then(response => response.json())
    .then(res => {
        if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(false);
        if (res.success) {
            alert("¡Precio actualizado y registrado en el historial con éxito!");
            document.getElementById('form-actualizar-precio').reset();
            if (typeof sincronizarDatosGlobales === 'function') {
                sincronizarDatosGlobales();
            }
        } else {
            alert("Error al actualizar precio: " + res.message);
        }
    })
    .catch(err => {
        if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(false);
        console.error("Error:", err);
        alert("Error de conexión al guardar el nuevo precio.");
    });
}

// ==========================================
// MANEJADOR DE MOVIMIENTO EXTRAORDINARIO
// ==========================================
function handleMovimiento(event) {
    event.preventDefault();
    
    const combustible = document.getElementById('mov-combustible').value;
    const tipo = document.getElementById('mov-tipo').value;
    const cantidad = parseFloat(document.getElementById('mov-cantidad').value);
    const obs = document.getElementById('mov-obs').value;

    const datosMovimiento = { combustible, tipo, cantidad, observaciones: obs };

    if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(true);

    const urlDestino = typeof URL_WEB_APP !== 'undefined' ? URL_WEB_APP : (window.URL_WEB_APP || "");

    fetch(urlDestino, {
        method: "POST",
        body: JSON.stringify({
            accion: "registrarMovimiento",
            datosMovimiento: datosMovimiento
        })
    })
    .then(response => response.json())
    .then(res => {
        if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(false);
        if (res.success) {
            alert("¡Movimiento registrado y guardado en Google Drive con éxito!");
            document.getElementById('form-movimiento').reset();
            if (typeof sincronizarDatosGlobales === 'function') {
                sincronizarDatosGlobales();
            }
        } else {
            alert("Error al registrar movimiento: " + res.message);
        }
    })
    .catch(err => {
        if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(false);
        console.error("Error:", err);
        alert("Error de conexión al intentar guardar en Google Drive.");
    });
}
