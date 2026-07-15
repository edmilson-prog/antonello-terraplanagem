/* @ds-bundle: {"format":4,"namespace":"AntonelloTerraplanagemDesignSystem_2ede57","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Pill","sourcePath":"components/core/Pill.jsx"},{"name":"StatusChip","sourcePath":"components/core/StatusChip.jsx"},{"name":"DataRow","sourcePath":"components/data/DataRow.jsx"},{"name":"KpiCard","sourcePath":"components/data/KpiCard.jsx"},{"name":"Note","sourcePath":"components/data/Note.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"},{"name":"IconNames","sourcePath":"components/icons/Icon.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"Avatar","sourcePath":"components/surfaces/Avatar.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Hazard","sourcePath":"components/surfaces/Hazard.jsx"},{"name":"IconTile","sourcePath":"components/surfaces/IconTile.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"a5e7da471af7","components/core/Button.jsx":"037b0d1a703f","components/core/Chip.jsx":"beeed09e4cfd","components/core/IconButton.jsx":"d1f1476f8dbe","components/core/Pill.jsx":"81021ada919b","components/core/StatusChip.jsx":"512b17ad0b1c","components/data/DataRow.jsx":"00c8690752a0","components/data/KpiCard.jsx":"93ffd91a8634","components/data/Note.jsx":"52ea755ab545","components/data/Sparkline.jsx":"3b91b26e269a","components/icons/Icon.jsx":"3d33698510e7","components/navigation/NavItem.jsx":"3d0899967812","components/surfaces/Avatar.jsx":"e1b88f11ca97","components/surfaces/Card.jsx":"ac9d7c4a1126","components/surfaces/Hazard.jsx":"c2cb268c51b8","components/surfaces/IconTile.jsx":"72e5556812c5","ui_kits/app-campo/CampoApp.jsx":"b198550d6ad7","ui_kits/app-campo/android-frame.jsx":"24dd1a192853","ui_kits/app-campo/image-slot.js":"0394ad34f685","ui_kits/retaguarda/App.jsx":"991523938737","ui_kits/retaguarda/ClienteDetail.jsx":"95497d41858c","ui_kits/retaguarda/ClientesList.jsx":"1bb94f0729a3","ui_kits/retaguarda/ComprovantesList.jsx":"ff8a422784ab","ui_kits/retaguarda/CustoHora.jsx":"3f74ea86ed8b","ui_kits/retaguarda/Dashboard.jsx":"4f24f12dabc6","ui_kits/retaguarda/DashboardOperacional.jsx":"2b4aa50acddd","ui_kits/retaguarda/Diesel.jsx":"402014a41040","ui_kits/retaguarda/EquipamentosList.jsx":"dac96810a91a","ui_kits/retaguarda/Faturamento.jsx":"f87eafc44e47","ui_kits/retaguarda/Financeiro.jsx":"b625830848ed","ui_kits/retaguarda/Header.jsx":"a11c968349cd","ui_kits/retaguarda/Login.jsx":"518b4673b6c4","ui_kits/retaguarda/LoginV2.jsx":"b2e74e83c737","ui_kits/retaguarda/Manutencao.jsx":"c90b8be46a7d","ui_kits/retaguarda/NovaManutencao.jsx":"717a76ce282b","ui_kits/retaguarda/NovaNF.jsx":"055ff5672665","ui_kits/retaguarda/NovaOS.jsx":"92cee61c12c8","ui_kits/retaguarda/NovoAbastecimento.jsx":"efd2793ca9a7","ui_kits/retaguarda/NovoCliente.jsx":"a5ccd5bfc1ae","ui_kits/retaguarda/NovoCusto.jsx":"7c2d23ba2fe2","ui_kits/retaguarda/NovoEquipamento.jsx":"8ef46a1e25e1","ui_kits/retaguarda/NovoOperador.jsx":"2405aa393d9a","ui_kits/retaguarda/NovoOrcamento.jsx":"1ecb6b8aae0c","ui_kits/retaguarda/NovoPagamento.jsx":"a4dde36390ed","ui_kits/retaguarda/OSDetail.jsx":"4aa9b972ebec","ui_kits/retaguarda/OSList.jsx":"729f6da9f23f","ui_kits/retaguarda/OperadorDetail.jsx":"bab24c687a77","ui_kits/retaguarda/OperadoresList.jsx":"1cb73c3c993a","ui_kits/retaguarda/OrcamentoDetail.jsx":"39f558c0bcb1","ui_kits/retaguarda/OrcamentosList.jsx":"26cbcb5a0194","ui_kits/retaguarda/PainelGerencial.jsx":"e43baa1cc86e","ui_kits/retaguarda/Parametros.jsx":"88efbc63b929","ui_kits/retaguarda/Placeholder.jsx":"234c01f11f2c","ui_kits/retaguarda/PrecosList.jsx":"8d9fa51dfe15","ui_kits/retaguarda/Rentabilidade.jsx":"27b9f45c4740","ui_kits/retaguarda/Sidebar.jsx":"c8d5b12e62d0","ui_kits/retaguarda/Sobre.jsx":"f3b20205fc03","ui_kits/retaguarda/data.js":"58bfabfe1b8b","ui_kits/site/image-slot.js":"0394ad34f685"},"inlinedExternals":[],"unexposedExports":[{"name":"iconNames","sourcePath":"components/icons/Icon.jsx"}]} */

(() => {

const __ds_ns = (window.AntonelloTerraplanagemDesignSystem_2ede57 = window.AntonelloTerraplanagemDesignSystem_2ede57 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Pill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Pill — a small monospace count/label bubble (nav counts, card-header tallies).
 */
function Pill({
  children,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['atp-pill', className].filter(Boolean).join(' ')
  }, rest), children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Pill.jsx", error: String((e && e.message) || e) }); }

// components/data/Sparkline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Sparkline — tiny inline trend polyline (as used in the corner of KPI tiles).
 * `points` is an array of numbers (y-values, higher = up) or [x,y] pairs.
 */
function Sparkline({
  points = [],
  width = 60,
  height = 24,
  stroke = 'var(--amarelo)',
  strokeWidth = 2,
  className = '',
  style,
  ...rest
}) {
  const vals = points.map(p => Array.isArray(p) ? p : [null, p]);
  const ys = vals.map(v => v[1]);
  const min = Math.min(...ys),
    max = Math.max(...ys),
    range = max - min || 1;
  const n = vals.length;
  const pad = 2;
  const d = vals.map((v, i) => {
    const x = v[0] != null ? v[0] : n > 1 ? i / (n - 1) * width : 0;
    const y = pad + (1 - (v[1] - min) / range) * (height - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return /*#__PURE__*/React.createElement("svg", _extends({
    className: ['atp-spark', className].filter(Boolean).join(' '),
    viewBox: `0 0 ${width} ${height}`,
    width: width,
    height: height,
    fill: "none",
    style: style,
    "aria-hidden": "true"
  }, rest), /*#__PURE__*/React.createElement("polyline", {
    points: d,
    stroke: stroke,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/icons/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ============================================================
   Icon — Antonello Terraplanagem
   The product draws its icons from Lucide (https://lucide.dev), 24×24,
   1.5px grid, round caps/joins, rendered at stroke-width ~1.9 in-app.
   This map contains the exact glyphs used across the product (harvested
   from source), so the system is self-contained (no CDN dependency).
   Add more Lucide glyphs here as new screens need them.
   ============================================================ */

const PATHS = {
  /* ---- Navigation / modules ---- */
  'dashboard': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "9",
    x: "3",
    y: "3",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "5",
    x: "14",
    y: "3",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "9",
    x: "14",
    y: "12",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "5",
    x: "3",
    y: "16",
    rx: "1"
  })),
  'clipboard-list': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "8",
    height: "4",
    x: "8",
    y: "2",
    rx: "1",
    ry: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 11h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 16h.01"
  })),
  'receipt': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 17V7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"
  })),
  'truck': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 18H9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "18",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "18",
    r: "2"
  })),
  'hard-hat': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 6a6 6 0 0 1 6 6v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 15v-3a6 6 0 0 1 6-6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "15",
    width: "20",
    height: "4",
    rx: "1"
  })),
  'users': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3.128a4 4 0 0 1 0 7.744"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  })),
  'user': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "7",
    r: "4"
  })),
  'tag': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7.5",
    cy: "7.5",
    r: ".5",
    fill: "currentColor"
  })),
  'file-text': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v5a1 1 0 0 0 1 1h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 9H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 13H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 17H8"
  })),
  'file-plus': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v5a1 1 0 0 0 1 1h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 15h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 18v-6"
  })),
  'file-check': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v5a1 1 0 0 0 1 1h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m14 20 2 2 4-4"
  })),
  'wallet': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"
  })),
  'calculator': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "16",
    height: "20",
    x: "4",
    y: "2",
    rx: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    x2: "16",
    y1: "6",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    x2: "16",
    y1: "14",
    y2: "18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 10h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 10h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 10h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 14h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 14h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 18h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 18h.01"
  })),
  'trending-up': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 7h6v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m22 7-8.5 8.5-5-5L2 17"
  })),
  'line-chart': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 3v16a2 2 0 0 0 2 2h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m19 9-5 5-4-4-3 3"
  })),
  'bar-chart': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 3v16a2 2 0 0 0 2 2h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 17V9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 17V5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 17v-3"
  })),
  'wrench': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"
  })),
  'fuel': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 21h13"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 9h11"
  })),
  /* ---- Actions / UI ---- */
  'sparkles': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 2v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 4h-4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "4",
    cy: "20",
    r: "2"
  })),
  'sun': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 20v2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m4.93 4.93 1.41 1.41"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m17.66 17.66 1.41 1.41"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 12h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 12h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6.34 17.66-1.41 1.41"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m19.07 4.93-1.41 1.41"
  })),
  'moon': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
  })),
  'cloud': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
  })),
  'cloud-rain': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 14v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 14v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16v6"
  })),
  'chevron-right': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m9 18 6-6-6-6"
  })),
  'arrow-left': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m12 19-7-7 7-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 12H5"
  })),
  'arrow-up-right': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M7 7h10v10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 17 17 7"
  })),
  'pencil': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m15 5 4 4"
  })),
  'message-circle': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
  })),
  'ban': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.929 4.929 19.07 19.071"
  })),
  'check': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })),
  'circle-check-big': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M21.801 10A10 10 0 1 1 17 3.335"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 11 3 3L22 4"
  })),
  'circle-alert': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "12",
    y1: "8",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "12.01",
    y1: "16",
    y2: "16"
  })),
  'info': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16v-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8h.01"
  })),
  'lock': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "11",
    x: "3",
    y: "11",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11V7a5 5 0 0 1 10 0v4"
  })),
  'eye': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  })),
  'eye-off': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.084 14.158a3 3 0 0 1-4.242-4.242"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m2 2 20 20"
  })),
  'log-in': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m10 17 5-5-5-5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 12H3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
  })),
  'history': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 3v5h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l4 2"
  })),
  'bell': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10.268 21a2 2 0 0 0 3.464 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
  })),
  'sliders': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "21",
    x2: "14",
    y1: "4",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    x2: "3",
    y1: "4",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    x2: "12",
    y1: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    x2: "3",
    y1: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    x2: "16",
    y1: "20",
    y2: "20"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "3",
    y1: "20",
    y2: "20"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "14",
    x2: "14",
    y1: "2",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    x2: "8",
    y1: "10",
    y2: "14"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    x2: "16",
    y1: "18",
    y2: "22"
  })),
  /* ---- Business objects / detail ---- */
  'building-2': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10 12h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 8h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 21v-3a2 2 0 0 0-4 0v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"
  })),
  'badge-check': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })),
  'briefcase': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "20",
    height: "14",
    x: "2",
    y: "6",
    rx: "2"
  })),
  'contact': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 10h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 14h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.17 15a3 3 0 0 1 5.66 0"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "11",
    r: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "5",
    width: "20",
    height: "14",
    rx: "2"
  })),
  'id-card': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "20",
    height: "14",
    x: "2",
    y: "5",
    rx: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "2",
    x2: "22",
    y1: "10",
    y2: "10"
  })),
  'cake': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 21h20"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 8v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 8v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 4h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 4h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 4h.01"
  })),
  'mail': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "4",
    width: "20",
    height: "16",
    rx: "2"
  })),
  'phone': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
  })),
  'map-pin': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })),
  'smartphone': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "14",
    height: "20",
    x: "5",
    y: "2",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 18h.01"
  })),
  'clock': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6v6l4 2"
  })),
  'gauge': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "10",
    x2: "14",
    y1: "2",
    y2: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "15",
    y1: "14",
    y2: "11"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "14",
    r: "8"
  })),
  'calendar': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M8 2v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 2v4"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "18",
    x: "3",
    y: "4",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 10h18"
  })),
  /* ---- Finance / payments ---- */
  'credit-card': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "20",
    height: "12",
    x: "2",
    y: "6",
    rx: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12h.01M18 12h.01"
  })),
  'hand-coins': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m2 16 6 6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "9",
    r: "2.9"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "5",
    r: "3"
  })),
  'landmark': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10 18v-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 18v-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 18v-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 22h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 18v-7"
  })),
  'link': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"
  })),
  'dollar-sign': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "12",
    y1: "2",
    y2: "22"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
  })),
  /* ---- Equipment variants ---- */
  'forklift': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 12H5a2 2 0 0 0-2 2v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 19h7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 19V2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12V7a2 2 0 0 1 2-2h2.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 16 10.828"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 19h4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "13",
    cy: "19",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "19",
    r: "2"
  })),
  'tractor': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 18h-5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 5a1 1 0 0 0-1 1v5.573"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 4h8.129a1 1 0 0 1 .99.863L13 11.246"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11V4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 15h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 10.1V4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "18",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "15",
    r: "5"
  })),
  /* ---- Legacy / data ---- */
  'database': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ellipse", {
    cx: "12",
    cy: "5",
    rx: "9",
    ry: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 5V19A9 3 0 0 0 21 19V5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 12A9 3 0 0 0 21 12"
  })),
  'archive': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    width: "20",
    height: "5",
    x: "2",
    y: "3",
    rx: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 12h4"
  }))
};

/**
 * Icon — renders a brand glyph from the Lucide-derived set.
 * @param {{name:string, size?:number, strokeWidth?:number, className?:string, style?:object}} props
 */
function Icon({
  name,
  size = 18,
  strokeWidth = 1.9,
  className = '',
  style,
  ...rest
}) {
  const body = PATHS[name];
  if (!body) {
    if (typeof console !== 'undefined') console.warn(`[Icon] unknown name: "${name}"`);
    return null;
  }
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    style: {
      flexShrink: 0,
      ...style
    },
    "aria-hidden": "true",
    focusable: "false"
  }, rest), body);
}

/** All available icon names (for pickers / docs). */
const IconNames = Object.keys(PATHS);
/** @deprecated lowercase alias — not exposed on the bundle namespace; use IconNames. */
const iconNames = IconNames;
Object.assign(__ds_scope, { Icon, IconNames, iconNames });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — a hero/header-level status or type indicator (pill).
 * Tones: active (green), neutral (grey), info (steel-blue), gold (amber).
 * Optional `led` dot or leading `icon`.
 */
function Badge({
  tone = 'neutral',
  led = false,
  icon,
  children,
  className = '',
  ...rest
}) {
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 13
  }) : icon;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['atp-badge', `atp-badge--${tone}`, className].filter(Boolean).join(' ')
  }, rest), led && /*#__PURE__*/React.createElement("span", {
    className: "atp-badge__led"
  }), ic, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function resolveIcon(icon, size) {
  return typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size
  }) : icon;
}

/**
 * Button — the product's action control.
 * Variants: primary (amber fill), ghost (outline), ai (amber-tinted "Perguntar à IA"),
 * wa (WhatsApp/green), danger (destructive outline).
 */
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const cls = ['atp-btn', `atp-btn--${variant}`, size !== 'md' ? `atp-btn--${size}` : '', className].filter(Boolean).join(' ');
  const gs = size === 'sm' ? 15 : 16;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls
  }, rest), resolveIcon(icon, gs), children != null && /*#__PURE__*/React.createElement("span", {
    className: "atp-btn__label"
  }, children), resolveIcon(iconRight, gs));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Chip — a neutral tag with an amber icon (e.g. equipment the operator is cleared for).
 */
function Chip({
  icon,
  children,
  className = '',
  ...rest
}) {
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15
  }) : icon;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['atp-chip', className].filter(Boolean).join(' ')
  }, rest), ic, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — square, icon-only control (theme toggle, row actions, toolbar).
 * Always pass `label` for accessibility (used as aria-label + tooltip).
 */
function IconButton({
  icon,
  label,
  size = 'md',
  className = '',
  ...rest
}) {
  const gs = size === 'sm' ? 15 : 18;
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: gs
  }) : icon;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    className: ['atp-icon-btn', size === 'sm' ? 'atp-icon-btn--sm' : '', className].filter(Boolean).join(' ')
  }, rest), ic);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusChip — compact status pill for table cells and list rows.
 * Tones map to the product's status colours; pass `led` for a dot or `icon` for a glyph.
 */
function StatusChip({
  tone = 'neutral',
  led = false,
  icon,
  children,
  className = '',
  ...rest
}) {
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 12
  }) : icon;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['atp-status', `atp-status--${tone}`, className].filter(Boolean).join(' ')
  }, rest), led && /*#__PURE__*/React.createElement("span", {
    className: "atp-status__led"
  }), ic, children);
}
Object.assign(__ds_scope, { StatusChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusChip.jsx", error: String((e && e.message) || e) }); }

// components/data/Note.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Note — a dashed-border informational callout with a leading icon.
 * `default` uses an amber-dim icon; `steel` for legacy/read-only context (Farolti).
 */
function Note({
  icon = 'info',
  tone = 'default',
  children,
  className = '',
  ...rest
}) {
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15
  }) : icon;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['atp-note', tone === 'steel' ? 'atp-note--steel' : '', className].filter(Boolean).join(' ')
  }, rest), ic, /*#__PURE__*/React.createElement("span", {
    className: "atp-note__t"
  }, children));
}
Object.assign(__ds_scope, { Note });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Note.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * NavItem — a sidebar navigation row: icon + label, optional count bubble,
 * and an active state (amber text, inset fill, left amber marker + LED dot).
 * Renders as <a> when `href` is set, otherwise <div role="button">.
 */
function NavItem({
  icon,
  children,
  count,
  active = false,
  dot = true,
  href,
  className = '',
  ...rest
}) {
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17
  }) : icon;
  const cls = ['atp-nav-item', active ? 'is-active' : '', className].filter(Boolean).join(' ');
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, ic, /*#__PURE__*/React.createElement("span", {
    className: "atp-nav-item__label"
  }, children), count != null && !active && /*#__PURE__*/React.createElement("span", {
    className: "atp-nav-item__count"
  }, count), active && dot && /*#__PURE__*/React.createElement("span", {
    className: "atp-nav-item__dot"
  }));
  if (href) return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    className: cls
  }, rest), inner);
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "button",
    tabIndex: 0,
    className: cls
  }, rest), inner);
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Avatar — initials or an icon in a coloured square/circle.
 * `flat` (solid amber, e.g. header user) or `brand` (amber gradient + glow, e.g. hero).
 */
function Avatar({
  initials,
  icon,
  shape = 'circle',
  size = 28,
  tone = 'flat',
  className = '',
  style,
  ...rest
}) {
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(size * 0.48),
    strokeWidth: 1.7
  }) : icon;
  const radius = shape === 'circle' ? '50%' : Math.max(10, Math.round(size * 0.23));
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['atp-avatar', tone === 'brand' ? 'atp-avatar--brand' : '', className].filter(Boolean).join(' '),
    style: {
      width: size,
      height: size,
      borderRadius: radius,
      fontSize: Math.round(size * 0.42),
      ...style
    }
  }, rest), ic || initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Hazard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Hazard — the signature diagonal amber/dark construction-tape bar.
 * Use as a brand emphasis stripe (under the sidebar wordmark, atop the content area).
 * `default` = 8px, `header` = 6px thinner variant.
 */
function Hazard({
  variant = 'default',
  height,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['atp-hazard', variant === 'header' ? 'atp-hazard--header' : '', className].filter(Boolean).join(' '),
    style: {
      ...(height ? {
        height
      } : {}),
      ...style
    },
    role: "presentation"
  }, rest));
}
Object.assign(__ds_scope, { Hazard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Hazard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/IconTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconTile — the small rounded square that holds an icon throughout the UI
 * (card headers, KPI corners, data rows). Tones set the fill + icon colour.
 */
function IconTile({
  icon,
  size = 'md',
  tone = 'amber',
  className = '',
  style,
  children,
  ...rest
}) {
  const px = {
    sm: 28,
    md: 30,
    lg: 34
  }[size] || 30;
  const gs = {
    sm: 15,
    md: 16,
    lg: 18
  }[size] || 16;
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: gs
  }) : icon;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['atp-tile', `atp-tile--${tone}`, className].filter(Boolean).join(' '),
    style: {
      width: px,
      height: px,
      ...style
    }
  }, rest), ic || children);
}
Object.assign(__ds_scope, { IconTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/IconTile.jsx", error: String((e && e.message) || e) }); }

// components/data/DataRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * DataRow — a key/value row for "Dados cadastrais"-style lists: a muted icon tile,
 * an uppercase key, and a value below. Rows divide with a soft hairline.
 */
function DataRow({
  icon,
  label,
  children,
  className = '',
  ...rest
}) {
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }) : icon;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['atp-datarow', className].filter(Boolean).join(' ')
  }, rest), icon != null && /*#__PURE__*/React.createElement(__ds_scope.IconTile, {
    size: "md",
    tone: "muted",
    className: "atp-datarow__i"
  }, ic), /*#__PURE__*/React.createElement("div", {
    className: "atp-datarow__c"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atp-datarow__k"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "atp-datarow__v"
  }, children)));
}
Object.assign(__ds_scope, { DataRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataRow.jsx", error: String((e && e.message) || e) }); }

// components/data/KpiCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * KpiCard — a headline metric tile: uppercase label, big value (optionally mono),
 * amber icon in the corner, a footnote (with optional trend), and an optional sparkline.
 */
function KpiCard({
  label,
  value,
  unit,
  icon,
  mono = false,
  trend,
  foot,
  spark,
  warn = false,
  className = '',
  ...rest
}) {
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17
  }) : icon;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['atp-kpi', warn ? 'atp-kpi--warn' : '', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "atp-kpi__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-kpi__label"
  }, label), /*#__PURE__*/React.createElement(__ds_scope.IconTile, {
    size: "md",
    tone: "amber",
    className: "atp-kpi__ic"
  }, ic)), /*#__PURE__*/React.createElement("div", {
    className: mono ? 'atp-kpi__val atp-kpi__val--mono' : 'atp-kpi__val'
  }, value, unit != null && /*#__PURE__*/React.createElement("span", {
    className: "atp-kpi__u"
  }, unit)), /*#__PURE__*/React.createElement("div", {
    className: "atp-kpi__foot"
  }, trend && /*#__PURE__*/React.createElement("span", {
    className: `atp-trend atp-trend--${trend.dir}`
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-up-right",
    size: 13,
    style: trend.dir === 'down' ? {
      transform: 'rotate(90deg)'
    } : undefined
  }), trend.value), foot), spark != null && (Array.isArray(spark) ? /*#__PURE__*/React.createElement(__ds_scope.Sparkline, {
    points: spark,
    className: "atp-kpi__spark"
  }) : /*#__PURE__*/React.createElement("span", {
    className: "atp-kpi__spark"
  }, spark)));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the standard surface. Optional built-in header (icon tile + uppercase
 * title + right-aligned slot). Pass `padded` for simple body padding, or leave
 * unpadded for tables / list rows that manage their own insets.
 */
function Card({
  title,
  icon,
  headerRight,
  padded = false,
  children,
  className = '',
  ...rest
}) {
  const hasHeader = title != null || icon != null || headerRight != null;
  const ic = typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }) : icon;
  return /*#__PURE__*/React.createElement("section", _extends({
    className: ['atp-card', className].filter(Boolean).join(' ')
  }, rest), hasHeader && /*#__PURE__*/React.createElement("div", {
    className: "atp-card__h"
  }, icon != null && /*#__PURE__*/React.createElement(__ds_scope.IconTile, {
    size: "md",
    tone: "amber"
  }, ic), title != null && /*#__PURE__*/React.createElement("h3", {
    className: "atp-card__title"
  }, title), headerRight != null && /*#__PURE__*/React.createElement("div", {
    className: "atp-card__right"
  }, headerRight)), /*#__PURE__*/React.createElement("div", {
    className: padded ? 'atp-card__body atp-card__body--pad' : 'atp-card__body'
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app-campo/CampoApp.jsx
try { (() => {
/* App de Campo — protótipo (PIN → Hoje → Apontamento → Confirmação; abas OS/Abastecer/Perfil). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Icon,
  StatusChip
} = NS;
const AC_OS = [{
  n: 'OS-021',
  t: 'Terraplenagem — lote industrial',
  cli: 'Essavado Ltda.',
  eq: 'Escavadeira CAT 320',
  eqIc: 'truck',
  h0: 4218.0,
  local: 'Distrito Industrial — Santo Ângelo/RS',
  ini: '01/07',
  prevH: 80,
  doneH: 62,
  escopo: 'Corte e aterro do platô (2.400 m²), conformação de taludes e compactação. Bota-fora no depósito da obra.'
}, {
  n: 'OS-019',
  t: 'Abertura de acesso e drenagem',
  cli: 'Construtora Sul',
  eq: 'Retroescavadeira JCB 3CX',
  eqIc: 'tractor',
  h0: 1888.0,
  local: 'Linha Cascalho — Santa Rosa/RS',
  ini: '24/06',
  prevH: 40,
  doneH: 28,
  escopo: 'Abertura de 340 m de acesso com cascalhamento e valas de drenagem nas laterais.'
}, {
  n: 'OS-024',
  t: 'Nivelamento de pátio',
  cli: 'Agro Vale Verde',
  eq: 'Pá Carregadeira XCMG',
  eqIc: 'forklift',
  h0: 998.0,
  local: 'Sede — Giruá/RS',
  ini: '05/07',
  prevH: 24,
  doneH: 8,
  escopo: 'Regularização e compactação do pátio de manobra junto aos silos.'
}];
const fmtH = n => n.toLocaleString('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
const AC_HIST = [{
  d: 'Ontem · qui, 10/07',
  rows: [{
    os: 'OS-021',
    eq: 'Escavadeira CAT 320',
    eqIc: 'truck',
    hm: '4.210,0 → 4.218,0',
    h: '8,0 h',
    sync: true
  }, {
    os: 'OS-019',
    eq: 'Retro JCB 3CX',
    eqIc: 'tractor',
    hm: '1.885,0 → 1.888,0',
    h: '3,0 h',
    sync: true
  }]
}, {
  d: 'qua, 09/07',
  rows: [{
    os: 'OS-021',
    eq: 'Escavadeira CAT 320',
    eqIc: 'truck',
    hm: '4.203,0 → 4.210,0',
    h: '7,5 h',
    sync: true
  }]
}, {
  d: 'ter, 08/07',
  rows: [{
    os: 'OS-024',
    eq: 'Pá Carregadeira XCMG',
    eqIc: 'forklift',
    hm: '990,0 → 998,0',
    h: '8,0 h',
    sync: true
  }, {
    os: 'OS-019',
    eq: 'Retro JCB 3CX',
    eqIc: 'tractor',
    hm: '1.882,0 → 1.885,0',
    h: '3,0 h',
    sync: true
  }]
}, {
  d: 'seg, 07/07',
  rows: [{
    os: 'OS-021',
    eq: 'Escavadeira CAT 320',
    eqIc: 'truck',
    hm: '4.195,0 → 4.203,0',
    h: '8,0 h',
    sync: true
  }]
}];
const AC_NOTIF = [{
  d: 'Hoje',
  rows: [{
    ic: 'clipboard-list',
    t: 'Nova OS atribuída a você',
    m: 'OS-024 · Nivelamento de pátio — Agro Vale Verde',
    hr: '07:38',
    unread: true,
    os: 'OS-024'
  }, {
    ic: 'wrench',
    t: 'Manutenção agendada',
    m: 'CAT 320 · plano 4.300 h — leve para a base sexta à tarde',
    hr: '07:15',
    unread: true
  }]
}, {
  d: 'Ontem',
  rows: [{
    ic: 'check',
    t: 'Apontamento aprovado',
    m: 'OS-021 · 8,0 h de quinta confirmadas pela retaguarda',
    hr: '18:22',
    unread: false,
    os: 'OS-021'
  }, {
    ic: 'gauge',
    t: 'Lembrete de apontamento',
    m: 'Você iniciou a OS-019 às 07:40 e não apontou até as 17h',
    hr: '17:00',
    unread: false,
    os: 'OS-019'
  }]
}, {
  d: 'qua, 09/07',
  rows: [{
    ic: 'fuel',
    t: 'Abastecimento registrado',
    m: '120 L · Escavadeira CAT 320 — tanque interno',
    hr: '11:45',
    unread: false
  }, {
    ic: 'circle-alert',
    t: 'Correção solicitada',
    m: 'OS-019 · confira o horímetro final de terça (1.885,0)',
    hr: '09:10',
    unread: false,
    os: 'OS-019'
  }]
}];
const AC_CHK = [{
  t: 'Nível de óleo e água',
  m: 'Motor e hidráulico dentro da faixa'
}, {
  t: 'Vazamentos visíveis',
  m: 'Mangueiras, cilindros e comandos'
}, {
  t: 'Material rodante / pneus',
  m: 'Esteiras, sapatas ou calibragem'
}, {
  t: 'Luzes e alarme de ré',
  m: 'Faróis, giroflex e sinal sonoro'
}, {
  t: 'Cinto de segurança',
  m: 'Trava e retenção funcionando'
}, {
  t: 'Extintor de incêndio',
  m: 'Carga válida e lacre intacto'
}, {
  t: 'Espelhos e cabine',
  m: 'Visão limpa, vidros e retrovisores'
}, {
  t: 'Horímetro funcionando',
  m: 'Registrando horas normalmente'
}];
const AC_RDO_PREV = [{
  d: 'Ontem · qui, 10/07',
  clima: 'Sol · Sol',
  eq: 3,
  h: '11,0 h'
}, {
  d: 'qua, 09/07',
  clima: 'Nublado · Chuva',
  eq: 2,
  h: '7,5 h'
}];
const AC_CLIMAS = [['sol', 'sun', 'Sol'], ['nublado', 'cloud', 'Nublado'], ['chuva', 'cloud-rain', 'Chuva']];
const AC_MNT_TIPOS = [['hidraulico', 'wrench', 'Hidráulico', 'Vazamento, comando lento, mangueira'], ['motor', 'gauge', 'Motor', 'Falha, fumaça, superaquecimento'], ['rodante', 'truck', 'Material rodante', 'Esteira, sapata, pneu, rolete'], ['eletrica', 'circle-alert', 'Elétrica', 'Luzes, alarme de ré, painel'], ['outro', 'file-text', 'Outro', 'Descreva na observação']];
const AC_BASE = [-28.2965, -54.266];
const AC_ROTAS = {
  'OS-021': {
    dest: [-28.318, -54.243],
    via: [[-28.301, -54.259], [-28.309, -54.251]],
    km: '12,4 km',
    min: '18 min'
  },
  'OS-019': {
    dest: [-28.276, -54.297],
    via: [[-28.289, -54.279], [-28.281, -54.291]],
    km: '8,7 km',
    min: '14 min'
  },
  'OS-024': {
    dest: [-28.328, -54.286],
    via: [[-28.308, -54.272], [-28.319, -54.281]],
    km: '15,2 km',
    min: '22 min'
  }
};
const AC_SEG = [{
  id: 's1',
  sev: 'critico',
  ic: 'circle-alert',
  t: 'Rede elétrica energizada a 8 m',
  m: 'OS-021 · setor leste do platô — altura máxima da lança 6 m, sinaleiro obrigatório'
}, {
  id: 's2',
  sev: 'atencao',
  ic: 'cloud-rain',
  t: 'Chuva prevista para a tarde',
  m: 'Talude do platô norte fica instável — mantenha a máquina afastada da crista'
}, {
  id: 's3',
  sev: 'atencao',
  ic: 'hard-hat',
  t: 'Visita técnica do cliente às 14h',
  m: 'OS-019 · EPI completo e área de manobra sinalizada durante a visita'
}];
const AC_DDS = {
  tema: 'Trabalho próximo a redes elétricas',
  pontos: ['Distância mínima de 3 m de cabos energizados', 'Sinaleiro sempre em contato visual com o operador', 'Em contato acidental: não desça da máquina, afaste com a própria máquina']
};
const AC_FICHA = {
  'Escavadeira CAT 320': {
    ano: '2019',
    serie: 'CAT0320-8842',
    consumo: '14,2 L/h',
    prox: 'Plano 4.300 h',
    proxIn: 'em 82 h',
    proxPct: 58,
    mnts: [['02/07', 'Plano 4.200 h — filtros e graxa'], ['14/05', 'Troca de dente da caçamba']]
  },
  'Retroescavadeira JCB 3CX': {
    ano: '2021',
    serie: 'JCB3CX-1107',
    consumo: '9,8 L/h',
    prox: 'Plano 2.000 h',
    proxIn: 'em 105 h',
    proxPct: 48,
    mnts: [['20/06', 'Revisão de freios'], ['02/04', 'Plano 1.800 h — óleos e filtros']]
  },
  'Pá Carregadeira XCMG': {
    ano: '2018',
    serie: 'XCMG-LW300-553',
    consumo: '11,5 L/h',
    prox: 'Plano 1.000 h',
    proxIn: 'vencida · −18 h',
    proxPct: 100,
    late: true,
    mnts: [['08/07', 'Corretiva — comando hidráulico (em andamento)'], ['12/06', 'Plano 900 h — óleos e filtros']]
  }
};
const AC_PAR_MOTIVOS = [['chuva', 'cloud-rain', 'Chuva', 'Frente paralisada por clima'], ['caminhao', 'truck', 'Aguardando caminhão', 'Sem basculante para carregar'], ['quebra', 'wrench', 'Quebra de máquina', 'Parada por defeito ou manutenção'], ['liberacao', 'clock', 'Aguardando liberação', 'Frente, topografia ou cliente'], ['outro', 'file-text', 'Outro', 'Descreva na observação']];
const AC_PAR_PREV = [{
  d: 'Ontem · qui, 10/07',
  m: 'Chuva',
  h: '1,5 h',
  os: 'OS-021'
}, {
  d: 'ter, 08/07',
  m: 'Aguardando caminhão',
  h: '0,5 h',
  os: 'OS-024'
}];
const AC_ESP = {
  mes: 'jul/2025',
  base: 76.0,
  dias: 10,
  fecha: '31/07',
  confira: '28/07',
  porOS: [['OS-021', 'Terraplenagem — lote industrial', 46.5], ['OS-019', 'Abertura de acesso e drenagem', 21.5], ['OS-024', 'Nivelamento de pátio', 8.0]],
  semanas: [['S1 · 01–04/07', 26.0], ['S2 · 07–11/07', 50.0]]
};
const AC_ESC = [{
  d: 'sáb, 12/07',
  tag: 'amanhã',
  os: null,
  ic: 'wrench',
  t: 'Manutenção na base',
  m: 'Levar a CAT 320 — plano 4.300 h · meio turno'
}, {
  d: 'seg, 14/07',
  os: 'OS-021',
  ic: 'truck',
  t: 'Terraplenagem — lote industrial',
  m: 'Essavado · Distrito Industrial · CAT 320'
}, {
  d: 'ter, 15/07',
  os: 'OS-021',
  ic: 'truck',
  t: 'Terraplenagem — lote industrial',
  m: 'Essavado · Distrito Industrial · CAT 320'
}, {
  d: 'qua, 16/07',
  os: 'OS-024',
  ic: 'forklift',
  t: 'Nivelamento de pátio',
  m: 'Agro Vale Verde · Giruá · Pá XCMG',
  mud: true
}, {
  d: 'qui, 17/07',
  os: 'OS-019',
  ic: 'tractor',
  t: 'Abertura de acesso e drenagem',
  m: 'Construtora Sul · Linha Cascalho · JCB 3CX'
}, {
  d: 'sex, 18/07',
  os: 'OS-019',
  ic: 'tractor',
  t: 'Abertura de acesso e drenagem',
  m: 'Construtora Sul · Linha Cascalho · JCB 3CX'
}];
const AC_VIA_MAT = [['bota', 'Bota-fora'], ['cascalho', 'Cascalho'], ['argila', 'Argila']];
const AC_VIA_ROTA = {
  'OS-021': {
    dest: 'Depósito de bota-fora da obra',
    km: 3.2
  },
  'OS-019': {
    dest: 'Jazida de cascalho — Linha Sul',
    km: 5.8
  },
  'OS-024': {
    dest: 'Pátio de descarte — sede',
    km: 1.4
  }
};
const AC_MOB_TIPOS = [['mob', 'Mobilização'], ['desmob', 'Desmobilização'], ['transf', 'Transferência']];
const AC_MOB_KM = {
  'OS-021': 12.4,
  'OS-019': 8.7,
  'OS-024': 15.2
};
function CampoApp() {
  const [screen, setScreen] = React.useState('pin');
  const [tab, setTab] = React.useState('hoje');
  const [pin, setPin] = React.useState('');
  const [os, setOs] = React.useState(AC_OS[0]);
  const [hf, setHf] = React.useState(AC_OS[0].h0 + 8);
  const [litros, setLitros] = React.useState(120);
  const [chk, setChk] = React.useState({});
  const [climaM, setClimaM] = React.useState('sol');
  const [climaT, setClimaT] = React.useState(null);
  const [equipe, setEquipe] = React.useState(3);
  const [mntTipo, setMntTipo] = React.useState(null);
  const [mntUrg, setMntUrg] = React.useState('pode');
  const [parMotivo, setParMotivo] = React.useState(null);
  const [parDur, setParDur] = React.useState(1);
  const [espOk, setEspOk] = React.useState(false);
  const [espDiv, setEspDiv] = React.useState(false);
  const [viaMat, setViaMat] = React.useState('bota');
  const [viaCount, setViaCount] = React.useState(4);
  const [viaLast, setViaLast] = React.useState('10:20');
  const [mobTipo, setMobTipo] = React.useState('mob');
  const [mobKm, setMobKm] = React.useState(12);
  const [sigName, setSigName] = React.useState('');
  const [hasSig, setHasSig] = React.useState(false);
  const sigCanvas = React.useRef(null);
  const sigDrawing = React.useRef(false);
  const mapaEl = React.useRef(null);
  const mapaObj = React.useRef(null);
  const [mapErr, setMapErr] = React.useState(false);
  React.useEffect(() => {
    if (screen !== 'mapa') {
      if (mapaObj.current) {
        mapaObj.current.remove();
        mapaObj.current = null;
      }
      return;
    }
    let dead = false;
    function init() {
      if (dead || !mapaEl.current || mapaObj.current || !window.L) return;
      const L = window.L;
      const r = AC_ROTAS[os.n] || AC_ROTAS['OS-021'];
      const map = L.map(mapaEl.current, {
        zoomControl: false
      });
      map.attributionControl.setPosition('topright');
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Imagens © Esri'
      }).addTo(map);
      const pts = [AC_BASE, ...r.via, r.dest];
      L.polyline(pts, {
        color: '#ffb300',
        weight: 4,
        dashArray: '1 11',
        lineCap: 'round',
        opacity: 0.95
      }).addTo(map);
      L.marker(AC_BASE, {
        icon: L.divIcon({
          className: 'acm-pin',
          html: '<div class="bx bx--base"><svg viewBox="0 0 24 24" fill="none" stroke="#ffb300" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M6 20v-4h4v4"/><path d="m10 16 3-7 5 4v3"/></svg></div><div class="tl tl--base"></div>',
          iconSize: [30, 38],
          iconAnchor: [15, 38]
        })
      }).addTo(map);
      L.marker(r.dest, {
        icon: L.divIcon({
          className: 'acm-pin',
          html: '<div class="bx"><svg viewBox="0 0 24 24" fill="none" stroke="#16140f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div><div class="tl"></div>',
          iconSize: [30, 38],
          iconAnchor: [15, 38]
        })
      }).addTo(map);
      map.fitBounds(L.latLngBounds(pts).pad(0.22));
      mapaObj.current = map;
    }
    if (window.L) init();else {
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link');
        css.id = 'leaflet-css';
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      let s = document.getElementById('leaflet-js');
      if (!s) {
        s = document.createElement('script');
        s.id = 'leaflet-js';
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(s);
      }
      s.addEventListener('load', init);
      s.addEventListener('error', () => {
        if (!dead) setMapErr(true);
      });
    }
    return () => {
      dead = true;
      if (mapaObj.current) {
        mapaObj.current.remove();
        mapaObj.current = null;
      }
    };
  }, [screen, os]);
  const [okInfo, setOkInfo] = React.useState(null);
  const [hoje, setHoje] = React.useState([{
    os: 'OS-019',
    h: '5,5 h'
  }]);
  const [lidas, setLidas] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [segAck, setSegAck] = React.useState({});
  const [ddsOk, setDdsOk] = React.useState(false);
  const [syncedAll, setSyncedAll] = React.useState(false);
  const [lastSync, setLastSync] = React.useState('07:42');
  const naoLidas = lidas ? 0 : AC_NOTIF.reduce((s, g) => s + g.rows.filter(r => r.unread).length, 0);
  function key(d) {
    if (pin.length >= 4) return;
    const p = pin + d;
    setPin(p);
    if (p.length === 4) setTimeout(() => {
      setScreen('app');
      setTab('hoje');
      setPin('');
    }, 250);
  }
  function openApont(o) {
    setOs(o);
    setHf(o.h0 + 8);
    setScreen('apontar');
  }
  function openDet(o) {
    setOs(o);
    setScreen('osdet');
  }
  function openChk(o) {
    setOs(o);
    setChk({});
    setScreen('chk');
  }
  function openRdo(o) {
    setOs(o);
    setScreen('rdo');
  }
  function openMnt(o) {
    setOs(o);
    setMntTipo(null);
    setMntUrg('pode');
    setScreen('mnt');
  }
  function openPar(o) {
    setOs(o);
    setParMotivo(null);
    setParDur(1);
    setScreen('par');
  }
  function openMob(o) {
    setOs(o);
    setMobTipo('mob');
    setMobKm(AC_MOB_KM[o.n] || 12);
    setScreen('mob');
  }
  function mobTrajeto(o, t) {
    const obra = o.local.split(' — ')[0];
    if (t === 'desmob') return obra + ' → Base Antonello';
    if (t === 'transf') return obra + ' → outra obra';
    return 'Base Antonello → ' + obra;
  }
  function confirmMob() {
    const tp = (AC_MOB_TIPOS.find(x => x[0] === mobTipo) || [])[1];
    setOkInfo({
      title: tp + ' registrada',
      lines: [[os.n, os.eq], ['Trajeto', mobTrajeto(os, mobTipo)], ['Percurso', mobKm.toLocaleString('pt-BR', {
        maximumFractionDigits: 1
      }) + ' km de prancha'], ['Registrado', 'no aparelho · sincroniza ao conectar']]
    });
    setScreen('ok');
  }
  function confirmVia() {
    const r = AC_VIA_ROTA[os.n] || AC_VIA_ROTA['OS-021'];
    const m = (AC_VIA_MAT.find(x => x[0] === viaMat) || [])[1];
    setOkInfo({
      title: 'Viagens registradas',
      lines: [[os.n, os.t], ['Material', m], ['Viagens', viaCount + ' × 12 m³ ≈ ' + viaCount * 12 + ' m³'], ['Percurso', (viaCount * r.km * 2).toLocaleString('pt-BR', {
        maximumFractionDigits: 1
      }) + ' km rodados']]
    });
    setScreen('ok');
  }
  function confirmPar() {
    const m = (AC_PAR_MOTIVOS.find(t => t[0] === parMotivo) || [])[2] || '—';
    setOkInfo({
      title: 'Paralisação registrada',
      lines: [[os.n, os.t], ['Motivo', m], ['Duração', fmtH(parDur) + ' h'], ['Registrado', 'sex, 11/07 · no aparelho']]
    });
    setScreen('ok');
  }
  function openSig(o) {
    setOs(o);
    setSigName('');
    setHasSig(false);
    setScreen('sig');
  }
  function doSync() {
    if (syncing || syncedAll) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncedAll(true);
      setLastSync('agora');
    }, 1400);
  }
  function sigPos(e) {
    const c = sigCanvas.current,
      r = c.getBoundingClientRect();
    return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)];
  }
  function sigDown(e) {
    e.preventDefault();
    const ctx = sigCanvas.current.getContext('2d');
    ctx.strokeStyle = '#f0eee6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const [x, y] = sigPos(e);
    sigDrawing.current = true;
    sigCanvas.current.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function sigMove(e) {
    if (!sigDrawing.current) return;
    const ctx = sigCanvas.current.getContext('2d');
    const [x, y] = sigPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSig) setHasSig(true);
  }
  function sigUp() {
    sigDrawing.current = false;
  }
  function sigClear() {
    const c = sigCanvas.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setHasSig(false);
  }
  function confirmSig() {
    const feitasHoje = hoje.filter(a => a.os === os.n).reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    setOkInfo({
      title: 'Medição assinada',
      lines: [[os.n, 'Medição #2 · 01/07 – 11/07'], ['Responsável', sigName + ' — ' + os.cli], ['Horas no período', fmtH(os.doneH + feitasHoje) + ' h'], ['Assinado', 'no aparelho · sex, 11/07']]
    });
    setScreen('ok');
  }
  function confirmMnt() {
    const tipo = (AC_MNT_TIPOS.find(t => t[0] === mntTipo) || [])[2] || '—';
    setOkInfo({
      title: 'Solicitação enviada',
      lines: [[os.n, os.eq], ['Tipo', tipo], ['Urgência', mntUrg === 'parado' ? 'Máquina parada' : 'Pode aguardar'], ['Horímetro', fmtH(os.h0)]]
    });
    setScreen('ok');
  }
  function confirmRdo() {
    const lb = v => (AC_CLIMAS.find(c => c[0] === v) || [])[2] || '—';
    const hHoje = hoje.reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    setOkInfo({
      title: 'Diário registrado',
      lines: [[os.n, 'sex, 11/07'], ['Clima', lb(climaM) + ' · ' + lb(climaT)], ['Equipe', equipe + ' pessoas'], ['Horas de máquina', fmtH(hHoje) + ' h']]
    });
    setScreen('ok');
  }
  function confirmChk() {
    const noks = Object.values(chk).filter(v => v === 'nok').length;
    setOkInfo({
      title: noks > 0 ? 'Checklist com pendências' : 'Checklist concluído',
      lines: [[os.n, os.eq], ['Conformes', AC_CHK.length - noks + ' de ' + AC_CHK.length], ...(noks > 0 ? [['Não conformes', noks + (noks === 1 ? ' item — manutenção notificada' : ' itens — manutenção notificada')]] : [])]
    });
    setScreen('ok');
  }
  function confirmApont() {
    const hrs = fmtH(hf - os.h0) + ' h';
    setHoje(h => [...h, {
      os: os.n,
      h: hrs
    }]);
    setOkInfo({
      title: 'Apontamento registrado',
      lines: [[os.n, os.eq], ['Horímetro', fmtH(os.h0) + ' → ' + fmtH(hf)], ['Horas', hrs]]
    });
    setScreen('ok');
  }
  function confirmDiesel() {
    setOkInfo({
      title: 'Abastecimento registrado',
      lines: [[os.n, os.eq], ['Litros', litros + ' L'], ['Horímetro', fmtH(os.h0)]]
    });
    setScreen('ok');
  }

  /* ---------- PIN ---------- */
  if (screen === 'pin') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Login por PIN"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-pin"
    }, /*#__PURE__*/React.createElement("div", {
      className: "brand"
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logo-tile.svg",
      alt: ""
    }), /*#__PURE__*/React.createElement("b", null, "APP DE CAMPO", /*#__PURE__*/React.createElement("small", null, "ANTONELLO TERRAPLANAGEM")), /*#__PURE__*/React.createElement("span", {
      className: "who"
    }, "Adelar Machado \xB7 Operador")), /*#__PURE__*/React.createElement("div", {
      className: "ac-dots"
    }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("i", {
      key: i,
      className: i < pin.length ? 'on' : ''
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--muted-2)'
      }
    }, "Digite seu PIN de 4 d\xEDgitos"), /*#__PURE__*/React.createElement("div", {
      className: "ac-pad"
    }, [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => /*#__PURE__*/React.createElement("button", {
      key: d,
      type: "button",
      className: "ac-key",
      onClick: () => key(String(d))
    }, d)), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-key",
      onClick: () => key('0')
    }, "0"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-key ac-key--mute",
      "aria-label": "Apagar",
      onClick: () => setPin(pin.slice(0, -1))
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 20
    })))));
  }

  /* ---------- Apontamento ---------- */
  if (screen === 'apontar') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Apontamento"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Apontamento"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Equipamento"), /*#__PURE__*/React.createElement("div", {
      className: "ac-eq"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: os.eqIc,
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, os.eq), /*#__PURE__*/React.createElement("span", {
      className: "hm"
    }, "in\xEDcio ", fmtH(os.h0)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Hor\xEDmetro final"), /*#__PURE__*/React.createElement("div", {
      className: "ac-stepper"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Diminuir",
      onClick: () => setHf(Math.max(os.h0, hf - 0.5))
    }, "\u2212"), /*#__PURE__*/React.createElement("div", {
      className: "val"
    }, /*#__PURE__*/React.createElement("b", null, fmtH(hf)), /*#__PURE__*/React.createElement("span", null, "horas m\xE1quina")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Aumentar",
      onClick: () => setHf(hf + 0.5)
    }, "+"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-calc"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 17
    }), /*#__PURE__*/React.createElement("b", null, fmtH(hf - os.h0), " h"), /*#__PURE__*/React.createElement("span", null, "trabalhadas nesta OS hoje")), /*#__PURE__*/React.createElement("div", {
      className: "ac-field ac-obs"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Observa\xE7\xE3o (opcional)"), /*#__PURE__*/React.createElement("textarea", {
      placeholder: "Ex.: chuva no fim da tarde, troca de frente\u2026"
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      disabled: hf <= os.h0,
      onClick: confirmApont
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.2
    }), "Confirmar apontamento")));
  }

  /* ---------- Sucesso ---------- */
  if (screen === 'ok') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Confirma\xE7\xE3o"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-ok"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ic"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check-big",
      size: 36
    })), /*#__PURE__*/React.createElement("h2", null, okInfo.title), /*#__PURE__*/React.createElement("div", {
      className: "sum"
    }, okInfo.lines.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
      key: i
    }, k, " \xB7 ", /*#__PURE__*/React.createElement("b", null, v)))), /*#__PURE__*/React.createElement("span", {
      className: "off"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "smartphone",
      size: 13
    }), "Salvo no aparelho \u2014 sincroniza ao conectar"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      onClick: () => setScreen('app')
    }, "Voltar ao in\xEDcio"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big ac-big--ghost",
      onClick: () => openApont(os)
    }, "Novo apontamento"))));
  }

  /* ---------- Detalhe da OS ---------- */
  if (screen === 'osdet') {
    const feitasHoje = hoje.filter(a => a.os === os.n).reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    const done = os.doneH + feitasHoje;
    const pct = Math.min(100, Math.round(done / os.prevH * 100));
    const apts = [...hoje.filter(a => a.os === os.n).map(a => ({
      d: 'hoje',
      hm: null,
      h: a.h,
      sync: syncedAll
    })).reverse(), ...AC_HIST.flatMap(g => g.rows.filter(r => r.os === os.n).map(r => ({
      d: g.d.replace('Ontem · ', ''),
      hm: r.hm,
      h: r.h,
      sync: true
    })))].slice(0, 4);
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Detalhe da OS"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('app')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Ordem de Servi\xE7o"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-card ac-active",
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "top"
    }, os.n === 'OS-024' ? /*#__PURE__*/React.createElement(StatusChip, {
      tone: "info",
      led: true
    }, "Aberta") : /*#__PURE__*/React.createElement(StatusChip, {
      tone: "amber",
      led: true
    }, "Em andamento")), /*#__PURE__*/React.createElement("h3", null, os.t), /*#__PURE__*/React.createElement("div", {
      className: "meta",
      style: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
      name: "user",
      size: 12
    }), os.cli), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
      name: "map-pin",
      size: 12
    }), os.local), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 12
    }), "desde ", os.ini))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Equipamento"), /*#__PURE__*/React.createElement("div", {
      className: "ac-eq"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: os.eqIc,
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, os.eq), /*#__PURE__*/React.createElement("span", {
      className: "hm"
    }, "hor\xEDm. ", fmtH(os.h0))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => setScreen('eqf')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "truck",
      size: 16
    }), "Ficha do equipamento", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => openChk(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check-big",
      size: 16
    }), "Fazer checklist de pr\xE9-uso", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => openRdo(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "file-text",
      size: 16
    }), "Di\xE1rio de obra \xB7 hoje", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => openMnt(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "wrench",
      size: 16
    }), "Solicitar manuten\xE7\xE3o", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => openPar(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "ban",
      size: 16
    }), "Registrar paralisa\xE7\xE3o", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => setScreen('via')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "truck",
      size: 16
    }), "Viagens de basculante", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => openMob(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "forklift",
      size: 16
    }), "Mobiliza\xE7\xE3o \xB7 prancha", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => openSig(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pencil",
      size: 16
    }), "Medi\xE7\xE3o \xB7 assinatura do cliente", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => setScreen('mapa')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map-pin",
      size: 16
    }), "Mapa da obra \xB7 como chegar", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Progresso"), /*#__PURE__*/React.createElement("div", {
      className: "ac-prog"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("b", null, fmtH(done), " h"), /*#__PURE__*/React.createElement("span", null, "de ", os.prevH, " h previstas \xB7 ", pct, "%")), /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: pct + '%'
      }
    })))), /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, "Meus apontamentos nesta OS"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card",
      style: {
        marginBottom: 14
      }
    }, apts.length === 0 && /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, "Nenhum apontamento seu ainda."))), apts.map((a, i) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: i,
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--muted",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, a.d), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, a.hm ? /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, a.hm) : 'registrado hoje')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        font: '600 13px var(--font-mono)'
      }
    }, a.h), /*#__PURE__*/React.createElement("span", {
      className: a.sync ? 'ac-syncmini' : 'ac-syncmini ac-syncmini--pend'
    }, /*#__PURE__*/React.createElement(Icon, {
      name: a.sync ? 'check' : 'clock',
      size: 10,
      strokeWidth: 2.4
    }), a.sync ? 'sincronizado' : 'no aparelho'))))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Escopo"), /*#__PURE__*/React.createElement("div", {
      className: "ac-escopo"
    }, os.escopo))), /*#__PURE__*/React.createElement("div", {
      className: "ac-det-actions"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      onClick: () => openApont(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "gauge",
      size: 18
    }), "Apontar horas"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big ac-big--ghost",
      onClick: () => {
        setScreen('app');
        setTab('fuel');
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "fuel",
      size: 17
    }), "Abastecer")));
  }

  /* ---------- Checklist do equipamento ---------- */
  if (screen === 'chk') {
    const done = Object.keys(chk).length;
    const noks = Object.values(chk).filter(v => v === 'nok').length;
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Checklist do equipamento"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Checklist"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, done, "/", AC_CHK.length)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Pr\xE9-uso \xB7 hoje"), /*#__PURE__*/React.createElement("div", {
      className: "ac-eq"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: os.eqIc,
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, os.eq), /*#__PURE__*/React.createElement("span", {
      className: "hm"
    }, "hor\xEDm. ", fmtH(os.h0)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, AC_CHK.map((it, i) => /*#__PURE__*/React.createElement("div", {
      className: "ac-chk",
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, it.t), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, it.m)), /*#__PURE__*/React.createElement("div", {
      className: "btns"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Conforme",
      className: chk[i] === 'ok' ? 'ok on' : 'ok',
      onClick: () => setChk({
        ...chk,
        [i]: 'ok'
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.4
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "N\xE3o conforme",
      className: chk[i] === 'nok' ? 'nok on' : 'nok',
      onClick: () => setChk({
        ...chk,
        [i]: 'nok'
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "ban",
      size: 16,
      strokeWidth: 2.2
    })))))), noks > 0 && /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-alert",
      size: 15
    }), "Itens n\xE3o conformes ser\xE3o enviados \xE0 ", /*#__PURE__*/React.createElement("b", null, "Manuten\xE7\xE3o"), " ao confirmar."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      disabled: done < AC_CHK.length,
      onClick: confirmChk
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.2
    }), done < AC_CHK.length ? `Responda os ${AC_CHK.length} itens` : 'Concluir checklist'))));
  }

  /* ---------- Diário de obra (RDO) ---------- */
  if (screen === 'rdo') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Di\xE1rio de obra"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Di\xE1rio de obra"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Hoje \xB7 sex, 11/07"), /*#__PURE__*/React.createElement("div", {
      className: "ac-eq"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map-pin",
      size: 17
    })), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 13
      }
    }, os.local))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Clima \u2014 manh\xE3"), /*#__PURE__*/React.createElement("div", {
      className: "ac-seg"
    }, AC_CLIMAS.map(([id, ic, lb]) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: id,
      className: climaM === id ? 'on' : '',
      onClick: () => setClimaM(id)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 17
    }), lb)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Clima \u2014 tarde"), /*#__PURE__*/React.createElement("div", {
      className: "ac-seg"
    }, AC_CLIMAS.map(([id, ic, lb]) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: id,
      className: climaT === id ? 'on' : '',
      onClick: () => setClimaT(id)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 17
    }), lb)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Equipe em campo"), /*#__PURE__*/React.createElement("div", {
      className: "ac-stepper"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Diminuir",
      onClick: () => setEquipe(Math.max(1, equipe - 1))
    }, "\u2212"), /*#__PURE__*/React.createElement("div", {
      className: "val"
    }, /*#__PURE__*/React.createElement("b", null, equipe), /*#__PURE__*/React.createElement("span", null, "pessoas")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Aumentar",
      onClick: () => setEquipe(equipe + 1)
    }, "+"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field ac-obs"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Atividades executadas"), /*#__PURE__*/React.createElement("textarea", {
      placeholder: "Ex.: corte e aterro no plat\xF4 norte, 2 viagens de bota-fora\u2026"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ac-field ac-obs"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Ocorr\xEAncias (opcional)"), /*#__PURE__*/React.createElement("textarea", {
      placeholder: "Ex.: chuva paralisou a frente das 14h \xE0s 15h30\u2026"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Foto da frente de servi\xE7o"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 150,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("image-slot", {
      id: 'rdo-' + os.n,
      shape: "rect",
      placeholder: "Toque ou arraste a foto do dia"
    }))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      disabled: !climaT,
      onClick: confirmRdo
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.2
    }), climaT ? 'Enviar diário de hoje' : 'Informe o clima da tarde'), /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, "Di\xE1rios anteriores desta OS"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, AC_RDO_PREV.map((r, i) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: i,
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--muted",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "file-text",
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, r.d), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, r.clima, " \xB7 ", r.eq, " pessoas \xB7 ", r.h)), /*#__PURE__*/React.createElement("span", {
      className: "ac-syncmini"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 10,
      strokeWidth: 2.4
    }), "enviado"))))));
  }

  /* ---------- Solicitar manutenção ---------- */
  if (screen === 'mnt') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Solicitar manuten\xE7\xE3o"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Solicitar manuten\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Equipamento"), /*#__PURE__*/React.createElement("div", {
      className: "ac-eq"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: os.eqIc,
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, os.eq), /*#__PURE__*/React.createElement("span", {
      className: "hm"
    }, "hor\xEDm. ", fmtH(os.h0)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Qual o problema?"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, AC_MNT_TIPOS.map(([id, ic, t, m]) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: id,
      onClick: () => setMntTipo(id),
      style: {
        background: mntTipo === id ? 'var(--surface-2)' : undefined
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: id === 'eletrica' ? 'atp-tile' : 'atp-tile atp-tile--amber',
      style: id === 'eletrica' ? {
        width: 34,
        height: 34,
        background: 'var(--danger-soft)',
        color: 'var(--danger-fg)'
      } : {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 17
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, t), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, m)), mntTipo === id && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 17,
      style: {
        color: 'var(--amarelo)'
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Urg\xEAncia"), /*#__PURE__*/React.createElement("div", {
      className: "ac-seg",
      style: {
        gridTemplateColumns: '1fr 1fr'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: mntUrg === 'pode' ? 'on' : '',
      onClick: () => setMntUrg('pode')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 17
    }), "Pode aguardar"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: mntUrg === 'parado' ? 'on ac-seg-danger' : 'ac-seg-danger',
      onClick: () => setMntUrg('parado')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "ban",
      size: 17
    }), "M\xE1quina parada"))), mntUrg === 'parado' && /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-alert",
      size: 15
    }), "M\xE1quina parada abre chamado ", /*#__PURE__*/React.createElement("b", null, "corretivo priorit\xE1rio"), " e avisa a retaguarda na hora."), /*#__PURE__*/React.createElement("div", {
      className: "ac-field ac-obs",
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Observa\xE7\xE3o"), /*#__PURE__*/React.createElement("textarea", {
      placeholder: "Ex.: vazamento no cilindro da lan\xE7a, come\xE7ou hoje cedo\u2026"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Foto do problema (opcional)"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 140,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("image-slot", {
      id: 'mnt-' + os.n,
      shape: "rect",
      placeholder: "Toque ou arraste uma foto do problema"
    }))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      disabled: !mntTipo,
      onClick: confirmMnt
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "wrench",
      size: 18
    }), mntTipo ? 'Enviar solicitação' : 'Selecione o problema')));
  }

  /* ---------- Assinatura da medição ---------- */
  if (screen === 'sig') {
    const feitasHoje = hoje.filter(a => a.os === os.n).reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Assinatura do cliente"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Assinatura da medi\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Medi\xE7\xE3o #2 \xB7 01/07 \u2013 11/07"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card",
      style: {
        padding: '13px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: os.eqIc,
      size: 17
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13.5
      }
    }, os.t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--muted-2)',
        marginTop: 3
      }
    }, os.cli, " \xB7 ", os.local))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 18,
        paddingTop: 10,
        borderTop: '1px solid var(--border-soft)',
        font: '600 12.5px var(--font-mono)'
      }
    }, /*#__PURE__*/React.createElement("span", null, fmtH(os.doneH + feitasHoje), " h no per\xEDodo"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted-2)'
      }
    }, os.eq)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Respons\xE1vel no cliente"), /*#__PURE__*/React.createElement("input", {
      className: "ac-input",
      type: "text",
      value: sigName,
      placeholder: "Nome de quem acompanha a obra",
      onChange: e => setSigName(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k",
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    }, "Assinatura", hasSig && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-marklidas",
      style: {
        padding: 0
      },
      onClick: sigClear
    }, "Limpar")), /*#__PURE__*/React.createElement("div", {
      className: "ac-sig"
    }, /*#__PURE__*/React.createElement("canvas", {
      ref: sigCanvas,
      width: 640,
      height: 280,
      onPointerDown: sigDown,
      onPointerMove: sigMove,
      onPointerUp: sigUp,
      onPointerLeave: sigUp
    }), !hasSig && /*#__PURE__*/React.createElement("span", {
      className: "ph"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pencil",
      size: 15
    }), "Assine aqui com o dedo"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn",
      style: {
        background: 'var(--amarelo-soft)',
        borderColor: 'rgba(255,179,0,.26)',
        color: 'var(--muted)',
        marginTop: 0,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), "A assinatura confirma as ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg)'
      }
    }, "horas executadas"), " \u2014 valores s\xE3o tratados pela retaguarda."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      disabled: !hasSig || !sigName.trim(),
      onClick: confirmSig
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.2
    }), !hasSig ? 'Colete a assinatura' : !sigName.trim() ? 'Informe o responsável' : 'Confirmar medição')));
  }

  /* ---------- Sincronização / modo offline ---------- */
  if (screen === 'sync') {
    const pend = [...hoje.map((a, i) => ({
      ic: 'gauge',
      t: 'Apontamento · ' + a.os,
      m: a.h + ' registradas hoje',
      sz: '2 KB',
      key: 'a' + i
    })), {
      ic: 'file-text',
      t: 'Diário de obra · OS-021',
      m: 'texto + 1 foto da frente',
      sz: '1,8 MB',
      key: 'rdo'
    }, {
      ic: 'pencil',
      t: 'Assinatura de medição',
      m: 'Medição #2 · OS-021',
      sz: '64 KB',
      key: 'sig'
    }];
    const online = syncedAll;
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Modo offline"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('app')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Sincroniza\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
      className: "osn",
      style: online ? {
        color: 'var(--success-fg)',
        background: 'var(--success-soft)',
        borderColor: 'rgba(76,122,63,.3)'
      } : undefined
    }, online ? 'em dia' : pend.length + ' pendentes')), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll"
    }, /*#__PURE__*/React.createElement("div", {
      className: online ? 'ac-conn ac-conn--on' : 'ac-conn'
    }, /*#__PURE__*/React.createElement("span", {
      className: "led"
    }), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("b", null, syncing ? 'Sincronizando…' : online ? 'Conectado — tudo enviado' : 'Sem conexão no canteiro'), /*#__PURE__*/React.createElement("span", null, syncing ? 'enviando ' + pend.length + ' itens pela rede' : online ? 'última sincronização · ' + lastSync : 'seus registros ficam salvos no aparelho')), !online && !syncing && /*#__PURE__*/React.createElement(Icon, {
      name: "smartphone",
      size: 20,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), syncing && /*#__PURE__*/React.createElement("span", {
      className: "ac-spin"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "history",
      size: 20
    })), online && /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check-big",
      size: 20,
      style: {
        color: 'var(--success-fg)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "ac-tiles",
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-tile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "No aparelho"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, online ? 0 : pend.length, /*#__PURE__*/React.createElement("small", null, " itens"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-tile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Espa\xE7o usado"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, "4,2", /*#__PURE__*/React.createElement("small", null, " MB")))), /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, online ? 'Enviados agora' : 'Fila de envio'), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, pend.map(p => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: p.key,
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: p.ic,
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, p.t), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, p.m)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 10.5px var(--font-mono)',
        color: 'var(--muted-2)'
      }
    }, p.sz), /*#__PURE__*/React.createElement("span", {
      className: online ? 'ac-syncmini' : 'ac-syncmini ac-syncmini--pend'
    }, /*#__PURE__*/React.createElement(Icon, {
      name: online ? 'check' : 'clock',
      size: 10,
      strokeWidth: 2.4
    }), online ? 'sincronizado' : 'aguardando'))))), /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn",
      style: {
        background: 'var(--amarelo-soft)',
        borderColor: 'rgba(255,179,0,.26)',
        color: 'var(--muted)',
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), "O app funciona ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg)'
      }
    }, "offline por padr\xE3o"), ": tudo \xE9 salvo no aparelho e enviado sozinho quando a rede volta. Nada se perde ao fechar o app."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      disabled: syncing || online,
      onClick: doSync
    }, syncing ? /*#__PURE__*/React.createElement("span", {
      className: "ac-spin"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "history",
      size: 18
    })) : /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up-right",
      size: 18
    }), online ? 'Tudo sincronizado' : syncing ? 'Sincronizando…' : 'Tentar sincronizar agora'))));
  }

  /* ---------- Mapa da obra ---------- */
  if (screen === 'mapa') {
    const r = AC_ROTAS[os.n] || AC_ROTAS['OS-021'];
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Mapa da obra"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Mapa da obra"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "acm-wrap"
    }, /*#__PURE__*/React.createElement("div", {
      ref: mapaEl,
      className: "acm-map"
    }), mapErr && /*#__PURE__*/React.createElement("div", {
      className: "acm-fallback"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Icon, {
      name: "map-pin",
      size: 22
    }), /*#__PURE__*/React.createElement("br", null), "Mapa indispon\xEDvel offline \u2014 destino: ", os.local)), /*#__PURE__*/React.createElement("div", {
      className: "acm-info"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map-pin",
      size: 17
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("b", null, os.local), /*#__PURE__*/React.createElement("span", null, os.cli, " \xB7 ", os.t))), /*#__PURE__*/React.createElement("div", {
      className: "row stats"
    }, /*#__PURE__*/React.createElement("span", {
      className: "st"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "truck",
      size: 14
    }), r.km), /*#__PURE__*/React.createElement("span", {
      className: "st"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 14
    }), r.min, " da base")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up-right",
      size: 18
    }), "Abrir rota no GPS"))));
  }

  /* ---------- Alertas de segurança ---------- */
  if (screen === 'seg') {
    const pend = AC_SEG.filter(a => !segAck[a.id]).length + (ddsOk ? 0 : 1);
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Alertas de seguran\xE7a"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('app')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Seguran\xE7a"), /*#__PURE__*/React.createElement("span", {
      className: "osn",
      style: pend === 0 ? {
        color: 'var(--success-fg)',
        background: 'var(--success-soft)',
        borderColor: 'rgba(76,122,63,.3)'
      } : undefined
    }, pend === 0 ? 'tudo ciente' : pend + ' pendentes')), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-sec",
      style: {
        marginTop: 0
      }
    }, "DDS de hoje \xB7 sex, 11/07"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card",
      style: {
        padding: '14px 15px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "hard-hat",
      size: 17
    })), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 14
      }
    }, AC_DDS.tema)), /*#__PURE__*/React.createElement("ul", {
      className: "ac-dds"
    }, AC_DDS.pontos.map((p, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 13,
      strokeWidth: 2.4
    }), p))), ddsOk ? /*#__PURE__*/React.createElement("div", {
      className: "ac-ackok"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check-big",
      size: 15
    }), "Participa\xE7\xE3o confirmada \xB7 agora") : /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      style: {
        minHeight: 46
      },
      onClick: () => setDdsOk(true)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 17,
      strokeWidth: 2.2
    }), "Participei do DDS de hoje")), /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, "Alertas ativos"), AC_SEG.map(a => {
      const ok = !!segAck[a.id];
      return /*#__PURE__*/React.createElement("div", {
        className: a.sev === 'critico' ? 'ac-alert ac-alert--crit' : 'ac-alert',
        key: a.id
      }, /*#__PURE__*/React.createElement("div", {
        className: "row"
      }, /*#__PURE__*/React.createElement("span", {
        className: "ic"
      }, /*#__PURE__*/React.createElement(Icon, {
        name: a.ic,
        size: 17
      })), /*#__PURE__*/React.createElement("div", {
        className: "bd"
      }, /*#__PURE__*/React.createElement("div", {
        className: "tt"
      }, a.t), /*#__PURE__*/React.createElement("div", {
        className: "mm"
      }, a.m)), /*#__PURE__*/React.createElement("span", {
        className: a.sev === 'critico' ? 'atp-status atp-status--danger' : 'atp-status atp-status--amber',
        style: {
          flex: 'none'
        }
      }, a.sev === 'critico' ? 'Crítico' : 'Atenção')), ok ? /*#__PURE__*/React.createElement("div", {
        className: "ac-ackok"
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "circle-check-big",
        size: 15
      }), "Ciente \xB7 confirmado agora") : /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "ac-big ac-big--ghost",
        style: {
          minHeight: 44
        },
        onClick: () => setSegAck({
          ...segAck,
          [a.id]: true
        })
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 16,
        strokeWidth: 2.2
      }), "Confirmar ci\xEAncia"));
    }), /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn",
      style: {
        background: 'var(--amarelo-soft)',
        borderColor: 'rgba(255,179,0,.26)',
        color: 'var(--muted)',
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), "As confirma\xE7\xF5es ficam registradas na OS e vis\xEDveis para a ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg)'
      }
    }, "retaguarda"), ".")));
  }

  /* ---------- Ficha do equipamento ---------- */
  if (screen === 'eqf') {
    const f = AC_FICHA[os.eq] || AC_FICHA['Escavadeira CAT 320'];
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Ficha do equipamento"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Equipamento"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("image-slot", {
      id: 'eqf-' + f.serie,
      shape: "rect",
      placeholder: 'Foto — ' + os.eq
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--brand",
      style: {
        width: 40,
        height: 40
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: os.eqIc,
      size: 20
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: '800 15px/1.15 var(--font-display)',
        textTransform: 'uppercase'
      }
    }, os.eq), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--muted-2)',
        marginTop: 3
      }
    }, "alocada na ", os.n, " \xB7 ", os.cli)), /*#__PURE__*/React.createElement(StatusChip, {
      tone: "amber",
      led: true
    }, "Em obra")), /*#__PURE__*/React.createElement("div", {
      className: "ac-card",
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-datarow",
      style: {
        borderTop: 'none'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "gauge",
      size: 16
    }), /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("span", {
      className: "v mono"
    }, fmtH(os.h0), " h")), /*#__PURE__*/React.createElement("div", {
      className: "ac-datarow"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 16
    }), /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Ano"), /*#__PURE__*/React.createElement("span", {
      className: "v mono"
    }, f.ano)), /*#__PURE__*/React.createElement("div", {
      className: "ac-datarow"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "id-card",
      size: 16
    }), /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "S\xE9rie"), /*#__PURE__*/React.createElement("span", {
      className: "v mono"
    }, f.serie)), /*#__PURE__*/React.createElement("div", {
      className: "ac-datarow"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "fuel",
      size: 16
    }), /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Consumo"), /*#__PURE__*/React.createElement("span", {
      className: "v mono"
    }, f.consumo, " ", /*#__PURE__*/React.createElement("small", {
      style: {
        color: 'var(--muted-2)'
      }
    }, "m\xE9dio")))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Pr\xF3xima manuten\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      className: "ac-prog"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("b", {
      style: f.late ? {
        color: 'var(--danger-fg)'
      } : undefined
    }, f.prox), /*#__PURE__*/React.createElement("span", {
      style: f.late ? {
        color: 'var(--danger-fg)'
      } : undefined
    }, f.proxIn)), /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: f.proxPct + '%',
        background: f.late ? 'var(--danger)' : undefined
      }
    })))), /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, "\xDAltimas manuten\xE7\xF5es"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card",
      style: {
        marginBottom: 14
      }
    }, f.mnts.map(([d, t], i) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: i,
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--muted",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "wrench",
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, t), /*#__PURE__*/React.createElement("div", {
      className: "m mono"
    }, d))))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => openChk(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check-big",
      size: 16
    }), "Checklist de pr\xE9-uso", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-chk-open",
      onClick: () => openMnt(os)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "wrench",
      size: 16
    }), "Solicitar manuten\xE7\xE3o", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        marginLeft: 'auto'
      }
    }))));
  }

  /* ---------- Registro de paralisação ---------- */
  if (screen === 'par') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Registro de paralisa\xE7\xE3o"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Paralisa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Motivo da parada"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, AC_PAR_MOTIVOS.map(([id, ic, t, m]) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: id,
      onClick: () => setParMotivo(id),
      style: {
        background: parMotivo === id ? 'var(--surface-2)' : undefined
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 17
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, t), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, m)), parMotivo === id && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 17,
      style: {
        color: 'var(--amarelo)'
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Dura\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
      className: "ac-stepper"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Diminuir",
      onClick: () => setParDur(Math.max(0.5, parDur - 0.5))
    }, "\u2212"), /*#__PURE__*/React.createElement("div", {
      className: "val"
    }, /*#__PURE__*/React.createElement("b", null, fmtH(parDur), " h"), /*#__PURE__*/React.createElement("span", null, "frente parada")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Aumentar",
      onClick: () => setParDur(parDur + 0.5)
    }, "+"))), parMotivo === 'quebra' && /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-alert",
      size: 15
    }), "Quebra de m\xE1quina? Abra tamb\xE9m uma ", /*#__PURE__*/React.createElement("b", null, "solicita\xE7\xE3o de manuten\xE7\xE3o"), " na tela do equipamento."), /*#__PURE__*/React.createElement("div", {
      className: "ac-field ac-obs",
      style: {
        marginTop: parMotivo === 'quebra' ? 14 : 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Observa\xE7\xE3o (opcional)"), /*#__PURE__*/React.createElement("textarea", {
      placeholder: "Ex.: chuva forte das 13h \xE0s 14h30, frente alagada\u2026"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn",
      style: {
        background: 'var(--amarelo-soft)',
        borderColor: 'rgba(255,179,0,.26)',
        color: 'var(--muted)',
        marginTop: 0,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), "A paralisa\xE7\xE3o entra no ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg)'
      }
    }, "di\xE1rio de obra"), " e justifica horas menores na medi\xE7\xE3o."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      disabled: !parMotivo,
      onClick: confirmPar
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.2
    }), parMotivo ? 'Registrar paralisação' : 'Selecione o motivo'), /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, "Paralisa\xE7\xF5es recentes"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, AC_PAR_PREV.map((p, i) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: i,
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--muted",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "ban",
      size: 15
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, p.m, " \xB7 ", p.os), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, p.d)), /*#__PURE__*/React.createElement("b", {
      style: {
        font: '600 13px var(--font-mono)'
      }
    }, p.h))))));
  }

  /* ---------- Espelho de horas ---------- */
  if (screen === 'esp') {
    const addHoje = hoje.reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0) - 5.5;
    const total = AC_ESP.base + addHoje;
    const media = total / AC_ESP.dias;
    const maxOS = Math.max(...AC_ESP.porOS.map(([,, h]) => h));
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Espelho de horas"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('app')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Espelho de horas"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, AC_ESP.mes)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-tiles",
      style: {
        gridTemplateColumns: '1fr 1fr 1fr'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-tile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "No m\xEAs"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, fmtH(total), /*#__PURE__*/React.createElement("small", null, " h"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-tile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Dias"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, AC_ESP.dias)), /*#__PURE__*/React.createElement("div", {
      className: "ac-tile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "M\xE9dia/dia"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, fmtH(media), /*#__PURE__*/React.createElement("small", null, " h")))), /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, "Por ordem de servi\xE7o"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, AC_ESP.porOS.map(([n, t, h]) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: n,
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "osn",
      style: {
        width: 'auto'
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        borderRadius: 2,
        background: 'var(--surface-2)',
        marginTop: 7
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        display: 'block',
        height: '100%',
        borderRadius: 2,
        width: h / maxOS * 100 + '%',
        background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))'
      }
    }))), /*#__PURE__*/React.createElement("b", {
      style: {
        font: '600 13px var(--font-mono)',
        flex: 'none'
      }
    }, fmtH(h), " h")))), /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, "Por semana"), /*#__PURE__*/React.createElement("div", {
      className: "ac-card",
      style: {
        marginBottom: 14
      }
    }, AC_ESP.semanas.map(([s, h]) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: s,
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--muted",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, s), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, s.startsWith('S2') ? 'inclui os apontamentos de hoje' : 'semana fechada')), /*#__PURE__*/React.createElement("b", {
      style: {
        font: '600 13px var(--font-mono)'
      }
    }, fmtH(s.startsWith('S2') ? h + addHoje : h), " h")))), /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn",
      style: {
        background: 'var(--amarelo-soft)',
        borderColor: 'rgba(255,179,0,.26)',
        color: 'var(--muted)',
        marginTop: 0,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), "Confira suas horas at\xE9 ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg)'
      }
    }, AC_ESP.confira), " \u2014 o fechamento do m\xEAs \xE9 em ", AC_ESP.fecha, ". Valores de folha s\xE3o tratados pela retaguarda."), espOk ? /*#__PURE__*/React.createElement("div", {
      className: "ac-ackok",
      style: {
        minHeight: 48
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check-big",
      size: 16
    }), "Horas conferidas \xB7 confirmado agora") : /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      onClick: () => {
        setEspOk(true);
        setEspDiv(false);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.2
    }), "Confirmar minhas horas"), !espOk && !espDiv && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big ac-big--ghost",
      onClick: () => setEspDiv(true)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-alert",
      size: 17
    }), "Apontar diverg\xEAncia")), espDiv && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field ac-obs"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Qual a diverg\xEAncia?"), /*#__PURE__*/React.createElement("textarea", {
      placeholder: "Ex.: dia 08/07 trabalhei 8 h na OS-024, o espelho mostra 6 h\u2026"
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      onClick: () => {
        setEspDiv(false);
        setOkInfo({
          title: 'Divergência enviada',
          lines: [['Espelho', AC_ESP.mes], ['Status', 'em análise pela retaguarda'], ['Registrado', 'no aparelho · sincroniza ao conectar']]
        });
        setScreen('ok');
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up-right",
      size: 18
    }), "Enviar diverg\xEAncia"))));
  }

  /* ---------- Escala da semana ---------- */
  if (screen === 'esc') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Escala da semana"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('app')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Minha escala"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, "12\u201318/07")), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, AC_ESC.map((e, i) => {
      const alvo = e.os ? AC_OS.find(x => x.n === e.os) : null;
      return /*#__PURE__*/React.createElement("div", {
        className: "ac-osrow",
        key: i,
        onClick: alvo ? () => openDet(alvo) : undefined,
        style: e.tag ? {
          background: 'rgba(255,179,0,.05)',
          cursor: alvo ? 'pointer' : 'default'
        } : alvo ? undefined : {
          cursor: 'default'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 52,
          flex: 'none'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          font: '700 11px/1 var(--font-mono)',
          color: e.tag ? 'var(--amarelo)' : 'var(--fg)'
        }
      }, e.d.split(', ')[0]), /*#__PURE__*/React.createElement("div", {
        style: {
          font: '500 10px/1 var(--font-mono)',
          color: 'var(--muted-2)',
          marginTop: 4
        }
      }, e.d.split(', ')[1])), /*#__PURE__*/React.createElement("span", {
        className: "atp-tile atp-tile--amber",
        style: {
          width: 34,
          height: 34
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: e.ic,
        size: 17
      })), /*#__PURE__*/React.createElement("div", {
        className: "bd"
      }, /*#__PURE__*/React.createElement("div", {
        className: "t"
      }, e.t), /*#__PURE__*/React.createElement("div", {
        className: "m"
      }, e.m)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 5,
          flex: 'none'
        }
      }, e.os ? /*#__PURE__*/React.createElement("span", {
        className: "osn",
        style: {
          width: 'auto'
        }
      }, e.os) : /*#__PURE__*/React.createElement(StatusChip, {
        tone: "amber",
        led: true
      }, "Base"), e.tag && /*#__PURE__*/React.createElement("span", {
        className: "ac-syncmini ac-syncmini--pend"
      }, e.tag), e.mud && /*#__PURE__*/React.createElement("span", {
        className: "ac-syncmini",
        style: {
          color: 'var(--info-fg)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "info",
        size: 10,
        strokeWidth: 2.4
      }), "alterada")));
    })), /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn",
      style: {
        background: 'var(--amarelo-soft)',
        borderColor: 'rgba(255,179,0,.26)',
        color: 'var(--muted)',
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), "A escala \xE9 definida pela retaguarda e pode mudar \u2014 altera\xE7\xF5es chegam por ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg)'
      }
    }, "notifica\xE7\xE3o"), ". Toque num dia para abrir a OS.")));
  }

  /* ---------- Viagens de basculante ---------- */
  if (screen === 'via') {
    const r = AC_VIA_ROTA[os.n] || AC_VIA_ROTA['OS-021'];
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Viagens de basculante"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Viagens"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Material"), /*#__PURE__*/React.createElement("div", {
      className: "ac-seg"
    }, AC_VIA_MAT.map(([id, lb]) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: id,
      className: viaMat === id ? 'on' : '',
      onClick: () => setViaMat(id),
      style: {
        minHeight: 46
      }
    }, lb)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Trajeto \xB7 ida e volta"), /*#__PURE__*/React.createElement("div", {
      className: "ac-eq"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map-pin",
      size: 17
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 13
      }
    }, os.local.split(' — ')[0], " \u2192 ", r.dest)), /*#__PURE__*/React.createElement("span", {
      className: "hm"
    }, r.km.toLocaleString('pt-BR', {
      minimumFractionDigits: 1
    }), " km"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-via"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Viagens hoje"), /*#__PURE__*/React.createElement("div", {
      className: "n"
    }, viaCount), /*#__PURE__*/React.createElement("div", {
      className: "s"
    }, "\xFAltima \xB7 ", viaLast, " \xB7 ca\xE7amba 12 m\xB3"), /*#__PURE__*/React.createElement("div", {
      className: "btns"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "undo",
      "aria-label": "Desfazer",
      disabled: viaCount === 0,
      onClick: () => setViaCount(Math.max(0, viaCount - 1))
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "add",
      onClick: () => {
        setViaCount(viaCount + 1);
        setViaLast('agora');
      }
    }, "+1 viagem"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-tiles",
      style: {
        margin: '12px 0 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-tile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Volume estimado"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, viaCount * 12, /*#__PURE__*/React.createElement("small", null, " m\xB3"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-tile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "k"
    }, "Rodados"), /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, (viaCount * r.km * 2).toLocaleString('pt-BR', {
      maximumFractionDigits: 1
    }), /*#__PURE__*/React.createElement("small", null, " km")))), /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn",
      style: {
        background: 'var(--amarelo-soft)',
        borderColor: 'rgba(255,179,0,.26)',
        color: 'var(--muted)',
        marginTop: 0,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), "Cada toque fica salvo no aparelho na hora \u2014 as viagens entram na ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg)'
      }
    }, "medi\xE7\xE3o"), " da OS."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      disabled: viaCount === 0,
      onClick: confirmVia
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.2
    }), "Encerrar dia \xB7 ", viaCount, " viagens")));
  }

  /* ---------- Mobilização / prancha ---------- */
  if (screen === 'mob') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Mobiliza\xE7\xE3o / prancha"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('osdet')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Prancha"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, os.n)), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll",
      style: {
        paddingBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Tipo de transporte"), /*#__PURE__*/React.createElement("div", {
      className: "ac-seg"
    }, AC_MOB_TIPOS.map(([id, lb]) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      key: id,
      className: mobTipo === id ? 'on' : '',
      onClick: () => setMobTipo(id),
      style: {
        minHeight: 46,
        fontSize: 10.5
      }
    }, lb)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Equipamento na prancha"), /*#__PURE__*/React.createElement("div", {
      className: "ac-eq"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: os.eqIc,
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, os.eq), /*#__PURE__*/React.createElement("span", {
      className: "hm"
    }, "hor\xEDm. ", fmtH(os.h0)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Trajeto"), /*#__PURE__*/React.createElement("div", {
      className: "ac-eq"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map-pin",
      size: 17
    })), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 13,
        flex: 1,
        minWidth: 0
      }
    }, mobTrajeto(os, mobTipo)))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Quil\xF4metros de prancha"), /*#__PURE__*/React.createElement("div", {
      className: "ac-stepper"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Diminuir",
      onClick: () => setMobKm(Math.max(1, mobKm - 1))
    }, "\u2212"), /*#__PURE__*/React.createElement("div", {
      className: "val"
    }, /*#__PURE__*/React.createElement("b", null, mobKm.toLocaleString('pt-BR', {
      maximumFractionDigits: 1
    }), " km"), /*#__PURE__*/React.createElement("span", null, "s\xF3 ida \xB7 conforme od\xF4metro")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Aumentar",
      onClick: () => setMobKm(mobKm + 1)
    }, "+"))), /*#__PURE__*/React.createElement("div", {
      className: "ac-field ac-obs"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Observa\xE7\xE3o (opcional)"), /*#__PURE__*/React.createElement("textarea", {
      placeholder: "Ex.: sa\xEDda 06h40, escolta no trecho da RS-344\u2026"
    })), /*#__PURE__*/React.createElement("div", {
      className: "ac-field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Foto do equipamento carregado"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 140,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("image-slot", {
      id: 'mob-' + os.n,
      shape: "rect",
      placeholder: "Toque ou arraste a foto na prancha"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "ac-chk-warn",
      style: {
        background: 'var(--amarelo-soft)',
        borderColor: 'rgba(255,179,0,.26)',
        color: 'var(--muted)',
        marginTop: 0,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: 'var(--amarelo-dim)'
      }
    }), "Os km de prancha entram no ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg)'
      }
    }, "faturamento da OS"), " pela tabela de pre\xE7os \u2014 valores ficam na retaguarda."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-big",
      onClick: confirmMob
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      strokeWidth: 2.2
    }), "Registrar transporte")));
  }

  /* ---------- Histórico ---------- */
  if (screen === 'hist') {
    const semana = 29.5 + hoje.reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    const grupos = [{
      d: 'Hoje · sex, 11/07',
      rows: hoje.map(a => {
        const o = AC_OS.find(x => x.n === a.os) || AC_OS[0];
        return {
          os: a.os,
          eq: o.eq,
          eqIc: o.eqIc,
          hm: null,
          h: a.h,
          sync: syncedAll
        };
      }).reverse()
    }, ...AC_HIST];
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Hist\xF3rico de apontamentos"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('app')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Hist\xF3rico"), /*#__PURE__*/React.createElement("span", {
      className: "osn"
    }, fmtH(semana), " h na semana")), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll"
    }, grupos.map(g => g.rows.length > 0 && /*#__PURE__*/React.createElement("div", {
      key: g.d
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, g.d), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, g.rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
      className: "ac-osrow",
      key: i,
      style: {
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 34,
        height: 34
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: r.eqIc,
      size: 17
    })), /*#__PURE__*/React.createElement("div", {
      className: "bd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, r.os, " \xB7 ", r.eq), /*#__PURE__*/React.createElement("div", {
      className: "m"
    }, r.hm ? /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, r.hm) : 'registrado hoje')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        font: '600 13px var(--font-mono)'
      }
    }, r.h), /*#__PURE__*/React.createElement("span", {
      className: r.sync ? 'ac-syncmini' : 'ac-syncmini ac-syncmini--pend'
    }, /*#__PURE__*/React.createElement(Icon, {
      name: r.sync ? 'check' : 'clock',
      size: 10,
      strokeWidth: 2.4
    }), r.sync ? 'sincronizado' : 'no aparelho')))))))));
  }

  /* ---------- Notificações ---------- */
  if (screen === 'notif') {
    return /*#__PURE__*/React.createElement("div", {
      className: "ac-app",
      "data-screen-label": "Notifica\xE7\xF5es"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-form-head"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Voltar",
      onClick: () => setScreen('app')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    })), /*#__PURE__*/React.createElement("b", null, "Notifica\xE7\xF5es"), naoLidas > 0 ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "ac-marklidas",
      onClick: () => setLidas(true)
    }, "Marcar lidas") : /*#__PURE__*/React.createElement("span", {
      className: "osn",
      style: {
        color: 'var(--muted-2)',
        background: 'var(--surface-2)',
        borderColor: 'var(--border)'
      }
    }, "em dia")), /*#__PURE__*/React.createElement("div", {
      className: "ac-scroll"
    }, AC_NOTIF.map(g => /*#__PURE__*/React.createElement("div", {
      key: g.d
    }, /*#__PURE__*/React.createElement("div", {
      className: "ac-sec"
    }, g.d), /*#__PURE__*/React.createElement("div", {
      className: "ac-card"
    }, g.rows.map((r, i) => {
      const alvo = r.os ? AC_OS.find(x => x.n === r.os) : null;
      const unread = r.unread && !lidas;
      return /*#__PURE__*/React.createElement("div", {
        className: unread ? 'ac-osrow ac-notif ac-notif--new' : 'ac-osrow ac-notif',
        key: i,
        onClick: alvo ? () => openDet(alvo) : undefined,
        style: alvo ? undefined : {
          cursor: 'default'
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: r.ic === 'circle-alert' ? 'atp-tile' : 'atp-tile atp-tile--amber',
        style: r.ic === 'circle-alert' ? {
          width: 34,
          height: 34,
          background: 'var(--danger-soft)',
          color: 'var(--danger-fg)'
        } : {
          width: 34,
          height: 34
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: r.ic,
        size: 17
      })), /*#__PURE__*/React.createElement("div", {
        className: "bd"
      }, /*#__PURE__*/React.createElement("div", {
        className: "t"
      }, r.t), /*#__PURE__*/React.createElement("div", {
        className: "m",
        style: {
          whiteSpace: 'normal'
        }
      }, r.m)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6,
          flex: 'none'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: '500 10.5px var(--font-mono)',
          color: 'var(--muted-2)'
        }
      }, r.hr), unread && /*#__PURE__*/React.createElement("span", {
        className: "ac-dot"
      })));
    }))))));
  }

  /* ---------- App (abas) ---------- */
  const totalHoje = hoje.reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "ac-app",
    "data-screen-label": 'Aba ' + tab
  }, tab === 'hoje' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "ac-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-avatar",
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      fontSize: 15
    }
  }, "AM"), /*#__PURE__*/React.createElement("div", {
    className: "hi"
  }, /*#__PURE__*/React.createElement("b", null, "Bom dia, Adelar"), /*#__PURE__*/React.createElement("span", null, "sexta, 11 de julho")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-bell",
    "aria-label": "Notifica\xE7\xF5es",
    onClick: () => setScreen('notif')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 19
  }), naoLidas > 0 && /*#__PURE__*/React.createElement("span", {
    className: "bd"
  }, naoLidas)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: syncedAll ? 'ac-sync' : 'ac-sync ac-sync--pend',
    onClick: () => setScreen('sync')
  }, /*#__PURE__*/React.createElement("i", null), syncedAll ? 'Sincronizado · ' + lastSync : hoje.length + 2 + ' no aparelho')), /*#__PURE__*/React.createElement("div", {
    className: "ac-scroll"
  }, (AC_SEG.some(a => !segAck[a.id]) || !ddsOk) && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-segban",
    onClick: () => setScreen('seg')
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "hard-hat",
    size: 17
  })), /*#__PURE__*/React.createElement("span", {
    className: "bd"
  }, /*#__PURE__*/React.createElement("b", null, "Alertas de seguran\xE7a"), /*#__PURE__*/React.createElement("span", null, AC_SEG.filter(a => !segAck[a.id]).length + (ddsOk ? 0 : 1), " pendentes \u2014 confirme ci\xEAncia antes de operar")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    className: "ac-sec"
  }, "Em andamento agora"), /*#__PURE__*/React.createElement("div", {
    className: "ac-card ac-active"
  }, /*#__PURE__*/React.createElement("div", {
    className: "top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "os"
  }, "OS-021"), /*#__PURE__*/React.createElement(StatusChip, {
    tone: "amber",
    led: true
  }, "Em andamento")), /*#__PURE__*/React.createElement("h3", null, "Terraplenagem \u2014 lote industrial"), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 12
  }), "Essavado Ltda."), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "gauge",
    size: 12
  }), "in\xEDcio 4.218,0"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 12
  }), "desde 07:42")), /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big ac-big--flat",
    onClick: () => openApont(AC_OS[0])
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "gauge",
    size: 17
  }), "Encerrar e apontar horas"))), /*#__PURE__*/React.createElement("div", {
    className: "ac-sec"
  }, "Hoje"), /*#__PURE__*/React.createElement("div", {
    className: "ac-tiles"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ac-tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Horas apontadas"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, fmtH(totalHoje), /*#__PURE__*/React.createElement("small", null, " h"))), /*#__PURE__*/React.createElement("div", {
    className: "ac-tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Apontamentos"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, hoje.length))), /*#__PURE__*/React.createElement("div", {
    className: "ac-sec",
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, "Minhas OS", /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setScreen('esc'),
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--amarelo)',
      font: '600 11px/1 var(--font-sans)',
      textTransform: 'none',
      letterSpacing: 0
    }
  }, "Minha escala ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 13
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ac-card"
  }, AC_OS.map(o => /*#__PURE__*/React.createElement("div", {
    className: "ac-osrow",
    key: o.n,
    onClick: () => openDet(o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 34,
      height: 34
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: o.eqIc,
    size: 17
  })), /*#__PURE__*/React.createElement("div", {
    className: "bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, o.cli, " \xB7 ", o.eq)), /*#__PURE__*/React.createElement("span", {
    className: "osn"
  }, o.n)))))), tab === 'os' && /*#__PURE__*/React.createElement("div", {
    className: "ac-scroll",
    style: {
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ac-head",
    style: {
      padding: '0 0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hi"
  }, /*#__PURE__*/React.createElement("b", null, "Minhas OS"), /*#__PURE__*/React.createElement("span", null, "3 ativas nesta semana"))), /*#__PURE__*/React.createElement("div", {
    className: "ac-card"
  }, AC_OS.map(o => /*#__PURE__*/React.createElement("div", {
    className: "ac-osrow",
    key: o.n,
    onClick: () => openDet(o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 34,
      height: 34
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: o.eqIc,
    size: 17
  })), /*#__PURE__*/React.createElement("div", {
    className: "bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, o.cli, " \xB7 hor\xEDm. ", fmtH(o.h0))), /*#__PURE__*/React.createElement("span", {
    className: "osn"
  }, o.n)))), /*#__PURE__*/React.createElement("div", {
    className: "ac-sec",
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, "Apontamentos de hoje", /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setScreen('hist'),
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--amarelo)',
      font: '600 11px/1 var(--font-sans)',
      textTransform: 'none',
      letterSpacing: 0
    }
  }, "Ver hist\xF3rico ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 13
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ac-card"
  }, hoje.map((a, i) => /*#__PURE__*/React.createElement("div", {
    className: "ac-osrow",
    key: i,
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--muted",
    style: {
      width: 34,
      height: 34
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    className: "bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, a.os), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, "registrado hoje")), /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 13px var(--font-mono)'
    }
  }, a.h))))), tab === 'fuel' && /*#__PURE__*/React.createElement("div", {
    className: "ac-scroll",
    style: {
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ac-head",
    style: {
      padding: '0 0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hi"
  }, /*#__PURE__*/React.createElement("b", null, "Abastecer"), /*#__PURE__*/React.createElement("span", null, "diesel do tanque interno"))), /*#__PURE__*/React.createElement("div", {
    className: "ac-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Equipamento"), /*#__PURE__*/React.createElement("div", {
    className: "ac-card"
  }, AC_OS.map(o => /*#__PURE__*/React.createElement("div", {
    className: "ac-osrow",
    key: o.n,
    onClick: () => setOs(o),
    style: {
      background: os.n === o.n ? 'var(--surface-2)' : undefined
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 34,
      height: 34
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: o.eqIc,
    size: 17
  })), /*#__PURE__*/React.createElement("div", {
    className: "bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, o.eq), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, o.n, " \xB7 hor\xEDm. ", fmtH(o.h0))), os.n === o.n && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 17,
    style: {
      color: 'var(--amarelo)'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "ac-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Litros"), /*#__PURE__*/React.createElement("div", {
    className: "ac-stepper"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Diminuir",
    onClick: () => setLitros(Math.max(10, litros - 10))
  }, "\u2212"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, /*#__PURE__*/React.createElement("b", null, litros, " L"), /*#__PURE__*/React.createElement("span", null, "diesel S10")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Aumentar",
    onClick: () => setLitros(litros + 10)
  }, "+"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big",
    onClick: confirmDiesel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "fuel",
    size: 18
  }), "Registrar abastecimento")), tab === 'perfil' && /*#__PURE__*/React.createElement("div", {
    className: "ac-scroll",
    style: {
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ac-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ac-perfil-hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-avatar atp-avatar--brand",
    style: {
      width: 54,
      height: 54,
      borderRadius: 15,
      fontSize: 20
    }
  }, "AM"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, "Adelar Machado"), /*#__PURE__*/React.createElement("div", {
    className: "sb"
  }, "Operador \xB7 CLT \xB7 Santo \xC2ngelo \u2014 RS"))), /*#__PURE__*/React.createElement("div", {
    className: "ac-datarow"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "id-card",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "CNH"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Categoria E \xB7 at\xE9 03/2028")), /*#__PURE__*/React.createElement("div", {
    className: "ac-datarow"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "phone",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Telefone"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "(55) 99912-3040")), /*#__PURE__*/React.createElement("div", {
    className: "ac-datarow"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "smartphone",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Vers\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "v0.1 \xB7 funda\xE7\xE3o"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big ac-big--ghost",
    onClick: () => setScreen('notif')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 17
  }), "Notifica\xE7\xF5es", naoLidas > 0 ? ` · ${naoLidas} novas` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big ac-big--ghost",
    onClick: () => setScreen('seg')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "hard-hat",
    size: 17
  }), "Alertas de seguran\xE7a")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big ac-big--ghost",
    onClick: () => setScreen('sync')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "smartphone",
    size: 17
  }), "Sincroniza\xE7\xE3o", syncedAll ? '' : ' · pendente')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big ac-big--ghost",
    onClick: () => setScreen('hist')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "history",
    size: 17
  }), "Hist\xF3rico de apontamentos")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big ac-big--ghost",
    onClick: () => setScreen('esc')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 17
  }), "Minha escala \xB7 12\u201318/07")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big ac-big--ghost",
    onClick: () => setScreen('esp')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 17
  }), "Espelho de horas \xB7 ", AC_ESP.mes)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ac-big ac-big--ghost",
    onClick: () => setScreen('pin')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "log-in",
    size: 17,
    style: {
      transform: 'scaleX(-1)'
    }
  }), "Sair"))), /*#__PURE__*/React.createElement("nav", {
    className: "ac-tabs"
  }, [['hoje', 'dashboard', 'Hoje'], ['os', 'clipboard-list', 'Minhas OS'], ['fuel', 'fuel', 'Abastecer'], ['perfil', 'user', 'Perfil']].map(([id, ic, lb]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    type: "button",
    className: tab === id ? 'ac-tab is-active' : 'ac-tab',
    onClick: () => setTab(id)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 19
  }), /*#__PURE__*/React.createElement("span", null, lb), /*#__PURE__*/React.createElement("span", {
    className: "dt"
  })))));
}
window.CampoApp = CampoApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app-campo/CampoApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app-campo/android-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).

/* BEGIN USAGE */
// Android.jsx — Simplified Android (Material 3) device frame
// Status bar + top app bar + content + gesture nav + keyboard.
// Based on Figma M3 spec. No dependencies, no image assets.
// Exports (to window): AndroidDevice, AndroidStatusBar, AndroidAppBar, AndroidListItem, AndroidNavBar, AndroidKeyboard
//
// Usage — wrap your screen content in <AndroidDevice> to get the bezel, status
// bar and gesture nav (props: title, large, keyboard, dark):
//
//   <AndroidDevice title="Inbox" large>
//     ...your screen content...
//   </AndroidDevice>
//   <AndroidDevice title="Compose" keyboard>…</AndroidDevice>
/* END USAGE */

const MD_C = {
  surface: '#f4fbf8',
  surfaceVariant: '#dae5e1',
  inverseOnSurface: '#ecf2ef',
  secondaryContainer: '#cde8e1',
  primaryFixedDim: '#83d5c6',
  onSurface: '#171d1b',
  onSurfaceVar: '#49454f',
  onPrimaryContainer: '#00201c',
  primary: '#006a60',
  frameBorder: 'rgba(116,119,117,0.5)'
};

// ─────────────────────────────────────────────────────────────
// Status bar (time left, wifi/cell/battery right)
// ─────────────────────────────────────────────────────────────
function AndroidStatusBar({
  dark = false
}) {
  const c = dark ? '#fff' : MD_C.onSurface;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      position: 'relative',
      fontFamily: 'Roboto, system-ui, sans-serif'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 128,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 400,
      letterSpacing: 0.25,
      lineHeight: '20px',
      color: c
    }
  }, "9:30")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: 8,
      transform: 'translateX(-50%)',
      width: 24,
      height: 24,
      borderRadius: 100,
      background: '#2e2e2e'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      paddingRight: 2
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    style: {
      marginRight: -2
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    style: {
      marginRight: -2
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14.67 14.67V1.33L1.33 14.67h13.34z",
    fill: c
  }))), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3.75",
    y: "2",
    width: "8.5",
    height: "13",
    rx: "1.5",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5.5",
    y: "0.9",
    width: "5",
    height: "2",
    rx: "0.5",
    fill: c
  }))));
}

// ─────────────────────────────────────────────────────────────
// Top app bar (Material 3 small/medium)
// ─────────────────────────────────────────────────────────────
function AndroidAppBar({
  title = 'Title',
  large = false
}) {
  const iconDot = /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: MD_C.onSurfaceVar,
      opacity: 0.3
    }
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: MD_C.surface,
      padding: '4px 4px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, iconDot, !large && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 22,
      fontWeight: 400,
      color: MD_C.onSurface,
      fontFamily: 'Roboto, system-ui, sans-serif'
    }
  }, title), large && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), iconDot), large && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 20px',
      fontSize: 28,
      fontWeight: 400,
      color: MD_C.onSurface,
      fontFamily: 'Roboto, system-ui, sans-serif'
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// List item (Material 3)
// ─────────────────────────────────────────────────────────────
function AndroidListItem({
  headline,
  supporting,
  leading
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '12px 16px',
      minHeight: 56,
      boxSizing: 'border-box',
      fontFamily: 'Roboto, system-ui, sans-serif'
    }
  }, leading && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: MD_C.primary,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      fontWeight: 500,
      flexShrink: 0
    }
  }, leading), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: MD_C.onSurface,
      lineHeight: '24px'
    }
  }, headline), supporting && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: MD_C.onSurfaceVar,
      lineHeight: '20px'
    }
  }, supporting)));
}

// ─────────────────────────────────────────────────────────────
// Gesture nav bar (pill)
// ─────────────────────────────────────────────────────────────
function AndroidNavBar({
  dark = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 108,
      height: 4,
      borderRadius: 2,
      background: dark ? '#fff' : MD_C.onSurface,
      opacity: 0.4
    }
  }));
}

// ─────────────────────────────────────────────────────────────
// Device frame — wraps everything
// ─────────────────────────────────────────────────────────────
function AndroidDevice({
  children,
  width = 412,
  height = 892,
  dark = false,
  title,
  large = false,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 18,
      overflow: 'hidden',
      background: dark ? '#1d1b20' : MD_C.surface,
      border: `8px solid ${MD_C.frameBorder}`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(AndroidStatusBar, {
    dark: dark
  }), title !== undefined && /*#__PURE__*/React.createElement(AndroidAppBar, {
    title: title,
    large: large
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(AndroidKeyboard, null), /*#__PURE__*/React.createElement(AndroidNavBar, {
    dark: dark
  }));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — Gboard (Material 3)
// ─────────────────────────────────────────────────────────────
function AndroidKeyboard() {
  let _k = 0;
  const key = (l, {
    flex = 1,
    bg = MD_C.surface,
    r = 6,
    minW,
    fs = 21
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: _k++,
    style: {
      height: 46,
      borderRadius: r,
      flex,
      minWidth: minW,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Roboto, system-ui',
      fontSize: fs,
      color: MD_C.onPrimaryContainer
    }
  }, l);
  const row = (keys, style = {}) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'center',
      ...style
    }
  }, keys.map(l => key(l)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: MD_C.inverseOnSurface,
      padding: '0 8px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], {
    padding: '0 20px'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, key('', {
    bg: MD_C.surfaceVariant
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flex: 7,
      minWidth: 274
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l))), key('', {
    bg: MD_C.surfaceVariant
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, key('?123', {
    bg: MD_C.secondaryContainer,
    r: 100,
    minW: 58,
    fs: 14
  }), key(',', {
    bg: MD_C.surfaceVariant
  }), key('', {
    flex: 3,
    minW: 154
  }), key('.', {
    bg: MD_C.surfaceVariant
  }), key('', {
    bg: MD_C.primaryFixedDim,
    r: 100,
    minW: 58
  }))));
}
Object.assign(window, {
  AndroidDevice,
  AndroidStatusBar,
  AndroidAppBar,
  AndroidListItem,
  AndroidNavBar,
  AndroidKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app-campo/android-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app-campo/image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever a design needs an image.
 * You control the slot's shape; it sizes to its container by default. When the search_stock_photos tool
 * is available, prefill the slot by default — write the photo's URL into
 * src (with credit/credit-href); the user can still fill or replace it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The sidecar is a SIBLING of the HTML file that uses this component: the
 * read is a document-relative fetch, and the host resolves the bridge's
 * sidecar writes into the previewed file's directory to match (same
 * contract as design_canvas.jsx). Pages in the same directory share one
 * sidecar; keep slot ids distinct across them.
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          Initial framing baseline: cover | contain.   (default 'cover')
 *                cover starts the image filling the frame (overflow cropped);
 *                contain starts it fully visible (letterboxed). Either way the
 *                user can always pan/scale from there — double-click, or the
 *                Edit control, enters reframe mode (drag to move, scroll or
 *                corner-handles to scale; Escape / click-out commits). The
 *                crop persists alongside the image in the sidecar.
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. Prefill it with a real
 *                photo via search_stock_photos when that tool is available
 *                (set credit/credit-href from the result). A user drop
 *                overrides it; clearing the drop reveals src again.
 *   credit       Attribution text shown as a small overlay at the
 *                bottom-left of the filled slot. REQUIRED whenever src
 *                points at any Unsplash host (images.unsplash.com,
 *                plus.unsplash.com, …): an Unsplash src with no credit
 *                renders an error tile INSTEAD of the photo (Unsplash
 *                terms forbid showing their photos unattributed). Use the
 *                exact form 'Photo by {photographer name} on Unsplash' —
 *                the overlay then links the name to credit-href and
 *                'Unsplash' to the Unsplash homepage, and links back to
 *                unsplash.com automatically get the required utm referral
 *                params appended at render time. The credit belongs to
 *                the src image, so it only shows while src is what's
 *                displayed — a user-dropped image hides it.
 *   credit-href  Link for the photographer's name in the credit overlay
 *                (their Unsplash profile URL from the stock-photo search
 *                results). http(s) URLs only — anything else renders the
 *                name as plain text.
 *
 * Sizing: the slot fills its container by default (width/height 100%).
 * Put it in a sized wrapper — absolutely positioned, a grid cell, a fixed
 * frame — and it takes exactly that box. When the parent's height is
 * indefinite (ordinary flow), it falls back to full width at a 3:2 aspect
 * ratio instead of collapsing. In a shrink-to-fit parent (a float,
 * width:max-content, an unsized absolute wrapper), percentages have
 * nothing to resolve against — size the slot or its wrapper explicitly
 * there. For a fixed-size slot, set
 * width/height on the element itself (inline style), which overrides the
 * default. When
 * layering content above a slot (full-bleed layouts), make the overlay
 * click-through — pointer-events: none on scrims/text plates, re-enabled
 * on interactive children — so the slot's hover controls stay reachable.
 * Keep the slot's bottom-left corner visually clear as well: the credit
 * overlay renders there, and a dark fade or text plate covering it hides
 * the attribution Unsplash's terms require — end the fade above that
 * corner, or keep it nearly transparent where the credit sits.
 *
 * Usage:
 *   <div style="position:relative;width:100%;height:100%">      <!-- full-bleed: -->
 *     <image-slot id="bg" shape="rect"></image-slot>            <!-- fills the wrapper -->
 *   </div>
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';

  // Unsplash terms require visible attribution wherever their photos
  // display, and every link back to unsplash.com must carry utm referral
  // params. Two render-time rules enforce that here:
  //  - an Unsplash-src slot with NO credit attribute renders an error
  //    tile INSTEAD of the photo (an uncredited Unsplash photo on screen
  //    is itself the terms violation, so it never renders bare);
  //  - rendered credit links pointing at unsplash.com get the referral
  //    params appended when absent (credit-href values live in page
  //    content that can't be edited after the fact).
  // Keep the utm_source value in sync with UTM_SOURCE in
  // platform/web-agent/unsplash.ts — this file is a project-local
  // artifact and cannot import it (equality is pinned by tests).
  const UNSPLASH_HOMEPAGE_HREF = 'https://unsplash.com/?utm_source=claude_design&utm_medium=referral';
  // Host rule mirrors the hotlink validator that admits Unsplash srcs into
  // pages in the first place (cdn$ in unsplash.ts: apex or any subdomain)
  // — Unsplash+ results serve from plus.unsplash.com, not just images.*,
  // and an admitted-but-uncredited photo must error whatever unsplash
  // host it rides on.
  // Trailing-dot FQDNs (images.unsplash.com.) are the same host to the
  // browser but would miss the regex — strip one dot so the check fails
  // CLOSED (unrecognized-but-real Unsplash srcs must error, not render).
  const isUnsplashHost = u => {
    try {
      return /(^|\.)unsplash\.com$/.test(new URL(u, document.baseURI).hostname.replace(/\.$/, ''));
    } catch {
      return false;
    }
  };
  // Render-time referral normalization for links back to Unsplash:
  // appends utm_source/utm_medium when absent, preserves every existing
  // query param, never overwrites an existing utm_source, and passes
  // non-Unsplash URLs through untouched. Input is an ABSOLUTE validated
  // http(s) URL (the credit render funnel resolves + validates first).
  const withReferral = href => {
    try {
      const u = new URL(href);
      if (!/(^|\.)unsplash\.com$/.test(u.hostname.replace(/\.$/, ''))) {
        return href;
      }
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source', 'claude_design');
      }
      if (!u.searchParams.has('utm_medium')) {
        u.searchParams.set('utm_medium', 'referral');
      }
      return u.toString();
    } catch (e) {
      return href;
    }
  };
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  // Unload-time flush: save()'s serialization defers a mid-RTT re-fire to a
  // .then that never runs in an unloading document, silently dropping a
  // pagehide commit. Post the current slots immediately instead — content
  // is a superset snapshot of any in-flight save's, the write is a
  // whole-file last-writer-wins replace, and postMessage FIFO delivers it
  // to the host after the in-flight one, so a backend-side reorder at
  // worst reproduces the dropped-commit outcome this flush improves on.
  // Guarded on the initial sidecar read: pre-hydration slots can miss
  // other slots' persisted entries, and flushing it would clobber them —
  // that narrow case stays best-effort (the in-memory merge in load()
  // cannot happen in an unloading document anyway).
  function flushNow() {
    if (!loaded) return;
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    try {
      Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {});
    } catch (e) {}
  }
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet =
  // Fill the container by default: slots are usually placed inside a
  // sized wrapper (a hero frame, a grid cell, an inset:0 layer) and are
  // expected to take that box — a fixed intrinsic size would render as
  // a small tile in the corner of a full-bleed wrapper instead.
  // aspect-ratio is the companion fallback that keeps a bare slot
  // visible when the parent's height is indefinite: height:100%
  // resolves to auto there, and the ratio then derives height from
  // width instead of letting the slot collapse to zero height.
  // Explicit width/height on the element override all of this.
  ':host{display:block;position:relative;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);' + '  width:100%;height:100%;aspect-ratio:3/2}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  // popover=manual promotes the spill to the top layer on reframe, so it is
  // not clipped by any overflow:hidden / clip-path / scroll-container
  // ancestor (a plain z-index can't escape overflow clipping). UA popover
  // defaults (inset:0;margin:auto) are reset; _applyView sets viewport px.
  '.spill{position:fixed;margin:0;inset:auto;border:0;padding:0;background:transparent;' + '  overflow:visible;transform:translate(-50%,-50%);z-index:1;cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls overlay INSIDE the frame, pinned to the top-right corner, so
  // a full-bleed slot in an overflow:hidden container still shows them
  // (the old below-mask placement got clipped). Credit sits bottom-left,
  // so top-right avoids collision. The blurred pill background keeps them
  // legible over the image.
  // The UA [popover] base rule styles the element in EVERY state (only
  // display:none is gated on :not(:popover-open), and the display:flex
  // below overrides that) — so the UA resets live HERE, like .spill's,
  // or the ordinary hover-state strip renders as a bordered Canvas box
  // centered by margin:auto. inset:auto precedes top/right (shorthand).
  '.ctl{position:absolute;inset:auto;top:8px;right:8px;margin:0;border:0;padding:0;' + '  background:transparent;overflow:visible;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' +
  // While reframing, the spill owns the top layer and would swallow every
  // click on the in-frame controls. Promoting .ctl into the top layer
  // ABOVE the spill (shown after it — later popovers stack higher) keeps
  // Edit-as-toggle and Replace clickable mid-reframe. _applyView pins it
  // to the frame's top-right in viewport px (translateX(-100%)
  // right-aligns against the computed left edge); inset:auto clears the
  // base rule's top/right so the inline left/top position it alone.
  '.ctl:popover-open{position:fixed;inset:auto;transform:translateX(-100%)}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}' +
  // Replacement in flight: after a src swap the browser keeps painting
  // the PREVIOUS image until the new one decodes, so a Replace would
  // flash the old photo and then pop. Hide the stale frame (visibility,
  // not display — _applyView geometry still applies) and spin until the
  // new image reports in (load/error clears data-swapping).
  ':host([data-swapping]) .frame img{visibility:hidden}' + '.loading{position:absolute;inset:0;display:none;align-items:center;' + '  justify-content:center;pointer-events:none}' + ':host([data-swapping]) .loading{display:flex}' + '.loading::after{content:"";width:22px;height:22px;border-radius:50%;' + '  border:2px solid rgba(0,0,0,.12);border-top-color:rgba(0,0,0,.45);' + '  animation:om-slot-spin .7s linear infinite}' + '@keyframes om-slot-spin{to{transform:rotate(360deg)}}' +
  // Reduced motion: the static two-tone ring still reads as "working".
  '@media (prefers-reduced-motion:reduce){.loading::after{animation:none}}' + '.credit{position:absolute;left:6px;bottom:6px;max-width:calc(100% - 12px);display:none;' + '  padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.55);color:#fff;' + '  font:10px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;' + '  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(6px)}' +
  // The credit is a SPAN holding one or two <a>s (Unsplash's prescribed
  // form links the photographer AND Unsplash) — anchors style inline so
  // the overlay reads as one line of text.
  '.credit a{color:inherit;text-decoration:none}' + '.credit a:hover,.credit a:focus-visible{text-decoration:underline}' + ':host([data-filled][data-credit]) .credit{display:block}' +
  // Exports must ship JUST the image — no hover controls, no credit chip
  // (the host marks <html data-om-exporting> for the capture window; the
  // page-level hide script can't reach shadow DOM, this rule can).
  ':host-context([data-om-exporting]) .ctl,' + ':host-context([data-om-exporting]) .credit{display:none !important}' +
  // No export-window mask rules here on purpose: the export capture
  // releases the replacement mask by REMOVING data-swapping (the
  // shadow-root pass in pages/export/shared.ts HIDE_EXPORT_CHROME_SCRIPT)
  // — attribute removal works in every engine (:host-context is
  // Chromium-only), is scoped by construction to slots actually
  // mid-swap, and hides the spinner through the same gate. A masked img
  // would otherwise be silently dropped from PPTX decks (the capture
  // walk skips visibility:hidden imgs).
  // Attribution error tile: REPLACES the photo when an Unsplash src has
  // no credit attribute — rendering the photo uncredited is the terms
  // violation, so the photo must not appear at all.
  // Calm and neutral on purpose (review feedback): the tile informs the
  // user; the fix instructions are machine-facing (usage docblock, tool
  // description, and the turn-end scan's bounce copy name the attributes
  // for the agent).
  '.attr-error{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  background:#f2f1ef;color:#6e6c66;user-select:none;' + '  font:13px/1.45 system-ui,-apple-system,sans-serif}' + '.attr-error svg{opacity:.55}' + '.attr-error .cap{max-width:92%;font-weight:500;letter-spacing:.01em}' + ':host([data-attribution-error]) .attr-error{display:flex}' + ':host([data-attribution-error]) .ring{display:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  const warnIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' + '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'placeholder', 'src', 'id', 'credit', 'credit-href'];
    }

    /** Duplicate-slide hook (called by deck-stage, see its
     *  _remintDuplicateIds): copy this id's stored image, if any, under a
     *  freshly minted key and return that key — so a duplicated slide's
     *  slot keeps its dropped photo instead of reverting to the
     *  placeholder. 'isFree' is the caller's uniqueness check (document
     *  ids); candidates must ALSO be unused in the sidecar, which can
     *  hold keys from other pages sharing the project root. (An EMPTY
     *  slot on another page leaves no sidecar entry, so its id is not
     *  detectable here — a minted key can collide with it and that slot
     *  would show this photo. Same blast radius as two pages reusing an
     *  id by hand, which the shared sidecar already permits.) Returns null
     *  when no id could be minted (caller strips the id, today's
     *  behavior). */
    static cloneSlot(fromId, isFree) {
      if (typeof fromId !== 'string' || !fromId) return null;
      // Pre-hydration the store can't veto candidates or source the copy
      // — degrade to the strip (today's behavior) rather than mint
      // against keys we can't see yet. Any rendered (= droppable) slot
      // means load() has already settled.
      if (!loaded) return null;
      const stem = fromId.replace(/-\d+$/, '') || fromId;
      for (let n = 2; n < 100; n++) {
        const toId = stem + '-' + n;
        if (toId === fromId) continue;
        if (slots[toId] !== undefined) {
          // Reuse a key holding this exact value (bytes AND crop) if no
          // live element here owns it — a duplicate op the host refused
          // after minting leaves such a key behind, and reusing keeps
          // refused retries from accumulating one orphaned copy per
          // attempt. Full equality (not just bytes) so a byte-identical
          // key another PAGE owns with its own crop is stepped past, not
          // adopted or rewritten. (Entries without .u never match.)
          const prev = getSlot(toId);
          const cur = getSlot(fromId);
          if (!(prev && cur && prev.u && prev.u === cur.u && prev.s === cur.s && prev.x === cur.x && prev.y === cur.y && (typeof isFree !== 'function' || isFree(toId)))) continue;
          return toId;
        }
        if (typeof isFree === 'function' && !isFree(toId)) continue;
        const v = getSlot(fromId);
        if (v) setSlot(toId, Object.assign({}, v));
        return toId;
      }
      return null;
    }
    constructor() {
      super();
      // clonable: rail thumbnails deep-clone slides and carry this shadow
      // along; reuse an already-cloned root so upgrade-after-clone works.
      // (Deliberately NOT serializable — a getHTML consumer would embed
      // multi-MB sidecar data-URLs into serialized page HTML.)
      const root = this.shadowRoot || this.attachShadow({
        mode: 'open',
        clonable: true
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="attr-error" part="attribution-error">' + warnIcon + '    <div class="cap">This photo needs attribution</div></div>' + '  <div class="loading" part="loading"></div>' + '  <div class="ring" part="ring"></div>' + '</div>' +
      // Outside .frame, like .spill/.ctl — the frame's overflow:hidden +
      // border-radius/clip-path would cut the credit off on circle/pill/mask.
      // A SPAN, not an <a>: the prescribed Unsplash credit holds two links
      // (photographer + Unsplash), built per-render in _render().
      '<span class="credit" part="credit"></span>' + '<div class="spill" popover="manual" data-dc-edit-transparent>' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' +
      // data-dc-edit-transparent: the DC editor's edit-mode picker lets
      // clicks through for chrome marked with it (EDIT_TRANSPARENT_SEL)
      // — without it, Replace/Edit clicks in Edit mode are swallowed by
      // element selection and the controls look dead.
      '<div class="ctl" popover="manual" data-dc-edit-transparent><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="edit" title="Reframe image">Edit</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ctl = root.querySelector('.ctl');
      this._credit = root.querySelector('.credit');
      this._attrError = root.querySelector('.attr-error');
      // Credit clicks open the link, not browse/reframe.
      this._credit.addEventListener('click', e => e.stopPropagation());
      this._credit.addEventListener('dblclick', e => e.stopPropagation());
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      // Encode-in-flight marker (the owning _ingest generation): while set,
      // the same-src "nothing in flight" clear in _render must not fire —
      // the stored value still points at the OLD image until the encode
      // lands, so that clear would unmask the stale image mid-replace.
      this._swapGen = 0;
      // Render-owned swap in flight: set when _render assigns a new src,
      // cleared only by the img's own load/error (or the empty branch).
      // img.complete CANNOT stand in for this — setting src only QUEUES
      // the current-request swap (a microtask), so synchronously after an
      // assignment, complete still reports the OLD settled request. The
      // pick path does exactly that: the host sets src, credit, and
      // credit-href back-to-back in one task, and renders #2/#3 would
      // read the stale complete === true and drop the mask one render
      // after it was set.
      this._loadPending = false;
      // See _render's empty branch: a transient attribution-error wipe of a
      // showing image must make the follow-up render a replacement (spinner),
      // not a first fill (blank frame).
      this._hidShowing = false;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        // The hidden controls are opacity-0 but still tabbable — without
        // this gate a keyboard user could drive them on a read-only share
        // link (mirrors the dblclick handler's editable gate).
        if (!this.hasAttribute('data-editable')) return;
        if (act === 'replace') {
          this._exitReframe(true);
          // Host-owned picker (Unsplash modal; it also offers local import).
          this.dispatchEvent(new CustomEvent('image-slot:pick', {
            bubbles: true,
            composed: true,
            detail: {
              id: this.id || null
            }
          }));
        }
        if (act === 'edit') {
          if (!this._reframes()) return;
          if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      // load/error also release the replacement-in-flight mask (via the
      // single discipline in _releaseMask): the swap is only revealed once
      // the new image can actually paint (on error the frame shows its
      // background, same as a fresh slot with a broken src).
      this._img.addEventListener('load', () => {
        this._loadPending = false;
        this._releaseMask(true);
        this._applyView();
      });
      this._img.addEventListener('error', () => {
        this._loadPending = false;
        this._releaseMask(true);
      });
      // Gated only on editable — any filled slot can be repositioned/scaled,
      // regardless of fit. Share links (no writeFile) stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
          const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // The host may inject window.omelette.writeFile AFTER the first render;
      // re-render on hover so the editable-gated controls reliably appear.
      this.addEventListener('pointerenter', this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('pointerenter', this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      // commit=false: a disconnect is not a user intent — committing here
      // would persist whatever half-finished drag a React remount or DOM
      // splice happened to interrupt. Deliberate exits commit on their own
      // paths (Escape/click-out/toggle), and unloads commit via pagehide.
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._signalReframe(true);
      // Best-effort commit when the document unloads mid-reframe (a host
      // navigation racing the enter signal, a manual reload, tab close):
      // the sidecar write rides the host bridge, which outlives this
      // document, so the crop survives even though the mode dies with the
      // DOM. Held on the instance so _exitReframe detaches exactly what
      // was attached.
      this._pagehide = () => {
        this._exitReframe(true);
        flushNow();
      };
      window.addEventListener('pagehide', this._pagehide);
      // Promote spill to the top layer, then keep it pinned over the frame:
      // scroll/resize cover the common cases, and a per-frame rect check
      // catches layout shifts that fire neither (an image above finishing
      // load, streamed DOM pushing the slot down, an ancestor transform
      // change) so the overlay can't detach from the frame.
      try {
        this._spill.showPopover();
      } catch {}
      // After the spill, so the controls stack above it in the top layer.
      try {
        this._ctl.showPopover();
      } catch {}
      this._reposition = () => {
        if (this.hasAttribute('data-reframe')) this._applyView();
      };
      window.addEventListener('scroll', this._reposition, true);
      window.addEventListener('resize', this._reposition);
      this._lastRect = '';
      this._watch = () => {
        if (!this.hasAttribute('data-reframe')) return;
        const r = this.getBoundingClientRect();
        const key = r.left + ',' + r.top + ',' + r.width + ',' + r.height;
        if (key !== this._lastRect) {
          this._lastRect = key;
          this._applyView();
        }
        this._watchId = requestAnimationFrame(this._watch);
      };
      this._watchId = requestAnimationFrame(this._watch);
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (this._reposition) {
        window.removeEventListener('scroll', this._reposition, true);
        window.removeEventListener('resize', this._reposition);
        this._reposition = null;
      }
      if (this._watchId) {
        cancelAnimationFrame(this._watchId);
        this._watchId = 0;
      }
      if (this._pagehide) {
        window.removeEventListener('pagehide', this._pagehide);
        this._pagehide = null;
      }
      try {
        this._spill.hidePopover();
      } catch {}
      try {
        this._ctl.hidePopover();
      } catch {}
      this._ctl.style.left = '';
      this._ctl.style.top = '';
      if (commit) this._commitView();
      this._signalReframe(false);
    }

    // Reframe state lives only in this DOM until commit, invisible to the
    // host's dirty signals — announce enter/exit so the host can hold
    // auto-reloads for exactly the gesture (the guest bundle forwards
    // image-slot:reframe to the host as imageSlotReframe). Dispatched on
    // the element (composed, so it escapes shadow roots) while connected;
    // a disconnected exit (disconnectedCallback) falls back to document so
    // the host still hears it.
    _signalReframe(active) {
      const target = this.isConnected ? this : document;
      target.dispatchEvent(new CustomEvent('image-slot:reframe', {
        bubbles: true,
        composed: true,
        detail: {
          active: active,
          id: this.id || null
        }
      }));
    }

    // Public: host's "Import from computer" calls this to run local browse.
    openFilePicker() {
      this._exitReframe(true);
      this._input.click();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      // Replacing a shown image: surface the swap through the encode too,
      // not just the decode — otherwise the old photo sits there with no
      // feedback while the canvas re-encode runs. An empty slot keeps its
      // placeholder (no spinner) until the encode lands, as before.
      // _swapGen guards the mask against re-renders DURING the encode
      // (pointerenter, ResizeObserver, another slot's store write): the
      // stored value still resolves to the old image there, so _render's
      // same-src clear would otherwise unmask it mid-replace.
      if (this.hasAttribute('data-filled')) {
        this.setAttribute('data-swapping', '');
        this._swapGen = gen;
      }
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        // Clear BEFORE setSlot: its synchronous re-render must see no
        // pending encode, so a byte-identical re-upload (same data URL, no
        // load event coming) still clears the mask via the complete branch.
        this._swapGen = 0;
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._swapGen = 0;
        // Reveal the kept old image — unless another replacement (a
        // remote pick's src swap) is still in flight, in which case the
        // mask stays until THAT image settles (its load/error releases).
        this._releaseMask();
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is available on any filled slot — the user can
    // always reposition/scale. `fit` only sets the initial baseline (see
    // _geom): contain starts fully-visible, cover starts frame-filling.
    _reframes() {
      return this.hasAttribute('data-filled');
    }

    // The single release discipline for the replacement-in-flight mask
    // (data-swapping). The mask comes off only when BOTH hold:
    //  - no encode is pending (_swapGen) — mid-encode the stored value
    //    still resolves to the old image, so any reveal paints it;
    //  - the frame img has settled on its current src — an unsettled src
    //    means some replacement is still in flight (e.g. a remote pick),
    //    whoever started it, and revealing would paint the previous
    //    frame. The load/error listeners pass settled=true (the event IS
    //    the settlement signal, per spec complete is true by then);
    //    other callers rely on the complete flag (covers loaded AND
    //    failed).
    // Every release path funnels through here EXCEPT _render's empty
    // branch (the img is being cleared — nothing will ever settle).
    _releaseMask(settled) {
      if (!this._swapGen && !this._loadPending && (settled || this._img.complete)) {
        this.removeAttribute('data-swapping');
      }
    }

    // Baseline geometry, shared by clamp/apply/resize. `base` is the scale at
    // view-scale s=1: cover = fill the frame (overflow on the looser axis),
    // contain = fit fully inside (letterboxed). Zooming a contain image past
    // s where it overflows naturally becomes a crop. Null until the img has
    // loaded (naturalWidth is 0 before that) or when the slot has no layout
    // box — ResizeObserver fires with a 0×0 rect under display:none, and
    // clamping against a degenerate 1×1 frame would silently pull the stored
    // pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
      const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
      return {
        iw,
        ih,
        fw,
        fh,
        base
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      // Top-layer controls: pin to the frame's top-right in viewport px
      // (the same 8px inset as the in-frame layout; unscaled — top-layer UI
      // reads as chrome, not page content). BEFORE the geometry branch:
      // placement needs only the frame rect, and a not-yet-loaded or broken
      // src must not leave the promoted strip floating unpositioned. Gated
      // on the popover actually being open: without the Popover API,
      // showPopover() threw (swallowed in _enterReframe), .ctl stays in
      // its in-frame absolute layout, and viewport-px coordinates would
      // shove it off-frame — and matches(':popover-open') itself throws
      // there (unknown pseudo-class), hence the try/catch.
      if (this.hasAttribute('data-reframe')) {
        let onTop = false;
        try {
          onTop = this._ctl.matches(':popover-open');
        } catch {}
        if (onTop) {
          const r = this.getBoundingClientRect();
          this._ctl.style.left = r.right - 8 + 'px';
          this._ctl.style.top = r.top + 8 + 'px';
        }
      }
      if (!g) {
        // Dimensions not known yet (before img load) — centered fit so there
        // is no flash of an unpositioned image before the geometry lands.
        const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = contain ? 'contain' : 'cover';
        return;
      }
      // Baseline (cover-fill or contain-fit) × view scale. Width/height and
      // left/top are all frame-% — depends only on the frame aspect ratio, so
      // a responsive resize keeps the same crop. The spill layer mirrors the
      // same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      if (this.hasAttribute('data-reframe')) {
        // Top-layer spill: position in viewport px over the frame. The top
        // layer escapes ancestor transforms entirely, so EVERY term must be
        // in viewport units: getBoundingClientRect gives the frame's scaled
        // origin AND size, and the rect/layout ratio rescales the ghost —
        // sizing from layout px alone renders it 1/scale too large under a
        // scaled deck slide. Inner ghost + handles stay box-relative.
        const r = this.getBoundingClientRect();
        const sx = g.fw ? r.width / g.fw : 1;
        const sy = g.fh ? r.height / g.fh : 1;
        this._spill.style.width = g.iw * k * sx + 'px';
        this._spill.style.height = g.ih * k * sy + 'px';
        this._spill.style.left = r.left + (50 + this._view.x) / 100 * r.width + 'px';
        this._spill.style.top = r.top + (50 + this._view.y) / 100 * r.height + 'px';
      }
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      // An Unsplash src with no credit attribute must NOT render — showing
      // the photo uncredited is the Unsplash-terms violation itself. The
      // error tile replaces the photo until the credit is written. A
      // user-dropped image is the user's own content and always renders.
      // Trimmed: credit is agent/user-editable content, and a whitespace-
      // only value must count as missing — otherwise it would suppress the
      // error tile AND render an empty credit box (no text, no links),
      // exactly the unattributed state this gate exists to prevent.
      const credit = (this.getAttribute('credit') || '').trim();
      const attrError = !!(!credit && !this._userUrl && srcAttr && isUnsplashHost(srcAttr));
      this.toggleAttribute('data-attribution-error', attrError);
      if (url && !attrError) {
        const prev = this._img.getAttribute('src');
        if (prev !== url) {
          // Replacing an already-shown image: mark the swap BEFORE setting
          // src so the stale frame is never revealed (see the data-swapping
          // stylesheet rules). First fill (prev empty) keeps the existing
          // placeholder-until-load behavior — no spinner. _hidShowing
          // covers the pick path's transient attribution-error wipe: prev
          // is gone, but an image WAS showing, so this is a replacement.
          if (prev || this._hidShowing) this.setAttribute('data-swapping', '');
          // Mark the swap BEFORE assigning src: complete keeps reporting
          // the old settled request until the browser's
          // update-the-image-data microtask runs, so same-task re-renders
          // (the pick path's credit/credit-href setAttributes) need this
          // flag, not complete, to know a load is in flight.
          this._loadPending = true;
          this._img.src = url;
          this._ghost.src = url;
        } else {
          // Same-src re-render — release if settled, so an ingest-set
          // spinner can't stick after a byte-identical re-upload (same
          // data URL, no further load event ever fires).
          this._releaseMask();
        }
        this._hidShowing = false;
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this.removeAttribute('data-swapping');
        // The src is being removed — no load/error will ever fire for it.
        this._loadPending = false;
        // A transient attribution-error wipe of a showing image happens on
        // the pick path: the host sets src one setAttribute before credit,
        // so render N hides the old image (attrError) and render N+1
        // restores a URL. Remember the wipe so that restore renders as a
        // replacement (spinner), not a first fill (blank frame).
        this._hidShowing = attrError && !!this._img.getAttribute('src');
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        // The error tile owns the blocked-photo state; .empty stays for
        // the genuinely-empty slot.
        this._empty.style.display = attrError ? 'none' : 'flex';
        this.removeAttribute('data-filled');
      }

      // Credit belongs to the author src, so a user drop hides it.
      // textContent + the http(s)-only funnel keep external strings inert.
      const showCredit = !!(url && credit && !this._userUrl && !attrError);
      this._credit.textContent = '';
      if (showCredit) {
        // Validate once (resolved against the document, http(s) only),
        // then append the terms-required utm referral params to links
        // that point back at unsplash.com.
        let href = '';
        const rawHref = this.getAttribute('credit-href') || '';
        if (rawHref) {
          try {
            const u = new URL(rawHref, document.baseURI);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
              href = withReferral(u.href);
            }
          } catch {}
        }
        const mkLink = (text, linkHref) => {
          const a = document.createElement('a');
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          a.setAttribute('href', linkHref);
          a.textContent = text;
          return a;
        };
        // Unsplash's prescribed credit is TWO links — the photographer's
        // name to their profile (credit-href) and 'Unsplash' to the
        // homepage. Render that split whenever the text has the canonical
        // shape; other text keeps the legacy single-link rendering.
        const m = /^Photo by (.+) on Unsplash$/.exec(credit);
        if (m) {
          this._credit.appendChild(document.createTextNode('Photo by '));
          this._credit.appendChild(href ? mkLink(m[1], href) : document.createTextNode(m[1]));
          this._credit.appendChild(document.createTextNode(' on '));
          this._credit.appendChild(mkLink('Unsplash', UNSPLASH_HOMEPAGE_HREF));
        } else if (href) {
          this._credit.appendChild(mkLink(credit, href));
        } else {
          this._credit.textContent = credit;
        }
      }
      this.toggleAttribute('data-credit', showCredit);
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app-campo/image-slot.js", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/App.jsx
try { (() => {
/* Retaguarda — app shell + simple screen routing.
   Defines window.App; each HTML entry mounts it (optionally with `initial`). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Hazard
} = NS;
function App({
  initial
}) {
  const [module, setModule] = React.useState(initial && initial.module || 'clientes');
  const [selected, setSelected] = React.useState(initial && initial.entity || null);
  const navigate = id => {
    setModule(id);
    setSelected(null);
  };
  const P = window.RTG.placeholders;
  const crumbs = [{
    label: 'Retaguarda'
  }];
  let screen;
  if (module === 'dashboard') {
    crumbs.push({
      label: 'Dashboard',
      here: true
    });
    screen = /*#__PURE__*/React.createElement(window.Dashboard, {
      onNavigate: navigate
    });
  } else if (module === 'os') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Ordens de Serviço'
      }, {
        label: 'Nova OS',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovaOS, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else if (selected) {
      crumbs.push({
        label: 'Ordens de Serviço'
      }, {
        label: selected.n,
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.OSDetail, {
        os: selected,
        onBack: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Ordens de Serviço',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.OSList, {
        onOpen: setSelected,
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else if (module === 'orcamentos') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Orçamentos'
      }, {
        label: 'Novo orçamento',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovoOrcamento, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else if (selected) {
      crumbs.push({
        label: 'Orçamentos'
      }, {
        label: selected.n,
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.OrcamentoDetail, {
        orc: selected,
        onBack: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Orçamentos',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.OrcamentosList, {
        onNew: () => setSelected({
          __new: true
        }),
        onOpen: setSelected
      });
    }
  } else if (module === 'precos') {
    crumbs.push({
      label: 'Preços',
      here: true
    });
    screen = /*#__PURE__*/React.createElement(window.PrecosList, null);
  } else if (module === 'rentabilidade') {
    crumbs.push({
      label: 'Rentabilidade',
      here: true
    });
    screen = /*#__PURE__*/React.createElement(window.Rentabilidade, null);
  } else if (module === 'comprovantes') {
    crumbs.push({
      label: 'Comprovantes',
      here: true
    });
    screen = /*#__PURE__*/React.createElement(window.ComprovantesList, null);
  } else if (module === 'manutencao') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Manutenção'
      }, {
        label: 'Nova manutenção',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovaManutencao, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Manutenção',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.Manutencao, {
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else if (module === 'painel') {
    crumbs.push({
      label: 'Painel Gerencial',
      here: true
    });
    screen = /*#__PURE__*/React.createElement(window.PainelGerencial, null);
  } else if (module === 'financeiro') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Financeiro'
      }, {
        label: 'Novo pagamento',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovoPagamento, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Financeiro',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.Financeiro, {
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else if (module === 'custohora') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Custo da Hora'
      }, {
        label: 'Novo lançamento',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovoCusto, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Custo da Hora',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.CustoHora, {
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else if (module === 'equipamentos') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Equipamentos'
      }, {
        label: 'Novo equipamento',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovoEquipamento, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Equipamentos',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.EquipamentosList, {
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else if (module === 'diesel') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Diesel'
      }, {
        label: 'Novo abastecimento',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovoAbastecimento, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Diesel',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.Diesel, {
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else if (module === 'faturamento') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Faturamento'
      }, {
        label: 'Nova NF',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovaNF, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Faturamento',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.Faturamento, {
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else if (module === 'parametros') {
    crumbs.push({
      label: 'Parâmetros',
      here: true
    });
    screen = /*#__PURE__*/React.createElement(window.Parametros, null);
  } else if (module === 'sobre') {
    crumbs.push({
      label: 'Sobre',
      here: true
    });
    screen = /*#__PURE__*/React.createElement(window.Sobre, null);
  } else if (module === 'clientes') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Clientes'
      }, {
        label: 'Novo cliente',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovoCliente, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else if (selected) {
      crumbs.push({
        label: 'Clientes'
      }, {
        label: selected.nome,
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.ClienteDetail, {
        cliente: selected,
        onBack: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Clientes',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.ClientesList, {
        onOpen: setSelected,
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else if (module === 'operadores') {
    if (selected && selected.__new) {
      crumbs.push({
        label: 'Operadores'
      }, {
        label: 'Novo operador',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.NovoOperador, {
        onCancel: () => setSelected(null),
        onCreate: () => setSelected(null)
      });
    } else if (selected) {
      crumbs.push({
        label: 'Operadores'
      }, {
        label: selected.nome,
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.OperadorDetail, {
        operador: selected,
        onBack: () => setSelected(null)
      });
    } else {
      crumbs.push({
        label: 'Operadores',
        here: true
      });
      screen = /*#__PURE__*/React.createElement(window.OperadoresList, {
        onOpen: setSelected,
        onNew: () => setSelected({
          __new: true
        })
      });
    }
  } else {
    const p = P[module] || {
      icon: 'dashboard',
      label: module
    };
    crumbs.push({
      label: p.label,
      here: true
    });
    screen = /*#__PURE__*/React.createElement(window.Placeholder, {
      icon: p.icon,
      label: p.label
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "rtg-app"
  }, /*#__PURE__*/React.createElement(window.Sidebar, {
    module: module,
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement("div", {
    className: "rtg-main"
  }, /*#__PURE__*/React.createElement(Hazard, {
    variant: "header"
  }), /*#__PURE__*/React.createElement(window.Header, {
    crumbs: crumbs
  }), /*#__PURE__*/React.createElement("main", {
    className: "rtg-content"
  }, screen)));
}
window.App = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/ClienteDetail.jsx
try { (() => {
/* Retaguarda — Cliente detail (recreation of mock-detalhe-cliente). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Avatar,
  Badge,
  Button,
  KpiCard,
  Card,
  StatusChip,
  DataRow,
  IconTile,
  Note,
  Pill,
  Icon
} = NS;

/* Example detail data (Vale Verde) used for the rich sections. */
const CLI_OS = [{
  n: 'OS-021',
  t: 'Terraplenagem — lote industrial',
  h: '62 h',
  d: 'desde 01/07',
  v: 'R$ 24.800',
  tone: 'amber',
  st: 'Em andamento',
  led: true
}, {
  n: 'OS-018',
  t: 'Abertura de acesso e drenagem',
  h: '40 h',
  d: 'desde 20/06',
  v: 'R$ 16.200',
  tone: 'amber',
  st: 'Em andamento',
  led: true
}, {
  n: 'OS-012',
  t: 'Fundação de galpão — estacas',
  h: '88 h',
  d: '02–24/05',
  v: 'R$ 41.000',
  tone: 'success',
  st: 'Concluída',
  led: true
}, {
  n: 'OS-007',
  t: 'Nivelamento de pátio',
  h: '30 h',
  d: '08–19/04',
  v: 'R$ 12.500',
  tone: 'success',
  st: 'Concluída',
  led: true
}];
const CLI_NF = [{
  doc: 'NF 1042',
  em: '05/07',
  vc: '20/07',
  v: 'R$ 12.400',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'NF 1038',
  em: '28/06',
  vc: '12/07',
  v: 'R$ 8.900',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'NF 1035',
  em: '20/06',
  vc: '05/07',
  v: 'R$ 11.100',
  tone: 'danger',
  icon: 'circle-alert',
  st: 'Vencido'
}, {
  doc: 'NF 1029',
  em: '05/06',
  vc: '20/06',
  v: 'R$ 9.500',
  tone: 'success',
  icon: 'check',
  st: 'Pago'
}, {
  doc: 'NF 1021',
  em: '20/05',
  vc: '04/06',
  v: 'R$ 15.200',
  tone: 'success',
  icon: 'check',
  st: 'Pago'
}];
const CLI_ORC = [{
  t: 'Terraplenagem — fase 2',
  m: 'ORC-055 · 02/07',
  v: 'R$ 58.000',
  tone: 'info',
  st: 'Aberto'
}, {
  t: 'Drenagem de acesso',
  m: 'ORC-051 · 24/06',
  v: 'R$ 22.400',
  tone: 'info',
  st: 'Aberto'
}, {
  t: 'Pátio de manobra',
  m: 'ORC-047 · 12/06',
  v: 'R$ 18.900',
  tone: 'info',
  st: 'Aberto'
}, {
  t: 'Fundação do anexo',
  m: 'ORC-039 · 20/04',
  v: 'R$ 41.000',
  tone: 'success',
  st: 'Aprovado'
}, {
  t: 'Limpeza de terreno',
  m: 'ORC-030 · 08/03',
  v: 'R$ 9.800',
  tone: 'neutral',
  st: 'Perdido'
}];
const CLI_COMP = [{
  icon: 'credit-card',
  t: 'PIX recebido — NF 1029',
  m: '20/06 · 14:22',
  v: 'R$ 9.500'
}, {
  icon: 'landmark',
  t: 'TED recebida — NF 1021',
  m: '04/06 · 09:10',
  v: 'R$ 15.200'
}, {
  icon: 'link',
  t: 'Boleto pago — NF 1015',
  m: '22/05 · 16:40',
  v: 'R$ 7.300'
}];
const CLI_FAROLTI = [{
  k: 'Faturado (LTV)',
  ic: 'wallet',
  v: 'R$ 512.300',
  mono: true
}, {
  k: 'Ticket médio',
  ic: 'dollar-sign',
  v: 'R$ 8.740',
  mono: true
}, {
  k: 'OS realizadas',
  ic: 'file-text',
  v: '59'
}, {
  k: 'Curva ABC',
  ic: 'trending-up',
  v: 'A',
  s: 'alto valor histórico',
  abc: true
}, {
  k: 'Primeira OS',
  ic: 'calendar',
  v: '03/2019',
  mono: true
}, {
  k: 'Última OS',
  ic: 'calendar',
  v: '02/2022',
  mono: true
}, {
  k: 'Recência',
  ic: 'history',
  v: '38 meses',
  s: 'desde a última OS no legado'
}, {
  k: 'Origem',
  ic: 'database',
  v: 'ERP Farolti',
  s: 'Migração jun/2024'
}];
function ClienteDetail({
  cliente,
  onBack
}) {
  const c = cliente || window.RTG.clientes[0];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Clientes"), /*#__PURE__*/React.createElement("section", {
    className: "rtg-hero"
  }, /*#__PURE__*/React.createElement(Avatar, {
    icon: c.tipo === 'PJ' ? 'building-2' : 'user',
    size: 78,
    shape: "square",
    tone: "brand"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-main"
  }, /*#__PURE__*/React.createElement("h1", null, c.nome), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-sub"
  }, c.ativo ? /*#__PURE__*/React.createElement(Badge, {
    tone: "active",
    led: true
  }, "Ativo") : /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    led: true
  }, "Inativo"), /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    icon: "building-2"
  }, c.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'), c.recorrente && /*#__PURE__*/React.createElement(Badge, {
    tone: "gold",
    icon: "badge-check"
  }, "Cliente recorrente")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-qf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, c.tipo === 'PJ' ? 'CNPJ' : 'CPF'), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, c.doc)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Telefone"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, c.telefone)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Cliente desde"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, c.desde || 'mar/2022 · 3 anos')), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\xDAltima OS"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, c.ultimaOS || '08/07/2025')))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "pencil"
  }, "Editar"), /*#__PURE__*/React.createElement(Button, {
    variant: "wa",
    icon: "message-circle"
  }, "WhatsApp"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus"
  }, "Novo or\xE7amento"), /*#__PURE__*/React.createElement(Button, {
    variant: "danger",
    icon: "ban"
  }, "Inativar"))), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis"
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Faturado em 2025",
    value: c.faturado || 'R$ 148.500',
    mono: true,
    icon: "credit-card",
    trend: {
      dir: 'up',
      value: '18%'
    },
    foot: "vs. 2024",
    spark: [19, 17, 18, 12, 13, 8, 9, 4]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Saldo a receber",
    value: c.saldo || 'R$ 32.400',
    mono: true,
    warn: true,
    icon: "hand-coins",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "3 t\xEDtulos \xB7 ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--danger-fg)',
        fontWeight: 600
      }
    }, "1 vencido"))
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "OS ativas",
    value: String(c.osAtivas ?? 2),
    icon: "clipboard-list",
    foot: "em andamento no per\xEDodo",
    spark: [13, 14, 10, 11, 9, 10, 7, 8]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Or\xE7amentos abertos",
    value: String(c.orcAbertos ?? 3),
    icon: "file-text",
    foot: "R$ 99.300 em propostas"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Ordens de Servi\xE7o",
    icon: "clipboard-list",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "4 vinculadas")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-oslist"
  }, CLI_OS.map(o => /*#__PURE__*/React.createElement("div", {
    className: "rtg-osrow",
    key: o.n
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-osnum"
  }, o.n), /*#__PURE__*/React.createElement("div", {
    className: "rtg-osbody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 12
  }), " ", o.h), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 12
  }), " ", o.d))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-osend"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-osval"
  }, o.v), /*#__PURE__*/React.createElement(StatusChip, {
    tone: o.tone,
    led: o.led
  }, o.st)))))), /*#__PURE__*/React.createElement(Card, {
    title: "Contas a receber",
    icon: "wallet",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "R$ 32.400 em aberto")
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Documento"), /*#__PURE__*/React.createElement("th", null, "Emiss\xE3o"), /*#__PURE__*/React.createElement("th", null, "Vencimento"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Valor"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, CLI_NF.map(n => /*#__PURE__*/React.createElement("tr", {
    key: n.doc
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-doc"
  }, n.doc)), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, n.em), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, n.vc), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, n.v), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: n.tone,
    led: n.led,
    icon: n.icon
  }, n.st)))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados cadastrais",
    icon: "contact",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "building-2",
    label: "Raz\xE3o / Fantasia"
  }, c.nome, " \xB7 ", /*#__PURE__*/React.createElement("small", null, c.fantasia || c.nome)), /*#__PURE__*/React.createElement(DataRow, {
    icon: "briefcase",
    label: "Segmento"
  }, c.segmento, " \xB7 ", /*#__PURE__*/React.createElement("small", null, c.tipo)), /*#__PURE__*/React.createElement(DataRow, {
    icon: "mail",
    label: "E-mail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, c.email || 'contato@cliente.com.br')), /*#__PURE__*/React.createElement(DataRow, {
    icon: "phone",
    label: "Telefone"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, c.telefone)), /*#__PURE__*/React.createElement(DataRow, {
    icon: "map-pin",
    label: "Endere\xE7o"
  }, c.endereco || c.cidade || 'Santo Ângelo/RS'), /*#__PURE__*/React.createElement(DataRow, {
    icon: "user",
    label: "Contato"
  }, c.contato || 'Setor de compras', " \xB7 ", /*#__PURE__*/React.createElement("small", null, c.contatoArea || 'Compras'))), /*#__PURE__*/React.createElement(Card, {
    title: "Or\xE7amentos",
    icon: "file-text",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "5 no total")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, CLI_ORC.map(o => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: o.m
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "file-text",
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, o.m)), /*#__PURE__*/React.createElement("div", {
    className: "cv"
  }, o.v, /*#__PURE__*/React.createElement(StatusChip, {
    tone: o.tone,
    style: {
      padding: '2px 7px'
    }
  }, o.st)))))), /*#__PURE__*/React.createElement(Card, {
    title: "Comprovantes recentes",
    icon: "receipt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, CLI_COMP.map(o => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: o.t
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: o.icon,
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, o.m)), /*#__PURE__*/React.createElement("div", {
    className: "cv"
  }, o.v))))))), /*#__PURE__*/React.createElement("section", {
    className: "rtg-farolti"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-farolti-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "database",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, /*#__PURE__*/React.createElement("h3", null, "Hist\xF3rico no ERP legado (Farolti)"), /*#__PURE__*/React.createElement("p", null, "Snapshot importado no cadastro (c\xF3digo 781) \u2014 n\xE3o \xE9 recalculado ao vivo pelo sistema.")), /*#__PURE__*/React.createElement("span", {
    className: "rtg-farolti-badge"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "archive",
    size: 12
  }), " Importado \xB7 congelado")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-farolti-grid"
  }, CLI_FAROLTI.map(f => /*#__PURE__*/React.createElement("div", {
    className: f.abc ? 'rtg-fstat abc' : 'rtg-fstat',
    key: f.k
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-fstat-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, f.k), /*#__PURE__*/React.createElement("span", {
    className: "fic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: f.ic,
    size: 15
  }))), /*#__PURE__*/React.createElement("div", {
    className: f.mono ? 'v mono' : 'v'
  }, f.v), f.s && /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, f.s))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Os n\xFAmeros do ", /*#__PURE__*/React.createElement("b", null, "snapshot Farolti"), " refletem o hist\xF3rico anterior \xE0 migra\xE7\xE3o e permanecem congelados. A atividade a partir de jun/2024 \xE9 calculada em tempo real pelo sistema (blocos acima).")));
}
window.ClienteDetail = ClienteDetail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/ClienteDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/ClientesList.jsx
try { (() => {
/* Retaguarda — Clientes list (click a row to open the detail). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  StatusChip,
  Badge,
  IconTile,
  Button
} = NS;
function ClientesList({
  onOpen,
  onNew
}) {
  const rows = window.RTG.clientes;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Clientes"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus",
    onClick: onNew
  }, "Novo cliente")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table rtg-clickable"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", null, "Tipo"), /*#__PURE__*/React.createElement("th", null, "Cidade"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "OS ativas"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Saldo"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id,
    onClick: () => onOpen(c)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-namecell"
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: c.tipo === 'PJ' ? 'building-2' : 'user',
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, c.nome), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, c.segmento)))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    tone: c.tipo === 'PJ' ? 'info' : 'neutral'
  }, c.tipo)), /*#__PURE__*/React.createElement("td", null, c.cidade || 'Santo Ângelo/RS'), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, c.osAtivas), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, c.saldo), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, c.ativo ? /*#__PURE__*/React.createElement(StatusChip, {
    tone: "success",
    led: true
  }, "Ativo") : /*#__PURE__*/React.createElement(StatusChip, {
    tone: "neutral"
  }, "Inativo"))))))));
}
window.ClientesList = ClientesList;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/ClientesList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/ComprovantesList.jsx
try { (() => {
/* Retaguarda — Comprovantes (recibos de pagamento; filtro por forma). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  Pill,
  Icon
} = NS;
const CMP_ROWS = [{
  data: '05/07',
  forma: 'PIX',
  ic: 'credit-card',
  t: 'PIX recebido — NF 1041',
  cli: 'Agro Vale Verde',
  nf: 'NF 1041',
  v: 'R$ 9.600'
}, {
  data: '03/07',
  forma: 'TED',
  ic: 'landmark',
  t: 'TED recebida — NF 1033',
  cli: 'Construtora Sul',
  nf: 'NF 1033',
  v: 'R$ 7.800'
}, {
  data: '20/06',
  forma: 'PIX',
  ic: 'credit-card',
  t: 'PIX recebido — NF 1029',
  cli: 'Construtora Vale Verde',
  nf: 'NF 1029',
  v: 'R$ 9.500'
}, {
  data: '04/06',
  forma: 'TED',
  ic: 'landmark',
  t: 'TED recebida — NF 1021',
  cli: 'Construtora Vale Verde',
  nf: 'NF 1021',
  v: 'R$ 15.200'
}, {
  data: '22/05',
  forma: 'Boleto',
  ic: 'link',
  t: 'Boleto pago — NF 1015',
  cli: 'Essavado Ltda.',
  nf: 'NF 1015',
  v: 'R$ 7.300'
}, {
  data: '12/05',
  forma: 'PIX',
  ic: 'credit-card',
  t: 'PIX recebido — NF 1012',
  cli: 'Metalúrgica Boa Vista',
  nf: 'NF 1012',
  v: 'R$ 6.400'
}];
const CMP_FILTERS = ['Todos', 'PIX', 'TED', 'Boleto'];
function ComprovantesList() {
  const [filter, setFilter] = React.useState('Todos');
  const rows = filter === 'Todos' ? CMP_ROWS : CMP_ROWS.filter(r => r.forma === filter);
  const count = id => id === 'Todos' ? CMP_ROWS.length : CMP_ROWS.filter(r => r.forma === id).length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Comprovantes"), /*#__PURE__*/React.createElement(Pill, null, "R$ 55.800 no per\xEDodo"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus"
  }, "Anexar comprovante")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-filters"
  }, CMP_FILTERS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    type: "button",
    className: filter === f ? 'rtg-filter is-active' : 'rtg-filter',
    onClick: () => setFilter(f)
  }, f, /*#__PURE__*/React.createElement("span", {
    className: "ct"
  }, count(f))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Data"), /*#__PURE__*/React.createElement("th", null, "Comprovante"), /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", null, "NF"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Valor"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.data), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.ic,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, r.t))), /*#__PURE__*/React.createElement("td", null, r.cli), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-doc"
  }, r.nf)), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.v))))))));
}
window.ComprovantesList = ComprovantesList;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/ComprovantesList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/CustoHora.jsx
try { (() => {
/* Retaguarda — Custo da Hora (custo horário por equipamento; clique numa linha
   para ver a composição). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  KpiCard,
  Card,
  Button,
  Pill,
  IconTile,
  Icon,
  Note,
  StatusChip
} = NS;
const CH_ROWS = [{
  id: 'cat',
  eq: 'Escavadeira CAT 320',
  ic: 'truck',
  horas: '148 h',
  custo: 'R$ 232',
  preco: 'R$ 400',
  margem: '42%',
  dir: 'up',
  comp: [['fuel', 'Diesel', 'R$ 98/h', 42], ['wrench', 'Manutenção', 'R$ 41/h', 18], ['hard-hat', 'Operador', 'R$ 62/h', 27], ['history', 'Depreciação', 'R$ 31/h', 13]]
}, {
  id: 'jcb',
  eq: 'Retroescavadeira JCB 3CX',
  ic: 'tractor',
  horas: '96 h',
  custo: 'R$ 178',
  preco: 'R$ 320',
  margem: '44%',
  dir: 'up',
  comp: [['fuel', 'Diesel', 'R$ 72/h', 40], ['wrench', 'Manutenção', 'R$ 30/h', 17], ['hard-hat', 'Operador', 'R$ 55/h', 31], ['history', 'Depreciação', 'R$ 21/h', 12]]
}, {
  id: 'xcmg',
  eq: 'Pá Carregadeira XCMG',
  ic: 'forklift',
  horas: '74 h',
  custo: 'R$ 195',
  preco: 'R$ 300',
  margem: '35%',
  dir: 'up',
  comp: [['fuel', 'Diesel', 'R$ 84/h', 43], ['wrench', 'Manutenção', 'R$ 38/h', 20], ['hard-hat', 'Operador', 'R$ 52/h', 27], ['history', 'Depreciação', 'R$ 21/h', 10]]
}, {
  id: 'basc',
  eq: 'Caminhão basculante 01',
  ic: 'truck',
  horas: '58 h',
  custo: 'R$ 174',
  preco: 'R$ 220',
  margem: '21%',
  dir: 'down',
  comp: [['fuel', 'Diesel', 'R$ 81/h', 47], ['wrench', 'Manutenção', 'R$ 44/h', 25], ['hard-hat', 'Operador', 'R$ 35/h', 20], ['history', 'Depreciação', 'R$ 14/h', 8]]
}];
function CustoHora({
  onNew
}) {
  const [sel, setSel] = React.useState(CH_ROWS[0]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Custo da Hora"), /*#__PURE__*/React.createElement(Pill, null, "julho/2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "calculator"
  }, "Recalcular custos"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus",
    onClick: onNew
  }, "Novo lan\xE7amento")), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Custo m\xE9dio da hora",
    value: "R$ 198",
    mono: true,
    icon: "calculator",
    foot: "ponderado pelas horas",
    spark: [15, 16, 14, 15, 13, 14, 12, 13]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Horas faturadas",
    value: "376",
    unit: "h",
    icon: "clock",
    trend: {
      dir: 'up',
      value: '6%'
    },
    foot: "vs. junho",
    spark: [19, 17, 18, 13, 14, 9, 11, 6]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Diesel no m\xEAs",
    value: "R$ 28.400",
    mono: true,
    warn: true,
    icon: "fuel",
    foot: "9.400 L consumidos"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Margem m\xE9dia",
    value: "38%",
    icon: "trending-up",
    trend: {
      dir: 'up',
      value: '3 p.p.'
    },
    foot: "vs. junho",
    spark: [14, 13, 14, 12, 11, 10, 9, 7]
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Custo por equipamento",
    icon: "calculator",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, CH_ROWS.length, " equipamentos")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table rtg-clickable"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Horas (m\xEAs)"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Custo/h"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Pre\xE7o/h"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Margem"))), /*#__PURE__*/React.createElement("tbody", null, CH_ROWS.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    className: sel.id === r.id ? 'is-selected' : '',
    onClick: () => setSel(r)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.ic,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, r.eq))), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.horas), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.custo), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.preco), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: `atp-trend atp-trend--${r.dir}`,
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 13,
    style: r.dir === 'down' ? {
      transform: 'rotate(90deg)'
    } : undefined
  }), r.margem)))))))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "O custo da hora soma ", /*#__PURE__*/React.createElement("b", null, "diesel"), ", ", /*#__PURE__*/React.createElement("b", null, "manuten\xE7\xE3o"), ", ", /*#__PURE__*/React.createElement("b", null, "operador"), " e ", /*#__PURE__*/React.createElement("b", null, "deprecia\xE7\xE3o"), " por hor\xEDmetro. Valores ficam restritos a este m\xF3dulo, ", /*#__PURE__*/React.createElement("b", null, "Financeiro"), " e ", /*#__PURE__*/React.createElement("b", null, "Rentabilidade"), ", conforme o particionamento de acesso.")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: `Composição — ${sel.eq}`,
    icon: sel.ic,
    headerRight: /*#__PURE__*/React.createElement(Pill, null, sel.custo, "/h")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist",
    style: {
      padding: '10px 18px 16px'
    }
  }, sel.comp.map(([ic, t, v, pct]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      padding: '10px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: ic,
    tone: "amber",
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    className: "rtg-val",
    style: {
      fontSize: 12.5
    }
  }, v), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 11px/1 var(--font-mono)',
      color: 'var(--muted-2)',
      width: 34,
      textAlign: 'right'
    }
  }, pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: 'var(--surface-2)',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: pct + '%',
      borderRadius: 3,
      background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))'
    }
  })))))), /*#__PURE__*/React.createElement(Card, {
    title: "Pre\xE7o de tabela",
    icon: "tag",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 10px/1 var(--font-display)',
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'var(--muted-2)'
    }
  }, sel.eq), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 23px/1 var(--font-mono)',
      marginTop: 8
    }
  }, sel.preco, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--muted)'
    }
  }, "/h"))), sel.dir === 'up' ? /*#__PURE__*/React.createElement(StatusChip, {
    tone: "success",
    led: true
  }, "Margem saud\xE1vel") : /*#__PURE__*/React.createElement(StatusChip, {
    tone: "danger",
    icon: "circle-alert"
  }, "Margem apertada"))))));
}
window.CustoHora = CustoHora;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/CustoHora.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Dashboard.jsx
try { (() => {
/* Retaguarda — Dashboard (company-wide operational overview). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  KpiCard,
  Card,
  StatusChip,
  Pill,
  IconTile,
  Icon
} = NS;
const DASH_OS = [{
  n: 'OS-021',
  t: 'Terraplenagem — lote industrial',
  cli: 'Construtora Vale Verde',
  h: '62 h',
  d: 'desde 01/07',
  tone: 'amber',
  st: 'Em andamento'
}, {
  n: 'OS-019',
  t: 'Abertura de acesso e drenagem',
  cli: 'Construtora Sul',
  h: '28 h',
  d: 'desde 24/06',
  tone: 'amber',
  st: 'Em andamento'
}, {
  n: 'OS-018',
  t: 'Abertura de acesso e drenagem',
  cli: 'Essavado Ltda.',
  h: '40 h',
  d: 'desde 20/06',
  tone: 'amber',
  st: 'Em andamento'
}, {
  n: 'OS-024',
  t: 'Nivelamento de pátio',
  cli: 'Agro Vale Verde',
  h: '8 h',
  d: 'desde 05/07',
  tone: 'info',
  st: 'Aberta'
}];
const DASH_APONT = [{
  op: 'Adelar Machado',
  eq: 'Escavadeira CAT 320',
  eqIcon: 'truck',
  h0: '4.210',
  h1: '4.218',
  hrs: '8,0 h',
  os: 'OS-021'
}, {
  op: 'Vilson Prediger',
  eq: 'Retroescavadeira JCB 3CX',
  eqIcon: 'tractor',
  h0: '1.888',
  h1: '1.895',
  hrs: '7,0 h',
  os: 'OS-019'
}, {
  op: 'Nelson Kunz',
  eq: 'Pá Carregadeira XCMG',
  eqIcon: 'forklift',
  h0: '998',
  h1: '1.004',
  hrs: '6,0 h',
  os: 'OS-024'
}, {
  op: 'Ivo Scherer',
  eq: 'Caminhão basculante',
  eqIcon: 'truck',
  h0: '2.130',
  h1: '2.138',
  hrs: '8,0 h',
  os: 'OS-018'
}];
const DASH_FROTA = [{
  eq: 'Escavadeira CAT 320',
  ic: 'truck',
  tone: 'success',
  st: 'Em operação'
}, {
  eq: 'Retroescavadeira JCB 3CX',
  ic: 'tractor',
  tone: 'success',
  st: 'Em operação'
}, {
  eq: 'Pá Carregadeira XCMG',
  ic: 'forklift',
  tone: 'amber',
  st: 'Em manutenção'
}, {
  eq: 'Caminhão basculante 02',
  ic: 'truck',
  tone: 'neutral',
  st: 'Parado'
}];
const DASH_VENC = [{
  doc: 'NF 1042',
  cli: 'Construtora Vale Verde',
  m: 'vence 20/07',
  v: 'R$ 12.400',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'NF 1038',
  cli: 'Construtora Vale Verde',
  m: 'vence 12/07',
  v: 'R$ 8.900',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'NF 1035',
  cli: 'Essavado Ltda.',
  m: 'venceu 05/07',
  v: 'R$ 11.100',
  tone: 'danger',
  icon: 'circle-alert',
  st: 'Vencido'
}];
const DASH_BARS = [['S1', 58], ['S2', 66], ['S3', 61], ['S4', 74], ['S5', 70], ['S6', 79], ['S7', 68], ['S8', 88]];
function Dashboard({
  onNavigate
}) {
  const [tab, setTab] = React.useState('geral');
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Dashboard"), /*#__PURE__*/React.createElement(Pill, null, "julho/2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "rtg-pagesub"
  }, "Vis\xE3o geral da opera\xE7\xE3o \u2014 equipamentos, ordens e faturamento."), /*#__PURE__*/React.createElement("div", {
    className: "rtg-tabs",
    role: "tablist"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "tab",
    "aria-selected": tab === 'geral',
    className: tab === 'geral' ? 'rtg-tab is-active' : 'rtg-tab',
    onClick: () => setTab('geral')
  }, "Vis\xE3o geral"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "tab",
    "aria-selected": tab === 'op',
    className: tab === 'op' ? 'rtg-tab is-active' : 'rtg-tab',
    onClick: () => setTab('op')
  }, "Operacional")), tab === 'op' ? /*#__PURE__*/React.createElement(window.DashboardOperacional, {
    onNavigate: onNavigate
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Faturamento no m\xEAs",
    value: "R$ 86.200",
    mono: true,
    icon: "credit-card",
    trend: {
      dir: 'up',
      value: '11%'
    },
    foot: "vs. junho",
    spark: [18, 16, 17, 12, 13, 9, 10, 5]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Horas apontadas",
    value: "640",
    unit: "h",
    icon: "clock",
    trend: {
      dir: 'up',
      value: '6%'
    },
    foot: "vs. junho",
    spark: [19, 17, 18, 13, 14, 9, 11, 6]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "OS em andamento",
    value: "7",
    icon: "clipboard-list",
    foot: "3 abrem esta semana",
    spark: [14, 15, 11, 12, 9, 11, 8, 9]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Saldo a receber",
    value: "R$ 61.900",
    mono: true,
    warn: true,
    icon: "hand-coins",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "5 t\xEDtulos \xB7 ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--danger-fg)',
        fontWeight: 600
      }
    }, "2 vencidos"))
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "OS em andamento",
    icon: "clipboard-list",
    headerRight: /*#__PURE__*/React.createElement("span", {
      className: "rtg-link",
      onClick: () => onNavigate && onNavigate('os')
    }, "Ver todas ", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14
    }))
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-oslist"
  }, DASH_OS.map(s => /*#__PURE__*/React.createElement("div", {
    className: "rtg-osrow",
    key: s.n
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-osnum"
  }, s.n), /*#__PURE__*/React.createElement("div", {
    className: "rtg-osbody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, s.t), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 12
  }), " ", s.cli), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 12
  }), " ", s.h), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 12
  }), " ", s.d))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-osend"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: s.tone,
    led: true
  }, s.st)))))), /*#__PURE__*/React.createElement(Card, {
    title: "Apontamentos de hoje",
    icon: "gauge",
    headerRight: /*#__PURE__*/React.createElement("span", {
      className: "rtg-link",
      onClick: () => onNavigate && onNavigate('operadores')
    }, "Ver todos ", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14
    }))
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Operador"), /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", null, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Horas"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "OS"))), /*#__PURE__*/React.createElement("tbody", null, DASH_APONT.map((a, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 600
    }
  }, a.op), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.eqIcon,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, a.eq))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-horim"
  }, /*#__PURE__*/React.createElement("b", null, a.h0), " \u2192 ", /*#__PURE__*/React.createElement("b", null, a.h1))), /*#__PURE__*/React.createElement("td", {
    className: "r",
    style: {
      fontWeight: 600
    }
  }, a.hrs), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, a.os)))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Frota",
    icon: "truck",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "14 equipamentos")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, DASH_FROTA.map(f => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: f.eq
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: f.ic,
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, f.eq)), /*#__PURE__*/React.createElement(StatusChip, {
    tone: f.tone,
    led: f.tone !== 'neutral'
  }, f.st))))), /*#__PURE__*/React.createElement(Card, {
    title: "Vencimentos pr\xF3ximos",
    icon: "wallet",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "R$ 32.400")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, DASH_VENC.map(v => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: v.doc
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "file-check",
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, v.doc, " \u2014 ", v.cli), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, v.m)), /*#__PURE__*/React.createElement("div", {
    className: "cv"
  }, v.v, /*#__PURE__*/React.createElement(StatusChip, {
    tone: v.tone,
    led: v.led,
    icon: v.icon,
    style: {
      padding: '2px 7px'
    }
  }, v.st)))))), /*#__PURE__*/React.createElement(Card, {
    title: "Horas por semana",
    icon: "bar-chart"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars"
  }, DASH_BARS.map(([lbl, h], i) => /*#__PURE__*/React.createElement("div", {
    className: "rtg-barcol",
    key: lbl
  }, /*#__PURE__*/React.createElement("div", {
    className: i === DASH_BARS.length - 1 ? 'rtg-bar hi' : 'rtg-bar',
    style: {
      height: h + '%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "rtg-barlbl"
  }, lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars-meta"
  }, /*#__PURE__*/React.createElement("span", null, "M\xE9dia ", /*#__PURE__*/React.createElement("b", null, "158 h"), "/semana"), /*#__PURE__*/React.createElement("span", null, "Pico ", /*#__PURE__*/React.createElement("b", null, "176 h"), " (S8)"))))))));
}
window.Dashboard = Dashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/DashboardOperacional.jsx
try { (() => {
/* Retaguarda — Dashboard · aba Operacional (tempo real: mapa, ordens, financeiro, manutenção preditiva). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Pill,
  Icon,
  Sparkline,
  Button,
  StatusChip
} = NS;
const OP_SVG = {
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  tractor: '<path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20"/><path d="M16 18h-5"/><path d="M18 5a1 1 0 0 0-1 1v5.573"/><path d="M3 4h8.129a1 1 0 0 1 .99.863L13 11.246"/><path d="M4 11V4"/><path d="M7 15h.01"/><path d="M8 10.1V4"/><circle cx="18" cy="18" r="2"/><circle cx="7" cy="15" r="5"/>',
  forklift: '<path d="M12 12H5a2 2 0 0 0-2 2v5"/><path d="M15 19h7"/><path d="M16 19V2"/><path d="M6 12V7a2 2 0 0 1 2-2h2.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 16 10.828"/><path d="M7 19h4"/><circle cx="13" cy="19" r="2"/><circle cx="5" cy="19" r="2"/>'
};
const OP_PINS = [{
  ll: [-28.296, -54.281],
  eq: 'Escavadeira CAT 320',
  os: 'OS-021',
  op: 'Adelar Machado',
  g: 'truck'
}, {
  ll: [-28.308, -54.252],
  eq: 'Retroescavadeira JCB 3CX',
  os: 'OS-019',
  op: 'Vilson Prediger',
  g: 'tractor'
}, {
  ll: [-28.313, -54.272],
  eq: 'Pá Carregadeira XCMG',
  os: 'OS-024',
  op: 'Nelson Kunz',
  g: 'forklift'
}, {
  ll: [-28.291, -54.259],
  eq: 'Caminhão basculante',
  os: 'OS-018',
  op: 'Ivo Scherer',
  g: 'truck'
}];
const OP_NOVAS = [40, 80, 0, 40, 0, 80, 40];
const OP_MANUT = [{
  eq: 'Pá Carregadeira XCMG',
  ic: 'forklift',
  al: 'Plano 1.000 h — óleo e filtros',
  v: 'vencida · −18 h',
  pct: 100,
  c: 'var(--danger)',
  late: true
}, {
  eq: 'Escavadeira Volvo EC140',
  ic: 'truck',
  al: 'Plano 7.500 h — filtros e óleos',
  v: 'em 12 h',
  pct: 92,
  c: 'var(--amarelo)'
}, {
  eq: 'Escavadeira CAT 320',
  ic: 'truck',
  al: 'Plano 4.300 h — filtros e graxa',
  v: 'em 82 h',
  pct: 58,
  c: 'var(--success-fg)'
}, {
  eq: 'Retroescavadeira JCB 3CX',
  ic: 'tractor',
  al: 'Plano 2.000 h — revisão geral',
  v: 'em 105 h',
  pct: 48,
  c: 'var(--success-fg)'
}, {
  eq: 'Rolo compactador CA25',
  ic: 'tractor',
  al: 'Plano 3.000 h — óleo e filtros',
  v: 'em 130 h',
  pct: 35,
  c: 'var(--success-fg)'
}];
const OP_RECV_MAX = 21300;
const OP_RECV = [{
  cli: 'Construtora Vale Verde',
  total: 'R$ 21.300',
  seg: [{
    v: 12400,
    c: 'var(--amarelo)'
  }, {
    v: 8900,
    c: 'var(--amarelo-deep)'
  }]
}, {
  cli: 'Construtora Sul',
  total: 'R$ 19.900',
  seg: [{
    v: 19900,
    c: 'var(--danger)'
  }]
}, {
  cli: 'Essavado Ltda.',
  total: 'R$ 11.100',
  seg: [{
    v: 11100,
    c: 'var(--danger)'
  }]
}, {
  cli: 'Agro Vale Verde',
  total: 'R$ 9.600',
  seg: [{
    v: 9600,
    c: 'var(--amarelo)'
  }]
}];
const OP_HOJE = [{
  os: 'OS-021',
  op: 'Adelar Machado',
  h: '8,0 h'
}, {
  os: 'OS-019',
  op: 'Vilson Prediger',
  h: '7,0 h'
}, {
  os: 'OS-024',
  op: 'Nelson Kunz',
  h: '6,0 h'
}];
function DashboardOperacional({
  onNavigate
}) {
  const mapEl = React.useRef(null);
  const mapObj = React.useRef(null);
  const [mapErr, setMapErr] = React.useState(false);
  React.useEffect(() => {
    let dead = false;
    function init() {
      if (dead || !mapEl.current || mapObj.current || !window.L) return;
      const L = window.L;
      const map = L.map(mapEl.current, {
        scrollWheelZoom: false
      }).setView([-28.302, -54.266], 14);
      map.attributionControl.setPosition('topright');
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Imagens © Esri'
      }).addTo(map);
      OP_PINS.forEach(p => {
        L.marker(p.ll, {
          icon: L.divIcon({
            className: 'rtg-pin',
            html: '<div class="bx"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + OP_SVG[p.g] + '</svg></div><div class="tl"></div>',
            iconSize: [30, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -34]
          })
        }).addTo(map).bindPopup('<b>' + p.eq + '</b><br>' + p.os + ' — ' + p.op);
      });
      mapObj.current = map;
    }
    if (window.L) init();else {
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link');
        css.id = 'leaflet-css';
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      let s = document.getElementById('leaflet-js');
      if (!s) {
        s = document.createElement('script');
        s.id = 'leaflet-js';
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(s);
      }
      s.addEventListener('load', init);
      s.addEventListener('error', () => {
        if (!dead) setMapErr(true);
      });
    }
    return () => {
      dead = true;
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "rtg-opgrid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Operacional em tempo real",
    icon: "map-pin",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "4 equipamentos em campo")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-map-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    ref: mapEl,
    className: "rtg-map"
  }), mapErr && /*#__PURE__*/React.createElement("div", {
    className: "rtg-map-fallback"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 22
  }), /*#__PURE__*/React.createElement("br", null), "Mapa indispon\xEDvel offline \u2014 4 equipamentos em campo (OS-018, 019, 021, 024).")), /*#__PURE__*/React.createElement("span", {
    className: "rtg-map-live"
  }, /*#__PURE__*/React.createElement("i", null), "Ao vivo"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-map-ov"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sun",
    size: 15
  }), " ", /*#__PURE__*/React.createElement("b", null, "17\xB0"), "\xA0\xB7 Santo \xC2ngelo \u2014 RS \xB7 c\xE9u limpo", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "hard-hat",
    size: 15
  }), " 4 operadores em campo"))), /*#__PURE__*/React.createElement(Card, {
    title: "Manuten\xE7\xE3o preditiva",
    icon: "wrench",
    headerRight: /*#__PURE__*/React.createElement("span", {
      className: "rtg-link",
      onClick: () => onNavigate && onNavigate('manutencao')
    }, "Ver todas ", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14
    }))
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", null, "Alerta"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Vence"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Sa\xFAde"))), /*#__PURE__*/React.createElement("tbody", null, OP_MANUT.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.eq
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: m.ic,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, m.eq))), /*#__PURE__*/React.createElement("td", {
    style: {
      color: 'var(--muted)'
    }
  }, m.al), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontWeight: 600,
      color: m.late ? 'var(--danger-fg)' : 'var(--fg)'
    }
  }, m.v)), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-health"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: m.pct + '%',
      background: m.c
    }
  }))))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow rtg-opsec"
  }, "Ordens e horas"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-optiles"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-optile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Abertas"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "4"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-minibars"
  }, OP_NOVAS.map((h, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    className: h ? '' : 'z',
    style: {
      height: (h || 8) + '%'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "Novas OS \xB7 \xFAltimos 7 dias")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-optile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Em andamento"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "7"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-statlist"
  }, /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--amarelo)'
    }
  }), "Em andamento", /*#__PURE__*/React.createElement("b", null, "7")), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--info-fg)'
    }
  }), "Abertas", /*#__PURE__*/React.createElement("b", null, "4")), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--success-fg)'
    }
  }), "Conclu\xEDdas no m\xEAs", /*#__PURE__*/React.createElement("b", null, "6")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-optile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Horas apontadas"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "640", /*#__PURE__*/React.createElement("span", {
    className: "u"
  }, "h")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-minirows"
  }, OP_HOJE.map(r => /*#__PURE__*/React.createElement("div", {
    className: "r",
    key: r.os
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag",
    style: {
      padding: '2px 6px',
      fontSize: 11
    }
  }, r.os), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, r.op.split(' ')[0]), /*#__PURE__*/React.createElement("b", null, r.h)))), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "Hoje \xB7 21 h em 3 OS")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow rtg-opsec"
  }, "Financeiro"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-optiles"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-optile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Executado"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, "R$ 98.400"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "servi\xE7o executado no m\xEAs"), /*#__PURE__*/React.createElement(Sparkline, {
    points: [19, 17, 18, 13, 14, 10, 11, 5],
    width: 170,
    height: 30,
    style: {
      display: 'block',
      marginTop: 12
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-optile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Faturado"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, "R$ 86.200"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-trend atp-trend--up"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 12
  }), "11%"), " vs. junho"), /*#__PURE__*/React.createElement(Sparkline, {
    points: [18, 16, 17, 12, 13, 9, 10, 5],
    width: 170,
    height: 30,
    style: {
      display: 'block',
      marginTop: 12
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-optile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Recebido"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, "R$ 55.800"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-trend atp-trend--down"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 12,
    style: {
      transform: 'rotate(90deg)'
    }
  }), "4%"), " vs. junho"), /*#__PURE__*/React.createElement(Sparkline, {
    points: [16, 17, 14, 15, 12, 13, 12, 14],
    width: 170,
    height: 30,
    stroke: "var(--amarelo-dim)",
    style: {
      display: 'block',
      marginTop: 12
    }
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Contas a receber por cliente",
    icon: "hand-coins",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "R$ 61.900 em aberto")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-recv"
  }, OP_RECV.map(r => /*#__PURE__*/React.createElement("div", {
    className: "rtg-recv-row",
    key: r.cli
  }, /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, r.cli), /*#__PURE__*/React.createElement("span", {
    className: "rtg-recv-bar"
  }, r.seg.map((s, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      width: s.v / OP_RECV_MAX * 100 + '%',
      background: s.c
    }
  }))), /*#__PURE__*/React.createElement("span", {
    className: "vl"
  }, r.total))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-recv-legend"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--amarelo)'
    }
  }), "A vencer \xB7 0\u201315 dias"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--amarelo-deep)'
    }
  }), "A vencer \xB7 16\u201330 dias"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--danger)'
    }
  }), "Vencida")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow rtg-opsec"
  }, "Atalhos e a\xE7\xF5es r\xE1pidas"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-shortcuts"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus",
    onClick: () => onNavigate && onNavigate('os')
  }, "Nova O.S."), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "file-text",
    onClick: () => onNavigate && onNavigate('orcamentos')
  }, "Novo or\xE7amento"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "users",
    onClick: () => onNavigate && onNavigate('clientes')
  }, "Novo cliente"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "fuel",
    onClick: () => onNavigate && onNavigate('diesel')
  }, "Registrar abastecimento"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "bar-chart",
    onClick: () => onNavigate && onNavigate('painel')
  }, "Gerar relat\xF3rio")))));
}
window.DashboardOperacional = DashboardOperacional;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/DashboardOperacional.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Diesel.jsx
try { (() => {
/* Retaguarda — Diesel (abastecimentos, consumo por equipamento, tanque interno). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  KpiCard,
  Card,
  Button,
  Pill,
  IconTile,
  Icon,
  Note
} = NS;
const DSL_ABAST = [{
  data: '09/07',
  eq: 'Escavadeira CAT 320',
  ic: 'truck',
  orig: 'Tanque interno',
  hor: '4.218',
  l: '110 L',
  rl: 'R$ 5,84',
  v: 'R$ 642'
}, {
  data: '08/07',
  eq: 'Caminhão basculante 01',
  ic: 'truck',
  orig: 'Posto Missões',
  hor: '2.138',
  l: '180 L',
  rl: 'R$ 6,04',
  v: 'R$ 1.087'
}, {
  data: '07/07',
  eq: 'Retroescavadeira JCB 3CX',
  ic: 'tractor',
  orig: 'Tanque interno',
  hor: '1.895',
  l: '85 L',
  rl: 'R$ 5,84',
  v: 'R$ 496'
}, {
  data: '05/07',
  eq: 'Pá Carregadeira XCMG',
  ic: 'forklift',
  orig: 'Tanque interno',
  hor: '1.004',
  l: '95 L',
  rl: 'R$ 5,84',
  v: 'R$ 555'
}, {
  data: '04/07',
  eq: 'Escavadeira CAT 320',
  ic: 'truck',
  orig: 'Posto Missões',
  hor: '4.203',
  l: '120 L',
  rl: 'R$ 6,04',
  v: 'R$ 725'
}, {
  data: '03/07',
  eq: 'Rolo compactador CA25',
  ic: 'tractor',
  orig: 'Tanque interno',
  hor: '2.880',
  l: '60 L',
  rl: 'R$ 5,84',
  v: 'R$ 350'
}];
const DSL_CONSUMO = [{
  eq: 'Basculante 01',
  ic: 'truck',
  v: '18,4 L/h',
  pct: 100
}, {
  eq: 'CAT 320',
  ic: 'truck',
  v: '14,2 L/h',
  pct: 77
}, {
  eq: 'Pá XCMG',
  ic: 'forklift',
  v: '11,5 L/h',
  pct: 63
}, {
  eq: 'Retro JCB 3CX',
  ic: 'tractor',
  v: '9,8 L/h',
  pct: 53
}, {
  eq: 'Rolo CA25',
  ic: 'tractor',
  v: '8,6 L/h',
  pct: 47
}];
function Diesel({
  onNew
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Diesel"), /*#__PURE__*/React.createElement(Pill, null, "julho/2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "fuel",
    onClick: onNew
  }, "Novo abastecimento")), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Diesel no m\xEAs",
    value: "R$ 28.400",
    mono: true,
    warn: true,
    icon: "fuel",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "vs. junho ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--down)',
        fontWeight: 600
      }
    }, "+9%"))
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Litros no m\xEAs",
    value: "9.400",
    unit: "L",
    mono: true,
    icon: "gauge",
    foot: "42 abastecimentos",
    spark: [14, 15, 13, 16, 14, 17, 15, 18]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Pre\xE7o m\xE9dio do litro",
    value: "R$ 5,92",
    mono: true,
    icon: "dollar-sign",
    foot: "tanque R$ 5,84 \xB7 posto R$ 6,04"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Consumo m\xE9dio",
    value: "13,8",
    unit: "L/h",
    mono: true,
    icon: "truck",
    foot: "frota em opera\xE7\xE3o",
    spark: [15, 14, 15, 13, 14, 13, 14, 12]
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Abastecimentos",
    icon: "fuel",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "42 no m\xEAs")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap rtg-tablewrap--wide"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Data"), /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", null, "Origem"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Litros"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "R$/L"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Valor"))), /*#__PURE__*/React.createElement("tbody", null, DSL_ABAST.map((a, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, a.data), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.ic,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, a.eq))), /*#__PURE__*/React.createElement("td", null, a.orig), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, a.hor), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, a.l), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, a.rl), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, a.v))))))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Cada abastecimento entra no c\xE1lculo do ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " pelo hor\xEDmetro do equipamento. Compras de diesel aparecem em ", /*#__PURE__*/React.createElement("b", null, "Financeiro \u203A Contas a pagar"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Consumo por equipamento",
    icon: "gauge",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "L/h no m\xEAs")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 18px 16px'
    }
  }, DSL_CONSUMO.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.eq,
    style: {
      padding: '10px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: c.ic,
    tone: "amber",
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600
    }
  }, c.eq), /*#__PURE__*/React.createElement("span", {
    className: "rtg-val",
    style: {
      fontSize: 12.5
    }
  }, c.v)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: 'var(--surface-2)',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: c.pct + '%',
      borderRadius: 3,
      background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))'
    }
  })))))), /*#__PURE__*/React.createElement(Card, {
    title: "Tanque interno",
    icon: "database",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 23px/1 var(--font-mono)'
    }
  }, "1.230 L"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--muted)'
    }
  }, "de 2.000 L \xB7 62%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      borderRadius: 4,
      background: 'var(--surface-2)',
      margin: '12px 0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: '62%',
      borderRadius: 4,
      background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted-2)'
    }
  }, "\xDAltima compra ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg)',
      fontFamily: 'var(--font-mono)'
    }
  }, "02/07"), " \xB7 4.000 L \xB7 Posto Miss\xF5es")))));
}
window.Diesel = Diesel;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Diesel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/EquipamentosList.jsx
try { (() => {
/* Retaguarda — Equipamentos list (frota; filtro por situação). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  StatusChip,
  Badge,
  Button,
  Pill,
  Icon
} = NS;
const EQ_ROWS = [{
  id: 'cat320',
  nome: 'Escavadeira CAT 320',
  sub: 'Caterpillar · 2019',
  ic: 'truck',
  tipo: 'Escavadeira',
  hor: '4.218',
  mes: '148 h',
  diesel: '14,2 L/h',
  prox: 'em 82 h',
  st: 'Em operação',
  tone: 'success'
}, {
  id: 'jcb',
  nome: 'Retroescavadeira JCB 3CX',
  sub: 'JCB · 2021',
  ic: 'tractor',
  tipo: 'Retroescavadeira',
  hor: '1.895',
  mes: '96 h',
  diesel: '9,8 L/h',
  prox: 'em 105 h',
  st: 'Em operação',
  tone: 'success'
}, {
  id: 'xcmg',
  nome: 'Pá Carregadeira XCMG',
  sub: 'XCMG LW300 · 2020',
  ic: 'forklift',
  tipo: 'Pá carregadeira',
  hor: '1.004',
  mes: '74 h',
  diesel: '11,5 L/h',
  prox: 'vencida',
  proxLate: true,
  st: 'Em manutenção',
  tone: 'amber'
}, {
  id: 'volvo',
  nome: 'Escavadeira Volvo EC140',
  sub: 'Volvo · 2017',
  ic: 'truck',
  tipo: 'Escavadeira',
  hor: '7.612',
  mes: '0 h',
  diesel: '15,1 L/h',
  prox: 'em 12 h',
  st: 'Em manutenção',
  tone: 'amber'
}, {
  id: 'basc01',
  nome: 'Caminhão basculante 01',
  sub: 'VW Constellation · 2018',
  ic: 'truck',
  tipo: 'Caminhão',
  hor: '2.138',
  mes: '58 h',
  diesel: '18,4 L/h',
  prox: 'em 60 h',
  st: 'Em operação',
  tone: 'success'
}, {
  id: 'basc02',
  nome: 'Caminhão basculante 02',
  sub: 'Mercedes Axor · 2015',
  ic: 'truck',
  tipo: 'Caminhão',
  hor: '3.410',
  mes: '0 h',
  diesel: '19,0 L/h',
  prox: '—',
  st: 'Parado',
  tone: 'neutral'
}, {
  id: 'rolo',
  nome: 'Rolo compactador CA25',
  sub: 'Dynapac · 2016',
  ic: 'tractor',
  tipo: 'Compactador',
  hor: '2.880',
  mes: '22 h',
  diesel: '8,6 L/h',
  prox: 'em 130 h',
  st: 'Em operação',
  tone: 'success'
}, {
  id: 'prancha',
  nome: 'Prancha de transporte',
  sub: 'Randon · 2019',
  ic: 'truck',
  tipo: 'Implemento',
  hor: '—',
  mes: '16 h',
  diesel: '—',
  prox: 'em 90 dias',
  st: 'Em operação',
  tone: 'success'
}];
const EQ_FILTERS = [{
  id: 'todos',
  label: 'Todos'
}, {
  id: 'Em operação',
  label: 'Em operação',
  tone: 'success'
}, {
  id: 'Em manutenção',
  label: 'Em manutenção',
  tone: 'amber'
}, {
  id: 'Parado',
  label: 'Parados',
  tone: 'neutral'
}];
function EquipamentosList({
  onNew
}) {
  const [filter, setFilter] = React.useState('todos');
  const rows = filter === 'todos' ? EQ_ROWS : EQ_ROWS.filter(r => r.st === filter);
  const count = id => id === 'todos' ? EQ_ROWS.length : EQ_ROWS.filter(r => r.st === id).length;
  const ledColor = tone => tone === 'success' ? 'var(--success-fg)' : tone === 'amber' ? 'var(--amarelo)' : 'var(--muted-2)';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Equipamentos"), /*#__PURE__*/React.createElement(Pill, null, "14 na frota"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus",
    onClick: onNew
  }, "Novo equipamento")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-filters"
  }, EQ_FILTERS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    type: "button",
    className: filter === f.id ? 'rtg-filter is-active' : 'rtg-filter',
    onClick: () => setFilter(f.id)
  }, f.tone && /*#__PURE__*/React.createElement("span", {
    className: "led",
    style: {
      color: ledColor(f.tone)
    }
  }), f.label, /*#__PURE__*/React.createElement("span", {
    className: "ct"
  }, count(f.id))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap rtg-tablewrap--wide"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", null, "Tipo"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Horas (m\xEAs)"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Diesel m\xE9dio"), /*#__PURE__*/React.createElement("th", null, "Pr\xF3x. manuten\xE7\xE3o"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-namecell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 30,
      height: 30
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.ic,
    size: 16
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, r.nome), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, r.sub)))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, r.tipo)), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.hor), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.mes), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.diesel), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: r.proxLate ? {
      color: 'var(--danger-fg)',
      fontWeight: 600
    } : undefined
  }, r.prox), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: r.tone,
    led: r.tone !== 'neutral'
  }, r.st)))))))));
}
window.EquipamentosList = EquipamentosList;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/EquipamentosList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Faturamento.jsx
try { (() => {
/* Retaguarda — Faturamento (NFs emitidas, OS a faturar, evolução mensal). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  KpiCard,
  Card,
  StatusChip,
  Button,
  Pill,
  Icon
} = NS;
const FAT_NFS = [{
  nf: 'NF 1042',
  cli: 'Construtora Vale Verde',
  os: 'OS-021',
  em: '05/07',
  v: 'R$ 12.400',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  nf: 'NF 1041',
  cli: 'Agro Vale Verde',
  os: 'OS-024',
  em: '03/07',
  v: 'R$ 9.600',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  nf: 'NF 1038',
  cli: 'Construtora Vale Verde',
  os: 'OS-018',
  em: '28/06',
  v: 'R$ 8.900',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  nf: 'NF 1035',
  cli: 'Essavado Ltda.',
  os: 'OS-016',
  em: '20/06',
  v: 'R$ 11.100',
  tone: 'danger',
  icon: 'circle-alert',
  st: 'Vencida'
}, {
  nf: 'NF 1029',
  cli: 'Construtora Vale Verde',
  os: 'OS-012',
  em: '05/06',
  v: 'R$ 9.500',
  tone: 'success',
  icon: 'check',
  st: 'Paga'
}, {
  nf: 'NF 1021',
  cli: 'Construtora Vale Verde',
  os: 'OS-007',
  em: '20/05',
  v: 'R$ 15.200',
  tone: 'success',
  icon: 'check',
  st: 'Paga'
}];
const FAT_PENDENTES = [{
  os: 'OS-015',
  t: 'Fundação de galpão — estacas',
  cli: 'Metalúrgica Boa Vista',
  v: 'R$ 19.800'
}, {
  os: 'OS-011',
  t: 'Limpeza de terreno',
  cli: 'Construtora Sul',
  v: 'R$ 6.400'
}];
const FAT_MESES = [['fev', 52], ['mar', 61], ['abr', 58], ['mai', 74], ['jun', 78], ['jul', 88]];
function Faturamento({
  onNew
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Faturamento"), /*#__PURE__*/React.createElement(Pill, null, "julho/2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-check",
    onClick: onNew
  }, "Emitir NF")), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Faturado no m\xEAs",
    value: "R$ 86.200",
    mono: true,
    icon: "credit-card",
    trend: {
      dir: 'up',
      value: '11%'
    },
    foot: "vs. junho",
    spark: [18, 16, 17, 12, 13, 9, 10, 5]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "NFs emitidas",
    value: "12",
    icon: "file-check",
    foot: "no m\xEAs",
    spark: [15, 14, 15, 12, 13, 10, 11, 8]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "A faturar",
    value: "R$ 26.200",
    mono: true,
    warn: true,
    icon: "clipboard-list",
    foot: "2 OS conclu\xEDdas sem NF"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Ticket m\xE9dio",
    value: "R$ 7.183",
    mono: true,
    icon: "dollar-sign",
    foot: "por NF no m\xEAs"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Notas fiscais emitidas",
    icon: "file-check",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "12 no m\xEAs")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "NF"), /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", null, "OS"), /*#__PURE__*/React.createElement("th", null, "Emiss\xE3o"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Valor"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, FAT_NFS.map(n => /*#__PURE__*/React.createElement("tr", {
    key: n.nf
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-doc"
  }, n.nf)), /*#__PURE__*/React.createElement("td", null, n.cli), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, n.os)), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, n.em), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, n.v), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: n.tone,
    led: n.led,
    icon: n.icon
  }, n.st))))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "A faturar",
    icon: "clipboard-list",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "R$ 26.200")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, FAT_PENDENTES.map(p => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: p.os
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, p.os), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, p.t), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, p.cli)), /*#__PURE__*/React.createElement("div", {
    className: "cv"
  }, p.v), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    icon: "file-check"
  }, "Emitir"))))), /*#__PURE__*/React.createElement(Card, {
    title: "Faturamento por m\xEAs",
    icon: "bar-chart"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars"
  }, FAT_MESES.map(([lbl, h], i) => /*#__PURE__*/React.createElement("div", {
    className: "rtg-barcol",
    key: lbl
  }, /*#__PURE__*/React.createElement("div", {
    className: i === FAT_MESES.length - 1 ? 'rtg-bar hi' : 'rtg-bar',
    style: {
      height: h + '%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "rtg-barlbl"
  }, lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars-meta"
  }, /*#__PURE__*/React.createElement("span", null, "M\xE9dia ", /*#__PURE__*/React.createElement("b", null, "R$ 71.400"), "/m\xEAs"), /*#__PURE__*/React.createElement("span", null, "Pico ", /*#__PURE__*/React.createElement("b", null, "R$ 86.200"), " (jul)")))))));
}
window.Faturamento = Faturamento;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Faturamento.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Financeiro.jsx
try { (() => {
/* Retaguarda — Financeiro (contas a receber / a pagar, comprovantes). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  KpiCard,
  Card,
  StatusChip,
  Button,
  Pill,
  IconTile,
  Icon
} = NS;
const FIN_RECEBER = [{
  doc: 'NF 1042',
  cli: 'Construtora Vale Verde',
  em: '05/07',
  vc: '20/07',
  v: 'R$ 12.400',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'NF 1041',
  cli: 'Agro Vale Verde',
  em: '03/07',
  vc: '18/07',
  v: 'R$ 9.600',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'NF 1038',
  cli: 'Construtora Vale Verde',
  em: '28/06',
  vc: '12/07',
  v: 'R$ 8.900',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'NF 1035',
  cli: 'Essavado Ltda.',
  em: '20/06',
  vc: '05/07',
  v: 'R$ 11.100',
  tone: 'danger',
  icon: 'circle-alert',
  st: 'Vencido'
}, {
  doc: 'NF 1033',
  cli: 'Construtora Sul',
  em: '18/06',
  vc: '02/07',
  v: 'R$ 7.800',
  tone: 'danger',
  icon: 'circle-alert',
  st: 'Vencido'
}, {
  doc: 'NF 1029',
  cli: 'Construtora Vale Verde',
  em: '05/06',
  vc: '20/06',
  v: 'R$ 9.500',
  tone: 'success',
  icon: 'check',
  st: 'Pago'
}];
const FIN_PAGAR = [{
  doc: 'BOL 8821',
  forn: 'Posto Missões — diesel',
  ic: 'fuel',
  vc: '15/07',
  v: 'R$ 14.300',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'NF 5540',
  forn: 'Peças CAT — manutenção',
  ic: 'wrench',
  vc: '22/07',
  v: 'R$ 6.850',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'FOLHA 07',
  forn: 'Folha — operadores',
  ic: 'hard-hat',
  vc: '30/07',
  v: 'R$ 31.200',
  tone: 'amber',
  led: true,
  st: 'A vencer'
}, {
  doc: 'AP 2207',
  forn: 'Seguro da frota',
  ic: 'truck',
  vc: '02/07',
  v: 'R$ 4.980',
  tone: 'success',
  icon: 'check',
  st: 'Pago'
}];
const FIN_COMP = [{
  icon: 'credit-card',
  t: 'PIX recebido — NF 1029',
  m: '20/06 · 14:22',
  v: 'R$ 9.500'
}, {
  icon: 'landmark',
  t: 'TED recebida — NF 1021',
  m: '04/06 · 09:10',
  v: 'R$ 15.200'
}, {
  icon: 'link',
  t: 'Boleto pago — NF 1015',
  m: '22/05 · 16:40',
  v: 'R$ 7.300'
}];
const FIN_FORMAS = [{
  icon: 'credit-card',
  t: 'PIX',
  m: '12 recebimentos',
  v: 'R$ 38.400'
}, {
  icon: 'landmark',
  t: 'TED',
  m: '5 recebimentos',
  v: 'R$ 29.100'
}, {
  icon: 'link',
  t: 'Boleto',
  m: '7 recebimentos',
  v: 'R$ 18.700'
}];
function Financeiro({
  onNew
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Financeiro"), /*#__PURE__*/React.createElement(Pill, null, "julho/2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus",
    onClick: onNew
  }, "Novo lan\xE7amento")), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "A receber",
    value: "R$ 61.900",
    mono: true,
    warn: true,
    icon: "hand-coins",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "5 t\xEDtulos \xB7 ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--danger-fg)',
        fontWeight: 600
      }
    }, "2 vencidos"))
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "A pagar",
    value: "R$ 52.350",
    mono: true,
    icon: "wallet",
    foot: "3 t\xEDtulos at\xE9 30/07"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Recebido no m\xEAs",
    value: "R$ 86.200",
    mono: true,
    icon: "credit-card",
    trend: {
      dir: 'up',
      value: '11%'
    },
    foot: "vs. junho",
    spark: [18, 16, 17, 12, 13, 9, 10, 5]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Saldo do m\xEAs",
    value: "R$ 33.850",
    mono: true,
    icon: "trending-up",
    foot: "recebido \u2212 pago",
    spark: [16, 15, 14, 12, 11, 9, 8, 6]
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Contas a receber",
    icon: "hand-coins",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "R$ 61.900 em aberto")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap rtg-tablewrap--wide"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Documento"), /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", null, "Emiss\xE3o"), /*#__PURE__*/React.createElement("th", null, "Vencimento"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Valor"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, FIN_RECEBER.map(n => /*#__PURE__*/React.createElement("tr", {
    key: n.doc
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-doc"
  }, n.doc)), /*#__PURE__*/React.createElement("td", null, n.cli), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, n.em), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, n.vc), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, n.v), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: n.tone,
    led: n.led,
    icon: n.icon
  }, n.st)))))))), /*#__PURE__*/React.createElement(Card, {
    title: "Contas a pagar",
    icon: "wallet",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "R$ 52.350 em aberto")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap rtg-tablewrap--wide"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Documento"), /*#__PURE__*/React.createElement("th", null, "Fornecedor"), /*#__PURE__*/React.createElement("th", null, "Vencimento"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Valor"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, FIN_PAGAR.map(n => /*#__PURE__*/React.createElement("tr", {
    key: n.doc
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-doc"
  }, n.doc)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.ic,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, n.forn))), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, n.vc), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, n.v), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: n.tone,
    led: n.led,
    icon: n.icon
  }, n.st))))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Recebimentos por forma",
    icon: "credit-card",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "24 no m\xEAs")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, FIN_FORMAS.map(o => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: o.t
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: o.icon,
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, o.m)), /*#__PURE__*/React.createElement("div", {
    className: "cv"
  }, o.v))))), /*#__PURE__*/React.createElement(Card, {
    title: "Comprovantes recentes",
    icon: "receipt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, FIN_COMP.map(o => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: o.t
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: o.icon,
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, o.m)), /*#__PURE__*/React.createElement("div", {
    className: "cv"
  }, o.v))))))));
}
window.Financeiro = Financeiro;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Financeiro.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Header.jsx
try { (() => {
/* Retaguarda — sticky top header (breadcrumbs + AI + theme + user). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Button,
  IconButton,
  Avatar,
  Icon
} = NS;
function Header({
  crumbs
}) {
  const [theme, setTheme] = React.useState(() => {
    try {
      return localStorage.getItem('rtg-theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('rtg-theme', theme);
    } catch (e) {}
  }, [theme]);
  const light = theme === 'light';
  return /*#__PURE__*/React.createElement("header", {
    className: "rtg-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-crumbs"
  }, crumbs.map((c, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: c.here ? 'here' : ''
  }, c.label)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-spacer"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ai",
    icon: "sparkles"
  }, "Perguntar \xE0 IA"), /*#__PURE__*/React.createElement(IconButton, {
    icon: light ? 'moon' : 'sun',
    label: light ? 'Tema escuro' : 'Tema claro',
    onClick: () => setTheme(light ? 'dark' : 'light')
  }), /*#__PURE__*/React.createElement("div", {
    className: "rtg-user"
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: "AA",
    size: 28
  }), " ", /*#__PURE__*/React.createElement("b", null, "Admin AILA")));
}
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Login.jsx
try { (() => {
/* Retaguarda — tela de login (acesso restrito à gestão). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Button,
  Icon,
  Note
} = NS;
function Login({
  onLogin
}) {
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  function submit(e) {
    e.preventDefault();
    if (loading) return;
    if (!user.trim() || !pass.trim()) {
      setError('Informe usuário e senha para entrar.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => onLogin && onLogin(), 900);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "rtg-login",
    "data-screen-label": "Login"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "rtg-login-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-login-brand-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-brand-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-logo",
    style: {
      width: 46,
      height: 46,
      borderRadius: 13
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#16140f",
    strokeWidth: "2.1",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      width: 28,
      height: 28
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 20h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 20v-4h4v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m10 16 3-7 5 4v3"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-brand-name",
    style: {
      fontSize: 17
    }
  }, "ANTONELLO", /*#__PURE__*/React.createElement("small", null, "TERRAPLANAGEM"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hazard",
    style: {
      margin: '18px 0 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: 'var(--hazard)'
    }
  })), /*#__PURE__*/React.createElement("h2", null, "Gest\xE3o da opera\xE7\xE3o \u2014 do or\xE7amento \xE0 nota fiscal."), /*#__PURE__*/React.createElement("div", {
    className: "rtg-login-feats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 30,
      height: 30
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clipboard-list",
    size: 16
  })), "Ordens de Servi\xE7o e medi\xE7\xF5es"), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 30,
      height: 30
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "gauge",
    size: 16
  })), "Apontamentos por hor\xEDmetro"), /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 30,
      height: 30
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "wallet",
    size: 16
  })), "Faturamento e custo da hora"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-login-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "st"
  }, /*#__PURE__*/React.createElement("i", null), "Sistemas operacionais"), /*#__PURE__*/React.createElement("span", {
    className: "vs"
  }, "v0.1 \xB7 funda\xE7\xE3o"))), /*#__PURE__*/React.createElement("main", {
    className: "rtg-login-main"
  }, /*#__PURE__*/React.createElement("form", {
    className: "rtg-login-card",
    onSubmit: submit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--amarelo)'
    }
  }, "Acesso restrito"), /*#__PURE__*/React.createElement("h1", null, "Entrar na Retaguarda"), /*#__PURE__*/React.createElement("p", {
    className: "sub"
  }, "Use as credenciais fornecidas pela administra\xE7\xE3o."), /*#__PURE__*/React.createElement("label", {
    className: "rtg-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Usu\xE1rio"), /*#__PURE__*/React.createElement("span", {
    className: "bx"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: user,
    placeholder: "nome.sobrenome",
    autoComplete: "username",
    onChange: e => {
      setUser(e.target.value);
      setError('');
    }
  }))), /*#__PURE__*/React.createElement("label", {
    className: "rtg-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Senha"), /*#__PURE__*/React.createElement("span", {
    className: "bx"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    type: show ? 'text' : 'password',
    value: pass,
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    autoComplete: "current-password",
    onChange: e => {
      setPass(e.target.value);
      setError('');
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "eye",
    "aria-label": show ? 'Ocultar senha' : 'Mostrar senha',
    onClick: () => setShow(!show)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: show ? 'eye-off' : 'eye',
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-login-row"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rem"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: remember,
    onChange: e => setRemember(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", {
    className: "ck"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 11,
    strokeWidth: 2.6
  })), "Manter conectado"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Esqueci minha senha")), error && /*#__PURE__*/React.createElement("div", {
    className: "rtg-login-err"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-alert",
    size: 15
  }), error), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: loading ? 'clock' : 'log-in',
    disabled: loading,
    style: {
      width: '100%',
      justifyContent: 'center',
      padding: '12px 13px',
      fontSize: 14
    }
  }, loading ? 'Entrando…' : 'Entrar'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Note, {
    icon: "smartphone",
    tone: "steel"
  }, "Operadores de campo n\xE3o entram por aqui \u2014 o apontamento \xE9 feito pelo ", /*#__PURE__*/React.createElement("b", null, "app de campo"), ".")))));
}
window.Login = Login;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/LoginV2.jsx
try { (() => {
/* Retaguarda — tela de login v2 (marca com logo real full-bleed). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Button,
  Icon,
  Note
} = NS;
function LoginV2({
  onLogin
}) {
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  function submit(e) {
    e.preventDefault();
    if (loading) return;
    if (!user.trim() || !pass.trim()) {
      setError('Informe usuário e senha para entrar.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => onLogin && onLogin(), 900);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "rtg-login rtg-login2",
    "data-screen-label": "Login v2"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "rtg-login2-brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logoDark || '../../assets/logo-antonello-dark.png',
    alt: "Antonello Terraplanagem"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rtg-login2-scrim"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rtg-login2-brandfoot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hz"
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "st"
  }, /*#__PURE__*/React.createElement("i", null), "Sistemas operacionais"), /*#__PURE__*/React.createElement("span", {
    className: "vs"
  }, "v0.1 \xB7 funda\xE7\xE3o")))), /*#__PURE__*/React.createElement("main", {
    className: "rtg-login-main"
  }, /*#__PURE__*/React.createElement("form", {
    className: "rtg-login-card",
    onSubmit: submit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-login2-mark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-logo",
    style: {
      width: 42,
      height: 42,
      borderRadius: 12
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#16140f",
    strokeWidth: "2.1",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 20h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 20v-4h4v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m10 16 3-7 5 4v3"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-brand-name",
    style: {
      fontSize: 15
    }
  }, "ANTONELLO", /*#__PURE__*/React.createElement("small", null, "TERRAPLANAGEM"))), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--amarelo)'
    }
  }, "Acesso restrito"), /*#__PURE__*/React.createElement("h1", null, "Entrar na Retaguarda"), /*#__PURE__*/React.createElement("p", {
    className: "sub"
  }, "Use as credenciais fornecidas pela administra\xE7\xE3o."), /*#__PURE__*/React.createElement("label", {
    className: "rtg-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Usu\xE1rio"), /*#__PURE__*/React.createElement("span", {
    className: "bx"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: user,
    placeholder: "nome.sobrenome",
    autoComplete: "username",
    onChange: e => {
      setUser(e.target.value);
      setError('');
    }
  }))), /*#__PURE__*/React.createElement("label", {
    className: "rtg-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Senha"), /*#__PURE__*/React.createElement("span", {
    className: "bx"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    type: show ? 'text' : 'password',
    value: pass,
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    autoComplete: "current-password",
    onChange: e => {
      setPass(e.target.value);
      setError('');
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "eye",
    "aria-label": show ? 'Ocultar senha' : 'Mostrar senha',
    onClick: () => setShow(!show)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: show ? 'eye-off' : 'eye',
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-login-row"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rem"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: remember,
    onChange: e => setRemember(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", {
    className: "ck"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 11,
    strokeWidth: 2.6
  })), "Manter conectado"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Esqueci minha senha")), error && /*#__PURE__*/React.createElement("div", {
    className: "rtg-login-err"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-alert",
    size: 15
  }), error), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: loading ? 'clock' : 'log-in',
    disabled: loading,
    style: {
      width: '100%',
      justifyContent: 'center',
      padding: '12px 13px',
      fontSize: 14
    }
  }, loading ? 'Entrando…' : 'Entrar'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Note, {
    icon: "smartphone",
    tone: "steel"
  }, "Operadores de campo n\xE3o entram por aqui \u2014 o apontamento \xE9 feito pelo ", /*#__PURE__*/React.createElement("b", null, "app de campo"), ".")))));
}
window.LoginV2 = LoginV2;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/LoginV2.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Manutencao.jsx
try { (() => {
/* Retaguarda — Manutenção (ordens de manutenção + planos por horímetro). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  KpiCard,
  Card,
  StatusChip,
  Badge,
  Button,
  Pill,
  IconTile,
  Icon,
  Note
} = NS;
const MNT_ORDENS = [{
  data: '08/07',
  eq: 'Pá Carregadeira XCMG',
  ic: 'forklift',
  tipo: 'Corretiva',
  t: 'Vazamento no comando hidráulico',
  custo: 'R$ 3.400',
  st: 'Em andamento',
  tone: 'amber'
}, {
  data: '07/07',
  eq: 'Escavadeira Volvo EC140',
  ic: 'truck',
  tipo: 'Preventiva',
  t: 'Plano 7.500 h — filtros e óleos',
  custo: 'R$ 2.750',
  st: 'Em andamento',
  tone: 'amber'
}, {
  data: '15/07',
  eq: 'Retroescavadeira JCB 3CX',
  ic: 'tractor',
  tipo: 'Preventiva',
  t: 'Plano 2.000 h — revisão geral',
  custo: '—',
  st: 'Agendada',
  tone: 'info'
}, {
  data: '02/07',
  eq: 'Escavadeira CAT 320',
  ic: 'truck',
  tipo: 'Preventiva',
  t: 'Plano 4.200 h — filtros e graxa',
  custo: 'R$ 1.850',
  st: 'Concluída',
  tone: 'success'
}, {
  data: '26/06',
  eq: 'Caminhão basculante 01',
  ic: 'truck',
  tipo: 'Corretiva',
  t: 'Troca de embreagem',
  custo: 'R$ 3.850',
  st: 'Concluída',
  tone: 'success'
}];
const MNT_PLANOS = [{
  eq: 'Pá Carregadeira XCMG',
  ic: 'forklift',
  m: 'plano 1.000 h',
  v: 'vencida',
  late: true
}, {
  eq: 'Escavadeira Volvo EC140',
  ic: 'truck',
  m: 'plano 7.500 h',
  v: 'em 12 h',
  late: false
}, {
  eq: 'Escavadeira CAT 320',
  ic: 'truck',
  m: 'plano 4.300 h',
  v: 'em 82 h',
  late: false
}, {
  eq: 'Retroescavadeira JCB 3CX',
  ic: 'tractor',
  m: 'plano 2.000 h',
  v: 'em 105 h',
  late: false
}, {
  eq: 'Rolo compactador CA25',
  ic: 'tractor',
  m: 'plano 3.000 h',
  v: 'em 130 h',
  late: false
}];
function Manutencao({
  onNew
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Manuten\xE7\xE3o"), /*#__PURE__*/React.createElement(Pill, null, "julho/2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "wrench",
    onClick: onNew
  }, "Nova manuten\xE7\xE3o")), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Manuten\xE7\xF5es no m\xEAs",
    value: "6",
    icon: "wrench",
    foot: "4 preventivas \xB7 2 corretivas",
    spark: [12, 13, 11, 14, 12, 13, 12, 14]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Custo de manuten\xE7\xE3o",
    value: "R$ 11.850",
    mono: true,
    warn: true,
    icon: "calculator",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "vs. junho ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--down)',
        fontWeight: 600
      }
    }, "+14%"))
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Em manuten\xE7\xE3o",
    value: "2",
    icon: "truck",
    foot: "XCMG \xB7 Volvo EC140"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Planos a vencer",
    value: "2",
    icon: "gauge",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "pr\xF3ximas 50 h \xB7 ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--danger-fg)',
        fontWeight: 600
      }
    }, "1 vencido"))
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Ordens de manuten\xE7\xE3o",
    icon: "wrench",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "6 no m\xEAs")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap rtg-tablewrap--wide"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Data"), /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", null, "Tipo"), /*#__PURE__*/React.createElement("th", null, "Descri\xE7\xE3o"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Custo"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, MNT_ORDENS.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.data), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.ic,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, r.eq))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    tone: r.tipo === 'Corretiva' ? 'gold' : 'neutral'
  }, r.tipo)), /*#__PURE__*/React.createElement("td", null, r.t), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.custo), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: r.tone,
    led: true
  }, r.st)))))))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Manuten\xE7\xF5es alimentam o ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " do equipamento; o alerta antecipado de ", /*#__PURE__*/React.createElement("b", null, "50 h"), " \xE9 definido em ", /*#__PURE__*/React.createElement("b", null, "Par\xE2metros"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Planos por hor\xEDmetro",
    icon: "gauge",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "5 planos")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, MNT_PLANOS.map(p => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: p.eq
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: p.ic,
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, p.eq), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, p.m)), p.late ? /*#__PURE__*/React.createElement(StatusChip, {
    tone: "danger",
    icon: "circle-alert"
  }, "Vencida") : /*#__PURE__*/React.createElement("span", {
    className: "rtg-val",
    style: {
      fontSize: 12.5
    }
  }, p.v))))))));
}
window.Manutencao = Manutencao;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Manutencao.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovaManutencao.jsx
try { (() => {
/* Retaguarda — Nova Manutenção (ordem de manutenção com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  Badge,
  StatusChip,
  IconTile,
  Note,
  Icon
} = NS;
const NMT_EQUIP = [['Escavadeira CAT 320', 'truck'], ['Escavadeira Volvo EC140', 'truck'], ['Retroescavadeira JCB 3CX', 'tractor'], ['Pá Carregadeira XCMG', 'forklift'], ['Rolo compactador CA25', 'tractor'], ['Caminhão basculante 01', 'truck']];
function NovaManutencao({
  onCancel,
  onCreate
}) {
  const [f, setF] = React.useState({
    eq: 'Pá Carregadeira XCMG',
    tipo: 'Corretiva',
    prio: 'alta',
    abertura: '',
    hor: '',
    desc: '',
    custo: '',
    fornec: ''
  });
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.value
  }));
  const eqIc = (NMT_EQUIP.find(x => x[0] === f.eq) || [])[1] || 'truck';
  const ready = f.desc.trim() && f.hor.trim();
  const prioTone = {
    alta: 'danger',
    media: 'amber',
    baixa: 'neutral'
  }[f.prio];
  const prioLbl = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa'
  }[f.prio];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Manuten\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Nova manuten\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "MNT \xB7 rascunho")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados da manuten\xE7\xE3o",
    icon: "wrench",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Equipamento", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.eq,
    onChange: set('eq')
  }, NMT_EQUIP.map(([t]) => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Tipo"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-seg2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: f.tipo === 'Preventiva' ? 'on' : '',
    onClick: () => setF(s => ({
      ...s,
      tipo: 'Preventiva'
    }))
  }, "Preventiva"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: f.tipo === 'Corretiva' ? 'on' : '',
    onClick: () => setF(s => ({
      ...s,
      tipo: 'Corretiva'
    }))
  }, "Corretiva"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Prioridade"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.prio,
    onChange: set('prio')
  }, /*#__PURE__*/React.createElement("option", {
    value: "alta"
  }, "Alta \u2014 parar a m\xE1quina"), /*#__PURE__*/React.createElement("option", {
    value: "media"
  }, "M\xE9dia \u2014 programar"), /*#__PURE__*/React.createElement("option", {
    value: "baixa"
  }, "Baixa \u2014 pr\xF3xima revis\xE3o"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Abertura"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "dd/mm/aaaa",
    value: f.abertura,
    onChange: set('abertura')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Hor\xEDmetro", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    inputMode: "numeric",
    placeholder: "998",
    value: f.hor,
    onChange: set('hor')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Descri\xE7\xE3o do servi\xE7o", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Vazamento no comando hidr\xE1ulico",
    value: f.desc,
    onChange: set('desc')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Custo estimado"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "R$ 0",
    value: f.custo,
    onChange: set('custo')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Fornecedor / oficina"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Oficina interna",
    value: f.fornec,
    onChange: set('fornec')
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Abrir manuten\xE7\xE3o"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "wrench",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: eqIc,
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, f.eq), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: f.tipo === 'Corretiva' ? 'gold' : 'neutral'
  }, f.tipo)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Servi\xE7o"), /*#__PURE__*/React.createElement("span", {
    className: f.desc ? 'v' : 'v ph'
  }, f.desc || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Prioridade"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: prioTone,
    led: f.prio !== 'baixa'
  }, prioLbl))), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("span", {
    className: f.hor ? 'v mono' : 'v ph'
  }, f.hor || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Custo est."), /*#__PURE__*/React.createElement("span", {
    className: f.custo ? 'v mono' : 'v ph'
  }, f.custo || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Oficina"), /*#__PURE__*/React.createElement("span", {
    className: f.fornec ? 'v' : 'v ph'
  }, f.fornec || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "amber",
    led: true
  }, "Em andamento"))))), f.prio === 'alta' ? /*#__PURE__*/React.createElement(Note, {
    icon: "circle-alert"
  }, "Prioridade ", /*#__PURE__*/React.createElement("b", null, "alta"), " tira o equipamento de opera\xE7\xE3o \u2014 as OS que dependem dele ficam sinalizadas at\xE9 a conclus\xE3o.") : /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "A manuten\xE7\xE3o alimenta o ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " do equipamento e o hist\xF3rico da ", /*#__PURE__*/React.createElement("b", null, "ficha"), "."))));
}
window.NovaManutencao = NovaManutencao;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovaManutencao.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovaNF.jsx
try { (() => {
/* Retaguarda — Nova NF (emissão a partir de OS/medição, com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  StatusChip,
  IconTile,
  Note,
  Icon
} = NS;

/* OS concluídas / medições prontas para faturar (espelha "A faturar"). */
const NF_FONTES = [{
  id: 'os015',
  os: 'OS-015',
  cli: 'Metalúrgica Boa Vista',
  t: 'Fundação de galpão — estacas',
  v: 19800
}, {
  id: 'os011',
  os: 'OS-011',
  cli: 'Construtora Sul',
  t: 'Limpeza de terreno',
  v: 6400
}, {
  id: 'os021m2',
  os: 'OS-021',
  cli: 'Construtora Vale Verde',
  t: 'Terraplenagem — medição #2',
  v: 15400
}];
const NF_NATUREZA = ['Prestação de serviço', 'Locação de equipamento', 'Locação com operador'];
const brl = n => 'R$ ' + n.toLocaleString('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});
function NovaNF({
  onCancel,
  onCreate
}) {
  const [fonte, setFonte] = React.useState('os015');
  const [nat, setNat] = React.useState(NF_NATUREZA[0]);
  const [emissao, setEmissao] = React.useState('');
  const [prazo, setPrazo] = React.useState('15');
  const [obs, setObs] = React.useState('');
  const f = NF_FONTES.find(x => x.id === fonte) || NF_FONTES[0];
  const iss = Math.round(f.v * 0.05);
  const ready = !!fonte;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Faturamento"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Nova nota fiscal"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "NF 1043 \xB7 rascunho")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Emiss\xE3o de NF",
    icon: "file-check",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Faturar a partir de", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: fonte,
    onChange: e => setFonte(e.target.value)
  }, NF_FONTES.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.os, " \xB7 ", o.cli, " \u2014 ", brl(o.v))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Natureza da opera\xE7\xE3o"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: nat,
    onChange: e => setNat(e.target.value)
  }, NF_NATUREZA.map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Emiss\xE3o"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "dd/mm/aaaa",
    value: emissao,
    onChange: e => setEmissao(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Prazo de pagamento"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: prazo,
    onChange: e => setPrazo(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "0"
  }, "\xC0 vista"), /*#__PURE__*/React.createElement("option", {
    value: "15"
  }, "15 dias"), /*#__PURE__*/React.createElement("option", {
    value: "30"
  }, "30 dias"), /*#__PURE__*/React.createElement("option", {
    value: "45"
  }, "28/45 dias"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Observa\xE7\xF5es da nota"), /*#__PURE__*/React.createElement("textarea", {
    className: "rtg-ta",
    placeholder: "Dados adicionais, reten\xE7\xF5es, refer\xEAncia do contrato\u2026",
    value: obs,
    onChange: e => setObs(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    icon: "file-text",
    disabled: !ready
  }, "Salvar rascunho"), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "file-check",
    disabled: !ready
  }, "Emitir NF"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "file-check",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "file-check",
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px/1 var(--font-mono)',
      color: 'var(--amarelo)'
    }
  }, "NF 1043"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      marginTop: 5
    }
  }, f.cli))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Origem"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, f.os))), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Servi\xE7o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, f.t)), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Natureza"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, nat)), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Vencimento"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, prazo === '0' ? 'à vista' : 'em ' + prazo + ' dias')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Base"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, brl(f.v))), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "ISS (5%)"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, brl(iss))), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "amber",
    led: true
  }, "A vencer")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-total"
  }, /*#__PURE__*/React.createElement("span", null, "Valor da nota"), /*#__PURE__*/React.createElement("b", null, brl(f.v)))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "A NF baixa a ", /*#__PURE__*/React.createElement("b", null, "medi\xE7\xE3o"), " na OS e cria o t\xEDtulo em ", /*#__PURE__*/React.createElement("b", null, "Financeiro \u203A Contas a receber"), ". O pagamento \xE9 conciliado pelo ", /*#__PURE__*/React.createElement("b", null, "comprovante"), "."))));
}
window.NovaNF = NovaNF;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovaNF.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovaOS.jsx
try { (() => {
/* Retaguarda — Nova OS (formulário de criação com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  StatusChip,
  IconTile,
  Note,
  Icon
} = NS;
const NOS_TIPOS = [['Terraplenagem', 'truck'], ['Drenagem', 'tractor'], ['Nivelamento', 'forklift'], ['Fundação — estacas', 'truck'], ['Cascalhamento', 'truck'], ['Limpeza de terreno', 'tractor']];
const NOS_EQUIP = [['Escavadeira CAT 320', 'truck'], ['Escavadeira Volvo EC140', 'truck'], ['Retroescavadeira JCB 3CX', 'tractor'], ['Pá Carregadeira XCMG', 'forklift'], ['Rolo compactador CA25', 'tractor'], ['Caminhão basculante', 'truck']];
const NOS_ORC = [['', 'Sem orçamento vinculado', ''], ['ORC-055', 'ORC-055 · Terraplenagem — fase 2', 'R$ 58.000'], ['ORC-051', 'ORC-051 · Drenagem de acesso', 'R$ 22.400'], ['ORC-047', 'ORC-047 · Pátio de manobra', 'R$ 18.900']];
function NovaOS({
  onCancel,
  onCreate
}) {
  const clientes = window.RTG.clientes;
  const operadores = window.RTG.operadores.filter(o => o.ativo);
  const [f, setF] = React.useState({
    cli: '',
    tipo: 'Terraplenagem',
    serv: '',
    eq: 'Escavadeira CAT 320',
    op: '',
    inicio: '',
    local: '',
    orc: '',
    valor: '',
    obs: ''
  });
  const set = k => e => {
    const v = e.target.value;
    setF(s => {
      const n = {
        ...s,
        [k]: v
      };
      if (k === 'orc') {
        const row = NOS_ORC.find(r => r[0] === v);
        if (row && row[2]) n.valor = row[2];
      }
      return n;
    });
  };
  const eqIc = (NOS_EQUIP.find(x => x[0] === f.eq) || [])[1] || 'truck';
  const ready = f.cli && f.serv.trim() && f.op;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Ordens de Servi\xE7o"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Nova OS"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "OS-0025 \xB7 rascunho")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados da ordem de servi\xE7o",
    icon: "clipboard-list",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Cliente", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.cli,
    onChange: set('cli')
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione o cliente\u2026"), clientes.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.nome
  }, c.nome)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Tipo de servi\xE7o"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.tipo,
    onChange: set('tipo')
  }, NOS_TIPOS.map(([t]) => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "In\xEDcio previsto"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "dd/mm/aaaa",
    value: f.inicio,
    onChange: set('inicio')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Descri\xE7\xE3o do servi\xE7o", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Terraplenagem \u2014 lote industrial",
    value: f.serv,
    onChange: set('serv')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Equipamento"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.eq,
    onChange: set('eq')
  }, NOS_EQUIP.map(([t]) => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Operador", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.op,
    onChange: set('op')
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione\u2026"), operadores.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.nome
  }, o.nome)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Local da obra"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Distrito Industrial \u2014 Santo \xC2ngelo/RS",
    value: f.local,
    onChange: set('local')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Or\xE7amento vinculado"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.orc,
    onChange: set('orc')
  }, NOS_ORC.map(([v, lbl]) => /*#__PURE__*/React.createElement("option", {
    key: v,
    value: v
  }, lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Valor previsto"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "R$ 0",
    value: f.valor,
    onChange: set('valor')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Observa\xE7\xF5es"), /*#__PURE__*/React.createElement("textarea", {
    className: "rtg-ta",
    placeholder: "Condi\xE7\xF5es da frente, restri\xE7\xF5es de acesso, combina\xE7\xF5es com o cliente\u2026",
    value: f.obs,
    onChange: set('obs')
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    icon: "file-text",
    disabled: !ready
  }, "Salvar rascunho"), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Abrir OS"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "clipboard-list",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: eqIc,
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px/1 var(--font-mono)',
      color: 'var(--amarelo)'
    }
  }, "OS-0025"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      marginTop: 5
    }
  }, f.serv || 'Nova ordem de serviço'))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Cliente"), /*#__PURE__*/React.createElement("span", {
    className: f.cli ? 'v' : 'v ph'
  }, f.cli || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Tipo"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, f.tipo)), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Equipamento"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, f.eq)), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Operador"), /*#__PURE__*/React.createElement("span", {
    className: f.op ? 'v' : 'v ph'
  }, f.op || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "In\xEDcio"), /*#__PURE__*/React.createElement("span", {
    className: f.inicio ? 'v mono' : 'v ph'
  }, f.inicio || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Or\xE7amento"), /*#__PURE__*/React.createElement("span", {
    className: f.orc ? 'v mono' : 'v ph'
  }, f.orc || 'nenhum')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Valor"), /*#__PURE__*/React.createElement("span", {
    className: f.valor ? 'v mono' : 'v ph'
  }, f.valor || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "info",
    led: true
  }, "Aberta"))))), /*#__PURE__*/React.createElement(Note, {
    icon: "smartphone"
  }, "Ao abrir a OS, ela aparece no ", /*#__PURE__*/React.createElement("b", null, "app de campo"), " do operador \u2014 os apontamentos por hor\xEDmetro passam a chegar em tempo real."))));
}
window.NovaOS = NovaOS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovaOS.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovoAbastecimento.jsx
try { (() => {
/* Retaguarda — Novo Abastecimento (formulário de diesel com custo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  StatusChip,
  IconTile,
  Note,
  Icon
} = NS;
const NAB_EQUIP = [['Escavadeira CAT 320', 'truck'], ['Escavadeira Volvo EC140', 'truck'], ['Retroescavadeira JCB 3CX', 'tractor'], ['Pá Carregadeira XCMG', 'forklift'], ['Rolo compactador CA25', 'tractor'], ['Caminhão basculante 01', 'truck']];
const NAB_ORIG = [['interno', 'Tanque interno', 5.84], ['posto', 'Posto Missões', 6.04]];
const brl = n => 'R$ ' + n.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function NovoAbastecimento({
  onCancel,
  onCreate
}) {
  const [f, setF] = React.useState({
    data: '',
    eq: 'Escavadeira CAT 320',
    orig: 'interno',
    hor: '',
    litros: ''
  });
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.value
  }));
  const eqIc = (NAB_EQUIP.find(x => x[0] === f.eq) || [])[1] || 'truck';
  const orig = NAB_ORIG.find(o => o[0] === f.orig) || NAB_ORIG[0];
  const litros = parseFloat((f.litros || '').replace(',', '.')) || 0;
  const total = litros * orig[2];
  const ready = litros > 0 && f.hor.trim();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Diesel"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Novo abastecimento"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "diesel")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados do abastecimento",
    icon: "fuel",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Equipamento", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.eq,
    onChange: set('eq')
  }, NAB_EQUIP.map(([t]) => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Origem do diesel"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-seg2"
  }, NAB_ORIG.map(([id, lbl, pr]) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: id,
    className: f.orig === id ? 'on' : '',
    onClick: () => setF(s => ({
      ...s,
      orig: id
    }))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: id === 'interno' ? 'database' : 'map-pin',
    size: 15
  }), lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Data"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "dd/mm/aaaa",
    value: f.data,
    onChange: set('data')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Hor\xEDmetro", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    inputMode: "numeric",
    placeholder: "4.218",
    value: f.hor,
    onChange: set('hor')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Litros", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "number",
    min: "0",
    step: "0.1",
    placeholder: "110",
    value: f.litros,
    onChange: set('litros')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Pre\xE7o do litro"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    value: brl(orig[2]),
    readOnly: true,
    style: {
      opacity: .7
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Registrar abastecimento"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "fuel",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: eqIc,
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, f.eq), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted-2)',
      marginTop: 4
    }
  }, orig[1]))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Data"), /*#__PURE__*/React.createElement("span", {
    className: f.data ? 'v mono' : 'v ph'
  }, f.data || 'hoje')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("span", {
    className: f.hor ? 'v mono' : 'v ph'
  }, f.hor || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Litros"), /*#__PURE__*/React.createElement("span", {
    className: litros ? 'v mono' : 'v ph'
  }, litros ? litros.toLocaleString('pt-BR') + ' L' : 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "R$/litro"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, brl(orig[2]))), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Origem"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, f.orig === 'interno' ? /*#__PURE__*/React.createElement(StatusChip, {
    tone: "info"
  }, "Tanque interno") : /*#__PURE__*/React.createElement(StatusChip, {
    tone: "amber"
  }, "Posto externo")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-total"
  }, /*#__PURE__*/React.createElement("span", null, "Custo do abastecimento"), /*#__PURE__*/React.createElement("b", null, brl(total)))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Entra no ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " do equipamento pelo hor\xEDmetro. Abastecimento em ", /*#__PURE__*/React.createElement("b", null, "posto"), " vira conta a pagar em ", /*#__PURE__*/React.createElement("b", null, "Financeiro"), "; no ", /*#__PURE__*/React.createElement("b", null, "tanque interno"), " baixa o estoque de diesel."))));
}
window.NovoAbastecimento = NovoAbastecimento;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovoAbastecimento.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovoCliente.jsx
try { (() => {
/* Retaguarda — Novo Cliente (formulário de cadastro com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  Badge,
  IconTile,
  Note,
  Icon
} = NS;
const NCL_SEG = ['Construção civil', 'Terraplenagem', 'Agronegócio', 'Indústria', 'Particular'];
function maskDoc(v, pj) {
  const d = v.replace(/\D/g, '').slice(0, pj ? 14 : 11);
  if (pj) return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
}
function NovoCliente({
  onCancel,
  onCreate
}) {
  const [f, setF] = React.useState({
    tipo: 'PJ',
    nome: '',
    fantasia: '',
    seg: 'Construção civil',
    doc: '',
    email: '',
    tel: '',
    cidade: '',
    endereco: '',
    contato: '',
    area: ''
  });
  const set = k => e => {
    const v = e.target.value;
    setF(s => ({
      ...s,
      [k]: k === 'doc' ? maskDoc(v, s.tipo === 'PJ') : v
    }));
  };
  const setTipo = t => setF(s => ({
    ...s,
    tipo: t,
    doc: ''
  }));
  const pj = f.tipo === 'PJ';
  const ready = f.nome.trim() && f.doc.trim() && f.tel.trim();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Clientes"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Novo cliente"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "cadastro")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados cadastrais",
    icon: "contact",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Tipo de pessoa"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-seg2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: pj ? 'on' : '',
    onClick: () => setTipo('PJ')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "building-2",
    size: 15
  }), "Pessoa Jur\xEDdica"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: !pj ? 'on' : '',
    onClick: () => setTipo('PF')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 15
  }), "Pessoa F\xEDsica"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, pj ? 'Razão social' : 'Nome completo', /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: pj ? 'Ex.: Construtora Vale Verde Ltda.' : 'Ex.: João Beletti',
    value: f.nome,
    onChange: set('nome')
  })), pj && /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Nome fantasia"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Vale Verde",
    value: f.fantasia,
    onChange: set('fantasia')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Segmento"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.seg,
    onChange: set('seg')
  }, NCL_SEG.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, pj ? 'CNPJ' : 'CPF', /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    inputMode: "numeric",
    placeholder: pj ? '00.000.000/0000-00' : '000.000.000-00',
    value: f.doc,
    onChange: set('doc')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Telefone", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "(55) 3312-8800",
    value: f.tel,
    onChange: set('tel')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "E-mail"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "financeiro@empresa.com.br",
    value: f.email,
    onChange: set('email')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Cidade / UF"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Santo \xC2ngelo/RS",
    value: f.cidade,
    onChange: set('cidade')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Endere\xE7o"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Rua das Ind\xFAstrias, 480",
    value: f.endereco,
    onChange: set('endereco')
  })), pj && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Contato"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Marcos Feltrin",
    value: f.contato,
    onChange: set('contato')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\xC1rea do contato"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Compras",
    value: f.area,
    onChange: set('area')
  })))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Cadastrar cliente"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: pj ? 'building-2' : 'user',
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: pj ? 'building-2' : 'user',
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, f.nome || 'Novo cliente'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: pj ? 'info' : 'neutral'
  }, pj ? 'Pessoa Jurídica' : 'Pessoa Física')))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Segmento"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, f.seg)), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, pj ? 'CNPJ' : 'CPF'), /*#__PURE__*/React.createElement("span", {
    className: f.doc ? 'v mono' : 'v ph'
  }, f.doc || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Telefone"), /*#__PURE__*/React.createElement("span", {
    className: f.tel ? 'v mono' : 'v ph'
  }, f.tel || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "E-mail"), /*#__PURE__*/React.createElement("span", {
    className: f.email ? 'v mono' : 'v ph'
  }, f.email || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Cidade"), /*#__PURE__*/React.createElement("span", {
    className: f.cidade ? 'v' : 'v ph'
  }, f.cidade || 'a definir')), pj && /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Contato"), /*#__PURE__*/React.createElement("span", {
    className: f.contato ? 'v' : 'v ph'
  }, f.contato || 'a definir', f.area ? ' · ' + f.area : '')))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "O cliente entra ", /*#__PURE__*/React.createElement("b", null, "ativo"), " e j\xE1 pode receber ", /*#__PURE__*/React.createElement("b", null, "or\xE7amentos"), " e ", /*#__PURE__*/React.createElement("b", null, "ordens de servi\xE7o"), ". O hist\xF3rico do ERP Farolti, quando houver, \xE9 vinculado pela retaguarda."))));
}
window.NovoCliente = NovoCliente;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovoCliente.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovoCusto.jsx
try { (() => {
/* Retaguarda — Novo lançamento de custo (compõe o Custo da Hora; resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  StatusChip,
  IconTile,
  Note,
  Icon
} = NS;
const NLC_CAT = [['depreciacao', 'Depreciação', 'history'], ['seguro', 'Seguro', 'badge-check'], ['pneus', 'Pneus / rodante', 'truck'], ['operador', 'Operador / folha', 'hard-hat'], ['indireto', 'Custo indireto', 'wallet'], ['outros', 'Outros', 'calculator']];
const NLC_EQUIP = ['Rateio da frota', 'Escavadeira CAT 320', 'Retroescavadeira JCB 3CX', 'Pá Carregadeira XCMG', 'Caminhão basculante 01'];
const NLC_BASE = [['mensal', 'Mensal'], ['hora', 'Por hora'], ['anual', 'Anual']];
const brl = n => 'R$ ' + n.toLocaleString('pt-BR', {
  minimumFractionDigits: n % 1 ? 2 : 0,
  maximumFractionDigits: 2
});
function NovoCusto({
  onCancel,
  onCreate
}) {
  const [f, setF] = React.useState({
    cat: 'depreciacao',
    eq: 'Escavadeira CAT 320',
    base: 'mensal',
    valor: '',
    horas: '160',
    comp: '',
    obs: ''
  });
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.value
  }));
  const cat = NLC_CAT.find(c => c[0] === f.cat) || NLC_CAT[0];
  const valor = parseFloat((f.valor || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
  const horas = parseFloat(f.horas) || 0;
  const porHora = f.base === 'hora' ? valor : f.base === 'anual' ? horas ? valor / (horas * 12) : 0 : horas ? valor / horas : 0;
  const ready = valor > 0 && (f.base === 'hora' || horas > 0);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Custo da Hora"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Novo lan\xE7amento de custo"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "custo da hora")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados do custo",
    icon: "calculator",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Categoria"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.cat,
    onChange: set('cat')
  }, NLC_CAT.map(([id, lbl]) => /*#__PURE__*/React.createElement("option", {
    key: id,
    value: id
  }, lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Equipamento"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.eq,
    onChange: set('eq')
  }, NLC_EQUIP.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Base do valor"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-seg3"
  }, NLC_BASE.map(([id, lbl]) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: id,
    className: f.base === id ? 'on' : '',
    onClick: () => setF(s => ({
      ...s,
      base: id
    }))
  }, lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Valor ", f.base === 'hora' ? '(R$/h)' : f.base === 'anual' ? '(anual)' : '(mensal)', /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    inputMode: "decimal",
    placeholder: "R$ 0",
    value: f.valor,
    onChange: set('valor')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Horas/m\xEAs de refer\xEAncia", f.base !== 'hora' && /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "number",
    min: "0",
    placeholder: "160",
    value: f.horas,
    onChange: set('horas'),
    disabled: f.base === 'hora',
    style: f.base === 'hora' ? {
      opacity: .5
    } : undefined
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Compet\xEAncia"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "mm/aaaa",
    value: f.comp,
    onChange: set('comp')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Observa\xE7\xF5es"), /*#__PURE__*/React.createElement("textarea", {
    className: "rtg-ta",
    placeholder: "Crit\xE9rio de rateio, refer\xEAncia do contrato, mem\xF3ria de c\xE1lculo\u2026",
    value: f.obs,
    onChange: set('obs')
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Lan\xE7ar custo"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "calculator",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: cat[2],
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, cat[1]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted-2)',
      marginTop: 4
    }
  }, f.eq))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Base"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, (NLC_BASE.find(b => b[0] === f.base) || [])[1])), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Valor"), /*#__PURE__*/React.createElement("span", {
    className: valor ? 'v mono' : 'v ph'
  }, valor ? brl(valor) : 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Horas ref."), /*#__PURE__*/React.createElement("span", {
    className: f.base === 'hora' ? 'v ph' : 'v mono'
  }, f.base === 'hora' ? 'n/a' : (f.horas || '0') + ' h')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Compet\xEAncia"), /*#__PURE__*/React.createElement("span", {
    className: f.comp ? 'v mono' : 'v ph'
  }, f.comp || 'atual')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "info",
    led: true
  }, "No c\xE1lculo")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-total"
  }, /*#__PURE__*/React.createElement("span", null, "Impacto no custo/h"), /*#__PURE__*/React.createElement("b", null, brl(Math.round(porHora * 100) / 100), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px/1 var(--font-sans)',
      color: 'var(--muted)'
    }
  }, "/h")))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Entra na ", /*#__PURE__*/React.createElement("b", null, "composi\xE7\xE3o do Custo da Hora"), " do equipamento (ao lado de diesel e manuten\xE7\xE3o). Valores ficam restritos a ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), ", ", /*#__PURE__*/React.createElement("b", null, "Financeiro"), " e ", /*#__PURE__*/React.createElement("b", null, "Rentabilidade"), "."))));
}
window.NovoCusto = NovoCusto;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovoCusto.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovoEquipamento.jsx
try { (() => {
/* Retaguarda — Novo Equipamento (cadastro de frota, com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  Badge,
  StatusChip,
  IconTile,
  Note,
  Icon
} = NS;
const NEQ_TIPOS = [['Escavadeira', 'truck'], ['Retroescavadeira', 'tractor'], ['Pá carregadeira', 'forklift'], ['Caminhão', 'truck'], ['Compactador', 'tractor'], ['Implemento', 'truck']];
const NEQ_PROP = [['propria', 'Própria'], ['locada', 'Locada']];
function NovoEquipamento({
  onCancel,
  onCreate
}) {
  const [f, setF] = React.useState({
    nome: '',
    tipo: 'Escavadeira',
    marca: '',
    ano: '',
    prop: 'propria',
    placa: '',
    hor: '',
    planoH: ''
  });
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.value
  }));
  const tipoIc = (NEQ_TIPOS.find(x => x[0] === f.tipo) || [])[1] || 'truck';
  const ready = f.nome.trim() && f.marca.trim();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Equipamentos"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Novo equipamento"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "frota")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados do equipamento",
    icon: "truck",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Nome / identifica\xE7\xE3o", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Escavadeira CAT 320",
    value: f.nome,
    onChange: set('nome')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Tipo"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.tipo,
    onChange: set('tipo')
  }, NEQ_TIPOS.map(([t]) => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Propriedade"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-seg2"
  }, NEQ_PROP.map(([id, lbl]) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: id,
    className: f.prop === id ? 'on' : '',
    onClick: () => setF(s => ({
      ...s,
      prop: id
    }))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: id === 'propria' ? 'badge-check' : 'link',
    size: 15
  }), lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Marca / modelo", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Caterpillar 320",
    value: f.marca,
    onChange: set('marca')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Ano"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    inputMode: "numeric",
    placeholder: "2019",
    value: f.ano,
    onChange: set('ano')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Placa / patrim\xF4nio"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "ABC-1D23 / PAT-014",
    value: f.placa,
    onChange: set('placa')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Hor\xEDmetro inicial"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    inputMode: "numeric",
    placeholder: "0",
    value: f.hor,
    onChange: set('hor')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Intervalo do plano preventivo"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "Ex.: a cada 250 h",
    value: f.planoH,
    onChange: set('planoH')
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Cadastrar equipamento"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "truck",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: tipoIc,
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, f.nome || 'Novo equipamento'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, f.tipo), /*#__PURE__*/React.createElement(Badge, {
    tone: f.prop === 'propria' ? 'info' : 'gold'
  }, f.prop === 'propria' ? 'Própria' : 'Locada')))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Marca"), /*#__PURE__*/React.createElement("span", {
    className: f.marca ? 'v' : 'v ph'
  }, f.marca || 'a definir', f.ano ? ' · ' + f.ano : '')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Placa/pat."), /*#__PURE__*/React.createElement("span", {
    className: f.placa ? 'v mono' : 'v ph'
  }, f.placa || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, f.hor || '0')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Plano"), /*#__PURE__*/React.createElement("span", {
    className: f.planoH ? 'v' : 'v ph'
  }, f.planoH || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "success",
    led: true
  }, "Em opera\xE7\xE3o"))))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "O equipamento fica dispon\xEDvel para ", /*#__PURE__*/React.createElement("b", null, "apontamentos"), " e ", /*#__PURE__*/React.createElement("b", null, "OS"), ". O hor\xEDmetro alimenta o ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " e dispara os ", /*#__PURE__*/React.createElement("b", null, "planos de manuten\xE7\xE3o"), " pelo intervalo definido."))));
}
window.NovoEquipamento = NovoEquipamento;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovoEquipamento.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovoOperador.jsx
try { (() => {
/* Retaguarda — Novo Operador (formulário de cadastro com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  Badge,
  Avatar,
  Chip,
  Note,
  Icon
} = NS;
const NOP_EQUIP = [['Escavadeira CAT 320', 'truck'], ['Escavadeira Volvo EC140', 'truck'], ['Retroescavadeira JCB 3CX', 'tractor'], ['Pá Carregadeira XCMG', 'forklift'], ['Rolo compactador CA25', 'tractor'], ['Caminhão basculante', 'truck']];
const NOP_CNH = ['A', 'B', 'C', 'D', 'E'];
function iniciais(nome) {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '—';
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}
function maskCpf(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
}
function NovoOperador({
  onCancel,
  onCreate
}) {
  const [f, setF] = React.useState({
    nome: '',
    vinculo: 'CLT',
    doc: '',
    tel: '',
    nasc: '',
    cnh: 'C',
    cnhVal: '',
    base: 'Santo Ângelo — RS',
    app: true
  });
  const [eqs, setEqs] = React.useState(['Escavadeira CAT 320']);
  const set = k => e => {
    const v = e.target.value;
    setF(s => ({
      ...s,
      [k]: k === 'doc' ? maskCpf(v) : v
    }));
  };
  const toggleEq = nm => setEqs(s => s.includes(nm) ? s.filter(x => x !== nm) : [...s, nm]);
  const ready = f.nome.trim() && f.doc.trim() && f.tel.trim();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Operadores"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Novo operador"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "cadastro")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados cadastrais",
    icon: "contact",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Nome completo", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Adelar Machado",
    value: f.nome,
    onChange: set('nome')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "V\xEDnculo"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-seg2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: f.vinculo === 'CLT' ? 'on' : '',
    onClick: () => setF(s => ({
      ...s,
      vinculo: 'CLT'
    }))
  }, "CLT"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: f.vinculo === 'PJ' ? 'on' : '',
    onClick: () => setF(s => ({
      ...s,
      vinculo: 'PJ'
    }))
  }, "PJ"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "CPF", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    inputMode: "numeric",
    placeholder: "000.000.000-00",
    value: f.doc,
    onChange: set('doc')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Telefone", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "(55) 99912-3040",
    value: f.tel,
    onChange: set('tel')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Nascimento"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "dd/mm/aaaa",
    value: f.nasc,
    onChange: set('nasc')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "CNH \u2014 categoria"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.cnh,
    onChange: set('cnh')
  }, NOP_CNH.map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, "Categoria ", c)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "CNH \u2014 validade"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "mm/aaaa",
    value: f.cnhVal,
    onChange: set('cnhVal')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Base"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Santo \xC2ngelo \u2014 RS",
    value: f.base,
    onChange: set('base')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Equipamentos habilitados"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-chipset"
  }, NOP_EQUIP.map(([nm, ic]) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: nm,
    className: eqs.includes(nm) ? 'on' : '',
    onClick: () => toggleEq(nm)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 14
  }), nm, eqs.includes(nm) && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13,
    strokeWidth: 2.4
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rtg-switch"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: f.app,
    onChange: e => setF(s => ({
      ...s,
      app: e.target.checked
    }))
  }), /*#__PURE__*/React.createElement("span", {
    className: "tk"
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Liberar acesso ao app de campo"), /*#__PURE__*/React.createElement("small", null, "O operador aponta horas e checklist pelo celular"))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Cadastrar operador"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "hard-hat",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: iniciais(f.nome),
    size: 48,
    shape: "square",
    tone: "brand"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, f.nome || 'Novo operador'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    icon: "briefcase"
  }, "Operador \xB7 ", f.vinculo), /*#__PURE__*/React.createElement(Badge, {
    tone: f.app ? 'info' : 'neutral',
    icon: "smartphone"
  }, f.app ? 'Acesso ao app' : 'Sem app')))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "CPF"), /*#__PURE__*/React.createElement("span", {
    className: f.doc ? 'v mono' : 'v ph'
  }, f.doc || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Telefone"), /*#__PURE__*/React.createElement("span", {
    className: f.tel ? 'v mono' : 'v ph'
  }, f.tel || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "CNH"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Categoria ", f.cnh, f.cnhVal ? ' · ' + f.cnhVal : '')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Base"), /*#__PURE__*/React.createElement("span", {
    className: f.base ? 'v' : 'v ph'
  }, f.base || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Equipamentos"), /*#__PURE__*/React.createElement("span", {
    className: eqs.length ? 'v' : 'v ph'
  }, eqs.length ? eqs.length + ' habilitados' : 'nenhum'))), eqs.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14
    }
  }, eqs.map(nm => /*#__PURE__*/React.createElement(Chip, {
    key: nm,
    icon: (NOP_EQUIP.find(x => x[0] === nm) || [])[1]
  }, nm)))), /*#__PURE__*/React.createElement(Note, {
    icon: "lock",
    tone: "steel"
  }, "Perfil operacional \u2014 sem dados financeiros. Custo-hora e valores ficam restritos \xE0s telas de ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " e ", /*#__PURE__*/React.createElement("b", null, "Financeiro"), "."))));
}
window.NovoOperador = NovoOperador;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovoOperador.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovoOrcamento.jsx
try { (() => {
/* Retaguarda — Novo Orçamento (itens da tabela de preços + total ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  StatusChip,
  IconTile,
  Note,
  Icon
} = NS;

/* Itens catalogáveis (espelham a tabela de Preços). */
const NORC_CAT = [{
  id: 'cat320',
  nm: 'Escavadeira CAT 320',
  ic: 'truck',
  un: 'h',
  preco: 400
}, {
  id: 'jcb',
  nm: 'Retroescavadeira JCB 3CX',
  ic: 'tractor',
  un: 'h',
  preco: 320
}, {
  id: 'xcmg',
  nm: 'Pá Carregadeira XCMG',
  ic: 'forklift',
  un: 'h',
  preco: 300
}, {
  id: 'rolo',
  nm: 'Rolo compactador CA25',
  ic: 'tractor',
  un: 'h',
  preco: 260
}, {
  id: 'basc',
  nm: 'Caminhão basculante',
  ic: 'truck',
  un: 'h',
  preco: 220
}, {
  id: 'mob',
  nm: 'Mobilização — prancha',
  ic: 'truck',
  un: 'km',
  preco: 8.5
}];
const brl = n => 'R$ ' + n.toLocaleString('pt-BR', {
  minimumFractionDigits: n % 1 ? 2 : 0,
  maximumFractionDigits: 2
});
function NovoOrcamento({
  onCancel,
  onCreate
}) {
  const clientes = window.RTG.clientes;
  const [cli, setCli] = React.useState('');
  const [serv, setServ] = React.useState('');
  const [val, setVal] = React.useState('');
  const [itens, setItens] = React.useState([{
    id: 'cat320',
    qt: 40
  }]);
  const addItem = () => {
    const usados = itens.map(i => i.id);
    const prox = NORC_CAT.find(c => !usados.includes(c.id)) || NORC_CAT[0];
    setItens(s => [...s, {
      id: prox.id,
      qt: 1
    }]);
  };
  const rmItem = idx => setItens(s => s.filter((_, i) => i !== idx));
  const setId = idx => e => {
    const v = e.target.value;
    setItens(s => s.map((it, i) => i === idx ? {
      ...it,
      id: v
    } : it));
  };
  const setQt = idx => e => {
    const v = Math.max(0, parseFloat(e.target.value) || 0);
    setItens(s => s.map((it, i) => i === idx ? {
      ...it,
      qt: v
    } : it));
  };
  const linhas = itens.map(it => {
    const c = NORC_CAT.find(x => x.id === it.id);
    return {
      ...c,
      qt: it.qt,
      sub: c.preco * it.qt
    };
  });
  const total = linhas.reduce((s, l) => s + l.sub, 0);
  const ready = cli && serv.trim() && total > 0;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Or\xE7amentos"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Novo or\xE7amento"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "ORC-056 \xB7 rascunho")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados do or\xE7amento",
    icon: "file-text",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Cliente", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: cli,
    onChange: e => setCli(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione o cliente\u2026"), clientes.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.nome
  }, c.nome)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Servi\xE7o", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Terraplenagem \u2014 fase 2",
    value: serv,
    onChange: e => setServ(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Validade da proposta"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "dd/mm/aaaa",
    value: val,
    onChange: e => setVal(e.target.value)
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Itens",
    icon: "tag",
    headerRight: /*#__PURE__*/React.createElement("span", {
      className: "rtg-link",
      onClick: addItem
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "file-plus",
      size: 14
    }), " Adicionar item")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table rtg-orc"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Item"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Qtd"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Unit."), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Subtotal"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, itens.map((it, idx) => {
    const c = NORC_CAT.find(x => x.id === it.id);
    return /*#__PURE__*/React.createElement("tr", {
      key: idx
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "rtg-eqcell"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atp-tile atp-tile--amber",
      style: {
        width: 26,
        height: 26
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: c.ic,
      size: 15
    })), /*#__PURE__*/React.createElement("select", {
      className: "rtg-select rtg-select--bare",
      value: it.id,
      onChange: setId(idx)
    }, NORC_CAT.map(o => /*#__PURE__*/React.createElement("option", {
      key: o.id,
      value: o.id
    }, o.nm))))), /*#__PURE__*/React.createElement("td", {
      className: "r"
    }, /*#__PURE__*/React.createElement("input", {
      className: "rtg-input rtg-input--qt mono",
      type: "number",
      min: "0",
      value: it.qt,
      onChange: setQt(idx)
    }), " ", /*#__PURE__*/React.createElement("span", {
      className: "rtg-un"
    }, c.un)), /*#__PURE__*/React.createElement("td", {
      className: "r rtg-val"
    }, brl(c.preco)), /*#__PURE__*/React.createElement("td", {
      className: "r rtg-val"
    }, brl(c.preco * it.qt)), /*#__PURE__*/React.createElement("td", {
      className: "r"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "rtg-rm",
      "aria-label": "Remover",
      disabled: itens.length === 1,
      onClick: () => rmItem(idx)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "ban",
      size: 15
    }))));
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    icon: "file-text",
    disabled: !ready
  }, "Salvar rascunho"), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Emitir or\xE7amento"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "file-text",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "file-text",
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px/1 var(--font-mono)',
      color: 'var(--amarelo)'
    }
  }, "ORC-056"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      marginTop: 5
    }
  }, serv || 'Nova proposta'))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Cliente"), /*#__PURE__*/React.createElement("span", {
    className: cli ? 'v' : 'v ph'
  }, cli || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Itens"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, itens.length, " ", itens.length === 1 ? 'item' : 'itens')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Validade"), /*#__PURE__*/React.createElement("span", {
    className: val ? 'v mono' : 'v ph'
  }, val || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "info",
    led: true
  }, "Aberto")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-total"
  }, /*#__PURE__*/React.createElement("span", null, "Total da proposta"), /*#__PURE__*/React.createElement("b", null, brl(total)))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Pre\xE7os v\xEAm da ", /*#__PURE__*/React.createElement("b", null, "tabela vigente"), "; a margem \xE9 conferida contra o ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), ". Ao aprovar, o or\xE7amento vira uma ", /*#__PURE__*/React.createElement("b", null, "OS"), " com um toque."))));
}
window.NovoOrcamento = NovoOrcamento;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovoOrcamento.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/NovoPagamento.jsx
try { (() => {
/* Retaguarda — Novo Pagamento (título a pagar, com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  StatusChip,
  IconTile,
  Note,
  Icon
} = NS;
const NPG_CAT = [['diesel', 'Diesel', 'fuel'], ['manut', 'Manutenção / peças', 'wrench'], ['folha', 'Folha — operadores', 'hard-hat'], ['frota', 'Frota / seguro', 'truck'], ['outros', 'Outros', 'wallet']];
const NPG_FORMA = ['PIX', 'TED', 'Boleto', 'Dinheiro'];
const brl = n => 'R$ ' + n.toLocaleString('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});
function NovoPagamento({
  onCancel,
  onCreate
}) {
  const [f, setF] = React.useState({
    cat: 'diesel',
    forn: '',
    doc: '',
    venc: '',
    valor: '',
    forma: 'Boleto',
    obs: ''
  });
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.value
  }));
  const cat = NPG_CAT.find(c => c[0] === f.cat) || NPG_CAT[0];
  const valorNum = parseFloat((f.valor || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
  const ready = f.forn.trim() && valorNum > 0 && f.venc.trim();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Financeiro"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Novo pagamento"), /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, "conta a pagar")), /*#__PURE__*/React.createElement("form", {
    className: "rtg-form",
    onSubmit: e => {
      e.preventDefault();
      if (ready) onCreate && onCreate();
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados do t\xEDtulo",
    icon: "wallet",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Categoria"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.cat,
    onChange: set('cat')
  }, NPG_CAT.map(([id, lbl]) => /*#__PURE__*/React.createElement("option", {
    key: id,
    value: id
  }, lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Fornecedor / benefici\xE1rio", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input",
    type: "text",
    placeholder: "Ex.: Posto Miss\xF5es",
    value: f.forn,
    onChange: set('forn')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Documento"), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "BOL 8821 / NF 5540",
    value: f.doc,
    onChange: set('doc')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Vencimento", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    placeholder: "dd/mm/aaaa",
    value: f.venc,
    onChange: set('venc')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Valor", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "rtg-input mono",
    type: "text",
    inputMode: "decimal",
    placeholder: "R$ 0",
    value: f.valor,
    onChange: set('valor')
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Forma de pagamento"), /*#__PURE__*/React.createElement("select", {
    className: "rtg-select",
    value: f.forma,
    onChange: set('forma')
  }, NPG_FORMA.map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-field-l col2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Observa\xE7\xF5es"), /*#__PURE__*/React.createElement("textarea", {
    className: "rtg-ta",
    placeholder: "Rateio por equipamento, centro de custo, refer\xEAncia\u2026",
    value: f.obs,
    onChange: set('obs')
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-form-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "ghost",
    icon: "file-text",
    disabled: !ready
  }, "Salvar rascunho"), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    disabled: !ready
  }, "Lan\xE7ar pagamento"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resumo",
    icon: "wallet",
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: cat[2],
    tone: "brand",
    size: "lg",
    style: {
      width: 48,
      height: 48,
      borderRadius: 13
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, f.forn || 'Novo pagamento'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted-2)',
      marginTop: 4
    }
  }, cat[1]))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Documento"), /*#__PURE__*/React.createElement("span", {
    className: f.doc ? 'v mono' : 'v ph'
  }, f.doc || 'sem documento')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Vencimento"), /*#__PURE__*/React.createElement("span", {
    className: f.venc ? 'v mono' : 'v ph'
  }, f.venc || 'a definir')), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Forma"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, f.forma)), /*#__PURE__*/React.createElement("div", {
    className: "sm-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "amber",
    led: true
  }, "A vencer")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-total"
  }, /*#__PURE__*/React.createElement("span", null, "Valor a pagar"), /*#__PURE__*/React.createElement("b", null, brl(valorNum)))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Entra em ", /*#__PURE__*/React.createElement("b", null, "Financeiro \u203A Contas a pagar"), ". Pagamentos de ", /*#__PURE__*/React.createElement("b", null, "diesel"), " e ", /*#__PURE__*/React.createElement("b", null, "manuten\xE7\xE3o"), " s\xE3o rateados no ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " do equipamento; a baixa \xE9 feita pelo ", /*#__PURE__*/React.createElement("b", null, "comprovante"), "."))));
}
window.NovoPagamento = NovoPagamento;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/NovoPagamento.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/OSDetail.jsx
try { (() => {
/* Retaguarda — Ordem de Serviço detail (hero, KPIs, apontamentos, medições, vínculos). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Badge,
  Button,
  KpiCard,
  Card,
  StatusChip,
  DataRow,
  Pill,
  IconTile,
  Note,
  Icon
} = NS;

/* Apontamentos por OS (exemplos coerentes com a lista + app de campo). */
const OS_APONT = {
  'OS-021': [{
    data: '09/07',
    op: 'Adelar Machado',
    eq: 'Escavadeira CAT 320',
    eqIc: 'truck',
    hm: '4.210 → 4.218',
    h: '8,0 h'
  }, {
    data: '08/07',
    op: 'Adelar Machado',
    eq: 'Escavadeira CAT 320',
    eqIc: 'truck',
    hm: '4.203 → 4.210',
    h: '7,5 h'
  }, {
    data: '05/07',
    op: 'Adelar Machado',
    eq: 'Escavadeira CAT 320',
    eqIc: 'truck',
    hm: '4.195 → 4.203',
    h: '8,0 h'
  }, {
    data: '04/07',
    op: 'Vilson Prediger',
    eq: 'Escavadeira CAT 320',
    eqIc: 'truck',
    hm: '4.187 → 4.195',
    h: '8,0 h'
  }, {
    data: '03/07',
    op: 'Adelar Machado',
    eq: 'Escavadeira CAT 320',
    eqIc: 'truck',
    hm: '4.180 → 4.187',
    h: '7,0 h'
  }]
};
const OS_APONT_FALLBACK = [{
  data: '09/07',
  op: 'Adelar Machado',
  eq: 'Escavadeira CAT 320',
  eqIc: 'truck',
  hm: '4.210 → 4.218',
  h: '8,0 h'
}, {
  data: '08/07',
  op: 'Nelson Kunz',
  eq: 'Escavadeira CAT 320',
  eqIc: 'truck',
  hm: '4.203 → 4.210',
  h: '7,5 h'
}, {
  data: '05/07',
  op: 'Vilson Prediger',
  eq: 'Retroescavadeira JCB 3CX',
  eqIc: 'tractor',
  hm: '1.882 → 1.888',
  h: '6,0 h'
}];
const OS_MED = [{
  n: 'Medição #2',
  per: '01/07 – 11/07',
  h: '38,5 h',
  v: 'R$ 15.400',
  tone: 'amber',
  led: true,
  st: 'Em aberto'
}, {
  n: 'Medição #1',
  per: '15/06 – 30/06',
  h: '23,5 h',
  v: 'R$ 9.400',
  tone: 'success',
  icon: 'check',
  st: 'Faturada'
}];
function OSDetail({
  os,
  onBack
}) {
  const o = os || {};
  const apont = OS_APONT[o.n] || OS_APONT_FALLBACK;
  const isAberta = o.st === 'Aberta';
  const isConcluida = o.st === 'Concluída';
  const heroTone = o.tone || 'info';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Ordens de Servi\xE7o"), /*#__PURE__*/React.createElement("section", {
    className: "rtg-hero"
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "clipboard-list",
    size: "lg",
    tone: "brand",
    style: {
      width: 78,
      height: 78,
      borderRadius: 18
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-main"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 13px/1 var(--font-mono)',
      color: 'var(--amarelo)',
      letterSpacing: '.02em'
    }
  }, o.n), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: 8
    }
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-sub"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: heroTone,
    led: true
  }, o.st), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    icon: o.eqIcon || 'truck'
  }, o.eq), /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    icon: "building-2"
  }, o.cli)), /*#__PURE__*/React.createElement("div", {
    className: "rtg-qf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Operador"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, o.op)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Per\xEDodo"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, o.per)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Local"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Distrito Industrial \xB7 Santo \xC2ngelo/RS")), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Or\xE7amento"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "ORC-055")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "pencil"
  }, "Editar"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "file-text"
  }, "Di\xE1rio"), isConcluida ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-check"
  }, "Faturar") : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "check"
  }, "Concluir OS"))), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis"
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Horas apontadas",
    value: o.h || '62 h',
    icon: "clock",
    foot: `${apont.length} apontamentos`,
    spark: [10, 12, 11, 13, 12, 14, 13, 15]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Valor previsto",
    value: o.v || 'R$ 24.800',
    mono: true,
    icon: "credit-card",
    foot: "conforme or\xE7amento"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Faturado",
    value: isConcluida ? o.v || 'R$ 24.800' : 'R$ 9.400',
    mono: true,
    icon: "file-check",
    foot: isConcluida ? 'OS concluída' : '1 de 2 medições'
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Margem estimada",
    value: "36%",
    icon: "trending-up",
    trend: {
      dir: 'up',
      value: '2 p.p.'
    },
    foot: "vs. m\xE9dia do servi\xE7o"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Apontamentos",
    icon: "gauge",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, apont.length, " lan\xE7amentos")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap rtg-tablewrap--wide"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Data"), /*#__PURE__*/React.createElement("th", null, "Operador"), /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", null, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Horas"))), /*#__PURE__*/React.createElement("tbody", null, apont.map((a, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, a.data), /*#__PURE__*/React.createElement("td", null, a.op), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.eqIc,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, a.eq))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-horim"
  }, a.hm)), /*#__PURE__*/React.createElement("td", {
    className: "r",
    style: {
      fontWeight: 600
    }
  }, a.h))))))), /*#__PURE__*/React.createElement(Card, {
    title: "Medi\xE7\xF5es",
    icon: "file-check",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "2 no per\xEDodo")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, OS_MED.map(m => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: m.n
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "receipt",
    tone: "amber",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, m.n, " \xB7 ", m.h), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, m.per)), /*#__PURE__*/React.createElement("div", {
    className: "cv"
  }, m.v, /*#__PURE__*/React.createElement(StatusChip, {
    tone: m.tone,
    led: m.led,
    icon: m.icon,
    style: {
      padding: '2px 7px'
    }
  }, m.st))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados da OS",
    icon: "clipboard-list",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "building-2",
    label: "Cliente"
  }, o.cli), /*#__PURE__*/React.createElement(DataRow, {
    icon: "hard-hat",
    label: "Operador"
  }, o.op), /*#__PURE__*/React.createElement(DataRow, {
    icon: o.eqIcon || 'truck',
    label: "Equipamento"
  }, o.eq), /*#__PURE__*/React.createElement(DataRow, {
    icon: "map-pin",
    label: "Local"
  }, "Distrito Industrial \u2014 Santo \xC2ngelo/RS"), /*#__PURE__*/React.createElement(DataRow, {
    icon: "calendar",
    label: "Per\xEDodo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, o.per)), /*#__PURE__*/React.createElement(DataRow, {
    icon: "file-text",
    label: "Or\xE7amento"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "ORC-055"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "aprovado 30/06"))), /*#__PURE__*/React.createElement(Card, {
    title: "Hist\xF3rico",
    icon: "history"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "file-check",
    tone: "muted",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, "Medi\xE7\xE3o #1 faturada"), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, "01/07 \xB7 NF 1029"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "clipboard-list",
    tone: "muted",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, "OS iniciada em campo"), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, o.per))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "file-text",
    tone: "muted",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, "Or\xE7amento ORC-055 aprovado"), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, "30/06 \xB7 ", o.cli))))), isAberta && /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "OS ", /*#__PURE__*/React.createElement("b", null, "aberta"), " \u2014 apontamentos chegam do ", /*#__PURE__*/React.createElement("b", null, "app de campo"), " em tempo real. Conclua a OS para liberar o faturamento total."))));
}
window.OSDetail = OSDetail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/OSDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/OSList.jsx
try { (() => {
/* Retaguarda — Ordens de Serviço list (filter by status via the chips). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  StatusChip,
  Button,
  Pill,
  IconTile,
  Icon
} = NS;
const OS_ROWS = [{
  n: 'OS-024',
  t: 'Nivelamento de pátio',
  cli: 'Agro Vale Verde',
  op: 'Adelar Machado',
  eq: 'Pá Carregadeira XCMG',
  eqIcon: 'forklift',
  h: '8 h',
  per: 'desde 05/07',
  v: 'R$ 9.600',
  st: 'Aberta',
  tone: 'info'
}, {
  n: 'OS-021',
  t: 'Terraplenagem — lote industrial',
  cli: 'Construtora Vale Verde',
  op: 'Adelar Machado',
  eq: 'Escavadeira CAT 320',
  eqIcon: 'truck',
  h: '62 h',
  per: 'desde 01/07',
  v: 'R$ 24.800',
  st: 'Em andamento',
  tone: 'amber'
}, {
  n: 'OS-019',
  t: 'Abertura de acesso e drenagem',
  cli: 'Construtora Sul',
  op: 'Vilson Prediger',
  eq: 'Retroescavadeira JCB 3CX',
  eqIcon: 'tractor',
  h: '28 h',
  per: 'desde 24/06',
  v: 'R$ 11.200',
  st: 'Em andamento',
  tone: 'amber'
}, {
  n: 'OS-018',
  t: 'Abertura de acesso e drenagem',
  cli: 'Essavado Ltda.',
  op: 'Nelson Kunz',
  eq: 'Escavadeira CAT 320',
  eqIcon: 'truck',
  h: '40 h',
  per: 'desde 20/06',
  v: 'R$ 16.200',
  st: 'Em andamento',
  tone: 'amber'
}, {
  n: 'OS-015',
  t: 'Fundação de galpão — estacas',
  cli: 'Metalúrgica Boa Vista',
  op: 'Adelar Machado',
  eq: 'Escavadeira CAT 320',
  eqIcon: 'truck',
  h: '44 h',
  per: '06–20/06',
  v: 'R$ 19.800',
  st: 'Concluída',
  tone: 'success'
}, {
  n: 'OS-012',
  t: 'Fundação de galpão — estacas',
  cli: 'Construtora Vale Verde',
  op: 'Vilson Prediger',
  eq: 'Retroescavadeira JCB 3CX',
  eqIcon: 'tractor',
  h: '88 h',
  per: '02–24/05',
  v: 'R$ 41.000',
  st: 'Concluída',
  tone: 'success'
}, {
  n: 'OS-007',
  t: 'Nivelamento de pátio',
  cli: 'Construtora Vale Verde',
  op: 'Nelson Kunz',
  eq: 'Pá Carregadeira XCMG',
  eqIcon: 'forklift',
  h: '30 h',
  per: '08–19/04',
  v: 'R$ 12.500',
  st: 'Concluída',
  tone: 'success'
}];
const OS_FILTERS = [{
  id: 'todas',
  label: 'Todas'
}, {
  id: 'Aberta',
  label: 'Abertas',
  tone: 'info'
}, {
  id: 'Em andamento',
  label: 'Em andamento',
  tone: 'amber'
}, {
  id: 'Concluída',
  label: 'Concluídas',
  tone: 'success'
}];
function OSList({
  onOpen,
  onNew
}) {
  const [filter, setFilter] = React.useState('todas');
  const rows = filter === 'todas' ? OS_ROWS : OS_ROWS.filter(r => r.st === filter);
  const count = id => id === 'todas' ? OS_ROWS.length : OS_ROWS.filter(r => r.st === id).length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Ordens de Servi\xE7o"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus",
    onClick: onNew
  }, "Nova OS")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-filters"
  }, OS_FILTERS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    type: "button",
    className: filter === f.id ? 'rtg-filter is-active' : 'rtg-filter',
    onClick: () => setFilter(f.id)
  }, f.tone && /*#__PURE__*/React.createElement("span", {
    className: "led",
    style: {
      color: `var(--${f.tone === 'amber' ? 'amarelo' : f.tone === 'info' ? 'info-fg' : 'success-fg'})`
    }
  }), f.label, /*#__PURE__*/React.createElement("span", {
    className: "ct"
  }, count(f.id))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap rtg-tablewrap--wide"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table rtg-clickable"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "OS"), /*#__PURE__*/React.createElement("th", null, "Servi\xE7o"), /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", null, "Operador"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Horas"), /*#__PURE__*/React.createElement("th", null, "Per\xEDodo"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Valor"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.n,
    onClick: () => onOpen && onOpen(r)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, r.n)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 600
    }
  }, r.t), /*#__PURE__*/React.createElement("td", null, r.cli), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.eqIcon,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, r.eq))), /*#__PURE__*/React.createElement("td", null, r.op), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.h), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.per), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.v), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: r.tone,
    led: true
  }, r.st)))))))));
}
window.OSList = OSList;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/OSList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/OperadorDetail.jsx
try { (() => {
/* Retaguarda — Operador detail (recreation of mock-detalhe-operador). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Avatar,
  Badge,
  Button,
  KpiCard,
  Card,
  StatusChip,
  DataRow,
  Chip,
  Note,
  Pill,
  Icon
} = NS;
const OP_APONT = [{
  data: '09/07',
  eq: 'Escavadeira CAT 320',
  eqIcon: 'truck',
  h0: '4.210',
  h1: '4.218',
  hrs: '8,0 h',
  os: 'OS-021'
}, {
  data: '08/07',
  eq: 'Escavadeira CAT 320',
  eqIcon: 'truck',
  h0: '4.203',
  h1: '4.210',
  hrs: '7,5 h',
  os: 'OS-021'
}, {
  data: '07/07',
  eq: 'Retroescavadeira JCB 3CX',
  eqIcon: 'tractor',
  h0: '1.882',
  h1: '1.888',
  hrs: '6,0 h',
  os: 'OS-019'
}, {
  data: '05/07',
  eq: 'Pá Carregadeira XCMG',
  eqIcon: 'forklift',
  h0: '990',
  h1: '998',
  hrs: '8,0 h',
  os: 'OS-024'
}, {
  data: '04/07',
  eq: 'Escavadeira CAT 320',
  eqIcon: 'truck',
  h0: '4.195',
  h1: '4.203',
  hrs: '8,0 h',
  os: 'OS-021'
}];
const OP_OS = [{
  n: 'OS-021',
  t: 'Terraplenagem — lote industrial',
  cli: 'Essavado Ltda.',
  h: '62 h',
  d: 'desde 01/07',
  tone: 'amber',
  st: 'Em andamento',
  led: true
}, {
  n: 'OS-019',
  t: 'Abertura de acesso e drenagem',
  cli: 'Construtora Sul',
  h: '28 h',
  d: 'desde 24/06',
  tone: 'amber',
  st: 'Em andamento',
  led: true
}, {
  n: 'OS-024',
  t: 'Nivelamento de pátio',
  cli: 'Agro Vale Verde',
  h: '8 h',
  d: 'desde 05/07',
  tone: 'info',
  st: 'Aberta',
  led: true
}, {
  n: 'OS-015',
  t: 'Fundação de galpão — estacas',
  cli: 'Metalúrgica Boa Vista',
  h: '44 h',
  d: '06–20/06',
  tone: 'success',
  st: 'Concluída',
  led: true
}];
const OP_BARS = [['S1', 62], ['S2', 71], ['S3', 56], ['S4', 80], ['S5', 68], ['S6', 76], ['S7', 64], ['S8', 92]];
const OP_EQUIP = [['truck', 'Escavadeira CAT 320'], ['tractor', 'Retro JCB 3CX'], ['forklift', 'Pá XCMG'], ['truck', 'Basculante']];
function OperadorDetail({
  operador,
  onBack
}) {
  const o = operador || window.RTG.operadores[0];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Operadores"), /*#__PURE__*/React.createElement("section", {
    className: "rtg-hero"
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: o.iniciais,
    size: 78,
    shape: "square",
    tone: "brand"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-main"
  }, /*#__PURE__*/React.createElement("h1", null, o.nome), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-sub"
  }, o.ativo ? /*#__PURE__*/React.createElement(Badge, {
    tone: "active",
    led: true
  }, "Ativo") : /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    led: true
  }, "Inativo"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    icon: "briefcase"
  }, "Operador \xB7 ", o.vinculo), o.app ? /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    icon: "smartphone"
  }, "Acesso ao app") : /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    icon: "smartphone"
  }, "Sem acesso ao app")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-qf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "CPF"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, o.doc)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Telefone"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, o.telefone)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Operador desde"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, o.desde || 'mar/2021 · 4 anos')), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\xDAltima atividade"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, o.ultimaAtividade || 'Hoje, 07:42')))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "pencil"
  }, "Editar"), /*#__PURE__*/React.createElement(Button, {
    variant: "wa",
    icon: "message-circle"
  }, "WhatsApp"), /*#__PURE__*/React.createElement(Button, {
    variant: "danger",
    icon: "ban"
  }, "Inativar"))), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis"
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Horas apontadas",
    value: o.horas || '182',
    unit: "h",
    icon: "clock",
    trend: {
      dir: 'up',
      value: '12%'
    },
    foot: "vs. junho",
    spark: [20, 17, 19, 12, 14, 8, 10, 4]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "OS ativas",
    value: String(o.osAtivas ?? 3),
    icon: "clipboard-list",
    foot: "2 em andamento \xB7 1 aberta",
    spark: [14, 15, 10, 12, 9, 11, 7, 8]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "OS conclu\xEDdas",
    value: String(o.osConcluidas ?? 17),
    icon: "circle-check-big",
    trend: {
      dir: 'up',
      value: '3'
    },
    foot: "no m\xEAs",
    spark: [22, 18, 16, 17, 11, 13, 7, 5]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Equipamentos",
    value: String(o.equipamentos ?? 4),
    icon: "truck",
    foot: "operados no per\xEDodo",
    spark: [16, 16, 13, 13, 10, 10, 8, 8]
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Apontamentos recentes",
    icon: "gauge",
    headerRight: /*#__PURE__*/React.createElement("span", {
      className: "rtg-link"
    }, "Ver todos ", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14
    }))
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Data"), /*#__PURE__*/React.createElement("th", null, "Equipamento"), /*#__PURE__*/React.createElement("th", null, "Hor\xEDmetro"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Horas"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "OS"))), /*#__PURE__*/React.createElement("tbody", null, OP_APONT.map((a, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, a.data), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.eqIcon,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, a.eq))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-horim"
  }, /*#__PURE__*/React.createElement("b", null, a.h0), " \u2192 ", /*#__PURE__*/React.createElement("b", null, a.h1))), /*#__PURE__*/React.createElement("td", {
    className: "r",
    style: {
      fontWeight: 600
    }
  }, a.hrs), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, a.os))))))), /*#__PURE__*/React.createElement(Card, {
    title: "Ordens de Servi\xE7o",
    icon: "clipboard-list",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "4 vinculadas")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-oslist"
  }, OP_OS.map(s => /*#__PURE__*/React.createElement("div", {
    className: "rtg-osrow",
    key: s.n
  }, /*#__PURE__*/React.createElement("span", {
    className: "rtg-osnum"
  }, s.n), /*#__PURE__*/React.createElement("div", {
    className: "rtg-osbody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, s.t), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 12
  }), " ", s.cli), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 12
  }), " ", s.h), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 12
  }), " ", s.d))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-osend"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: s.tone,
    led: s.led
  }, s.st))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados cadastrais",
    icon: "contact",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "id-card",
    label: "CNH"
  }, o.cnh || 'Categoria E · válida até 03/2028'), /*#__PURE__*/React.createElement(DataRow, {
    icon: "cake",
    label: "Nascimento"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, o.nascimento || '14/09/1985 · 39 anos')), /*#__PURE__*/React.createElement(DataRow, {
    icon: "briefcase",
    label: "V\xEDnculo"
  }, o.vinculo, " \xB7 ", /*#__PURE__*/React.createElement("small", null, "admiss\xE3o mar/2021")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "phone",
    label: "Telefone"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, o.telefone)), /*#__PURE__*/React.createElement(DataRow, {
    icon: "map-pin",
    label: "Base"
  }, o.base)), /*#__PURE__*/React.createElement(Card, {
    title: "Horas por semana",
    icon: "bar-chart"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars"
  }, OP_BARS.map(([lbl, h], i) => /*#__PURE__*/React.createElement("div", {
    className: "rtg-barcol",
    key: lbl
  }, /*#__PURE__*/React.createElement("div", {
    className: i === OP_BARS.length - 1 ? 'rtg-bar hi' : 'rtg-bar',
    style: {
      height: h + '%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "rtg-barlbl"
  }, lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars-meta"
  }, /*#__PURE__*/React.createElement("span", null, "M\xE9dia ", /*#__PURE__*/React.createElement("b", null, "42 h"), "/semana"), /*#__PURE__*/React.createElement("span", null, "Pico ", /*#__PURE__*/React.createElement("b", null, "46 h"), " (S8)")))), /*#__PURE__*/React.createElement(Card, {
    title: "Equipamentos habilitados",
    icon: "wrench"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-chips"
  }, OP_EQUIP.map(([ic, nm], i) => /*#__PURE__*/React.createElement(Chip, {
    key: i,
    icon: ic
  }, nm)))), /*#__PURE__*/React.createElement(Card, {
    title: "Acesso ao app",
    icon: "smartphone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-appcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-appstatus"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, "App liberado"), /*#__PURE__*/React.createElement("div", {
    className: "ss"
  }, "Login ativo no dispositivo"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-appgrid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "\xDAltimo acesso"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "Hoje, 07:42")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Dispositivo"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "Android \xB7 Moto G")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Vers\xE3o"), /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, "v0.1 \xB7 funda\xE7\xE3o")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Aponta via"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "App de campo"))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Note, {
    icon: "lock",
    tone: "steel"
  }, "Perfil operacional \u2014 sem dados financeiros. Custo-hora e valores ficam restritos \xE0s telas de ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), ", ", /*#__PURE__*/React.createElement("b", null, "Financeiro"), " e ", /*#__PURE__*/React.createElement("b", null, "Rentabilidade"), ", conforme o particionamento de acesso.")));
}
window.OperadorDetail = OperadorDetail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/OperadorDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/OperadoresList.jsx
try { (() => {
/* Retaguarda — Operadores list (click a row to open the detail). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  StatusChip,
  Badge,
  Avatar,
  Button
} = NS;
function OperadoresList({
  onOpen,
  onNew
}) {
  const rows = window.RTG.operadores;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Operadores"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus",
    onClick: onNew
  }, "Novo operador")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table rtg-clickable"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Operador"), /*#__PURE__*/React.createElement("th", null, "V\xEDnculo"), /*#__PURE__*/React.createElement("th", null, "Base"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Horas (m\xEAs)"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "App"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(o => /*#__PURE__*/React.createElement("tr", {
    key: o.id,
    onClick: () => onOpen(o)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-namecell"
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: o.iniciais,
    size: 34
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, o.nome), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, o.osAtivas, " OS ativas")))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, o.vinculo)), /*#__PURE__*/React.createElement("td", null, o.base), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, o.horas, " h"), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, o.app ? /*#__PURE__*/React.createElement(StatusChip, {
    tone: "info",
    led: true
  }, "Liberado") : /*#__PURE__*/React.createElement(StatusChip, {
    tone: "neutral"
  }, "Sem acesso")), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, o.ativo ? /*#__PURE__*/React.createElement(StatusChip, {
    tone: "success",
    led: true
  }, "Ativo") : /*#__PURE__*/React.createElement(StatusChip, {
    tone: "neutral"
  }, "Inativo"))))))));
}
window.OperadoresList = OperadoresList;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/OperadoresList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/OrcamentoDetail.jsx
try { (() => {
/* Retaguarda — Orçamento detail (hero, itens, resumo, histórico, vínculos). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Badge,
  Button,
  KpiCard,
  Card,
  StatusChip,
  DataRow,
  Pill,
  IconTile,
  Note,
  Icon
} = NS;

/* Itens por orçamento (fallback para os que não têm detalhamento). */
const ORC_ITENS = {
  'ORC-055': [{
    ic: 'truck',
    nm: 'Escavadeira CAT 320',
    qt: '90 h',
    un: 'R$ 400/h',
    sub: 'R$ 36.000'
  }, {
    ic: 'tractor',
    nm: 'Retroescavadeira JCB 3CX',
    qt: '40 h',
    un: 'R$ 320/h',
    sub: 'R$ 12.800'
  }, {
    ic: 'truck',
    nm: 'Caminhão basculante',
    qt: '30 h',
    un: 'R$ 220/h',
    sub: 'R$ 6.600'
  }, {
    ic: 'truck',
    nm: 'Mobilização — prancha',
    qt: '65 km',
    un: 'R$ 8,50/km',
    sub: 'R$ 2.600'
  }]
};
const ORC_ITENS_FALLBACK = [{
  ic: 'truck',
  nm: 'Escavadeira CAT 320',
  qt: '40 h',
  un: 'R$ 400/h',
  sub: 'R$ 16.000'
}, {
  ic: 'tractor',
  nm: 'Retroescavadeira JCB 3CX',
  qt: '20 h',
  un: 'R$ 320/h',
  sub: 'R$ 6.400'
}];
const ORC_HIST = {
  'Aberto': [['file-text', 'Orçamento emitido', 'enviado ao cliente'], ['mail', 'Proposta enviada por e-mail', 'aguardando retorno']],
  'Aprovado': [['badge-check', 'Orçamento aprovado', 'pelo cliente'], ['clipboard-list', 'OS gerada', 'a partir da proposta'], ['file-text', 'Orçamento emitido', 'enviado ao cliente']],
  'Perdido': [['ban', 'Orçamento perdido', 'cliente optou por outro fornecedor'], ['file-text', 'Orçamento emitido', 'enviado ao cliente']]
};
function OrcamentoDetail({
  orc,
  onBack
}) {
  const o = orc || {};
  const itens = ORC_ITENS[o.n] || ORC_ITENS_FALLBACK;
  const hist = ORC_HIST[o.st] || ORC_HIST['Aberto'];
  const isAberto = o.st === 'Aberto';
  const isAprovado = o.st === 'Aprovado';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "rtg-back",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Or\xE7amentos"), /*#__PURE__*/React.createElement("section", {
    className: "rtg-hero"
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "file-text",
    size: "lg",
    tone: "brand",
    style: {
      width: 78,
      height: 78,
      borderRadius: 18
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-main"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 13px/1 var(--font-mono)',
      color: 'var(--amarelo)',
      letterSpacing: '.02em'
    }
  }, o.n), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: 8
    }
  }, o.t), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-sub"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: o.tone,
    led: o.tone !== 'neutral'
  }, o.st), /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    icon: "building-2"
  }, o.cli), /*#__PURE__*/React.createElement(Badge, {
    tone: "gold",
    icon: "tag"
  }, o.v)), /*#__PURE__*/React.createElement("div", {
    className: "rtg-qf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Emiss\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, o.data)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Validade"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, o.val)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Itens"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, itens.length)), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Vendedor"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Admin AILA")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "pencil"
  }, "Editar"), /*#__PURE__*/React.createElement(Button, {
    variant: "wa",
    icon: "message-circle"
  }, "Enviar"), isAberto && /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "clipboard-list"
  }, "Aprovar \u2192 OS"), isAprovado && /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "clipboard-list"
  }, "Ver OS"))), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis"
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Valor total",
    value: o.v,
    mono: true,
    icon: "tag",
    foot: `${itens.length} itens`
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Custo estimado",
    value: "R$ 34.200",
    mono: true,
    warn: true,
    icon: "calculator",
    foot: "Custo da Hora vigente"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Margem",
    value: "41%",
    icon: "trending-up",
    trend: {
      dir: 'up',
      value: '3 p.p.'
    },
    foot: "acima da m\xEDnima (30%)"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Validade",
    value: isAberto ? '18 dias' : '—',
    icon: "clock",
    foot: isAberto ? 'para expirar' : o.st
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Itens do or\xE7amento",
    icon: "tag",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, o.v)
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Item"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Qtd"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Unit\xE1rio"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Subtotal"))), /*#__PURE__*/React.createElement("tbody", null, itens.map((it, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.ic,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, it.nm))), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, it.qt), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, it.un), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, it.sub))))))), /*#__PURE__*/React.createElement(Card, {
    title: "Hist\xF3rico",
    icon: "history"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-clist"
  }, hist.map(([ic, t, m], i) => /*#__PURE__*/React.createElement("div", {
    className: "rtg-crow",
    key: i,
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: ic,
    tone: "muted",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, t), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, m))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Dados do or\xE7amento",
    icon: "file-text",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "building-2",
    label: "Cliente"
  }, o.cli), /*#__PURE__*/React.createElement(DataRow, {
    icon: "briefcase",
    label: "Servi\xE7o"
  }, o.t), /*#__PURE__*/React.createElement(DataRow, {
    icon: "calendar",
    label: "Emiss\xE3o"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, o.data)), /*#__PURE__*/React.createElement(DataRow, {
    icon: "clock",
    label: "Validade"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, o.val)), /*#__PURE__*/React.createElement(DataRow, {
    icon: "tag",
    label: "Valor"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, o.v))), isAberto && /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Or\xE7amento ", /*#__PURE__*/React.createElement("b", null, "aberto"), " \u2014 ao aprovar, vira uma ", /*#__PURE__*/React.createElement("b", null, "OS"), " com os mesmos itens e o cliente j\xE1 vinculado. A margem \xE9 conferida contra o ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " vigente."), isAprovado && /*#__PURE__*/React.createElement(Note, {
    icon: "badge-check"
  }, "Or\xE7amento ", /*#__PURE__*/React.createElement("b", null, "aprovado"), " e convertido em OS. O acompanhamento passa para ", /*#__PURE__*/React.createElement("b", null, "Ordens de Servi\xE7o"), "."), o.st === 'Perdido' && /*#__PURE__*/React.createElement(Note, {
    icon: "ban",
    tone: "steel"
  }, "Or\xE7amento ", /*#__PURE__*/React.createElement("b", null, "perdido"), ". Mantido no hist\xF3rico para an\xE1lise da ", /*#__PURE__*/React.createElement("b", null, "taxa de convers\xE3o"), " no Painel Gerencial."))));
}
window.OrcamentoDetail = OrcamentoDetail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/OrcamentoDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/OrcamentosList.jsx
try { (() => {
/* Retaguarda — Orçamentos (pipeline comercial; filtro por situação). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  StatusChip,
  Button,
  Pill
} = NS;
const ORC_ROWS = [{
  n: 'ORC-055',
  t: 'Terraplenagem — fase 2',
  cli: 'Construtora Vale Verde',
  data: '02/07',
  val: '01/08',
  v: 'R$ 58.000',
  st: 'Aberto',
  tone: 'info'
}, {
  n: 'ORC-051',
  t: 'Drenagem de acesso',
  cli: 'Construtora Vale Verde',
  data: '24/06',
  val: '24/07',
  v: 'R$ 22.400',
  st: 'Aberto',
  tone: 'info'
}, {
  n: 'ORC-047',
  t: 'Pátio de manobra',
  cli: 'Construtora Vale Verde',
  data: '12/06',
  val: '12/07',
  v: 'R$ 18.900',
  st: 'Aberto',
  tone: 'info'
}, {
  n: 'ORC-042',
  t: 'Acesso rural — cascalhamento',
  cli: 'Agro Vale Verde',
  data: '28/05',
  val: '—',
  v: 'R$ 12.600',
  st: 'Aprovado',
  tone: 'success'
}, {
  n: 'ORC-039',
  t: 'Fundação do anexo',
  cli: 'Construtora Vale Verde',
  data: '20/04',
  val: '—',
  v: 'R$ 41.000',
  st: 'Aprovado',
  tone: 'success'
}, {
  n: 'ORC-030',
  t: 'Limpeza de terreno',
  cli: 'Construtora Vale Verde',
  data: '08/03',
  val: '—',
  v: 'R$ 9.800',
  st: 'Perdido',
  tone: 'neutral'
}];
const ORC_FILTERS = [{
  id: 'todos',
  label: 'Todos'
}, {
  id: 'Aberto',
  label: 'Abertos',
  tone: 'info'
}, {
  id: 'Aprovado',
  label: 'Aprovados',
  tone: 'success'
}, {
  id: 'Perdido',
  label: 'Perdidos',
  tone: 'neutral'
}];
function OrcamentosList({
  onNew,
  onOpen
}) {
  const [filter, setFilter] = React.useState('todos');
  const rows = filter === 'todos' ? ORC_ROWS : ORC_ROWS.filter(r => r.st === filter);
  const count = id => id === 'todos' ? ORC_ROWS.length : ORC_ROWS.filter(r => r.st === id).length;
  const ledColor = tone => tone === 'success' ? 'var(--success-fg)' : tone === 'info' ? 'var(--info-fg)' : 'var(--muted-2)';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Or\xE7amentos"), /*#__PURE__*/React.createElement(Pill, null, "R$ 99.300 em aberto"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "file-plus",
    onClick: onNew
  }, "Novo or\xE7amento")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-filters"
  }, ORC_FILTERS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    type: "button",
    className: filter === f.id ? 'rtg-filter is-active' : 'rtg-filter',
    onClick: () => setFilter(f.id)
  }, f.tone && /*#__PURE__*/React.createElement("span", {
    className: "led",
    style: {
      color: ledColor(f.tone)
    }
  }), f.label, /*#__PURE__*/React.createElement("span", {
    className: "ct"
  }, count(f.id))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table rtg-clickable"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Or\xE7amento"), /*#__PURE__*/React.createElement("th", null, "Servi\xE7o"), /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", null, "Emiss\xE3o"), /*#__PURE__*/React.createElement("th", null, "Validade"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Valor"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.n,
    onClick: () => onOpen && onOpen(r)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-doc"
  }, r.n)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 600
    }
  }, r.t), /*#__PURE__*/React.createElement("td", null, r.cli), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.data), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.val), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.v), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: r.tone,
    led: r.tone !== 'neutral'
  }, r.st)))))))));
}
window.OrcamentosList = OrcamentosList;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/OrcamentosList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/PainelGerencial.jsx
try { (() => {
/* Retaguarda — Painel Gerencial (visão executiva consolidada do ano). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  KpiCard,
  Card,
  Button,
  Pill,
  IconTile,
  Icon,
  Note
} = NS;
const PG_MESES = [['jan', 48], ['fev', 52], ['mar', 61], ['abr', 58], ['mai', 74], ['jun', 78], ['jul', 88]];
const PG_TOP = [{
  cli: 'Construtora Vale Verde',
  os: 18,
  rec: 'R$ 148.500',
  m: '39%',
  dir: 'up'
}, {
  cli: 'Metalúrgica Boa Vista',
  os: 9,
  rec: 'R$ 84.200',
  m: '37%',
  dir: 'up'
}, {
  cli: 'Construtora Sul',
  os: 8,
  rec: 'R$ 71.600',
  m: '33%',
  dir: 'up'
}, {
  cli: 'Agro Vale Verde',
  os: 7,
  rec: 'R$ 58.900',
  m: '31%',
  dir: 'up'
}, {
  cli: 'Essavado Ltda.',
  os: 5,
  rec: 'R$ 46.300',
  m: '16%',
  dir: 'down'
}];
const PG_ABC = [{
  k: 'Curva A',
  m: '4 clientes · 68% da receita',
  pct: 68
}, {
  k: 'Curva B',
  m: '7 clientes · 22% da receita',
  pct: 22
}, {
  k: 'Curva C',
  m: '11 clientes · 10% da receita',
  pct: 10
}];
const PG_FROTA = [{
  eq: 'Escavadeira CAT 320',
  ic: 'truck',
  pct: 81
}, {
  eq: 'Retro JCB 3CX',
  ic: 'tractor',
  pct: 72
}, {
  eq: 'Pá XCMG',
  ic: 'forklift',
  pct: 54
}, {
  eq: 'Basculante 01',
  ic: 'truck',
  pct: 38
}];
function PainelGerencial() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Painel Gerencial"), /*#__PURE__*/React.createElement(Pill, null, "2025 \xB7 acumulado"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar")), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Receita 2025",
    value: "R$ 512.400",
    mono: true,
    icon: "credit-card",
    trend: {
      dir: 'up',
      value: '14%'
    },
    foot: "vs. 2024",
    spark: [18, 17, 16, 14, 13, 11, 9, 5]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Resultado 2025",
    value: "R$ 189.300",
    mono: true,
    icon: "wallet",
    foot: "receita \u2212 custo",
    spark: [17, 16, 15, 13, 12, 10, 8, 6]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Margem m\xE9dia",
    value: "37%",
    icon: "trending-up",
    trend: {
      dir: 'up',
      value: '2 p.p.'
    },
    foot: "vs. 2024"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Horas faturadas",
    value: "2.140",
    unit: "h",
    mono: true,
    icon: "clock",
    foot: "47 OS no ano",
    spark: [19, 18, 17, 15, 13, 11, 9, 6]
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Resultado por m\xEAs",
    icon: "line-chart",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "R$ mil")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars"
  }, PG_MESES.map(([lbl, h], i) => /*#__PURE__*/React.createElement("div", {
    className: "rtg-barcol",
    key: lbl
  }, /*#__PURE__*/React.createElement("div", {
    className: i === PG_MESES.length - 1 ? 'rtg-bar hi' : 'rtg-bar',
    style: {
      height: h + '%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "rtg-barlbl"
  }, lbl)))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-bars-meta"
  }, /*#__PURE__*/React.createElement("span", null, "M\xE9dia ", /*#__PURE__*/React.createElement("b", null, "R$ 27.000"), "/m\xEAs"), /*#__PURE__*/React.createElement("span", null, "Pico ", /*#__PURE__*/React.createElement("b", null, "R$ 33.850"), " (jul)")))), /*#__PURE__*/React.createElement(Card, {
    title: "Top clientes \u2014 2025",
    icon: "users",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "22 ativos")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "OS"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Receita"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Margem"))), /*#__PURE__*/React.createElement("tbody", null, PG_TOP.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.cli
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "building-2",
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, r.cli))), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.os), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.rec), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: `atp-trend atp-trend--${r.dir}`,
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 13,
    style: r.dir === 'down' ? {
      transform: 'rotate(90deg)'
    } : undefined
  }), r.m))))))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Curva ABC de clientes",
    icon: "trending-up"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 18px 16px'
    }
  }, PG_ABC.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.k,
    style: {
      padding: '10px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px/1 var(--font-display)',
      color: 'var(--amarelo)',
      width: 60
    }
  }, c.k), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 12.5,
      color: 'var(--muted)'
    }
  }, c.m), /*#__PURE__*/React.createElement("span", {
    className: "rtg-val",
    style: {
      fontSize: 12.5
    }
  }, c.pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: 'var(--surface-2)',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: c.pct + '%',
      borderRadius: 3,
      background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))'
    }
  })))))), /*#__PURE__*/React.createElement(Card, {
    title: "Utiliza\xE7\xE3o da frota",
    icon: "truck",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "horas \xF7 dispon\xEDvel")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 18px 16px'
    }
  }, PG_FROTA.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.eq,
    style: {
      padding: '10px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: f.ic,
    tone: "amber",
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600
    }
  }, f.eq), /*#__PURE__*/React.createElement("span", {
    className: "rtg-val",
    style: {
      fontSize: 12.5
    }
  }, f.pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: 'var(--surface-2)',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: f.pct + '%',
      borderRadius: 3,
      background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))'
    }
  })))))), /*#__PURE__*/React.createElement(Note, {
    icon: "lock",
    tone: "steel"
  }, "Vis\xE3o restrita \xE0 gest\xE3o \u2014 consolida ", /*#__PURE__*/React.createElement("b", null, "OS"), ", ", /*#__PURE__*/React.createElement("b", null, "Faturamento"), ", ", /*#__PURE__*/React.createElement("b", null, "Financeiro"), " e ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), ". Meses fecham junto com a contabilidade."))));
}
window.PainelGerencial = PainelGerencial;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/PainelGerencial.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Parametros.jsx
try { (() => {
/* Retaguarda — Parâmetros (configurações operacionais, financeiras e de acesso). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  DataRow,
  StatusChip,
  Button,
  Pill,
  Note
} = NS;
function Parametros() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Par\xE2metros"), /*#__PURE__*/React.createElement(Pill, null, "v0.1 \xB7 funda\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "history"
  }, "Hist\xF3rico de altera\xE7\xF5es"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "pencil"
  }, "Editar par\xE2metros")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid",
    style: {
      gridTemplateColumns: '1fr 1fr',
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Empresa",
    icon: "building-2",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "building-2",
    label: "Raz\xE3o social"
  }, "Antonello Terraplanagem Ltda."), /*#__PURE__*/React.createElement(DataRow, {
    icon: "id-card",
    label: "CNPJ"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "04.887.210/0001-33")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "map-pin",
    label: "Sede"
  }, "Av. das M\xE1quinas, 1200 \u2014 Santo \xC2ngelo/RS"), /*#__PURE__*/React.createElement(DataRow, {
    icon: "phone",
    label: "Telefone"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "(55) 3313-4400"))), /*#__PURE__*/React.createElement(Card, {
    title: "Opera\xE7\xE3o",
    icon: "clipboard-list",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "clock",
    label: "Jornada padr\xE3o"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "8,0 h"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "por dia \xFAtil")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "gauge",
    label: "Toler\xE2ncia de hor\xEDmetro"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "\xB1 0,2 h"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "por apontamento")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "wrench",
    label: "Alerta de manuten\xE7\xE3o"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "50 h"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "antes do plano")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "fuel",
    label: "Diesel \u2014 tanque interno"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "R$ 5,84/L"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "atualizado 02/07"))), /*#__PURE__*/React.createElement(Card, {
    title: "Custo da Hora",
    icon: "calculator",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "history",
    label: "Deprecia\xE7\xE3o padr\xE3o"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "10% a.a."), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "sobre valor de mercado")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "hard-hat",
    label: "Custo do operador"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "R$ 62/h"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "encargos inclusos")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "trending-up",
    label: "Margem m\xEDnima"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "30%"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "alerta abaixo disso")))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Faturamento & financeiro",
    icon: "file-check",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "calendar",
    label: "Vencimento padr\xE3o"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "15 dias"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "ap\xF3s emiss\xE3o da NF")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "wallet",
    label: "Juros e multa"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "1% a.m. + 2%"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "t\xEDtulos vencidos")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "file-text",
    label: "S\xE9rie de NF"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "S\xE9rie 1"), " \xB7 ", /*#__PURE__*/React.createElement("small", null, "numera\xE7\xE3o autom\xE1tica")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "credit-card",
    label: "Recebimento padr\xE3o"
  }, "PIX \xB7 ", /*#__PURE__*/React.createElement("small", null, "chave CNPJ"))), /*#__PURE__*/React.createElement(Card, {
    title: "App de campo & acesso",
    icon: "smartphone",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "smartphone",
    label: "Apontamento via app"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "success",
    led: true
  }, "Ativado")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "check",
    label: "Aprova\xE7\xE3o de apontamentos"
  }, "Supervisor \xB7 ", /*#__PURE__*/React.createElement("small", null, "fecha o dia at\xE9 20h")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "lock",
    label: "Particionamento financeiro"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: "success",
    led: true
  }, "Ativado"))), /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Alterar par\xE2metros recalcula o ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " e a ", /*#__PURE__*/React.createElement("b", null, "Rentabilidade"), " a partir do m\xEAs vigente \u2014 meses fechados n\xE3o s\xE3o reprocessados."))));
}
window.Parametros = Parametros;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Parametros.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Placeholder.jsx
try { (() => {
/* Retaguarda — placeholder for modules not yet recreated in this UI kit. */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Icon
} = NS;
function Placeholder({
  icon,
  label
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle",
    style: {
      marginBottom: 16
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "rtg-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-empty-ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 26
  })), /*#__PURE__*/React.createElement("h2", null, "Em constru\xE7\xE3o"), /*#__PURE__*/React.createElement("p", null, "Este m\xF3dulo existe no sistema Retaguarda e est\xE1 em constru\xE7\xE3o neste UI kit.")));
}
window.Placeholder = Placeholder;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Placeholder.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/PrecosList.jsx
try { (() => {
/* Retaguarda — Preços (tabela de preços por equipamento/serviço). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  Button,
  Pill,
  Icon,
  Note
} = NS;
const PRC_ROWS = [{
  item: 'Escavadeira CAT 320',
  ic: 'truck',
  un: 'hora',
  preco: 'R$ 400',
  custo: 'R$ 232',
  margem: '42%',
  dir: 'up',
  atual: '01/07'
}, {
  item: 'Retroescavadeira JCB 3CX',
  ic: 'tractor',
  un: 'hora',
  preco: 'R$ 320',
  custo: 'R$ 178',
  margem: '44%',
  dir: 'up',
  atual: '01/07'
}, {
  item: 'Pá Carregadeira XCMG',
  ic: 'forklift',
  un: 'hora',
  preco: 'R$ 300',
  custo: 'R$ 195',
  margem: '35%',
  dir: 'up',
  atual: '01/07'
}, {
  item: 'Rolo compactador CA25',
  ic: 'tractor',
  un: 'hora',
  preco: 'R$ 260',
  custo: 'R$ 168',
  margem: '35%',
  dir: 'up',
  atual: '01/06'
}, {
  item: 'Caminhão basculante',
  ic: 'truck',
  un: 'hora',
  preco: 'R$ 220',
  custo: 'R$ 174',
  margem: '21%',
  dir: 'down',
  atual: '01/06'
}, {
  item: 'Mobilização — prancha',
  ic: 'truck',
  un: 'km',
  preco: 'R$ 8,50',
  custo: 'R$ 6,10',
  margem: '28%',
  dir: 'down',
  atual: '01/05'
}];
function PrecosList() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Pre\xE7os"), /*#__PURE__*/React.createElement(Pill, null, "tabela vigente \xB7 jul/2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "history"
  }, "Tabelas anteriores"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "pencil"
  }, "Editar pre\xE7os")), /*#__PURE__*/React.createElement(Card, {
    title: "Tabela de pre\xE7os",
    icon: "tag",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, PRC_ROWS.length, " itens")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Item"), /*#__PURE__*/React.createElement("th", null, "Unidade"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Pre\xE7o"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Custo ref."), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Margem"), /*#__PURE__*/React.createElement("th", null, "Atualizado"))), /*#__PURE__*/React.createElement("tbody", null, PRC_ROWS.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.item
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-eqcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atp-tile atp-tile--amber",
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.ic,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, r.item))), /*#__PURE__*/React.createElement("td", null, r.un), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.preco, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted-2)',
      fontWeight: 500
    }
  }, "/", r.un === 'km' ? 'km' : 'h')), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.custo), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: `atp-trend atp-trend--${r.dir}`,
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 13,
    style: r.dir === 'down' ? {
      transform: 'rotate(90deg)'
    } : undefined
  }), r.margem)), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.atual))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Note, {
    icon: "info"
  }, "Os pre\xE7os alimentam os ", /*#__PURE__*/React.createElement("b", null, "or\xE7amentos"), "; a margem \xE9 calculada contra o ", /*#__PURE__*/React.createElement("b", null, "Custo da Hora"), " vigente. Itens abaixo da margem m\xEDnima (30%, definida em Par\xE2metros) aparecem em laranja.")));
}
window.PrecosList = PrecosList;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/PrecosList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Rentabilidade.jsx
try { (() => {
/* Retaguarda — Rentabilidade (resultado por OS e por cliente). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  KpiCard,
  Card,
  StatusChip,
  Pill,
  IconTile,
  Icon,
  Note,
  Button
} = NS;
const RENT_OS = [{
  n: 'OS-012',
  cli: 'Construtora Vale Verde',
  rec: 'R$ 41.000',
  cus: 'R$ 24.100',
  res: 'R$ 16.900',
  m: '41%',
  dir: 'up',
  st: 'Concluída',
  tone: 'success'
}, {
  n: 'OS-015',
  cli: 'Metalúrgica Boa Vista',
  rec: 'R$ 19.800',
  cus: 'R$ 12.400',
  res: 'R$ 7.400',
  m: '37%',
  dir: 'up',
  st: 'Concluída',
  tone: 'success'
}, {
  n: 'OS-021',
  cli: 'Construtora Vale Verde',
  rec: 'R$ 24.800',
  cus: 'R$ 15.900',
  res: 'R$ 8.900',
  m: '36%',
  dir: 'up',
  st: 'Em andamento',
  tone: 'amber'
}, {
  n: 'OS-007',
  cli: 'Construtora Vale Verde',
  rec: 'R$ 12.500',
  cus: 'R$ 8.100',
  res: 'R$ 4.400',
  m: '35%',
  dir: 'up',
  st: 'Concluída',
  tone: 'success'
}, {
  n: 'OS-016',
  cli: 'Essavado Ltda.',
  rec: 'R$ 11.100',
  cus: 'R$ 9.300',
  res: 'R$ 1.800',
  m: '16%',
  dir: 'down',
  st: 'Concluída',
  tone: 'success'
}];
const RENT_CLI = [{
  cli: 'Construtora Vale Verde',
  v: '39%',
  pct: 89
}, {
  cli: 'Metalúrgica Boa Vista',
  v: '37%',
  pct: 84
}, {
  cli: 'Construtora Sul',
  v: '33%',
  pct: 75
}, {
  cli: 'Agro Vale Verde',
  v: '31%',
  pct: 70
}, {
  cli: 'Essavado Ltda.',
  v: '16%',
  pct: 36
}];
function Rentabilidade() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rtg-listhead"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "rtg-pagetitle"
  }, "Rentabilidade"), /*#__PURE__*/React.createElement(Pill, null, "julho/2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-up-right"
  }, "Exportar")), /*#__PURE__*/React.createElement("section", {
    className: "rtg-kpis",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Margem m\xE9dia",
    value: "38%",
    icon: "trending-up",
    trend: {
      dir: 'up',
      value: '3 p.p.'
    },
    foot: "vs. junho",
    spark: [14, 13, 14, 12, 11, 10, 9, 7]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Resultado no m\xEAs",
    value: "R$ 33.850",
    mono: true,
    icon: "wallet",
    foot: "receita \u2212 custo",
    spark: [16, 15, 14, 12, 11, 9, 8, 6]
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Receita",
    value: "R$ 86.200",
    mono: true,
    icon: "credit-card",
    trend: {
      dir: 'up',
      value: '11%'
    },
    foot: "vs. junho"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Custo total",
    value: "R$ 52.350",
    mono: true,
    warn: true,
    icon: "calculator",
    foot: "diesel + manuten\xE7\xE3o + folha"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Rentabilidade por OS",
    icon: "trending-up",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "5 no per\xEDodo")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-tablewrap rtg-tablewrap--wide"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rtg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "OS"), /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Receita"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Custo"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Resultado"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Margem"), /*#__PURE__*/React.createElement("th", {
    className: "r"
  }, "Situa\xE7\xE3o"))), /*#__PURE__*/React.createElement("tbody", null, RENT_OS.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.n
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rtg-ostag"
  }, r.n)), /*#__PURE__*/React.createElement("td", null, r.cli), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.rec), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.cus), /*#__PURE__*/React.createElement("td", {
    className: "r rtg-val"
  }, r.res), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: `atp-trend atp-trend--${r.dir}`,
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 13,
    style: r.dir === 'down' ? {
      transform: 'rotate(90deg)'
    } : undefined
  }), r.m)), /*#__PURE__*/React.createElement("td", {
    className: "r"
  }, /*#__PURE__*/React.createElement(StatusChip, {
    tone: r.tone,
    led: true
  }, r.st)))))))), /*#__PURE__*/React.createElement(Note, {
    icon: "lock",
    tone: "steel"
  }, "Valores vis\xEDveis apenas para perfis com acesso ao ", /*#__PURE__*/React.createElement("b", null, "particionamento financeiro"), " \u2014 operadores n\xE3o veem custos nem margens.")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Margem por cliente",
    icon: "users",
    headerRight: /*#__PURE__*/React.createElement(Pill, null, "per\xEDodo: 2025")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 18px 16px'
    }
  }, RENT_CLI.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.cli,
    style: {
      padding: '10px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(IconTile, {
    icon: "building-2",
    tone: "amber",
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600
    }
  }, c.cli), /*#__PURE__*/React.createElement("span", {
    className: "rtg-val",
    style: {
      fontSize: 12.5
    }
  }, c.v)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: 'var(--surface-2)',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: c.pct + '%',
      borderRadius: 3,
      background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))'
    }
  })))))))));
}
window.Rentabilidade = Rentabilidade;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Rentabilidade.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Sidebar.jsx
try { (() => {
/* Retaguarda — persistent sidebar (brand + grouped nav). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  NavItem,
  Hazard
} = NS;
const RTG_NAV = [{
  group: 'Operação',
  items: [['dashboard', 'dashboard', 'Dashboard'], ['os', 'clipboard-list', 'Ordens de Serviço'], ['comprovantes', 'receipt', 'Comprovantes']]
}, {
  group: 'Cadastros',
  items: [['equipamentos', 'truck', 'Equipamentos', 14], ['operadores', 'hard-hat', 'Operadores', 38], ['clientes', 'users', 'Clientes', 22]]
}, {
  group: 'Comercial',
  items: [['precos', 'tag', 'Preços'], ['orcamentos', 'file-text', 'Orçamentos']]
}, {
  group: 'Financeiro',
  items: [['faturamento', 'file-check', 'Faturamento'], ['financeiro', 'wallet', 'Financeiro'], ['custohora', 'calculator', 'Custo da Hora'], ['rentabilidade', 'trending-up', 'Rentabilidade'], ['painel', 'line-chart', 'Painel Gerencial']]
}, {
  group: 'Frota',
  items: [['manutencao', 'wrench', 'Manutenção'], ['diesel', 'fuel', 'Diesel']]
}, {
  group: 'Sistema',
  items: [['parametros', 'sliders', 'Parâmetros'], ['sobre', 'info', 'Sobre']]
}];
function Sidebar({
  module,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "rtg-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-brand-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-logo"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#16140f",
    strokeWidth: "2.1",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 20h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 20v-4h4v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m10 16 3-7 5 4v3"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-brand-name"
  }, "ANTONELLO", /*#__PURE__*/React.createElement("small", null, "TERRAPLANAGEM"))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hazard"
  }, /*#__PURE__*/React.createElement(Hazard, null))), /*#__PURE__*/React.createElement("nav", {
    className: "rtg-nav"
  }, RTG_NAV.map(g => /*#__PURE__*/React.createElement("div", {
    className: "rtg-group",
    key: g.group
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, g.group), g.items.map(([id, icon, label, count]) => /*#__PURE__*/React.createElement(NavItem, {
    key: id,
    icon: icon,
    count: count,
    active: module === id,
    onClick: () => onNavigate(id)
  }, label))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-foot"
  }, "v0.1 \xB7 funda\xE7\xE3o"));
}
window.Sidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/Sobre.jsx
try { (() => {
/* Retaguarda — Sobre (o sistema, os produtos e a migração do legado). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const {
  Card,
  DataRow,
  Badge,
  Chip,
  Note,
  Icon
} = NS;
const SOBRE_MODULOS = [['dashboard', 'Dashboard'], ['clipboard-list', 'Ordens de Serviço'], ['receipt', 'Comprovantes'], ['truck', 'Equipamentos'], ['hard-hat', 'Operadores'], ['users', 'Clientes'], ['tag', 'Preços'], ['file-text', 'Orçamentos'], ['file-check', 'Faturamento'], ['wallet', 'Financeiro'], ['calculator', 'Custo da Hora'], ['trending-up', 'Rentabilidade'], ['wrench', 'Manutenção'], ['fuel', 'Diesel']];
function Sobre() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "rtg-hero"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 78,
      height: 78,
      borderRadius: 18,
      background: 'var(--amarelo)',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      boxShadow: 'var(--shadow-amarelo)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "44",
    height: "44",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#16140f",
    strokeWidth: "2.1",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 20h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 20v-4h4v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m10 16 3-7 5 4v3"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-main"
  }, /*#__PURE__*/React.createElement("h1", null, "Antonello Terraplanagem"), /*#__PURE__*/React.createElement("div", {
    className: "rtg-hero-sub"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "gold",
    led: true
  }, "v0.1 \xB7 funda\xE7\xE3o"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    icon: "dashboard"
  }, "Retaguarda"), /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    icon: "smartphone"
  }, "App de campo")), /*#__PURE__*/React.createElement("div", {
    className: "rtg-qf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Desenvolvido por"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "AILA \u2014 Intelig\xEAncia Aplicada")), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\xDAltima atualiza\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "08/07/2025")), /*#__PURE__*/React.createElement("div", {
    className: "qf"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Ambiente"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Produ\xE7\xE3o"))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "O sistema",
    icon: "info",
    padded: true
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      lineHeight: 1.6,
      color: 'var(--muted)'
    }
  }, "Sistema de gest\xE3o da opera\xE7\xE3o de terraplenagem: ordens de servi\xE7o, apontamentos por hor\xEDmetro, frota, diesel, faturamento e custo da hora \u2014 do or\xE7amento ao recebimento. A ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg)'
    }
  }, "Retaguarda"), " concentra a gest\xE3o no escrit\xF3rio; o", ' ', /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg)'
    }
  }, "App de campo"), " (Android) registra os apontamentos dos operadores direto da m\xE1quina.")), /*#__PURE__*/React.createElement(Card, {
    title: "M\xF3dulos",
    icon: "dashboard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rtg-chips"
  }, SOBRE_MODULOS.map(([ic, nome]) => /*#__PURE__*/React.createElement(Chip, {
    key: nome,
    icon: ic
  }, nome))))), /*#__PURE__*/React.createElement("div", {
    className: "rtg-stack"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Instala\xE7\xE3o",
    icon: "contact",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "badge-check",
    label: "Licenciado para"
  }, "Antonello Terraplanagem Ltda."), /*#__PURE__*/React.createElement(DataRow, {
    icon: "calendar",
    label: "Em opera\xE7\xE3o desde"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "jun/2024")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "hard-hat",
    label: "Usu\xE1rios"
  }, "6 na retaguarda \xB7 ", /*#__PURE__*/React.createElement("small", null, "38 no app de campo")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "mail",
    label: "Suporte"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "suporte@ailainteligente.com"))), /*#__PURE__*/React.createElement(Card, {
    title: "Legado",
    icon: "database",
    padded: true
  }, /*#__PURE__*/React.createElement(DataRow, {
    icon: "database",
    label: "ERP anterior"
  }, "Farolti \xB7 ", /*#__PURE__*/React.createElement("small", null, "at\xE9 jun/2024")), /*#__PURE__*/React.createElement(DataRow, {
    icon: "archive",
    label: "Snapshot"
  }, "Importado \xB7 congelado")), /*#__PURE__*/React.createElement(Note, {
    icon: "info",
    tone: "steel"
  }, "O hist\xF3rico do ", /*#__PURE__*/React.createElement("b", null, "ERP Farolti"), " foi importado como snapshot no cadastro de cada cliente e n\xE3o \xE9 recalculado ao vivo \u2014 a atividade desde jun/2024 \xE9 calculada pelo sistema."))));
}
window.Sobre = Sobre;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/Sobre.jsx", error: String((e && e.message) || e) }); }

// ui_kits/retaguarda/data.js
try { (() => {
/* Retaguarda — demo data (fictional). Assigned to window.RTG. */
window.RTG = {
  /* OS aberta em destaque (usada pela entrada screen-os-detalhe.html) */
  osDetalhe: {
    n: 'OS-021',
    t: 'Terraplenagem — lote industrial',
    cli: 'Construtora Vale Verde',
    op: 'Adelar Machado',
    eq: 'Escavadeira CAT 320',
    eqIcon: 'truck',
    h: '62 h',
    per: 'desde 01/07',
    v: 'R$ 24.800',
    st: 'Em andamento',
    tone: 'amber'
  },
  /* Orçamento em destaque (usado por screen-orcamento-detalhe.html) */
  orcDetalhe: {
    n: 'ORC-055',
    t: 'Terraplenagem — fase 2',
    cli: 'Construtora Vale Verde',
    data: '02/07',
    val: '01/08',
    v: 'R$ 58.000',
    st: 'Aberto',
    tone: 'info'
  },
  clientes: [{
    id: 'valeverde',
    nome: 'Construtora Vale Verde',
    fantasia: 'Vale Verde',
    tipo: 'PJ',
    recorrente: true,
    ativo: true,
    segmento: 'Construção civil',
    doc: '12.345.678/0001-90',
    telefone: '(55) 3312-8800',
    email: 'financeiro@valeverde.com.br',
    endereco: 'Rua das Indústrias, 480 — Santo Ângelo/RS',
    contato: 'Marcos Feltrin',
    contatoArea: 'Compras',
    desde: 'mar/2022 · 3 anos',
    ultimaOS: '08/07/2025',
    faturado: 'R$ 148.500',
    saldo: 'R$ 32.400',
    osAtivas: 2,
    orcAbertos: 3
  }, {
    id: 'essavado',
    nome: 'Essavado Ltda.',
    tipo: 'PJ',
    ativo: true,
    segmento: 'Terraplenagem',
    doc: '08.221.114/0001-52',
    telefone: '(55) 3321-7744',
    cidade: 'Guarani das Missões/RS',
    osAtivas: 1,
    saldo: 'R$ 12.800'
  }, {
    id: 'sul',
    nome: 'Construtora Sul',
    tipo: 'PJ',
    ativo: true,
    segmento: 'Construção civil',
    doc: '19.552.803/0001-10',
    telefone: '(55) 3025-1180',
    cidade: 'Santa Rosa/RS',
    osAtivas: 1,
    saldo: 'R$ 0'
  }, {
    id: 'agrovv',
    nome: 'Agro Vale Verde',
    tipo: 'PJ',
    ativo: true,
    segmento: 'Agronegócio',
    doc: '27.104.559/0001-73',
    telefone: '(55) 99640-2210',
    cidade: 'Giruá/RS',
    osAtivas: 1,
    saldo: 'R$ 4.100'
  }, {
    id: 'boavista',
    nome: 'Metalúrgica Boa Vista',
    tipo: 'PJ',
    ativo: true,
    segmento: 'Indústria',
    doc: '11.870.442/0001-06',
    telefone: '(55) 3512-9090',
    cidade: 'Santo Ângelo/RS',
    osAtivas: 0,
    saldo: 'R$ 0'
  }, {
    id: 'beletti',
    nome: 'João Beletti',
    tipo: 'PF',
    ativo: false,
    segmento: 'Particular',
    doc: '702.114.330-55',
    telefone: '(55) 99988-1201',
    cidade: 'Ubiretama/RS',
    osAtivas: 0,
    saldo: 'R$ 0'
  }],
  operadores: [{
    id: 'adelar',
    nome: 'Adelar Machado',
    iniciais: 'AM',
    ativo: true,
    app: true,
    vinculo: 'CLT',
    doc: '044.428.710-86',
    telefone: '(55) 99912-3040',
    desde: 'mar/2021 · 4 anos',
    ultimaAtividade: 'Hoje, 07:42',
    nascimento: '14/09/1985 · 39 anos',
    cnh: 'Categoria E · válida até 03/2028',
    base: 'Santo Ângelo — RS',
    horas: '182',
    osAtivas: 3,
    osConcluidas: 17,
    equipamentos: 4
  }, {
    id: 'vilson',
    nome: 'Vilson Prediger',
    iniciais: 'VP',
    ativo: true,
    app: true,
    vinculo: 'CLT',
    doc: '551.209.880-44',
    telefone: '(55) 99671-8890',
    base: 'Santo Ângelo — RS',
    horas: '164',
    osAtivas: 2
  }, {
    id: 'nelson',
    nome: 'Nelson Kunz',
    iniciais: 'NK',
    ativo: true,
    app: true,
    vinculo: 'CLT',
    doc: '318.774.560-19',
    telefone: '(55) 99815-4402',
    base: 'Giruá — RS',
    horas: '151',
    osAtivas: 2
  }, {
    id: 'ivo',
    nome: 'Ivo Scherer',
    iniciais: 'IS',
    ativo: true,
    app: false,
    vinculo: 'PJ',
    doc: '22.905.118/0001-30',
    telefone: '(55) 99404-7781',
    base: 'Santa Rosa — RS',
    horas: '96',
    osAtivas: 1
  }, {
    id: 'darci',
    nome: 'Darci Bregalda',
    iniciais: 'DB',
    ativo: false,
    app: false,
    vinculo: 'CLT',
    doc: '609.330.221-70',
    telefone: '(55) 99120-6655',
    base: 'Santo Ângelo — RS',
    horas: '0',
    osAtivas: 0
  }],
  /* Modules without a built screen yet (shown as a labelled placeholder). */
  placeholders: {
    dashboard: {
      icon: 'dashboard',
      label: 'Dashboard'
    },
    os: {
      icon: 'clipboard-list',
      label: 'Ordens de Serviço'
    },
    comprovantes: {
      icon: 'receipt',
      label: 'Comprovantes'
    },
    equipamentos: {
      icon: 'truck',
      label: 'Equipamentos'
    },
    precos: {
      icon: 'tag',
      label: 'Preços'
    },
    orcamentos: {
      icon: 'file-text',
      label: 'Orçamentos'
    },
    faturamento: {
      icon: 'file-check',
      label: 'Faturamento'
    },
    financeiro: {
      icon: 'wallet',
      label: 'Financeiro'
    },
    custohora: {
      icon: 'calculator',
      label: 'Custo da Hora'
    },
    rentabilidade: {
      icon: 'trending-up',
      label: 'Rentabilidade'
    },
    painel: {
      icon: 'line-chart',
      label: 'Painel Gerencial'
    },
    manutencao: {
      icon: 'wrench',
      label: 'Manutenção'
    },
    diesel: {
      icon: 'fuel',
      label: 'Diesel'
    }
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/retaguarda/data.js", error: String((e && e.message) || e) }); }

// ui_kits/site/image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever a design needs an image.
 * You control the slot's shape; it sizes to its container by default. When the search_stock_photos tool
 * is available, prefill the slot by default — write the photo's URL into
 * src (with credit/credit-href); the user can still fill or replace it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The sidecar is a SIBLING of the HTML file that uses this component: the
 * read is a document-relative fetch, and the host resolves the bridge's
 * sidecar writes into the previewed file's directory to match (same
 * contract as design_canvas.jsx). Pages in the same directory share one
 * sidecar; keep slot ids distinct across them.
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          Initial framing baseline: cover | contain.   (default 'cover')
 *                cover starts the image filling the frame (overflow cropped);
 *                contain starts it fully visible (letterboxed). Either way the
 *                user can always pan/scale from there — double-click, or the
 *                Edit control, enters reframe mode (drag to move, scroll or
 *                corner-handles to scale; Escape / click-out commits). The
 *                crop persists alongside the image in the sidecar.
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. Prefill it with a real
 *                photo via search_stock_photos when that tool is available
 *                (set credit/credit-href from the result). A user drop
 *                overrides it; clearing the drop reveals src again.
 *   credit       Attribution text shown as a small overlay at the
 *                bottom-left of the filled slot. REQUIRED whenever src
 *                points at any Unsplash host (images.unsplash.com,
 *                plus.unsplash.com, …): an Unsplash src with no credit
 *                renders an error tile INSTEAD of the photo (Unsplash
 *                terms forbid showing their photos unattributed). Use the
 *                exact form 'Photo by {photographer name} on Unsplash' —
 *                the overlay then links the name to credit-href and
 *                'Unsplash' to the Unsplash homepage, and links back to
 *                unsplash.com automatically get the required utm referral
 *                params appended at render time. The credit belongs to
 *                the src image, so it only shows while src is what's
 *                displayed — a user-dropped image hides it.
 *   credit-href  Link for the photographer's name in the credit overlay
 *                (their Unsplash profile URL from the stock-photo search
 *                results). http(s) URLs only — anything else renders the
 *                name as plain text.
 *
 * Sizing: the slot fills its container by default (width/height 100%).
 * Put it in a sized wrapper — absolutely positioned, a grid cell, a fixed
 * frame — and it takes exactly that box. When the parent's height is
 * indefinite (ordinary flow), it falls back to full width at a 3:2 aspect
 * ratio instead of collapsing. In a shrink-to-fit parent (a float,
 * width:max-content, an unsized absolute wrapper), percentages have
 * nothing to resolve against — size the slot or its wrapper explicitly
 * there. For a fixed-size slot, set
 * width/height on the element itself (inline style), which overrides the
 * default. When
 * layering content above a slot (full-bleed layouts), make the overlay
 * click-through — pointer-events: none on scrims/text plates, re-enabled
 * on interactive children — so the slot's hover controls stay reachable.
 * Keep the slot's bottom-left corner visually clear as well: the credit
 * overlay renders there, and a dark fade or text plate covering it hides
 * the attribution Unsplash's terms require — end the fade above that
 * corner, or keep it nearly transparent where the credit sits.
 *
 * Usage:
 *   <div style="position:relative;width:100%;height:100%">      <!-- full-bleed: -->
 *     <image-slot id="bg" shape="rect"></image-slot>            <!-- fills the wrapper -->
 *   </div>
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';

  // Unsplash terms require visible attribution wherever their photos
  // display, and every link back to unsplash.com must carry utm referral
  // params. Two render-time rules enforce that here:
  //  - an Unsplash-src slot with NO credit attribute renders an error
  //    tile INSTEAD of the photo (an uncredited Unsplash photo on screen
  //    is itself the terms violation, so it never renders bare);
  //  - rendered credit links pointing at unsplash.com get the referral
  //    params appended when absent (credit-href values live in page
  //    content that can't be edited after the fact).
  // Keep the utm_source value in sync with UTM_SOURCE in
  // platform/web-agent/unsplash.ts — this file is a project-local
  // artifact and cannot import it (equality is pinned by tests).
  const UNSPLASH_HOMEPAGE_HREF = 'https://unsplash.com/?utm_source=claude_design&utm_medium=referral';
  // Host rule mirrors the hotlink validator that admits Unsplash srcs into
  // pages in the first place (cdn$ in unsplash.ts: apex or any subdomain)
  // — Unsplash+ results serve from plus.unsplash.com, not just images.*,
  // and an admitted-but-uncredited photo must error whatever unsplash
  // host it rides on.
  // Trailing-dot FQDNs (images.unsplash.com.) are the same host to the
  // browser but would miss the regex — strip one dot so the check fails
  // CLOSED (unrecognized-but-real Unsplash srcs must error, not render).
  const isUnsplashHost = u => {
    try {
      return /(^|\.)unsplash\.com$/.test(new URL(u, document.baseURI).hostname.replace(/\.$/, ''));
    } catch {
      return false;
    }
  };
  // Render-time referral normalization for links back to Unsplash:
  // appends utm_source/utm_medium when absent, preserves every existing
  // query param, never overwrites an existing utm_source, and passes
  // non-Unsplash URLs through untouched. Input is an ABSOLUTE validated
  // http(s) URL (the credit render funnel resolves + validates first).
  const withReferral = href => {
    try {
      const u = new URL(href);
      if (!/(^|\.)unsplash\.com$/.test(u.hostname.replace(/\.$/, ''))) {
        return href;
      }
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source', 'claude_design');
      }
      if (!u.searchParams.has('utm_medium')) {
        u.searchParams.set('utm_medium', 'referral');
      }
      return u.toString();
    } catch (e) {
      return href;
    }
  };
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  // Unload-time flush: save()'s serialization defers a mid-RTT re-fire to a
  // .then that never runs in an unloading document, silently dropping a
  // pagehide commit. Post the current slots immediately instead — content
  // is a superset snapshot of any in-flight save's, the write is a
  // whole-file last-writer-wins replace, and postMessage FIFO delivers it
  // to the host after the in-flight one, so a backend-side reorder at
  // worst reproduces the dropped-commit outcome this flush improves on.
  // Guarded on the initial sidecar read: pre-hydration slots can miss
  // other slots' persisted entries, and flushing it would clobber them —
  // that narrow case stays best-effort (the in-memory merge in load()
  // cannot happen in an unloading document anyway).
  function flushNow() {
    if (!loaded) return;
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    try {
      Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {});
    } catch (e) {}
  }
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet =
  // Fill the container by default: slots are usually placed inside a
  // sized wrapper (a hero frame, a grid cell, an inset:0 layer) and are
  // expected to take that box — a fixed intrinsic size would render as
  // a small tile in the corner of a full-bleed wrapper instead.
  // aspect-ratio is the companion fallback that keeps a bare slot
  // visible when the parent's height is indefinite: height:100%
  // resolves to auto there, and the ratio then derives height from
  // width instead of letting the slot collapse to zero height.
  // Explicit width/height on the element override all of this.
  ':host{display:block;position:relative;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);' + '  width:100%;height:100%;aspect-ratio:3/2}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  // popover=manual promotes the spill to the top layer on reframe, so it is
  // not clipped by any overflow:hidden / clip-path / scroll-container
  // ancestor (a plain z-index can't escape overflow clipping). UA popover
  // defaults (inset:0;margin:auto) are reset; _applyView sets viewport px.
  '.spill{position:fixed;margin:0;inset:auto;border:0;padding:0;background:transparent;' + '  overflow:visible;transform:translate(-50%,-50%);z-index:1;cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls overlay INSIDE the frame, pinned to the top-right corner, so
  // a full-bleed slot in an overflow:hidden container still shows them
  // (the old below-mask placement got clipped). Credit sits bottom-left,
  // so top-right avoids collision. The blurred pill background keeps them
  // legible over the image.
  // The UA [popover] base rule styles the element in EVERY state (only
  // display:none is gated on :not(:popover-open), and the display:flex
  // below overrides that) — so the UA resets live HERE, like .spill's,
  // or the ordinary hover-state strip renders as a bordered Canvas box
  // centered by margin:auto. inset:auto precedes top/right (shorthand).
  '.ctl{position:absolute;inset:auto;top:8px;right:8px;margin:0;border:0;padding:0;' + '  background:transparent;overflow:visible;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' +
  // While reframing, the spill owns the top layer and would swallow every
  // click on the in-frame controls. Promoting .ctl into the top layer
  // ABOVE the spill (shown after it — later popovers stack higher) keeps
  // Edit-as-toggle and Replace clickable mid-reframe. _applyView pins it
  // to the frame's top-right in viewport px (translateX(-100%)
  // right-aligns against the computed left edge); inset:auto clears the
  // base rule's top/right so the inline left/top position it alone.
  '.ctl:popover-open{position:fixed;inset:auto;transform:translateX(-100%)}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}' +
  // Replacement in flight: after a src swap the browser keeps painting
  // the PREVIOUS image until the new one decodes, so a Replace would
  // flash the old photo and then pop. Hide the stale frame (visibility,
  // not display — _applyView geometry still applies) and spin until the
  // new image reports in (load/error clears data-swapping).
  ':host([data-swapping]) .frame img{visibility:hidden}' + '.loading{position:absolute;inset:0;display:none;align-items:center;' + '  justify-content:center;pointer-events:none}' + ':host([data-swapping]) .loading{display:flex}' + '.loading::after{content:"";width:22px;height:22px;border-radius:50%;' + '  border:2px solid rgba(0,0,0,.12);border-top-color:rgba(0,0,0,.45);' + '  animation:om-slot-spin .7s linear infinite}' + '@keyframes om-slot-spin{to{transform:rotate(360deg)}}' +
  // Reduced motion: the static two-tone ring still reads as "working".
  '@media (prefers-reduced-motion:reduce){.loading::after{animation:none}}' + '.credit{position:absolute;left:6px;bottom:6px;max-width:calc(100% - 12px);display:none;' + '  padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.55);color:#fff;' + '  font:10px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;' + '  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(6px)}' +
  // The credit is a SPAN holding one or two <a>s (Unsplash's prescribed
  // form links the photographer AND Unsplash) — anchors style inline so
  // the overlay reads as one line of text.
  '.credit a{color:inherit;text-decoration:none}' + '.credit a:hover,.credit a:focus-visible{text-decoration:underline}' + ':host([data-filled][data-credit]) .credit{display:block}' +
  // Exports must ship JUST the image — no hover controls, no credit chip
  // (the host marks <html data-om-exporting> for the capture window; the
  // page-level hide script can't reach shadow DOM, this rule can).
  ':host-context([data-om-exporting]) .ctl,' + ':host-context([data-om-exporting]) .credit{display:none !important}' +
  // No export-window mask rules here on purpose: the export capture
  // releases the replacement mask by REMOVING data-swapping (the
  // shadow-root pass in pages/export/shared.ts HIDE_EXPORT_CHROME_SCRIPT)
  // — attribute removal works in every engine (:host-context is
  // Chromium-only), is scoped by construction to slots actually
  // mid-swap, and hides the spinner through the same gate. A masked img
  // would otherwise be silently dropped from PPTX decks (the capture
  // walk skips visibility:hidden imgs).
  // Attribution error tile: REPLACES the photo when an Unsplash src has
  // no credit attribute — rendering the photo uncredited is the terms
  // violation, so the photo must not appear at all.
  // Calm and neutral on purpose (review feedback): the tile informs the
  // user; the fix instructions are machine-facing (usage docblock, tool
  // description, and the turn-end scan's bounce copy name the attributes
  // for the agent).
  '.attr-error{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  background:#f2f1ef;color:#6e6c66;user-select:none;' + '  font:13px/1.45 system-ui,-apple-system,sans-serif}' + '.attr-error svg{opacity:.55}' + '.attr-error .cap{max-width:92%;font-weight:500;letter-spacing:.01em}' + ':host([data-attribution-error]) .attr-error{display:flex}' + ':host([data-attribution-error]) .ring{display:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  const warnIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' + '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'placeholder', 'src', 'id', 'credit', 'credit-href'];
    }

    /** Duplicate-slide hook (called by deck-stage, see its
     *  _remintDuplicateIds): copy this id's stored image, if any, under a
     *  freshly minted key and return that key — so a duplicated slide's
     *  slot keeps its dropped photo instead of reverting to the
     *  placeholder. 'isFree' is the caller's uniqueness check (document
     *  ids); candidates must ALSO be unused in the sidecar, which can
     *  hold keys from other pages sharing the project root. (An EMPTY
     *  slot on another page leaves no sidecar entry, so its id is not
     *  detectable here — a minted key can collide with it and that slot
     *  would show this photo. Same blast radius as two pages reusing an
     *  id by hand, which the shared sidecar already permits.) Returns null
     *  when no id could be minted (caller strips the id, today's
     *  behavior). */
    static cloneSlot(fromId, isFree) {
      if (typeof fromId !== 'string' || !fromId) return null;
      // Pre-hydration the store can't veto candidates or source the copy
      // — degrade to the strip (today's behavior) rather than mint
      // against keys we can't see yet. Any rendered (= droppable) slot
      // means load() has already settled.
      if (!loaded) return null;
      const stem = fromId.replace(/-\d+$/, '') || fromId;
      for (let n = 2; n < 100; n++) {
        const toId = stem + '-' + n;
        if (toId === fromId) continue;
        if (slots[toId] !== undefined) {
          // Reuse a key holding this exact value (bytes AND crop) if no
          // live element here owns it — a duplicate op the host refused
          // after minting leaves such a key behind, and reusing keeps
          // refused retries from accumulating one orphaned copy per
          // attempt. Full equality (not just bytes) so a byte-identical
          // key another PAGE owns with its own crop is stepped past, not
          // adopted or rewritten. (Entries without .u never match.)
          const prev = getSlot(toId);
          const cur = getSlot(fromId);
          if (!(prev && cur && prev.u && prev.u === cur.u && prev.s === cur.s && prev.x === cur.x && prev.y === cur.y && (typeof isFree !== 'function' || isFree(toId)))) continue;
          return toId;
        }
        if (typeof isFree === 'function' && !isFree(toId)) continue;
        const v = getSlot(fromId);
        if (v) setSlot(toId, Object.assign({}, v));
        return toId;
      }
      return null;
    }
    constructor() {
      super();
      // clonable: rail thumbnails deep-clone slides and carry this shadow
      // along; reuse an already-cloned root so upgrade-after-clone works.
      // (Deliberately NOT serializable — a getHTML consumer would embed
      // multi-MB sidecar data-URLs into serialized page HTML.)
      const root = this.shadowRoot || this.attachShadow({
        mode: 'open',
        clonable: true
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="attr-error" part="attribution-error">' + warnIcon + '    <div class="cap">This photo needs attribution</div></div>' + '  <div class="loading" part="loading"></div>' + '  <div class="ring" part="ring"></div>' + '</div>' +
      // Outside .frame, like .spill/.ctl — the frame's overflow:hidden +
      // border-radius/clip-path would cut the credit off on circle/pill/mask.
      // A SPAN, not an <a>: the prescribed Unsplash credit holds two links
      // (photographer + Unsplash), built per-render in _render().
      '<span class="credit" part="credit"></span>' + '<div class="spill" popover="manual" data-dc-edit-transparent>' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' +
      // data-dc-edit-transparent: the DC editor's edit-mode picker lets
      // clicks through for chrome marked with it (EDIT_TRANSPARENT_SEL)
      // — without it, Replace/Edit clicks in Edit mode are swallowed by
      // element selection and the controls look dead.
      '<div class="ctl" popover="manual" data-dc-edit-transparent><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="edit" title="Reframe image">Edit</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ctl = root.querySelector('.ctl');
      this._credit = root.querySelector('.credit');
      this._attrError = root.querySelector('.attr-error');
      // Credit clicks open the link, not browse/reframe.
      this._credit.addEventListener('click', e => e.stopPropagation());
      this._credit.addEventListener('dblclick', e => e.stopPropagation());
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      // Encode-in-flight marker (the owning _ingest generation): while set,
      // the same-src "nothing in flight" clear in _render must not fire —
      // the stored value still points at the OLD image until the encode
      // lands, so that clear would unmask the stale image mid-replace.
      this._swapGen = 0;
      // Render-owned swap in flight: set when _render assigns a new src,
      // cleared only by the img's own load/error (or the empty branch).
      // img.complete CANNOT stand in for this — setting src only QUEUES
      // the current-request swap (a microtask), so synchronously after an
      // assignment, complete still reports the OLD settled request. The
      // pick path does exactly that: the host sets src, credit, and
      // credit-href back-to-back in one task, and renders #2/#3 would
      // read the stale complete === true and drop the mask one render
      // after it was set.
      this._loadPending = false;
      // See _render's empty branch: a transient attribution-error wipe of a
      // showing image must make the follow-up render a replacement (spinner),
      // not a first fill (blank frame).
      this._hidShowing = false;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        // The hidden controls are opacity-0 but still tabbable — without
        // this gate a keyboard user could drive them on a read-only share
        // link (mirrors the dblclick handler's editable gate).
        if (!this.hasAttribute('data-editable')) return;
        if (act === 'replace') {
          this._exitReframe(true);
          // Host-owned picker (Unsplash modal; it also offers local import).
          this.dispatchEvent(new CustomEvent('image-slot:pick', {
            bubbles: true,
            composed: true,
            detail: {
              id: this.id || null
            }
          }));
        }
        if (act === 'edit') {
          if (!this._reframes()) return;
          if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      // load/error also release the replacement-in-flight mask (via the
      // single discipline in _releaseMask): the swap is only revealed once
      // the new image can actually paint (on error the frame shows its
      // background, same as a fresh slot with a broken src).
      this._img.addEventListener('load', () => {
        this._loadPending = false;
        this._releaseMask(true);
        this._applyView();
      });
      this._img.addEventListener('error', () => {
        this._loadPending = false;
        this._releaseMask(true);
      });
      // Gated only on editable — any filled slot can be repositioned/scaled,
      // regardless of fit. Share links (no writeFile) stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
          const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // The host may inject window.omelette.writeFile AFTER the first render;
      // re-render on hover so the editable-gated controls reliably appear.
      this.addEventListener('pointerenter', this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('pointerenter', this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      // commit=false: a disconnect is not a user intent — committing here
      // would persist whatever half-finished drag a React remount or DOM
      // splice happened to interrupt. Deliberate exits commit on their own
      // paths (Escape/click-out/toggle), and unloads commit via pagehide.
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._signalReframe(true);
      // Best-effort commit when the document unloads mid-reframe (a host
      // navigation racing the enter signal, a manual reload, tab close):
      // the sidecar write rides the host bridge, which outlives this
      // document, so the crop survives even though the mode dies with the
      // DOM. Held on the instance so _exitReframe detaches exactly what
      // was attached.
      this._pagehide = () => {
        this._exitReframe(true);
        flushNow();
      };
      window.addEventListener('pagehide', this._pagehide);
      // Promote spill to the top layer, then keep it pinned over the frame:
      // scroll/resize cover the common cases, and a per-frame rect check
      // catches layout shifts that fire neither (an image above finishing
      // load, streamed DOM pushing the slot down, an ancestor transform
      // change) so the overlay can't detach from the frame.
      try {
        this._spill.showPopover();
      } catch {}
      // After the spill, so the controls stack above it in the top layer.
      try {
        this._ctl.showPopover();
      } catch {}
      this._reposition = () => {
        if (this.hasAttribute('data-reframe')) this._applyView();
      };
      window.addEventListener('scroll', this._reposition, true);
      window.addEventListener('resize', this._reposition);
      this._lastRect = '';
      this._watch = () => {
        if (!this.hasAttribute('data-reframe')) return;
        const r = this.getBoundingClientRect();
        const key = r.left + ',' + r.top + ',' + r.width + ',' + r.height;
        if (key !== this._lastRect) {
          this._lastRect = key;
          this._applyView();
        }
        this._watchId = requestAnimationFrame(this._watch);
      };
      this._watchId = requestAnimationFrame(this._watch);
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (this._reposition) {
        window.removeEventListener('scroll', this._reposition, true);
        window.removeEventListener('resize', this._reposition);
        this._reposition = null;
      }
      if (this._watchId) {
        cancelAnimationFrame(this._watchId);
        this._watchId = 0;
      }
      if (this._pagehide) {
        window.removeEventListener('pagehide', this._pagehide);
        this._pagehide = null;
      }
      try {
        this._spill.hidePopover();
      } catch {}
      try {
        this._ctl.hidePopover();
      } catch {}
      this._ctl.style.left = '';
      this._ctl.style.top = '';
      if (commit) this._commitView();
      this._signalReframe(false);
    }

    // Reframe state lives only in this DOM until commit, invisible to the
    // host's dirty signals — announce enter/exit so the host can hold
    // auto-reloads for exactly the gesture (the guest bundle forwards
    // image-slot:reframe to the host as imageSlotReframe). Dispatched on
    // the element (composed, so it escapes shadow roots) while connected;
    // a disconnected exit (disconnectedCallback) falls back to document so
    // the host still hears it.
    _signalReframe(active) {
      const target = this.isConnected ? this : document;
      target.dispatchEvent(new CustomEvent('image-slot:reframe', {
        bubbles: true,
        composed: true,
        detail: {
          active: active,
          id: this.id || null
        }
      }));
    }

    // Public: host's "Import from computer" calls this to run local browse.
    openFilePicker() {
      this._exitReframe(true);
      this._input.click();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      // Replacing a shown image: surface the swap through the encode too,
      // not just the decode — otherwise the old photo sits there with no
      // feedback while the canvas re-encode runs. An empty slot keeps its
      // placeholder (no spinner) until the encode lands, as before.
      // _swapGen guards the mask against re-renders DURING the encode
      // (pointerenter, ResizeObserver, another slot's store write): the
      // stored value still resolves to the old image there, so _render's
      // same-src clear would otherwise unmask it mid-replace.
      if (this.hasAttribute('data-filled')) {
        this.setAttribute('data-swapping', '');
        this._swapGen = gen;
      }
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        // Clear BEFORE setSlot: its synchronous re-render must see no
        // pending encode, so a byte-identical re-upload (same data URL, no
        // load event coming) still clears the mask via the complete branch.
        this._swapGen = 0;
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._swapGen = 0;
        // Reveal the kept old image — unless another replacement (a
        // remote pick's src swap) is still in flight, in which case the
        // mask stays until THAT image settles (its load/error releases).
        this._releaseMask();
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is available on any filled slot — the user can
    // always reposition/scale. `fit` only sets the initial baseline (see
    // _geom): contain starts fully-visible, cover starts frame-filling.
    _reframes() {
      return this.hasAttribute('data-filled');
    }

    // The single release discipline for the replacement-in-flight mask
    // (data-swapping). The mask comes off only when BOTH hold:
    //  - no encode is pending (_swapGen) — mid-encode the stored value
    //    still resolves to the old image, so any reveal paints it;
    //  - the frame img has settled on its current src — an unsettled src
    //    means some replacement is still in flight (e.g. a remote pick),
    //    whoever started it, and revealing would paint the previous
    //    frame. The load/error listeners pass settled=true (the event IS
    //    the settlement signal, per spec complete is true by then);
    //    other callers rely on the complete flag (covers loaded AND
    //    failed).
    // Every release path funnels through here EXCEPT _render's empty
    // branch (the img is being cleared — nothing will ever settle).
    _releaseMask(settled) {
      if (!this._swapGen && !this._loadPending && (settled || this._img.complete)) {
        this.removeAttribute('data-swapping');
      }
    }

    // Baseline geometry, shared by clamp/apply/resize. `base` is the scale at
    // view-scale s=1: cover = fill the frame (overflow on the looser axis),
    // contain = fit fully inside (letterboxed). Zooming a contain image past
    // s where it overflows naturally becomes a crop. Null until the img has
    // loaded (naturalWidth is 0 before that) or when the slot has no layout
    // box — ResizeObserver fires with a 0×0 rect under display:none, and
    // clamping against a degenerate 1×1 frame would silently pull the stored
    // pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
      const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
      return {
        iw,
        ih,
        fw,
        fh,
        base
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      // Top-layer controls: pin to the frame's top-right in viewport px
      // (the same 8px inset as the in-frame layout; unscaled — top-layer UI
      // reads as chrome, not page content). BEFORE the geometry branch:
      // placement needs only the frame rect, and a not-yet-loaded or broken
      // src must not leave the promoted strip floating unpositioned. Gated
      // on the popover actually being open: without the Popover API,
      // showPopover() threw (swallowed in _enterReframe), .ctl stays in
      // its in-frame absolute layout, and viewport-px coordinates would
      // shove it off-frame — and matches(':popover-open') itself throws
      // there (unknown pseudo-class), hence the try/catch.
      if (this.hasAttribute('data-reframe')) {
        let onTop = false;
        try {
          onTop = this._ctl.matches(':popover-open');
        } catch {}
        if (onTop) {
          const r = this.getBoundingClientRect();
          this._ctl.style.left = r.right - 8 + 'px';
          this._ctl.style.top = r.top + 8 + 'px';
        }
      }
      if (!g) {
        // Dimensions not known yet (before img load) — centered fit so there
        // is no flash of an unpositioned image before the geometry lands.
        const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = contain ? 'contain' : 'cover';
        return;
      }
      // Baseline (cover-fill or contain-fit) × view scale. Width/height and
      // left/top are all frame-% — depends only on the frame aspect ratio, so
      // a responsive resize keeps the same crop. The spill layer mirrors the
      // same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      if (this.hasAttribute('data-reframe')) {
        // Top-layer spill: position in viewport px over the frame. The top
        // layer escapes ancestor transforms entirely, so EVERY term must be
        // in viewport units: getBoundingClientRect gives the frame's scaled
        // origin AND size, and the rect/layout ratio rescales the ghost —
        // sizing from layout px alone renders it 1/scale too large under a
        // scaled deck slide. Inner ghost + handles stay box-relative.
        const r = this.getBoundingClientRect();
        const sx = g.fw ? r.width / g.fw : 1;
        const sy = g.fh ? r.height / g.fh : 1;
        this._spill.style.width = g.iw * k * sx + 'px';
        this._spill.style.height = g.ih * k * sy + 'px';
        this._spill.style.left = r.left + (50 + this._view.x) / 100 * r.width + 'px';
        this._spill.style.top = r.top + (50 + this._view.y) / 100 * r.height + 'px';
      }
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      // An Unsplash src with no credit attribute must NOT render — showing
      // the photo uncredited is the Unsplash-terms violation itself. The
      // error tile replaces the photo until the credit is written. A
      // user-dropped image is the user's own content and always renders.
      // Trimmed: credit is agent/user-editable content, and a whitespace-
      // only value must count as missing — otherwise it would suppress the
      // error tile AND render an empty credit box (no text, no links),
      // exactly the unattributed state this gate exists to prevent.
      const credit = (this.getAttribute('credit') || '').trim();
      const attrError = !!(!credit && !this._userUrl && srcAttr && isUnsplashHost(srcAttr));
      this.toggleAttribute('data-attribution-error', attrError);
      if (url && !attrError) {
        const prev = this._img.getAttribute('src');
        if (prev !== url) {
          // Replacing an already-shown image: mark the swap BEFORE setting
          // src so the stale frame is never revealed (see the data-swapping
          // stylesheet rules). First fill (prev empty) keeps the existing
          // placeholder-until-load behavior — no spinner. _hidShowing
          // covers the pick path's transient attribution-error wipe: prev
          // is gone, but an image WAS showing, so this is a replacement.
          if (prev || this._hidShowing) this.setAttribute('data-swapping', '');
          // Mark the swap BEFORE assigning src: complete keeps reporting
          // the old settled request until the browser's
          // update-the-image-data microtask runs, so same-task re-renders
          // (the pick path's credit/credit-href setAttributes) need this
          // flag, not complete, to know a load is in flight.
          this._loadPending = true;
          this._img.src = url;
          this._ghost.src = url;
        } else {
          // Same-src re-render — release if settled, so an ingest-set
          // spinner can't stick after a byte-identical re-upload (same
          // data URL, no further load event ever fires).
          this._releaseMask();
        }
        this._hidShowing = false;
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this.removeAttribute('data-swapping');
        // The src is being removed — no load/error will ever fire for it.
        this._loadPending = false;
        // A transient attribution-error wipe of a showing image happens on
        // the pick path: the host sets src one setAttribute before credit,
        // so render N hides the old image (attrError) and render N+1
        // restores a URL. Remember the wipe so that restore renders as a
        // replacement (spinner), not a first fill (blank frame).
        this._hidShowing = attrError && !!this._img.getAttribute('src');
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        // The error tile owns the blocked-photo state; .empty stays for
        // the genuinely-empty slot.
        this._empty.style.display = attrError ? 'none' : 'flex';
        this.removeAttribute('data-filled');
      }

      // Credit belongs to the author src, so a user drop hides it.
      // textContent + the http(s)-only funnel keep external strings inert.
      const showCredit = !!(url && credit && !this._userUrl && !attrError);
      this._credit.textContent = '';
      if (showCredit) {
        // Validate once (resolved against the document, http(s) only),
        // then append the terms-required utm referral params to links
        // that point back at unsplash.com.
        let href = '';
        const rawHref = this.getAttribute('credit-href') || '';
        if (rawHref) {
          try {
            const u = new URL(rawHref, document.baseURI);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
              href = withReferral(u.href);
            }
          } catch {}
        }
        const mkLink = (text, linkHref) => {
          const a = document.createElement('a');
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          a.setAttribute('href', linkHref);
          a.textContent = text;
          return a;
        };
        // Unsplash's prescribed credit is TWO links — the photographer's
        // name to their profile (credit-href) and 'Unsplash' to the
        // homepage. Render that split whenever the text has the canonical
        // shape; other text keeps the legacy single-link rendering.
        const m = /^Photo by (.+) on Unsplash$/.exec(credit);
        if (m) {
          this._credit.appendChild(document.createTextNode('Photo by '));
          this._credit.appendChild(href ? mkLink(m[1], href) : document.createTextNode(m[1]));
          this._credit.appendChild(document.createTextNode(' on '));
          this._credit.appendChild(mkLink('Unsplash', UNSPLASH_HOMEPAGE_HREF));
        } else if (href) {
          this._credit.appendChild(mkLink(credit, href));
        } else {
          this._credit.textContent = credit;
        }
      }
      this.toggleAttribute('data-credit', showCredit);
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/image-slot.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.StatusChip = __ds_scope.StatusChip;

__ds_ns.DataRow = __ds_scope.DataRow;

__ds_ns.KpiCard = __ds_scope.KpiCard;

__ds_ns.Note = __ds_scope.Note;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconNames = __ds_scope.IconNames;

__ds_ns.NavItem = __ds_scope.NavItem;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Hazard = __ds_scope.Hazard;

__ds_ns.IconTile = __ds_scope.IconTile;

})();
