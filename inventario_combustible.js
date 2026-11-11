// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (ESTRICTAMENTE 2 CILINDROS: GASOLINA Y ACPM)
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

    // Valores por defecto si la hoja está vacía en stock base
    if (datosC001.stockBase <= 0) datosC001.stockBase = datosC001.capacidadMax;
    if (datosC002.stockBase <= 0) datosC002.stockBase = datosC002.capacidadMax;

    // Calcular ventas agrupadas
    let vendidoC001 = 0;
    let vendidoC002 = 0;

    for (let key in ventasPorCombustible) {
        if (key.includes('C001')) vendidoC001 += ventasPorCombustible[key];
        if (key.includes('C002')) vendidoC002 += ventasPorCombustible[key];
    }

    const contenedorCards = document.getElementById('dashboard-cards');
    if (!contenedorCards) return;
    contenedorCards.innerHTML = '';

    // Array estricto con los dos únicos tanques unificados
    const tanquesUnificados = [
        { ...datosC001, vendido: vendidoC001 },
        { ...datosC002, vendido: vendidoC002 }
    ];

    tanquesUnificados.forEach(tanque => {
        const stockExacto = Math.max(0, tanque.stockBase - tanque.vendido);
        let porcentaje = (stockExacto / tanque.capacidadMax) * 100;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0) porcentaje = 0;

        // Lógica de colores y alertas solicitada:
        // - Amarillo exacto si está entre 2100 y 2500 galones
        // - Rojo si es menor o igual al 20% o crítico
        // - Verde si está óptimo
        let colorNivel = "#10b981"; // Verde por defecto
        let alertaTexto = "";

        if (stockExacto >= 2100 && stockExacto <= 2500) {
            colorNivel = "#f59e0b"; // Amarillo de alerta (rango solicitado)
            alertaTexto = "⚠️ Revisar / Abastecer";
        } else if (porcentaje <= 20) {
            colorNivel = "#ef4444"; // Rojo crítico
            alertaTexto = "🚨 Nivel Crítico";
        } else {
            alertaTexto = "✅ Nivel Óptimo";
        }

        const cardHTML = `
            <div class="card" style="border-top: 5px solid ${colorNivel}; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.06); margin-bottom: 20px; text-align: center; padding: 20px; border-radius: 12px;">
                <!-- Pin superior del cilindro / batería -->
                <div style="width: 40px; height: 10px; background: #64748b; margin: 0 auto 6px auto; border-radius: 4px 4px 0 0;"></div>
                
                <h3 style="margin: 0 0 2px 0; color: var(--primary); font-size: 1.15rem;">🛢️ ${tanque.nombre} (${tanque.id})</h3>
                <span style="font-size: 0.75rem; font-weight: bold; color: ${colorNivel}; background: #f8fafc; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    ${alertaTexto}
                </span>

                <!-- Cuerpo del Cilindro / Batería Vertical -->
                <div style="background: #e2e8f0; border: 3px solid #cbd5e1; border-radius: 12px; height: 140px; width: 90px; margin: 15px auto; position: relative; overflow: hidden; box-shadow: inset 0 3px 6px rgba(0,0,0,0.1);">
                    <!-- Nivel de llenado dinámico desde abajo hacia arriba -->
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${porcentaje}%; background: ${colorNivel}; transition: height 0.6s ease-in-out;"></div>
                    <!-- Líneas de referencia o marca de agua de porcentaje -->
                    <span style="position: absolute; width: 100%; text-align: center; top: 50%; transform: translateY(-50%); font-weight: bold; font-size: 0.85rem; color: #0f172a; text-shadow: 0 1px 3px rgba(255,255,255,0.8);">
                        ${porcentaje.toFixed(1)}%
                    </span>
                </div>

                <!-- Cantidad Exacta -->
                <div style="margin-top: 8px;">
                    <span style="font-size: 1.1rem; font-weight: bold; color: #0f172a;">
                        ${stockExacto.toFixed(0)} <span style="font-size: 0.85rem; color: #64748b;">de ${tanque.capacidadMax.toLocaleString()} Gal</span>
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
