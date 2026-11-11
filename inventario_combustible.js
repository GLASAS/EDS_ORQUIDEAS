// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE
// ==========================================

function actualizarNivelesTanquesUI(datosInventario, datosVentas) {
    const ventasPorCombustible = {};
    
    // Acumular galones vendidos por CombustibleID (Columna D -> índice 3, Galid Columna E -> índice 4)
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

    // Procesar inventario (Columna C índice 2 = CombustibleID, Columna E índice 4 = Cantidad/Stock inicial)
    if (datosInventario && datosInventario.length > 1) {
        for (let j = 1; j < datosInventario.length; j++) {
            const idComb = String(datosInventario[j][2]).trim();
            const stockInicial = parseFloat(datosInventario[j][4]) || 0;
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
