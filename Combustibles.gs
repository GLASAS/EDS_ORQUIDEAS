function obtenerDatosDashboard(filtroVentas = 'hoy') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const combHoja = ss.getSheetByName("COMBUSTIBLES");
  const datos = combHoja.getDataRange().getValues();
  const headers = datos.shift();
  
  let combustibles = datos.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  combustibles.forEach(c => {
    c.consumoDiarioEstimado = 100;
    c.diasCobertura = c.StockActual > 0 ? (c.StockActual / c.consumoDiarioEstimado).toFixed(1) : 0;
    
    let dias = Number(c.diasCobertura);
    let capacidadMax = Number(c.CapacidadMaxima) || 5000;
    c.porcentajeLlenado = Math.min(Math.round((Number(c.StockActual) / capacidadMax) * 100), 100);

    // Criterios dinámicos:
    // Menos de 3 días -> BAJO (Rojo)
    // Entre 3 y 6 días -> MEDIO / TRABAJAR 3 DÍAS (Amarillo)
    // Más de 6 días -> FULL (Verde)
    if (dias < 3) {
      c.estadoAlerta = "BAJO";
      c.colorEstado = "red";
    } else if (dias >= 3 && dias <= 6) {
      c.estadoAlerta = "MEDIO (3 DÍAS)";
      c.colorEstado = "yellow";
    } else {
      c.estadoAlerta = "FULL";
      c.colorEstado = "green";
    }
    
    c.cantidadSugerida = Math.max(capacidadMax - Number(c.StockActual), 0);
  });

  let resumenVentas = calcularResumenVentasFiltro(ss, filtroVentas);

  return {
    combustibles: combustibles,
    ventasResumen: resumenVentas
  };
}

function calcularResumenVentasFiltro(ss, filtro) {
  const ventasHoja = ss.getSheetByName("VENTAS");
  const ventas = ventasHoja.getDataRange().getValues();
  ventas.shift();

  let ahora = new Date();
  let inicioFiltro = new Date();

  if (filtro === 'ayer') {
    inicioFiltro.setDate(ahora.getDate() - 1);
    inicioFiltro.setHours(0,0,0,0);
    ahora.setDate(ahora.getDate() - 1);
    ahora.setHours(23,59,59,999);
  } else if (filtro === 'semana') {
    let diaSemana = ahora.getDay();
    let diff = ahora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    inicioFiltro = new Date(ahora.setDate(diff));
    inicioFiltro.setHours(0,0,0,0);
    ahora = new Date();
  } else if (filtro === 'mes') {
    inicioFiltro = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    inicioFiltro.setHours(0,0,0,0);
    ahora = new Date();
  } else {
    // HOY por defecto
    inicioFiltro.setHours(0,0,0,0);
    ahora.setHours(23,59,59,999);
  }

  let totalDinero = 0;
  let totalGalones = 0;
  let conteo = 0;

  ventas.forEach(r => {
    let fechaVenta = new Date(r[1]);
    if (fechaVenta >= inicioFiltro && fechaVenta <= ahora) {
      totalGalones += Number(r[5]);
      totalDinero += Number(r[7]);
      conteo++;
    }
  });

  return {
    dinero: totalDinero,
    galones: totalGalones,
    conteo: conteo,
    filtroAplicado: filtro
  };
}

function registrarMovimientoInventario(combustibleID, tipoMovimiento, cantidad, observaciones, usuario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const combHoja = ss.getSheetByName("COMBUSTIBLES");
  const invHoja = ss.getSheetByName("INVENTARIO_COMBUSTIBLE");
  
  const datos = combHoja.getDataRange().getValues();
  let rowIndex = -1;
  let stockActual = 0;
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === combustibleID) {
      rowIndex = i + 1;
      stockActual = Number(datos[i][7]);
      break;
    }
  }
  
  if (rowIndex === -1) throw new Error("Combustible no encontrado.");
  
  let cantidadNum = Number(cantidad);
  let nuevoStock = stockActual;
  
  if (tipoMovimiento === "ENTRADA") {
    nuevoStock += cantidadNum;
  } else if (tipoMovimiento === "SALIDA") {
    if (stockActual - cantidadNum < 0) {
      throw new Error("Inventario insuficiente para procesar la salida.");
    }
    nuevoStock -= cantidadNum;
  } else if (tipoMovimiento === "AJUSTE") {
    nuevoStock = cantidadNum;
  }

  combHoja.getRange(rowIndex, 8).setValue(nuevoStock);
  
  const idMov = "MOV-" + new Date().getTime();
  invHoja.appendRow([
    idMov,
    new Date(),
    combustibleID,
    tipoMovimiento,
    cantidadNum,
    stockActual,
    nuevoStock,
    "MANUAL",
    usuario || "Administrador",
    observaciones || ""
  ]);

  registrarAuditoria(usuario, "REGISTRAR_MOVIMIENTO", "INVENTARIO_COMBUSTIBLE", combustibleID, stockActual, nuevoStock);
  
  return { success: true, nuevoStock: nuevoStock };
}

