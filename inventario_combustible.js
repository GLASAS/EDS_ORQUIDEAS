// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (ESTILO BATERÍA / TANQUE DINÁMICO)
// ==========================================

function actualizarNivelesTanquesUI(datosInventario, datosVentas) {
    const ventasPorCombustible = {};
    
    // 1. Acumular galones vendidos por CombustibleID (Columna D -> índice 3, Galid Columna E -> índice 4)
    if (datosVentas && datosVentas.length > 1) {
        for (let i = 1; i < datosVentas.length; i++) {
            const combustibleId = String(datosVentas[i][3]).trim();
            const galones = parseFloat(datosVentas[i][4]) || 0;
            if (combustibleId) {
                ventasPorCombustible[combustibleId] = (ventasPorCombustible[combustibleId] || 0) + galones;
            }
        }
    }

    const contenedorCards = document.getElementById('dashboard-cards');
    if (!contenedorCards) return;
    contenedorCards.innerHTML = '';

    // 2. Procesar inventario (Columna C índice 2 = CombustibleID, Columna E índice 4 = Stock Inicial / Capacidad Base)
    if (datosInventario && datosInventario.length > 1) {
        for (let j = 1; j < datosInventario.length; j++) {
            const idComb = String(datosInventario[j][2]).trim();
            const stockBase = parseFloat(datosInventario[j][4]) || 0;
            const nombreComb = datosInventario[j][1] || idComb;

            if (idComb) {
                const totalVendido = ventasPorCombustible[idComb] || 0;
                const stockExacto = Math.max(0, stockBase - totalVendido);

                // Definir capacidad máxima de referencia según el tipo de combustible
                let capacidadMax = stockBase > 0 ? stockBase : 6300; 
                if (idComb === 'C001' || nombreComb.toLowerCase().includes('acpm')) {
                    capacidadMax = 2300; // Tope estándar ACPM
                } else if (idComb === 'C002' || nombreComb.toLowerCase().includes('gasolina')) {
                    capacidadMax = 6300; // Tope estándar Gasolina
                }

                // Calcular porcentaje de la "batería" / tanque (cargado/descargado)
                let porcentaje = (stockExacto / capacidadMax) * 100;
                if (porcentaje > 100) porcentaje = 100;
                if (porcentaje < 0) porcentaje = 0;

                // Color dinámico de la carga de la batería (Verde > 40%, Amarillo 21-40%, Rojo <= 20%)
                let colorCarga = "linear-gradient(90deg, #10b981, #059669)"; // Verde (Cargado / Nivel óptimo)
                if (porcentaje <= 40 && porcentaje > 20) {
                    colorCarga = "linear-gradient(90deg, #f59e0b, #d97706)"; // Amarillo (Medio)
                } else if (porcentaje <= 20) {
                    colorCarga = "linear-gradient(90deg, #ef4444, #dc2626)"; // Rojo (Descargando / Crítico)
                }

                // Renderizar diseño tipo batería de celular / tanque de combustible
                const cardHTML = `
                    <div class="card" style="border-left: 5px solid #3b82f6; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="margin: 0; color: var(--primary);">🔋 ${nombreComb} (${idComb})</h3>
                            <span style="font-size: 0.85rem; font-weight: bold; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #475569;">
                                ${porcentaje.toFixed(1)}% Cargado
                            </span>
                        </div>
                        
                        <div class="card-body">
                            <!-- Contenedor Estilo Batería / Tanque -->
                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                                <div style="flex: 1; background: #e2e8f0; border-radius: 8px; height: 32px; position: relative; overflow: hidden; border: 2px solid #cbd5e1; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                                    <!-- Nivel de carga animado -->
                                    <div style="width: ${porcentaje}%; background: ${colorCarga}; height: 100%; transition: width 0.6s ease-in-out; border-radius: 6px 0 0 6px;"></div>
                                    <!-- Texto central con formato exacto solicitado -->
                                    <span style="position: absolute; width: 100%; text-align: center; top: 5px; left: 0; font-weight: bold; font-size: 0.85rem; color: #0f172a; text-shadow: 0 1px 2px rgba(255,255,255,0.7);">
                                        ${stockExacto.toFixed(0)} de ${capacidadMax.toLocaleString()} Gal
                                    </span>
                                </div>
                                <!-- Pin de la batería visual -->
                                <div style="width: 6px; height: 14px; background: #cbd5e1; border-radius: 0 3px 3px 0;"></div>
                            </div>

                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b; margin-top: 6px;">
                                <span>Vendido (Descarga): <b>${totalVendido.toFixed(2)} Gal</b></span>
                                <span>Capacidad Total: <b>${capacidadMax.toLocaleString()} Gal</b></span>
                            </div>
                        </div>
                    </div>
                `;
                contenedorCards.innerHTML += cardHTML;
            }
        }
    }
}
