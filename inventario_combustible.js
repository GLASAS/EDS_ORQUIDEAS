// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (CILINDROS VERTICALES PROFESIONALES)
// ==========================================

function actualizarNivelesTanquesUI(datosInventario, datosVentas) {
    const ventasPorCombustible = {};
    
    // 1. Acumular ventas totales por ID (Columna D -> índice 3, Galid Columna E -> índice 4)
    if (datosVentas && datosVentas.length > 1) {
        for (let i = 1; i < datosVentas.length; i++) {
            const combustibleId = String(datosVentas[i][3]).trim().toUpperCase();
            const galones = parseFloat(datosVentas[i][4]) || 0;
            if (combustibleId) {
                ventasPorCombustible[combustibleId] = (ventasPorCombustible[combustibleId] || 0) + galones;
            }
        }
    }

    // Estructuras exclusivas y fijas para los dos únicos tanques
    let datosC001 = { id: "C001", nombre: "ACPM", stockBase: 0, capacidadMax: 2300 };
    let datosC002 = { id: "C002", nombre: "Gasolina Corriente", stockBase: 0, capacidadMax: 6300 };

    // 2. Sumar todo el inventario de la hoja agrupando por C001 y C002
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

    const tanquesUnificados = [
        { ...datosC001, vendido: vendidoC001 },
        { ...datosC002, vendido: vendidoC002 }
    ];

    // Cambiar el contenedor principal a formato de cuadrícula para que los cilindros se acomoden lado a lado
    contenedorCards.style.display = "grid";
    contenedorCards.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
    contenedorCards.style.gap = "20px";

    tanquesUnificados.forEach(tanque => {
        const stockExacto = Math.max(0, tanque.stockBase - tanque.vendido);
        let porcentaje = (stockExacto / tanque.capacidadMax) * 100;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0) porcentaje = 0;

        // Lógica de colores y alertas:
        // - Amarillo si está entre 2100 y 2500 galones (rango solicitado)
        // - Rojo si está en nivel crítico (<= 20%)
        // - Verde si está en nivel óptimo
        let colorNivel = "#10b981"; // Verde
        let alertaTexto = "✅ Nivel Óptimo";

        if (stockExacto >= 2100 && stockExacto <= 2500) {
            colorNivel = "#f59e0b"; // Amarillo de alerta
            alertaTexto = "⚠️ Revisar / Abastecer";
        } else if (porcentaje <= 20) {
            colorNivel = "#ef4444"; // Rojo crítico
            alertaTexto = "🚨 Nivel Crítico";
        }

        const cardHTML = `
            <div class="card" style="border-top: 6px solid ${colorNivel}; background: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.08); text-align: center; padding: 25px; border-radius: 14px; display: flex; flex-direction: column; align-items: center;">
                
                <h3 style="margin: 0 0 5px 0; color: var(--primary); font-size: 1.2rem;">🛢️ ${tanque.nombre}</h3>
                <span style="font-size: 0.8rem; font-weight: bold; color: #64748b; margin-bottom: 15px;">(${tanque.id})</span>

                <!-- CILINDRO / TANQUE VERTICAL PROFESIONAL -->
                <div style="position: relative; width: 110px; height: 180px; background: #e2e8f0; border: 4px solid #475569; border-radius: 20px; overflow: hidden; box-shadow: inset 0 5px 15px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.05); margin: 10px 0;">
                    
                    <!-- Líquido dentro del tanque (se llena de abajo hacia arriba) -->
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${porcentaje}%; background: ${colorNivel}; transition: height 0.7s ease-in-out; opacity: 0.9;">
                        <!-- Efecto de brillo interior en el líquido -->
                        <div style="position: absolute; top: 0; left: 10px; width: 8px; height: 100%; background: rgba(255,255,255,0.3); border-radius: 4px;"></div>
                    </div>

                    <!-- Indicador de Porcentaje Flotante en el Centro -->
                    <div style="position: absolute; width: 100%; top: 50%; transform: translateY(-50%); text-align: center; z-index: 2;">
                        <span style="font-weight: 800; font-size: 1.1rem; color: #0f172a; background: rgba(255,255,255,0.85); padding: 3px 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            ${porcentaje.toFixed(1)}%
                        </span>
                    </div>
                </div>

                <!-- Estado de Alerta -->
                <div style="margin: 10px 0 5px 0;">
                    <span style="font-size: 0.8rem; font-weight: bold; color: ${colorNivel}; background: #f8fafc; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        ${alertaTexto}
                    </span>
                </div>

                <!-- Cantidad Exacta -->
                <div style="margin: 8px 0;">
                    <span style="font-size: 1.25rem; font-weight: bold; color: #0f172a;">
                        ${stockExacto.toFixed(0)} <span style="font-size: 0.9rem; color: #64748b;">de ${tanque.capacidadMax.toLocaleString()} Gal</span>
                    </span>
                </div>

                <!-- Pie de tarjeta con detalles -->
                <div style="width: 100%; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                    <span>Vendido: <b>${tanque.vendido.toFixed(1)} Gal</b></span>
                    <span>Capacidad: <b>${tanque.capacidadMax.toLocaleString()} Gal</b></span>
                </div>

            </div>
        `;
        contenedorCards.innerHTML += cardHTML;
    });
}
