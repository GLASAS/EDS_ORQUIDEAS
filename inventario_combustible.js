// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE
// ==========================================

/**
 * Calcula los niveles de combustible exactos restando:
 * Hoja INVENTARIO_COMBUSTIBLE (Columna C y E) menos
 * Hoja Ventas (Columna D = CombustibleID, Columna E = Galid).
 */
function actualizarNivelesTanquesUI(datosInventario, datosVentas) {
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

    if (datosInventario && datosInventario.length > 1) {
        for (let j = 1; j < datosInventario.length; j++) {
            const idComb = datosInventario[j][2]; // Columna C (CombustibleID)
            const stockInicial = parseFloat(datosInventario[j][4]) || 0; // Columna E (Cantidad / Stock inicial)
            const nombreComb = datosInventario[j][1] || idComb;

            if (idComb) {
                const totalVendido = ventasPorCombustible[idComb] || 0;
                const stockExacto = stockInicial - totalVendido;

                const cardHTML = `
                    <div class="card">
                        <h3>${nombreComb} (${idComb})</h3>
                        <div class="card-body">
                            <p>Stock Base: <b>${stockInicial.toFixed(2)} Gal</b></p>
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
