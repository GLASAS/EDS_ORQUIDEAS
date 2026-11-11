// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (ESTILO BATERÍA VERTICAL / TANQUE)
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

    // Estructuras para unificar en solo 2 baterías principales: Gasolina y ACPM
    let unificadoGasolina = { stockBase: 0, vendido: 0, capacidadMax: 6300, nombre: "Gasolina Corriente" };
    let unificadoAcpm = { stockBase: 0, vendido: 0, capacidadMax: 2300, nombre: "ACPM" };

    // 2. Procesar y unificar inventario (Columna C índice 2 = ID, Columna E índice 4 = Stock Inicial)
    if (datosInventario && datosInventario.length > 1) {
        for (let j = 1; j < datosInventario.length; j++) {
            const idComb = String(datosInventario[j][2]).trim().toUpperCase();
            const stockBaseFila = parseFloat(datosInventario[j][4]) || 0;
            const nombreFila = String(datosInventario[j][1] || "").toLowerCase();

            if (idComb) {
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

    if (unificadoGasolina.stockBase === 0) unificadoGasolina.stockBase = unificadoGasolina.capacidadMax;
    if (unificadoAcpm.stockBase === 0) unificadoAcpm.stockBase = unificadoAcpm.capacidadMax;

    const contenedorCards = document.getElementById('dashboard-cards');
    if (!contenedorCards) return;
    contenedorCards.innerHTML = '';

    const tanquesUnificados = [unificadoGasolina, unificadoAcpm];

    tanquesUnificados.forEach(tanque => {
        const stockExacto = Math.max(0, tanque.stockBase - tanque.vendido);
        let porcentaje = (stockExacto / tanque.capacidadMax) * 100;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0) porcentaje = 0;

        // Color principal según el porcentaje de carga
        let colorPrincipal = "#10b981"; // Verde
        if (porcentaje <= 60 && porcentaje > 30) colorPrincipal = "#f59e0b"; // Amarillo / Naranja
        if (porcentaje <= 30) colorPrincipal = "#ef4444"; // Rojo crítico

        // Generar 5 bloques segmentados estilo batería (de abajo hacia arriba)
        let bloquesHTML = '';
        const totalBloques = 5;
        const bloquesActivos = Math.round((porcentaje / 100) * totalBloques);

        for (let b = totalBloques; b >= 1; b--) {
            let colorBloque = "#e2e8f0"; // Vacío (gris claro)
            let opacity = "0.3";

            if (b <= bloquesActivos) {
                opacity = "1";
                if (b === 5 || b === 4) colorBloque = "#10b981"; // Verde arriba
                else if (b === 3) colorBloque = "#f59e0b";      // Amarillo medio
                else colorBloque = "#ef4444";                    // Rojo abajo (reserva)
            }

            bloquesHTML += `
                <div style="background: ${colorBloque}; opacity: ${opacity}; height: 22px; border-radius: 4px; transition: all 0.4s ease;"></div>
            `;
        }

        const cardHTML = `
            <div class="card" style="border-top: 5px solid ${colorPrincipal}; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.06); margin-bottom: 20px; text-align: center; padding: 20px;">
                <!-- Pin superior de la batería -->
                <div style="width: 35px; height: 8px; background: #64748b; margin: 0 auto 6px auto; border-radius: 3px 3px 0 0;"></div>
                
                <h3 style="margin: 0 0 4px 0; color: var(--primary); font-size: 1.1rem;">🔋 ${tanque.nombre}</h3>
                <span style="font-size: 0.8rem; font-weight: bold; color: #64748b;">
                    ${porcentaje.toFixed(1)}% Disponible
                </span>

                <!-- Cuerpo de la Batería Vertical con Bloques Segmentados -->
                <div style="background: #f8fafc; border: 3px solid #cbd5e1; border-radius: 10px; padding: 8px; margin: 15px auto; width: 120px; display: flex; flex-direction: column; gap: 5px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    ${bloquesHTML}
                </div>

                <!-- Cantidad Exacta -->
                <div style="margin-top: 10px;">
                    <span style="font-size: 1.2rem; font-weight: bold; color: #0f172a;">
                        ${stockExacto.toFixed(0)} <span style="font-size: 0.9rem; color: #64748b;">de ${tanque.capacidadMax.toLocaleString()} Gal</span>
                    </span>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-top: 12px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                    <span>Vendido: <b>${tanque.vendido.toFixed(1)} Gal</b></span>
                    <span>Capacidad: <b>${tanque.capacidadMax.toLocaleString()} Gal</b></span>
                </div>
            </div>
        `;
        contenedorCards.innerHTML += cardHTML;
    });
}
