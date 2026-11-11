// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (UNIFICADO EN 2 BATERÍAS: GASOLINA Y ACPM)
// ==========================================

function actualizarNivelesTanquesUI(datosInventario, datosVentas) {
    const ventasPorCombustible = {};
    
    // 1. Acumular galones vendidos por CombustibleID (Columna D -> índice 3, Galid Columna E -> índice 4)
    if (datosVentas && datosVentas.length > 1) {
        for (let i = 1; i < datosVentas.length; i++) {
            const combustibleId = String(datosVentas[i][3]).trim().toUpperCase();
            const galones = parseFloat(datosVentas[i][4]) || 0;
            if (combustibleId) {
                ventasPorCombustible[combustibleId] = (ventasPorCombustible[combustibleId] || 0) + galones;
            }
        }
    }

    // Estructuras acumuladoras para unificar en solo 2 baterías principales
    let unificadoGasolina = { stockBase: 0, vendido: 0, capacidadMax: 6300, nombre: "Gasolina Corriente" };
    let unificadoAcpm = { stockBase: 0, vendido: 0, capacidadMax: 2300, nombre: "ACPM" };

    // 2. Procesar y unificar el inventario de la hoja (Columna C índice 2 = ID, Columna E índice 4 = Stock Inicial)
    if (datosInventario && datosInventario.length > 1) {
        for (let j = 1; j < datosInventario.length; j++) {
            const idComb = String(datosInventario[j][2]).trim().toUpperCase();
            const stockBaseFila = parseFloat(datosInventario[j][4]) || 0;
            const nombreFila = String(datosInventario[j][1] || "").toLowerCase();

            if (idComb) {
                // Identificar si es ACPM o Gasolina por ID o por nombre
                if (idComb.includes('C001') || nombreFila.includes('acpm')) {
                    unificadoAcpm.stockBase += stockBaseFila;
                    unificadoAcpm.vendido += (ventasPorCombustible[idComb] || 0);
                    if (stockBaseFila > unificadoAcpm.capacidadMax) unificadoAcpm.capacidadMax = stockBaseFila;
                } else if (idComb.includes('C002') || nombreFila.includes('gasolina')) {
                    unificadoGasolina.stockBase += stockBaseFila;
                    unificadoGasolina.vendido += (ventasPorCombustible[idComb] || 0);
                    if (stockBaseFila > unificadoGasolina.capacidadMax) unificadoGasolina.capacidadMax = stockBaseFila;
                }
            }
        }
    }

    // Asegurar valores por defecto si no hay stock base registrado aún
    if (unificadoGasolina.stockBase === 0) unificadoGasolina.stockBase = unificadoGasolina.capacidadMax;
    if (unificadoAcpm.stockBase === 0) unificadoAcpm.stockBase = unificadoAcpm.capacidadMax;

    const contenedorCards = document.getElementById('dashboard-cards');
    if (!contenedorCards) return;
    contenedorCards.innerHTML = '';

    // Array con las 2 únicas baterías unificadas
    const tanquesUnificados = [unificadoGasolina, unificadoAcpm];

    tanquesUnificados.forEach(tanque => {
        const stockExacto = Math.max(0, tanque.stockBase - tanque.vendido);
        let porcentaje = (stockExacto / tanque.capacidadMax) * 100;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0) porcentaje = 0;

        // Colores inteligentes para la carga de la batería
        let colorCarga = "linear-gradient(90deg, #10b981, #059669)"; // Verde (Óptimo)
        if (porcentaje <= 40 && porcentaje > 20) {
            colorCarga = "linear-gradient(90deg, #f59e0b, #d97706)"; // Amarillo (Medio)
        } else if (porcentaje <= 20) {
            colorCarga = "linear-gradient(90deg, #ef4444, #dc2626)"; // Rojo (Crítico)
        }

        const cardHTML = `
            <div class="card" style="border-left: 5px solid #3b82f6; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; color: var(--primary);">🔋 ${tanque.nombre}</h3>
                    <span style="font-size: 0.85rem; font-weight: bold; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #475569;">
                        ${porcentaje.toFixed(1)}% Cargado
                    </span>
                </div>
                
                <div class="card-body">
                    <!-- Contenedor Estilo Batería / Tanque Unificado -->
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                        <div style="flex: 1; background: #e2e8f0; border-radius: 8px; height: 32px; position: relative; overflow: hidden; border: 2px solid #cbd5e1; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                            <!-- Barra de carga animada -->
                            <div style="width: ${porcentaje}%; background: ${colorCarga}; height: 100%; transition: width 0.6s ease-in-out; border-radius: 6px 0 0 6px;"></div>
                            <!-- Texto central con formato exacto unificado -->
                            <span style="position: absolute; width: 100%; text-align: center; top: 5px; left: 0; font-weight: bold; font-size: 0.85rem; color: #0f172a; text-shadow: 0 1px 2px rgba(255,255,255,0.7);">
                                ${stockExacto.toFixed(0)} de ${tanque.capacidadMax.toLocaleString()} Gal
                            </span>
                        </div>
                        <!-- Pin visual de la batería -->
                        <div style="width: 6px; height: 14px; background: #cbd5e1; border-radius: 0 3px 3px 0;"></div>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b; margin-top: 6px;">
                        <span>Vendido (Descarga): <b>${tanque.vendido.toFixed(2)} Gal</b></span>
                        <span>Capacidad Total: <b>${tanque.capacidadMax.toLocaleString()} Gal</b></span>
                    </div>
                </div>
            </div>
        `;
        contenedorCards.innerHTML += cardHTML;
    });
}
