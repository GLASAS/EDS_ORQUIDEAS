function abrirCaja(baseInicial, usuario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cajaHoja = ss.getSheetByName("CAJA");
  
  const datos = cajaHoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][12] === "ABIERTA") {
      throw new Error("Ya existe una caja abierta actualmente.");
    }
  }

  const cajaID = "CAJA-" + new Date().getTime();
  cajaHoja.appendRow([
    cajaID,
    new Date(),
    "",
    Number(baseInicial),
    0, 0, 0, 0, 0, 0, 0, 0,
    "ABIERTA",
    usuario || "Administrador"
  ]);

  registrarAuditoria(usuario, "ABRIR_CAJA", "CAJA", cajaID, 0, baseInicial);

  return { success: true, cajaID: cajaID };
}

function obtenerEstadoCaja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cajaHoja = ss.getSheetByName("CAJA");
  const datos = cajaHoja.getDataRange().getValues();
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][12] === "ABIERTA") {
      return {
        id: datos[i][0],
        fechaApertura: datos[i][1],
        baseInicial: datos[i][3],
        estado: "ABIERTA"
      };
    }
  }
  return { estado: "CERRADA" };
}

function registrarGasto(categoria, descripcion, valor, formaPago, responsable, soporte, observaciones, usuario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gastosHoja = ss.getSheetByName("GASTOS");
  
  const gastoID = "GASTO-" + new Date().getTime();
  gastosHoja.appendRow([
    gastoID,
    new Date(),
    categoria,
    descripcion,
    Number(valor),
    formaPago,
    responsable,
    soporte || "N/A",
    observaciones || "",
    usuario || "Administrador"
  ]);

  registrarAuditoria(usuario, "REGISTRAR_GASTO", "GASTOS", gastoID, 0, valor);

  return { success: true, gastoID: gastoID };
}

function cerrarCaja(totalReal, usuario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cajaHoja = ss.getSheetByName("CAJA");
  const ventasHoja = ss.getSheetByName("VENTAS");
  const gastosHoja = ss.getSheetByName("GASTOS");
  
  const datosCaja = cajaHoja.getDataRange().getValues();
  let rowIndex = -1;
  let cajaAbierta = null;
  
  for (let i = 1; i < datosCaja.length; i++) {
    if (datosCaja[i][12] === "ABIERTA") {
      rowIndex = i + 1;
      cajaAbierta = {
        id: datosCaja[i][0],
        fechaApertura: new Date(datosCaja[i][1]),
        baseInicial: Number(datosCaja[i][3])
      };
      break;
    }
  }

  if (!cajaAbierta) throw new Error("No hay ninguna caja abierta para cerrar.");

  let ventasEfectivo = 0;
  let ventasTarjetas = 0;
  let ventasTransferencias = 0;

  const ventas = ventasHoja.getDataRange().getValues();
  for (let i = 1; i < ventas.length; i++) {
    let fechaVenta = new Date(ventas[i][1]);
    if (fechaVenta >= cajaAbierta.fechaApertura) {
      let total = Number(ventas[i][7]);
      let medio = ventas[i][8];
      if (medio === "Efectivo") ventasEfectivo += total;
      else if (medio === "Tarjeta") ventasTarjetas += total;
      else if (medio === "Transferencia") ventasTransferencias += total;
    }
  }

  let totalGastos = 0;
  const gastos = gastosHoja.getDataRange().getValues();
  for (let i = 1; i < gastos.length; i++) {
    let fechaGasto = new Date(gastos[i][1]);
    if (fechaGasto >= cajaAbierta.fechaApertura) {
      if (gastos[i][5] === "Efectivo") {
        totalGastos += Number(gastos[i][4]);
      }
    }
  }

  let totalEsperado = cajaAbierta.baseInicial + ventasEfectivo - totalGastos;
  let realNum = Number(totalReal);
  let diferencia = realNum - totalEsperado;

  cajaHoja.getRange(rowIndex, 3).setValue(new Date());
  cajaHoja.getRange(rowIndex, 5).setValue(ventasEfectivo);
  cajaHoja.getRange(rowIndex, 6).setValue(ventasTarjetas);
  cajaHoja.getRange(rowIndex, 7).setValue(ventasTransferencias);
  cajaHoja.getRange(rowIndex, 8).setValue(totalGastos);
  cajaHoja.getRange(rowIndex, 10).setValue(totalEsperado);
  cajaHoja.getRange(rowIndex, 11).setValue(realNum);
  cajaHoja.getRange(rowIndex, 12).setValue(diferencia);
  cajaHoja.getRange(rowIndex, 13).setValue("CERRADA");

  registrarAuditoria(usuario, "CERRAR_CAJA", "CAJA", cajaAbierta.id, totalEsperado, realNum);

  return { success: true, totalEsperado: totalEsperado, diferencia: diferencia };
}

function obtenerClientes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const clienteHoja = ss.getSheetByName("CLIENTES");
  const datos = clienteHoja.getDataRange().getValues();
  const headers = datos.shift();
  
  return datos.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
