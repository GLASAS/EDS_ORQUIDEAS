// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (GASOLINA PRIMERO, CILINDROS BOTELLA Y ALERTAS)
// ==========================================

function actualizarNivelesTanquesUI(datosInventario, datosVentas) {
    const ventasPorCombustible = {};
    
    // 1. Acumular ventas totales por ID (Columna D -> índice 3, Galid Columna E -> índice 4)[cite: 6]
    if (datosVentas && datosVentas.length > 1) {
        for (let i = 1; i < datosVentas.length; i++) {
            const combustibleId = String(datosVentas[i][3]).trim().toUpperCase();
            const galones = parseFloat(datosVentas[i][4]) || 0;
            if (combustibleId) {
                ventasPorCombustible[combustibleId] = (ventasPorCombustible[combustibleId] || 0) + galones;
            }
        }
    }

    // Estructuras fijas unificadas para los dos tanques
    let datosC001 = { id: "C001", nombre: "ACPM", stockBase: 0, capacidadMax: 2300 };
    let datosC002 = { id: "C002", nombre: "Gasolina Corriente", stockBase: 0, capacidadMax: 6300 };

    // 2. Sumar el inventario agrupando estrictamente por C001 y C002[cite: 5]
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

    // Forzar contenedor horizontal flexible de dos columnas centrado
    contenedorCards.style.cssText = "display: flex; flex-wrap: wrap; gap: 25px; justify-content: center; align-items: flex-start;";

    // ORDEN ESTRICTO: GASOLINA DE PRIMERAS (C002) Y ACPM DESPUÉS (C001)
    const tanquesUnificados = [
        { ...datosC002, vendido: vendidoC002 },
        { ...datosC001, vendido: vendidoC001 }
    ];

    tanquesUnificados.forEach(tanque => {
        const stockExacto = Math.max(0, tanque.stockBase - tanque.vendido);
        let porcentaje = (stockExacto / tanque.capacidadMax) * 100;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0) porcentaje = 0;

        let colorNivel = "#10b981"; // Verde por defecto
        let alertaTexto = "✅ Nivel Óptimo";

        // Reglas de alerta específicas solicitadas:
        if (tanque.id === "C002") {
            // GASOLINA (Máx 6300): Amarillo entre 1000 y 2500, Rojo < 1000
            if (stockExacto < 1000) {
                colorNivel = "#ef4444"; 
                alertaTexto = "🚨 Reserva Crítica";
            } else if (stockExacto >= 1000 && stockExacto <= 2500) {
                colorNivel = "#f59e0b"; 
                alertaTexto = "⚠️ Zona de Abastecimiento";
            }
        } else if (tanque.id === "C001") {
            // ACPM (Máx 2300): Amarillo entre 600 y 1200, Rojo < 600
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

                <!-- CILINDRO / BOTELLA VERTICAL -->
                <div style="position: relative; width: 85px; height: 180px; background: #f1f5f9; border: 4px solid #334155; border-radius: 12px 12px 18px 18px; overflow: hidden; box-shadow: inset 0 5px 15px rgba(0,0,0,0.15); margin: 5px 0 15px 0;">
                    
                    <!-- Tapa de botella superior -->
                    <div style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 28px; height: 8px; background: #1e293b; border-radius: 3px; z-index: 3;"></div>

                    <!-- Líquido interior vertical (sube desde abajo) -->
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${porcentaje}%; background: ${colorNivel}; transition: height 0.7s ease-in-out; opacity: 0.9;">
                        <!-- Brillo longitudinal -->
                        <div style="position: absolute; top: 0; left: 8px; width: 6px; height: 100%; background: rgba(255,255,255,0.35); border-radius: 3px;"></div>
                    </div>

                    <!-- Porcentaje en el centro -->
                    <div style="position: absolute; width: 100%; top: 50%; transform: translateY(-50%); text-align: center; z-index: 2;">
                        <span style="font-weight: 800; font-size: 0.95rem; color: #0f172a; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                            ${porcentaje.toFixed(1)}%
                        </span>
                    </div>
                </div>

                <!-- Estado de Alerta -->
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 0.75rem; font-weight: bold; color: ${colorNivel}; background: #f8fafc; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        ${alertaTexto}
                    </span>
                </div>

                <!-- Cantidad Actual en Galones -->
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 1.2rem; font-weight: bold; color: #0f172a;">
                        ${stockExacto.toFixed(0)} <span style="font-size: 0.85rem; color: #64748b;">Galones</span>
                    </span>
                </div>

                <!-- Únicamente muestra la capacidad total al final -->
                <div style="width: 100%; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: 5px; font-size: 0.8rem; color: #64748b;">
                    Capacidad Total: <b>${tanque.capacidadMax.toLocaleString()} Gal</b>
                </div>

            </div>
        `;
        contenedorCards.innerHTML += cardHTML;
    });
}

// Manejador del formulario de movimiento extraordinario
function handleMovimiento(event) {
    event.preventDefault();
    
    const combustible = document.getElementById('mov-combustible').value;
    const tipo = document.getElementById('mov-tipo').value;
    const cantidad = parseFloat(document.getElementById('mov-cantidad').value);
    const obs = document.getElementById('mov-obs').value;

    const datosMovimiento = { combustible, tipo, cantidad, observaciones: obs };

    if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(true);

    fetch(URL_WEB_APP, {
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
        alert("Error de conexión al guardar en Google Drive.");
    });
}