function obtenerSurtidores() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const surtHoja = ss.getSheetByName("SURTIDORES");
  const combHoja = ss.getSheetByName("COMBUSTIBLES");
  
  const surts = surtHoja.getDataRange().getValues();
  const surtHeaders = surts.shift();
  
  const combs = combHoja.getDataRange().getValues();
  const combHeaders = combs.shift();
  
  let mapaPrecios = {};
  combs.forEach(r => {
    mapaPrecios[r[0]] = { precioVenta: r[6], nombre: r[1] };
  });

  return surts.map(row => {
    let obj = {};
    surtHeaders.forEach((h, i) => obj[h] = row[i]);
    obj.PrecioVenta = mapaPrecios[obj.CombustibleID] ? mapaPrecios[obj.CombustibleID].precioVenta : 0;
    obj.CombustibleNombre = mapaPrecios[obj.CombustibleID] ? mapaPrecios[obj.CombustibleID].nombre : "";
    return obj;
  });
}

function registrarVentaSurtidor(surtidorID, lecturaFinal, medioPago, usuario, observaciones) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const surtHoja = ss.getSheetByName("SURTIDORES");
  const ventasHoja = ss.getSheetByName("VENTAS");
  const lecturasHoja = ss.getSheetByName("LECTURAS_SURTIDORES");
  
  const surts = surtHoja.getDataRange().getValues();
  let surtRowIndex = -1;
  let surtData = null;
  
  for (let i = 1; i < surts.length; i++) {
    if (surts[i][0] === surtidorID) {
      surtRowIndex = i + 1;
      surtData = {
        id: surts[i][0],
        islaID: surts[i][1],
        nombre: surts[i][2],
        combustibleID: surts[i][3],
        lecturaActual: Number(surts[i][5])
      };
      break;
    }
  }
  
  if (!surtData) throw new Error("Surtidor no encontrado.");
  
  let finalNum = Number(lecturaFinal);
  if (finalNum < surtData.lecturaActual) {
    throw new Error("La lectura final no puede ser menor a la lectura actual del contador (" + surtData.lecturaActual + ").");
  }
  
  let cantidadGalones = finalNum - surtData.lecturaActual;
  if (cantidadGalones <= 0) {
    throw new Error("La cantidad vendida debe ser mayor a cero.");
  }

  const combHoja = ss.getSheetByName("COMBUSTIBLES");
  const combs = combHoja.getDataRange().getValues();
  let precioVenta = 0;
  for (let i = 1; i < combs.length; i++) {
    if (combs[i][0] === surtData.combustibleID) {
      precioVenta = Number(combs[i][6]);
      break;
    }
  }

  let totalVenta = cantidadGalones * precioVenta;
  let fechaHora = new Date();

  registrarMovimientoInventario(surtData.combustibleID, "SALIDA", cantidadGalones, `Venta Surtidor ${surtData.nombre}`, usuario);
  surtHoja.getRange(surtRowIndex, 6).setValue(finalNum);

  lecturasHoja.appendRow([
    "LECT-" + fechaHora.getTime(),
    fechaHora,
    surtidorID,
    surtData.lecturaActual,
    finalNum,
    cantidadGalones,
    usuario
  ]);

  ventasHoja.appendRow([
    "VENTA-" + fechaHora.getTime(),
    fechaHora,
    surtData.islaID,
    surtidorID,
    surtData.combustibleID,
    cantidadGalones,
    precioVenta,
    totalVenta,
    medioPago,
    usuario,
    observaciones || ""
  ]);

  registrarAuditoria(usuario, "REGISTRAR_VENTA", "VENTAS", surtidorID, surtData.lecturaActual, finalNum);

  return { success: true, cantidadGalones: cantidadGalones, totalVenta: totalVenta };
}
