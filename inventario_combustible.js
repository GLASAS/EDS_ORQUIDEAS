// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (ESTRICTAMENTE 2 TARJETAS: C001 Y C002)
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

    // Acumuladores exclusivos para los dos únicos grupos: C001 y C002
    let datosC001 = { id: "C001", nombre: "ACPM", stockBase: 0, capacidadMax: 2300 };
    let datosC002 = { id: "C002", nombre: "Gasolina Corriente", stockBase: 0, capacidadMax: 6300 };

    // 2. Agrupar todo el inventario sumando las cantidades de la hoja INVENTARIO_COMBUSTIBLE
    // Columna C (índice 2) = CombustibleID (C001 o C002), Columna E (índice 4) = Cantidad/Stock
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

    // Si no hay stock acumulado en la hoja, usar la capacidad por defecto como base
    if (datosC001.stockBase <= 0) datosC001.stockBase = datosC001.capacidadMax;
    if (datosC002.stockBase <= 0) datosC002.stockBase = datosC002.capacidadMax;

    // Calcular ventas totales agrupadas para C001 y C002
    // (Sumamos las ventas que correspondan al código exacto o que contengan la referencia)
    let vendidoC001 = 0;
    let vendidoC002 = 0;

    for (let key in ventasPorCombustible) {
        if (key.includes('C001')) vendidoC001 += ventasPorCombustible[key];
        if (key.includes('C002')) vendidoC002 += ventasPorCombustible[key];
    }

    const contenedorCards = document.getElementById('dashboard-cards');
    if (!contenedorCards) return;
    contenedorCards.innerHTML = '';

    // Array estricto con los dos únicos tanques a mostrar
    const tanquesAgrupados = [
        { ...datosC001, vendido: vendidoC001 },
        { ...datosC002, vendido: vendidoC002 }
    ];

    tanquesAgrupados.forEach(tanque => {
        const stockExacto = Math.max(0, tanque.stockBase - tanque.vendido);
        let porcentaje = (stockExacto / tanque.capacidadMax) * 100;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0) porcentaje = 0;

        // Color dinámico de la barra según nivel
        let colorBarra = "linear-gradient(90deg, #10b981, #059669)"; // Verde
        if (porcentaje <= 40 && porcentaje > 20) {
            colorBarra = "linear-gradient(90deg, #f59e0b, #d97706)"; // Amarillo
        } else if (porcentaje <= 20) {
            colorBarra = "linear-gradient(90deg, #ef4444, #dc2626)"; // Rojo
        }

        const cardHTML = `
            <div class="card" style="border-left: 5px solid #3b82f6; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: var(--primary);">⛽ ${tanque.nombre} (${tanque.id})</h3>
                    <span style="font-size: 0.85rem; font-weight: bold; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #475569;">
                        ${porcentaje.toFixed(1)}%
                    </span>
                </div>
                
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: #475569;">
                        <span>Nivel Actual:</span>
                        <b>${stockExacto.toFixed(2)} Gal</b>
                    </div>
                    
                    <!-- Barra de Nivel Limpia -->
                    <div style="background: #e2e8f0; border-radius: 8px; height: 28px; position: relative; overflow: hidden; border: 2px solid #cbd5e1; box-shadow: inset 0 2px 4px rgba(0,0,0,0.08); margin-bottom: 10px;">
                        <div style="width: ${porcentaje}%; background: ${colorBarra}; height: 100%; transition: width 0.6s ease-in-out; border-radius: 6px 0 0 6px;"></div>
                        <span style="position: absolute; width: 100%; text-align: center; top: 3px; left: 0; font-weight: bold; font-size: 0.85rem; color: #0f172a; text-shadow: 0 1px 2px rgba(255,255,255,0.7);">
                            ${stockExacto.toFixed(0)} de ${tanque.capacidadMax.toLocaleString()} Gal
                        </span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b;">
                        <span>Vendido: <b>${tanque.vendido.toFixed(2)} Gal</b></span>
                        <span>Capacidad Máx: <b>${tanque.capacidadMax.toLocaleString()} Gal</b></span>
                    </div>
                </div>
            </div>
        `;
        contenedorCards.innerHTML += cardHTML;
    });
}
