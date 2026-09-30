:root {
    --primary: #1e293b;
    --accent: #2563eb;
    --bg-color: #f8fafc;
    --card-bg: #ffffff;
    --text-main: #334155;
    --green: #10b981;
    --yellow: #f59e0b;
    --red: #ef4444;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
body { background-color: var(--bg-color); color: var(--text-main); }

.app-container { display: flex; height: 100vh; overflow: hidden; }

/* Sidebar */
.sidebar { width: 260px; background-color: var(--primary); color: white; display: flex; flex-direction: column; justify-content: space-between; }
.sidebar-header h2 { padding: 20px; font-size: 1.25rem; border-bottom: 1px solid #334155; }
.sidebar nav { padding: 15px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; flex: 1; }
.sidebar nav a { color: #94a3b8; text-decoration: none; padding: 10px 15px; border-radius: 8px; transition: 0.2s; font-size: 0.9rem; }
.sidebar nav a:hover, .sidebar nav a.active { background-color: var(--accent); color: white; }

.sidebar-footer { padding: 15px; border-top: 1px solid #334155; text-align: center; font-size: 0.75rem; color: #94a3b8; }
.compat-info { margin-top: 4px; font-size: 0.65rem; color: #64748b; }

/* Main */
.main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
.topbar { background: var(--card-bg); padding: 15px 30px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.topbar h1 { font-size: 1.3rem; color: var(--primary); }

.seccion { display: none; padding: 30px; }
.seccion.active { display: block; }

/* Cards Grid */
.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
.card { background: var(--card-bg); border-radius: 12px; padding: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 6px solid #cbd5e1; }
.card.green { border-top-color: var(--green); }
.card.yellow { border-top-color: var(--yellow); }
.card.red { border-top-color: var(--red); }

.card h3 { font-size: 1.2rem; margin-bottom: 15px; color: var(--primary); display: flex; justify-content: space-between; align-items: center; }
.badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; color: white; font-weight: bold; text-transform: uppercase; }
.badge.green { background: var(--green); }
.badge.yellow { background: var(--yellow); }
.badge.red { background: var(--red); }

.card-body p { margin: 8px 0; font-size: 0.95rem; display: flex; justify-content: space-between; }
.card-body p span { font-weight: 600; }

/* Forms & Info Box */
.form-card { max-width: 600px; margin: 0 auto; border-top-color: var(--accent); }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
.form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
.form-info-box { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid var(--accent); }
.form-info-box p { font-size: 0.9rem; margin: 5px 0; color: var(--primary); display: flex; justify-content: space-between; }
.form-info-box span { font-weight: bold; }

.btn-primary { background: var(--accent); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-size: 1rem; cursor: pointer; width: 100%; font-weight: 600; }
.btn-primary:hover { opacity: 0.9; }

/* Tablas de Datos */
.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem; text-align: left; }
.data-table th, .data-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f1f5f9; color: var(--primary); font-weight: 600; }
.data-table tr:hover { background-color: #f8fafc; }

/* Estilos Login Overlay */
.login-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(15, 23, 42, 0.85); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.login-card { background: white; padding: 40px; border-radius: 12px; width: 100%; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; }
.login-card h2 { color: var(--primary); margin-bottom: 10px; font-size: 1.5rem; }
.login-card p { color: var(--text-main); font-size: 0.9rem; margin-bottom: 20px; }
.login-footer { margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b; }

/* Notificaciones Toast Profesionales */
#toast-container { position: fixed; top: 20px; right: 20px; z-index: 100000; display: flex; flex-direction: column; gap: 10px; max-width: 380px; }
.toast { background: white; padding: 16px 20px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; border-left: 5px solid var(--accent); animation: slideIn 0.3s ease; font-size: 0.9rem; color: var(--primary); }
.toast.success { border-left-color: var(--green); }
.toast.error { border-left-color: var(--red); }
.toast.warning { border-left-color: var(--yellow); }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* Estilos para Tanques / Cilindros de Combustible Dinámicos */
.tanque-card { display: flex; flex-direction: column; gap: 15px; }
.tanque-visual-container { display: flex; align-items: center; gap: 20px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
.cilindro-tanque { width: 50px; height: 120px; background: #e2e8f0; border-radius: 8px; position: relative; overflow: hidden; border: 2px solid #cbd5e1; display: flex; align-items: flex-end; }
.cilindro-liquido { width: 100%; border-radius: 0 0 6px 6px; transition: height 0.6s ease; }
.cilindro-liquido.green { background-color: var(--green); }
.cilindro-liquido.yellow { background-color: var(--yellow); }
.cilindro-liquido.red { background-color: var(--red); }

.filtro-ventas-bar { display: flex; gap: 10px; margin-bottom: 20px; background: white; padding: 12px 20px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); align-items: center; flex-wrap: wrap; }
.btn-filtro { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--primary); transition: 0.2s; }
.btn-filtro.active, .btn-filtro:hover { background: var(--accent); color: white; border-color: var(--accent); }

@media (max-width: 768px) {
    .app-container { flex-direction: column; height: auto; }
    .sidebar { width: 100%; height: auto; }
    .sidebar nav { flex-direction: row; overflow-x: auto; padding: 10px; }
    .sidebar h2 { display: none; }
    .main-content { height: auto; overflow: visible; }
}
