// ==========================================
// MÓDULO: INVENTARIO Y NIVELES DE COMBUSTIBLE (CILINDRO TIPO BOTELLA Y REGLAS DE ALERTA)
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

    // Estructuras fijas unificadas para los dos tanques
    let datosC001 = { id: "C001", nombre: "ACPM", stockBase: 0, capacidadMax: 2300 };
    let datosC002 = { id: "C002", nombre: "Gasolina Corriente", stockBase: 0, capacidadMax: 6300 };

    // 2. Sumar el inventario agrupando estrictamente por C001 y C002
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

    // Configurar contenedor en cuadrícula moderna de 2 columnas
    contenedorCards.style.display = "grid";
    contenedorCards.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
    contenedorCards.style.gap = "20px";

    tanquesUnificados.forEach(tanque => {
        const stockExacto = Math.max(0, tanque.stockBase - tanque.vendido);
        let porcentaje = (stockExacto / tanque.capacidadMax) * 100;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0) porcentaje = 0;

        let colorNivel = "#10b981"; // Verde por defecto
        let alertaTexto = "✅ Nivel Óptimo";

        // Reglas de colores solicitadas por combustible:
        if (tanque.id === "C002") {
            // GASOLINA (Máx 6300)
            if (stockExacto < 1000) {
                colorNivel = "#ef4444"; // Rojo (< 1000)
                alertaTexto = "🚨 Reserva Crítica";
            } else if (stockExacto >= 1000 && stockExacto <= 2500) {
                colorNivel = "#f59e0b"; // Amarillo (1000 a 2500)
                alertaTexto = "⚠️ Revisar / Abastecer";
            }
        } else if (tanque.id === "C001") {
            // ACPM (Máx 2300)
            if (stockExacto < 600) {
                colorNivel = "#ef4444"; // Rojo (< 600)
                alertaTexto = "🚨 Reserva Crítica";
            } else if (stockExacto >= 600 && stockExacto <= 1200) {
                colorNivel = "#f59e0b"; // Amarillo (600 a 1200)
                alertaTexto = "⚠️ Revisar / Abastecer";
            }
        }

        const cardHTML = `
            <div class="card" style="border-top: 6px solid ${colorNivel}; background: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.08); text-align: center; padding: 22px; border-radius: 14px; display: flex; flex-direction: column; align-items: center;">
                
                <h3 style="margin: 0 0 4px 0; color: var(--primary); font-size: 1.15rem;">🛢️ ${tanque.nombre}</h3>
                <span style="font-size: 0.75rem; font-weight: bold; color: #64748b; margin-bottom: 12px;">(${tanque.id})</span>

                <!-- CILINDRO / BOTELLA VERTICAL -->
                <div style="position: relative; width: 90px; height: 160px; background: #f1f5f9; border: 3px solid #475569; border-radius: 12px 12px 16px 16px; overflow: hidden; box-shadow: inset 0 4px 10px rgba(0,0,0,0.15); margin: 5px 0;">
                    
                    <!-- Tapa / Cuello de la botella -->
                    <div style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 30px; height: 8px; background: #334155; border-radius: 3px; z-index: 3;"></div>

                    <!-- Nivel de líquido dentro de la botella (sube desde abajo) -->
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${porcentaje}%; background: ${colorNivel}; transition: height 0.7s ease-in-out; opacity: 0.92;">
                        <!-- Brillo interior -->
                        <div style="position: absolute; top: 0; left: 8px; width: 6px; height: 100%; background: rgba(255,255,255,0.35); border-radius: 3px;"></div>
                    </div>

                    <!-- Porcentaje en el centro -->
                    <div style="position: absolute; width: 100%; top: 50%; transform: translateY(-50%); text-align: center; z-index: 2;">
                        <span style="font-weight: 800; font-size: 0.95rem; color: #0f172a; background: rgba(255,255,255,0.85); padding: 2px 6px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            ${porcentaje.toFixed(1)}%
                        </span>
                    </div>
                </div>

                <!-- Estado de Alerta -->
                <div style="margin: 8px 0 4px 0;">
                    <span style="font-size: 0.75rem; font-weight: bold; color: ${colorNivel}; background: #f8fafc; padding: 3px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        ${alertaTexto}
                    </span>
                </div>

                <!-- Cantidad Actual Exacta -->
                <div style="margin: 6px 0;">
                    <span style="font-size: 1.15rem; font-weight: bold; color: #0f172a;">
                        ${stockExacto.toFixed(0)} <span style="font-size: 0.85rem; color: #64748b;">Galones</span>
                    </span>
                </div>

                <!-- Pie de tarjeta: ÚNICAMENTE MUESTRA LA CAPACIDAD MÁXIMA -->
                <div style="width: 100%; display: flex; justify-content: center; font-size: 0.8rem; color: #64748b; margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                    <span>Capacidad Total: <b>${tanque.capacidadMax.toLocaleString()} Gal</b></span>
                </div>

            </div>
        `;
        contenedorCards.innerHTML += cardHTML;
    });
}
