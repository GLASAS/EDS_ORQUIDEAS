function registrarAuditoria(usuario, accion, modulo, registro, anterior, nuevo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const audHoja = ss.getSheetByName("AUDITORIA");
  if (audHoja) {
    audHoja.appendRow([
      "AUD-" + new Date().getTime(),
      new Date(),
      usuario || "Sistema",
      accion,
      modulo,
      registro,
      anterior || "",
      nuevo || ""
    ]);
  }
}

function obtenerReporteResumen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const ventasHoja = ss.getSheetByName("VENTAS");
  const ventas = ventasHoja.getDataRange().getValues();
  ventas.shift();
  let totalVentasDinero = 0;
  let totalGalonesVendidos = 0;
  ventas.forEach(r => {
    totalGalonesVendidos += Number(r[5]);
    totalVentasDinero += Number(r[7]);
  });

  const gastosHoja = ss.getSheetByName("GASTOS");
  const gastos = gastosHoja.getDataRange().getValues();
  gastos.shift();
  let totalGastosDinero = 0;
  gastos.forEach(r => {
    totalGastosDinero += Number(r[4]);
  });

  const comprasHoja = ss.getSheetByName("COMPRAS");
  const compras = comprasHoja.getDataRange().getValues();
  compras.shift();
  let totalComprasDinero = 0;
  compras.forEach(r => {
    totalComprasDinero += Number(r[5]);
  });

  return {
    totalVentasDinero: totalVentasDinero,
    totalGalonesVendidos: totalGalonesVendidos,
    totalGastosDinero: totalGastosDinero,
    totalComprasDinero: totalComprasDinero,
    conteoVentas: ventas.length,
    conteoGastos: gastos.length
  };
}

function obtenerAlertasSistema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const combHoja = ss.getSheetByName("COMBUSTIBLES");
  const datos = combHoja.getDataRange().getValues();
  datos.shift();
  
  let alertas = [];
  datos.forEach(r => {
    let stock = Number(r[7]);
    let min = Number(r[8]);
    let seg = Number(r[9]);
    let nombre = r[1];
    
    if (stock <= (min + seg)) {
      alertas.push({
        nivel: "URGENTE",
        mensaje: `El combustible ${nombre} tiene un stock actual de ${stock} galones, alcanzando el nivel de alerta por debajo del mínimo/seguridad.`
      });
    } else {
      alertas.push({
        nivel: "NORMAL",
        mensaje: `El combustible ${nombre} se encuentra en niveles normales (${stock} galones).`
      });
    }
  });

  return alertas;
}
