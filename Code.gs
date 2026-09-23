function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
         .setTitle('Gestión Estación de Servicio')
         .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function incluir(archivo) {
  return HtmlService.createHtmlOutputFromFile(archivo).getContent();
}

function verificarUsuario(cedula, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("USUARIOS");
  const datos = hoja.getDataRange().getValues();
  const headers = datos.shift();
  
  let idxID = headers.indexOf("ID");
  let idxNombre = headers.indexOf("Nombre");
  let idxCedula = headers.indexOf("Cedula");
  let idxPass = headers.indexOf("Password");
  let idxRol = headers.indexOf("Rol");
  let idxEstado = headers.indexOf("Estado");
  
  for (let i = 0; i < datos.length; i++) {
    let row = datos[i];
    let cedulaDB = row[idxCedula] !== undefined ? row[idxCedula].toString().trim() : "";
    let passDB = row[idxPass] !== undefined ? row[idxPass].toString().trim() : "";
    
    if (cedulaDB === cedula.toString().trim()) {
      if (passDB === password.toString().trim()) {
        let estadoDB = row[idxEstado] ? row[idxEstado].toString().trim() : "Activo";
        if (estadoDB === "Activo") {
          return {
            success: true,
            id: row[idxID],
            nombre: row[idxNombre],
            cedula: cedulaDB,
            rol: row[idxRol]
          };
        } else {
          throw new Error("El usuario se encuentra inactivo.");
        }
      } else {
        throw new Error("Contraseña incorrecta.");
      }
    }
  }
  throw new Error("Número de cédula no registrado en el sistema.");
}

function cambiarPasswordConValidacion(cedula, fechaExpedicionInput, nuevaPassword) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("USUARIOS");
  const datos = hoja.getDataRange().getValues();
  const headers = datos.shift();
  
  let idxCedula = headers.indexOf("Cedula");
  let idxPass = headers.indexOf("Password");
  let idxFechaExp = headers.indexOf("FechaExpedicionCedula");
  let idxID = headers.indexOf("ID");
  
  for (let i = 0; i < datos.length; i++) {
    let row = datos[i];
    let cedulaDB = row[idxCedula] !== undefined ? row[idxCedula].toString().trim() : "";
    
    if (cedulaDB === cedula.toString().trim()) {
      let fechaDBRaw = row[idxFechaExp];
      let fechaDBStr = "";
      
      if (fechaDBRaw instanceof Date) {
        let yy = fechaDBRaw.getFullYear();
        let mm = String(fechaDBRaw.getMonth() + 1).padStart(2, '0');
        let dd = String(fechaDBRaw.getDate()).padStart(2, '0');
        fechaDBStr = `${yy}-${mm}-${dd}`;
      } else if (fechaDBRaw) {
        fechaDBStr = fechaDBRaw.toString().trim();
      }
      
      if (!fechaDBStr && idxFechaExp !== -1) {
        hoja.getRange(i + 2, idxFechaExp + 1).setValue(fechaExpedicionInput);
        fechaDBStr = fechaExpedicionInput;
      }

      if (fechaDBStr === fechaExpedicionInput.toString().trim()) {
        hoja.getRange(i + 2, idxPass + 1).setValue(nuevaPassword);
        registrarAuditoria("Sistema", "CAMBIAR_PASSWORD", "USUARIOS", row[idxID], "", "Actualización de contraseña");
        return { success: true, mensaje: "Contraseña actualizada exitosamente." };
      } else {
        throw new Error("La fecha de expedición de la cédula no coincide.");
      }
    }
  }
  throw new Error("Número de cédula no encontrado en el sistema.");
}

function registrarUsuario(nombre, cedula, password, rol, fechaExpedicion, usuarioAdmin) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("USUARIOS");
  const datos = hoja.getDataRange().getValues();
  const headers = datos[0];
  
  let idxCedula = headers.indexOf("Cedula");
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][idxCedula].toString().trim() === cedula.toString().trim()) {
      throw new Error("Ya existe un usuario registrado con este número de cédula.");
    }
  }

  const idUsuario = "USR-" + datos.length;
  hoja.appendRow([
    idUsuario,
    nombre,
    cedula,
    password,
    rol,
    "Activo",
    fechaExpedicion
  ]);

  registrarAuditoria(usuarioAdmin, "REGISTRAR_USUARIO", "USUARIOS", idUsuario, 0, nombre);

  return { success: true, mensaje: "Usuario registrado con éxito." };
}

