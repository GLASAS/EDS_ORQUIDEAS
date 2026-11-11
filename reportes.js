// ==========================================
// MÓDULO: REPORTES Y ALERTAS
// ==========================================

function exportarReportePDF() {
    window.print();
}

function exportarVentasExcelDirecto() {
    google.script.run
        .withSuccessHandler(url => {
            if (url) window.open(url, '_blank');
            else alert("Generando enlace de descarga...");
        })
        .exportarVentasExcelBackend();
}
