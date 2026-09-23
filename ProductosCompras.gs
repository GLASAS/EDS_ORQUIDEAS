function obtenerProductos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prodHoja = ss.getSheetByName("PRODUCTOS");
  const datos = prodHoja.getDataRange().getValues();
  const headers = datos.shift();
  
  return datos.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function registrarMovimientoProducto(productoID, tipoMovimiento, cantidad, observaciones, usuario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prodHoja = ss.getSheetByName("PRODUCTOS");
  const movHoja = ss.getSheetByName("MOVIMIENTOS_PRODUCTOS");
  
  const datos = prodHoja.getDataRange().getValues();
  let rowIndex = -1;
  let stockActual = 0;
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === productoID) {
      rowIndex = i + 1;
      stockActual = Number(datos[i][9]);
      break;
    }
  }
  
  if (rowIndex === -1) throw new Error("Producto no encontrado.");
  
  let cantidadNum = Number(cantidad);
  let nuevoStock = stockActual;
  
  if (tipoMovimiento === "ENTRADA" || tipoMovimiento === "COMPRA") {
    nuevoStock += cantidadNum;
  } else if (tipoMovimiento === "SALIDA" || tipoMovimiento === "VENTA") {
    if (stockActual - cantidadNum < 0) {
      throw new Error("Stock insuficiente para procesar la salida del producto.");
    }
    nuevoStock -= cantidadNum;
  } else if (tipoMovimiento === "AJUSTE") {
    nuevoStock = cantidadNum;
  }

  prodHoja.getRange(rowIndex, 10).setValue(nuevoStock);
  
  const idMov = "MOV-PROD-" + new Date().getTime();
  movHoja.appendRow([
    idMov,
    new Date(),
    productoID,
    tipoMovimiento,
    cantidadNum,
    stockActual,
    nuevoStock,
    "MANUAL",
    usuario || "Administrador",
    observaciones || ""
  ]);

  registrarAuditoria(usuario, "REGISTRAR_MOV_PRODUCTO", "PRODUCTOS", productoID, stockActual, nuevoStock);
  
  return { success: true, nuevoStock: nuevoStock };
}

function registrarOrdenCompra(proveedorID, fechaEsperada, items, usuario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const comprasHoja = ss.getSheetByName("COMPRAS");
  const detalleHoja = ss.getSheetByName("DETALLE_COMPRAS");
  
  const compraID = "COMPRA-" + new Date().getTime();
  let totalCompra = 0;
  
  items.forEach(item => {
    totalCompra += Number(item.cantidad) * Number(item.precioUnitario);
  });

  comprasHoja.appendRow([
    compraID,
    new Date(),
    fechaEsperada,
    proveedorID,
    "Recibido",
    totalCompra,
    usuario || "Administrador"
  ]);

  items.forEach(item => {
    const detalleID = "DET-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
    const subtotal = Number(item.cantidad) * Number(item.precioUnitario);
    
    detalleHoja.appendRow([
      detalleID,
      compraID,
      item.tipoItem,
      item.itemID,
      item.cantidad,
      item.precioUnitario,
      subtotal
    ]);

    if (item.tipoItem === "COMBUSTIBLE") {
      registrarMovimientoInventario(item.itemID, "ENTRADA", item.cantidad, `Compra Orden ${compraID}`, usuario);
    } else if (item.tipoItem === "PRODUCTO") {
      registrarMovimientoProducto(item.itemID, "COMPRA", item.cantidad, `Compra Orden ${compraID}`, usuario);
    }
  });

  registrarAuditoria(usuario, "REGISTRAR_COMPRA", "COMPRAS", compraID, 0, totalCompra);

  return { success: true, compraID: compraID, total: totalCompra };
}

function obtenerProveedores() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const provHoja = ss.getSheetByName("PROVEEDORES");
  const datos = provHoja.getDataRange().getValues();
  const headers = datos.shift();
  
  return datos.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