function obtenerListaUsuarios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("USUARIOS");
  const datos = hoja.getDataRange().getValues();
  const headers = datos.shift();
  
  let idxID = headers.indexOf("ID");
  let idxNombre = headers.indexOf("Nombre");
  let idxCedula = headers.indexOf("Cedula");
  let idxRol = headers.indexOf("Rol");
  let idxEstado = headers.indexOf("Estado");
  
  return datos.map(row => {
    return {
      id: row[idxID],
      nombre: row[idxNombre],
      cedula: row[idxCedula],
      rol: row[idxRol],
      estado: row[idxEstado]
    };
  });
}

function inicializarSistema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const estructuras = {
    "CONFIG": ["Clave", "Valor", "Descripcion"],
    "COMBUSTIBLES": ["ID", "Nombre", "Codigo", "Tipo", "Unidad", "PrecioCompra", "PrecioVenta", "StockActual", "StockMinimo", "StockSeguridad", "CapacidadMaxima", "DiasEntrega", "Proveedor", "Estado"],
    "TANQUES": ["ID", "Nombre", "CombustibleID", "CapacidadMaxima", "StockActual", "Estado"],
    "INVENTARIO_COMBUSTIBLE": ["ID", "FechaHora", "CombustibleID", "TipoMovimiento", "Cantidad", "StockAnterior", "StockNuevo", "DocumentoReferencia", "Usuario", "Observaciones"],
    "ALERTAS": ["ID", "FechaHora", "CombustibleID", "Nivel", "Mensaje", "Estado"],
    "ISLAS": ["ID", "Nombre", "Ubicacion", "Estado"],
    "SURTIDORES": ["ID", "IslaID", "Nombre", "CombustibleID", "Estado", "LecturaActual"],
    "LECTURAS_SURTIDORES": ["ID", "FechaHora", "SurtidorID", "LecturaAnterior", "LecturaFinal", "CantidadGalones", "Usuario"],
    "VENTAS": ["ID", "FechaHora", "IslaID", "SurtidorID", "CombustibleID", "Cantidad", "PrecioUnitario", "Total", "MedioPago", "Usuario", "Observaciones"],
    "PRODUCTOS": ["ID", "Codigo", "CodigoBarras", "Nombre", "Categoria", "Marca", "Unidad", "PrecioCompra", "PrecioVenta", "Stock", "StockMinimo", "Proveedor", "Ubicacion", "Estado"],
    "MOVIMIENTOS_PRODUCTOS": ["ID", "FechaHora", "ProductoID", "TipoMovimiento", "Cantidad", "StockAnterior", "StockNuevo", "DocumentoReferencia", "Usuario", "Observaciones"],
    "PROVEEDORES": ["ID", "Nombre", "NIT", "Contacto", "Telefono", "Email", "Direccion", "Productos", "TiempoEntrega", "CondicionesPago", "Estado"],
    "COMPRAS": ["ID", "FechaPedido", "FechaEsperada", "ProveedorID", "Estado", "Total", "Usuario"],
    "DETALLE_COMPRAS": ["ID", "CompraID", "TipoItem", "ItemID", "Cantidad", "PrecioUnitario", "Subtotal"],
    "CAJA": ["ID", "FechaApertura", "FechaCierre", "BaseInicial", "VentasEfectivo", "VentasTarjetas", "VentasTransferencias", "TotalGastos", "Retiros", "TotalEsperado", "TotalReal", "Diferencia", "Estado", "Usuario"],
    "GASTOS": ["ID", "FechaHora", "Categoria", "Descripcion", "Valor", "FormaPago", "Responsable", "Soporte", "Observaciones", "Usuario"],
    "CLIENTES": ["ID", "Nombre", "NIT_CC", "Telefono", "Email", "Direccion", "TipoCliente", "Estado"],
    "USUARIOS": ["ID", "Nombre", "Cedula", "Password", "Rol", "Estado", "FechaExpedicionCedula"],
    "AUDITORIA": ["ID", "FechaHora", "Usuario", "Accion", "Modulo", "RegistroAfectado", "ValorAnterior", "ValorNuevo"]
  };

  for (let nombre in estructuras) {
    let hoja = ss.getSheetByName(nombre);
    if (!hoja) {
      hoja = ss.insertSheet(nombre);
      hoja.appendRow(estructuras[nombre]);
    }
  }

  let userHoja = ss.getSheetByName("USUARIOS");
  if (userHoja.getLastRow() <= 1) {
    userHoja.appendRow(["USR-01", "Carlos Corredor Zapata", "79123456", "admin123", "Administrador", "Activo", "1999-10-04"]);
  }

  return "Sistema inicializado correctamente.";
}
