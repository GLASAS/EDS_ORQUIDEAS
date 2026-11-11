// ==========================================
// MÓDULO: COMPRAS Y ABASTECIMIENTO
// ==========================================

function inicializarModuloCompras(proveedores, productos) {
    // 1. Poblar Proveedores
    const selectProv = document.getElementById('compra-proveedor');
    if (selectProv) {
        selectProv.innerHTML = '<option value="">Seleccione un proveedor...</option>';
        if (proveedores && proveedores.length > 1) {
            for (let i = 1; i < proveedores.length; i++) {
                const nombreProv = proveedores[i][0] || proveedores[i][1];
                if (nombreProv) {
                    selectProv.innerHTML += `<option value="${nombreProv}">${nombreProv}</option>`;
                }
            }
        }
    }

    // 2. Poblar Ítems iniciales (Combustibles por defecto)
    actualizarItemsCompraSelect(productos);
}

function actualizarItemsCompraSelect(productosCache) {
    const tipoItem = document.getElementById('compra-tipo-item').value;
    const selectItem = document.getElementById('compra-item');
    if (!selectItem) return;

    selectItem.innerHTML = '';

    if (tipoItem === 'COMBUSTIBLE') {
        selectItem.innerHTML = `
            <option value="C001">ACPM (C001)</option>
            <option value="C002">Gasolina Corriente (C002)</option>
        `;
    } else if (tipoItem === 'PRODUCTO') {
        if (productosCache && productosCache.length > 1) {
            for (let i = 1; i < productosCache.length; i++) {
                const cod = productosCache[i][0];
                const nombre = productosCache[i][1];
                if (cod && nombre) {
                    selectItem.innerHTML += `<option value="${cod}">${nombre} (${cod})</option>`;
                }
            }
        } else {
            selectItem.innerHTML = `<option value="">No hay productos registrados en tienda</option>`;
        }
    }
}

function handleCompra(event) {
    event.preventDefault();

    const proveedor = document.getElementById('compra-proveedor').value;
    const tipoItem = document.getElementById('compra-tipo-item').value;
    const itemID = document.getElementById('compra-item').value;
    const cantidad = parseFloat(document.getElementById('compra-cantidad').value);
    const precio = parseFloat(document.getElementById('compra-precio').value);
    const fechaLlegada = document.getElementById('compra-fecha').value;

    const datosCompra = {
        proveedor,
        tipoItem,
        itemID,
        cantidad,
        precio,
        fechaLlegada,
        usuario: (typeof usuarioLogueado !== 'undefined' ? usuarioLogueado : "Carlos Corredor Zapata")
    };

    if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(true);

    const urlDestino = typeof URL_WEB_APP !== 'undefined' ? URL_WEB_APP : (window.URL_WEB_APP || "");

    fetch(urlDestino, {
        method: "POST",
        body: JSON.stringify({
            accion: "registrarCompra",
            datosCompra: datosCompra
        })
    })
    .then(response => response.json())
    .then(res => {
        if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(false);
        if (res.success) {
            alert("¡Orden de compra registrada y stock actualizado con éxito!");
            document.getElementById('form-compra').reset();
            if (typeof sincronizarDatosGlobales === 'function') {
                sincronizarDatosGlobales();
            }
        } else {
            alert("Error al registrar la compra: " + res.message);
        }
    })
    .catch(err => {
        if (typeof mostrarIndicadorCarga === 'function') mostrarIndicadorCarga(false);
        console.error("Error:", err);
        alert("Error de conexión al intentar guardar la compra.");
    });
}
