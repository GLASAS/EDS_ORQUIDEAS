// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (ESTILO TANQUE / BATERÍA)
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

                // Capacidad máxima de referencia adaptada a tus tanques (ej: Gasolina ~6300, ACPM ~2300 o el stock base registrado)
                let capacidadMax = stockBase > 0 ? stockBase : 6300; 
                if (idComb === 'C001') capacidadMax = 2300; // Tope estándar ACPM según ejemplo
                if (idComb === 'C002') capacidadMax = 6300; // Tope estándar Gasolina según ejemplo

                // Calcular porcentaje de llenado para la barra tipo batería/tanque
                let porcentaje = (stockExacto / capacidadMax) * 100;
                if (porcentaje > 100) porcentaje = 100;
                if (porcentaje < 0) porcentaje = 0;

                // Color dinámico de la barra según nivel (Verde > 40%, Amarillo 21-40%, Rojo <= 20%)
                let colorBarra = "linear-gradient(90deg, #10b981, #059669)"; // Verde operativo
                if (porcentaje <= 40 && porcentaje > 20) colorBarra = "linear-gradient(90deg, #f59e0b, #d97706)"; // Advertencia (Amarillo)
                if (porcentaje <= 20) colorBarra = "linear-gradient(90deg, #ef4444, #dc2626)"; // Crítico (Rojo)

                // Renderizar tarjeta con diseño de barra de combustible / batería
                const cardHTML = `
                    <div class="card" style="border-left: 5px solid #3b82f6; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h3 style="margin-bottom: 10px; color: var(--primary);">⛽ ${nombreComb} (${idComb})</h3>
                        <div class="card-body">
                            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
                                <span>Nivel Actual:</span>
                                <b>${stockExacto.toFixed(2)} Gal</b>
                            </div>
                            
                            <!-- Barra Gráfica Tipo Batería / Tanque -->
                            <div style="background: #e2e8f0; border-radius: 12px; height: 30px; position: relative; overflow: hidden; border: 2px solid #cbd5e1; box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);">
                                <div style="width: ${porcentaje}%; background: ${colorBarra}; height: 100%; transition: width 0.6s ease-in-out; border-radius: 9px 0 0 9px;"></div>
                                <span style="position: absolute; width: 100%; text-align: center; top: 4px; left: 0; font-weight: bold; font-size: 0.85rem; color: #0f172a; text-shadow: 0 1px 2px rgba(255,255,255,0.7);">
                                    ${stockExacto.toFixed(0)} de ${capacidadMax.toLocaleString()} Gal (${porcentaje.toFixed(1)}%)
                                </span>
                            </div>

                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b; margin-top: 8px;">
                                <span>Vendido: ${totalVendido.toFixed(2)} Gal</span>
                                <span>Capacidad Máx: ${capacidadMax.toLocaleString()} Gal</span>
                            </div>
                        </div>
                    </div>
                `;
                contenedorCards.innerHTML += cardHTML;
            }
        }
    }
}
