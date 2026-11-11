// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE
// ==========================================

/**
 * Actualiza los niveles de combustible calculando la resta entre:
 * Hoja INVENTARIO_COMBUSTIBLE (Columna C & Columna E) menos 
 * Hoja Ventas (Columna D = CombustibleID, Columna E = Galid).
 */
function actualizarNivelesTanquesUI(datosInventario, datosVentas) {
    // Acumular ventas por CombustibleID
    const ventasPorCombustible = {};
    if (datosVentas && datosVentas.length > 1) {
        for (let i = 1; i < datosVentas.length; i++) {
            const combustibleId = datosVentas[i][3]; // Columna D
            const galones = parseFloat(datosVentas[i][4]) || 0; // Columna E (Galid)
            if (combustibleId) {
                ventasPorCombustible[combustibleId] = (ventasPorCombustible[combustibleId] || 0) + galones;
            }
        }
    }

    const contenedorCards = document.getElementById('dashboard-cards');
    if (!contenedorCards) return;
    contenedorCards.innerHTML = '';

    // Procesar inventario (Columna C = ID Combustible, Columna E = Stock Inicial)
    if (datosInventario && datosInventario.length > 1) {
        for (let j = 1; j < datosInventario.length; j++) {
            const idComb = datosInventario[j][2]; // Columna C
            const stockInicial = parseFloat(datosInventario[j][4]) || 0; // Columna E
            const nombreComb = datosInventario[j][1] || idComb;

            if (idComb) {
                const totalVendido = ventasPorCombustible[idComb] || 0;
                const stockExacto = stockInicial - totalVendido;

                const cardHTML = `
                    <div class="card">
                        <h3>${nombreComb} (${idComb})</h3>
                        <div class="card-body">
                            <p>Stock Inicial: <b>${stockInicial.toFixed(2)} Gal</b></p>
                            <p>Total Vendido: <b>${totalVendido.toFixed(2)} Gal</b></p>
                            <p>Nivel Actual Exacto: <b style="color: var(--primary); font-size: 1.1rem;">${stockExacto.toFixed(2)} Gal</b></p>
                        </div>
                    </div>
                `;
                contenedorCards.innerHTML += cardHTML;
            }
        }
    }
}
