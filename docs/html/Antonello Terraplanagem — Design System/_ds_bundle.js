/* @ds-bundle: {"format":4,"namespace":"AntonelloTerraplanagemDesignSystem_2ede57","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Pill","sourcePath":"components/core/Pill.jsx"},{"name":"StatusChip","sourcePath":"components/core/StatusChip.jsx"},{"name":"DataRow","sourcePath":"components/data/DataRow.jsx"},{"name":"KpiCard","sourcePath":"components/data/KpiCard.jsx"},{"name":"Note","sourcePath":"components/data/Note.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"},{"name":"IconNames","sourcePath":"components/icons/Icon.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"Avatar","sourcePath":"components/surfaces/Avatar.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Hazard","sourcePath":"components/surfaces/Hazard.jsx"},{"name":"IconTile","sourcePath":"components/surfaces/IconTile.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"a5e7da471af7","components/core/Button.jsx":"037b0d1a703f","components/core/Chip.jsx":"beeed09e4cfd","components/core/IconButton.jsx":"d1f1476f8dbe","components/core/Pill.jsx":"81021ada919b","components/core/StatusChip.jsx":"512b17ad0b1c","components/data/DataRow.jsx":"00c8690752a0","components/data/KpiCard.jsx":"93ffd91a8634","components/data/Note.jsx":"52ea755ab545","components/data/Sparkline.jsx":"3b91b26e269a","components/icons/Icon.jsx":"bc38e5d86c76","components/navigation/NavItem.jsx":"3d0899967812","components/surfaces/Avatar.jsx":"e1b88f11ca97","components/surfaces/Card.jsx":"ac9d7c4a1126","components/surfaces/Hazard.jsx":"c2cb268c51b8","components/surfaces/IconTile.jsx":"72e5556812c5","ui_kits/retaguarda/App.jsx":"c29a2b36efb5","ui_kits/retaguarda/ClienteDetail.jsx":"95497d41858c","ui_kits/retaguarda/ClientesList.jsx":"f31427fe6a4e","ui_kits/retaguarda/ComprovantesList.jsx":"ff8a422784ab","ui_kits/retaguarda/CustoHora.jsx":"e284b9b96861","ui_kits/retaguarda/Dashboard.jsx":"4f24f12dabc6","ui_kits/retaguarda/DashboardOperacional.jsx":"2b4aa50acddd","ui_kits/retaguarda/Diesel.jsx":"23d9138dcf9b","ui_kits/retaguarda/EquipamentosList.jsx":"08cbbac1a32c","ui_kits/retaguarda/Faturamento.jsx":"ef7ac3490795","ui_kits/retaguarda/Financeiro.jsx":"3e2d11809e0d","ui_kits/retaguarda/Header.jsx":"4c119e8af9b9","ui_kits/retaguarda/Manutencao.jsx":"75548e2ba764","ui_kits/retaguarda/OSList.jsx":"a053e27d82a0","ui_kits/retaguarda/OperadorDetail.jsx":"bab24c687a77","ui_kits/retaguarda/OperadoresList.jsx":"de1066f55ea3","ui_kits/retaguarda/OrcamentosList.jsx":"82d9ca5e9616","ui_kits/retaguarda/PainelGerencial.jsx":"e43baa1cc86e","ui_kits/retaguarda/Parametros.jsx":"88efbc63b929","ui_kits/retaguarda/Placeholder.jsx":"234c01f11f2c","ui_kits/retaguarda/PrecosList.jsx":"8d9fa51dfe15","ui_kits/retaguarda/Rentabilidade.jsx":"27b9f45c4740","ui_kits/retaguarda/Sidebar.jsx":"c8d5b12e62d0","ui_kits/retaguarda/Sobre.jsx":"f3b20205fc03","ui_kits/retaguarda/data.js":"694489659834","ui_kits/site/image-slot.js":"0394ad34f685"},"inlinedExternals":[],"unexposedExports":[{"name":"iconNames","sourcePath":"components/icons/Icon.jsx"}]} */

(() => {
  const __ds_ns = (window.AntonelloTerraplanagemDesignSystem_2ede57 =
    window.AntonelloTerraplanagemDesignSystem_2ede57 || {});

  const __ds_scope = {};

  __ds_ns.__errors = __ds_ns.__errors || [];

  // components/core/Pill.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * Pill — a small monospace count/label bubble (nav counts, card-header tallies).
       */
      function Pill({ children, className = "", ...rest }) {
        return /*#__PURE__*/ React.createElement(
          "span",
          _extends(
            {
              className: ["atp-pill", className].filter(Boolean).join(" "),
            },
            rest,
          ),
          children,
        );
      }
      Object.assign(__ds_scope, { Pill });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/Pill.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/data/Sparkline.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * Sparkline — tiny inline trend polyline (as used in the corner of KPI tiles).
       * `points` is an array of numbers (y-values, higher = up) or [x,y] pairs.
       */
      function Sparkline({
        points = [],
        width = 60,
        height = 24,
        stroke = "var(--amarelo)",
        strokeWidth = 2,
        className = "",
        style,
        ...rest
      }) {
        const vals = points.map((p) => (Array.isArray(p) ? p : [null, p]));
        const ys = vals.map((v) => v[1]);
        const min = Math.min(...ys),
          max = Math.max(...ys),
          range = max - min || 1;
        const n = vals.length;
        const pad = 2;
        const d = vals
          .map((v, i) => {
            const x = v[0] != null ? v[0] : n > 1 ? (i / (n - 1)) * width : 0;
            const y = pad + (1 - (v[1] - min) / range) * (height - 2 * pad);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ");
        return /*#__PURE__*/ React.createElement(
          "svg",
          _extends(
            {
              className: ["atp-spark", className].filter(Boolean).join(" "),
              viewBox: `0 0 ${width} ${height}`,
              width: width,
              height: height,
              fill: "none",
              style: style,
              "aria-hidden": "true",
            },
            rest,
          ),
          /*#__PURE__*/ React.createElement("polyline", {
            points: d,
            stroke: stroke,
            strokeWidth: strokeWidth,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }),
        );
      }
      Object.assign(__ds_scope, { Sparkline });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/data/Sparkline.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/icons/Icon.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
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
        dashboard: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("rect", {
            width: "7",
            height: "9",
            x: "3",
            y: "3",
            rx: "1",
          }),
          /*#__PURE__*/ React.createElement("rect", {
            width: "7",
            height: "5",
            x: "14",
            y: "3",
            rx: "1",
          }),
          /*#__PURE__*/ React.createElement("rect", {
            width: "7",
            height: "9",
            x: "14",
            y: "12",
            rx: "1",
          }),
          /*#__PURE__*/ React.createElement("rect", {
            width: "7",
            height: "5",
            x: "3",
            y: "16",
            rx: "1",
          }),
        ),
        "clipboard-list": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("rect", {
            width: "8",
            height: "4",
            x: "8",
            y: "2",
            rx: "1",
            ry: "1",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 11h4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 16h4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M8 11h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M8 16h.01",
          }),
        ),
        receipt: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 17V7",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z",
          }),
        ),
        truck: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M15 18H9",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "17",
            cy: "18",
            r: "2",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "7",
            cy: "18",
            r: "2",
          }),
        ),
        "hard-hat": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 6a6 6 0 0 1 6 6v3",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M4 15v-3a6 6 0 0 1 6-6",
          }),
          /*#__PURE__*/ React.createElement("rect", {
            x: "2",
            y: "15",
            width: "20",
            height: "4",
            rx: "1",
          }),
        ),
        users: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 3.128a4 4 0 0 1 0 7.744",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M22 21v-2a4 4 0 0 0-3-3.87",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "9",
            cy: "7",
            r: "4",
          }),
        ),
        user: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "7",
            r: "4",
          }),
        ),
        tag: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "7.5",
            cy: "7.5",
            r: ".5",
            fill: "currentColor",
          }),
        ),
        "file-text": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 2v5a1 1 0 0 0 1 1h5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M10 9H8",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 13H8",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 17H8",
          }),
        ),
        "file-plus": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 2v5a1 1 0 0 0 1 1h5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M9 15h6",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 18v-6",
          }),
        ),
        "file-check": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 2v5a1 1 0 0 0 1 1h5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m14 20 2 2 4-4",
          }),
        ),
        wallet: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",
          }),
        ),
        calculator: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("rect", {
            width: "16",
            height: "20",
            x: "4",
            y: "2",
            rx: "2",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "8",
            x2: "16",
            y1: "6",
            y2: "6",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "16",
            x2: "16",
            y1: "14",
            y2: "18",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 10h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 10h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M8 10h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 14h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M8 14h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 18h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M8 18h.01",
          }),
        ),
        "trending-up": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 7h6v6",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m22 7-8.5 8.5-5-5L2 17",
          }),
        ),
        "line-chart": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 3v16a2 2 0 0 0 2 2h16",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m19 9-5 5-4-4-3 3",
          }),
        ),
        "bar-chart": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 3v16a2 2 0 0 0 2 2h16",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M18 17V9",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M13 17V5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M8 17v-3",
          }),
        ),
        wrench: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z",
          }),
        ),
        fuel: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M2 21h13",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 9h11",
          }),
        ),
        /* ---- Actions / UI ---- */
        sparkles: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M20 2v4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M22 4h-4",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "4",
            cy: "20",
            r: "2",
          }),
        ),
        sun: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "12",
            r: "4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 2v2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 20v2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m4.93 4.93 1.41 1.41",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m17.66 17.66 1.41 1.41",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M2 12h2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M20 12h2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m6.34 17.66-1.41 1.41",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m19.07 4.93-1.41 1.41",
          }),
        ),
        "chevron-right": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "m9 18 6-6-6-6",
          }),
        ),
        "arrow-left": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "m12 19-7-7 7-7",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M19 12H5",
          }),
        ),
        "arrow-up-right": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M7 7h10v10",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M7 17 17 7",
          }),
        ),
        pencil: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m15 5 4 4",
          }),
        ),
        "message-circle": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
          }),
        ),
        ban: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "12",
            r: "10",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M4.929 4.929 19.07 19.071",
          }),
        ),
        check: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M20 6 9 17l-5-5",
          }),
        ),
        "circle-check-big": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M21.801 10A10 10 0 1 1 17 3.335",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m9 11 3 3L22 4",
          }),
        ),
        "circle-alert": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "12",
            r: "10",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "12",
            x2: "12",
            y1: "8",
            y2: "12",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "12",
            x2: "12.01",
            y1: "16",
            y2: "16",
          }),
        ),
        info: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "12",
            r: "10",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 16v-4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 8h.01",
          }),
        ),
        lock: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("rect", {
            width: "18",
            height: "11",
            x: "3",
            y: "11",
            rx: "2",
            ry: "2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M7 11V7a5 5 0 0 1 10 0v4",
          }),
        ),
        history: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 3v5h5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 7v5l4 2",
          }),
        ),
        sliders: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("line", {
            x1: "21",
            x2: "14",
            y1: "4",
            y2: "4",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "10",
            x2: "3",
            y1: "4",
            y2: "4",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "21",
            x2: "12",
            y1: "12",
            y2: "12",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "8",
            x2: "3",
            y1: "12",
            y2: "12",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "21",
            x2: "16",
            y1: "20",
            y2: "20",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "12",
            x2: "3",
            y1: "20",
            y2: "20",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "14",
            x2: "14",
            y1: "2",
            y2: "6",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "8",
            x2: "8",
            y1: "10",
            y2: "14",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "16",
            x2: "16",
            y1: "18",
            y2: "22",
          }),
        ),
        /* ---- Business objects / detail ---- */
        "building-2": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M10 12h4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M10 8h4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 21v-3a2 2 0 0 0-4 0v3",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16",
          }),
        ),
        "badge-check": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m9 12 2 2 4-4",
          }),
        ),
        briefcase: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
          }),
          /*#__PURE__*/ React.createElement("rect", {
            width: "20",
            height: "14",
            x: "2",
            y: "6",
            rx: "2",
          }),
        ),
        contact: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 10h2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 14h2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M6.17 15a3 3 0 0 1 5.66 0",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "9",
            cy: "11",
            r: "2",
          }),
          /*#__PURE__*/ React.createElement("rect", {
            x: "2",
            y: "5",
            width: "20",
            height: "14",
            rx: "2",
          }),
        ),
        "id-card": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("rect", {
            width: "20",
            height: "14",
            x: "2",
            y: "5",
            rx: "2",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "2",
            x2: "22",
            y1: "10",
            y2: "10",
          }),
        ),
        cake: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M2 21h20",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M7 8v3",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 8v3",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M17 8v3",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M7 4h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 4h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M17 4h.01",
          }),
        ),
        mail: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",
          }),
          /*#__PURE__*/ React.createElement("rect", {
            x: "2",
            y: "4",
            width: "20",
            height: "16",
            rx: "2",
          }),
        ),
        phone: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
          }),
        ),
        "map-pin": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "10",
            r: "3",
          }),
        ),
        smartphone: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("rect", {
            width: "14",
            height: "20",
            x: "5",
            y: "2",
            rx: "2",
            ry: "2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 18h.01",
          }),
        ),
        clock: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "12",
            r: "10",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 6v6l4 2",
          }),
        ),
        gauge: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("line", {
            x1: "10",
            x2: "14",
            y1: "2",
            y2: "2",
          }),
          /*#__PURE__*/ React.createElement("line", {
            x1: "12",
            x2: "15",
            y1: "14",
            y2: "11",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "14",
            r: "8",
          }),
        ),
        calendar: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M8 2v4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 2v4",
          }),
          /*#__PURE__*/ React.createElement("rect", {
            width: "18",
            height: "18",
            x: "3",
            y: "4",
            rx: "2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 10h18",
          }),
        ),
        /* ---- Finance / payments ---- */
        "credit-card": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("rect", {
            width: "20",
            height: "12",
            x: "2",
            y: "6",
            rx: "2",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "12",
            cy: "12",
            r: "2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M6 12h.01M18 12h.01",
          }),
        ),
        "hand-coins": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "m2 16 6 6",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "16",
            cy: "9",
            r: "2.9",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "6",
            cy: "5",
            r: "3",
          }),
        ),
        landmark: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M10 18v-7",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M14 18v-7",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M18 18v-7",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 22h18",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M6 18v-7",
          }),
        ),
        link: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
          }),
        ),
        "dollar-sign": /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("line", {
            x1: "12",
            x2: "12",
            y1: "2",
            y2: "22",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
          }),
        ),
        /* ---- Equipment variants ---- */
        forklift: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "M12 12H5a2 2 0 0 0-2 2v5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M15 19h7",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 19V2",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M6 12V7a2 2 0 0 1 2-2h2.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 16 10.828",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M7 19h4",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "13",
            cy: "19",
            r: "2",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "5",
            cy: "19",
            r: "2",
          }),
        ),
        tractor: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("path", {
            d: "m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M16 18h-5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M18 5a1 1 0 0 0-1 1v5.573",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 4h8.129a1 1 0 0 1 .99.863L13 11.246",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M4 11V4",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M7 15h.01",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M8 10.1V4",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "18",
            cy: "18",
            r: "2",
          }),
          /*#__PURE__*/ React.createElement("circle", {
            cx: "7",
            cy: "15",
            r: "5",
          }),
        ),
        /* ---- Legacy / data ---- */
        database: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("ellipse", {
            cx: "12",
            cy: "5",
            rx: "9",
            ry: "3",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 5V19A9 3 0 0 0 21 19V5",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M3 12A9 3 0 0 0 21 12",
          }),
        ),
        archive: /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement("rect", {
            width: "20",
            height: "5",
            x: "2",
            y: "3",
            rx: "1",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8",
          }),
          /*#__PURE__*/ React.createElement("path", {
            d: "M10 12h4",
          }),
        ),
      };

      /**
       * Icon — renders a brand glyph from the Lucide-derived set.
       * @param {{name:string, size?:number, strokeWidth?:number, className?:string, style?:object}} props
       */
      function Icon({ name, size = 18, strokeWidth = 1.9, className = "", style, ...rest }) {
        const body = PATHS[name];
        if (!body) {
          if (typeof console !== "undefined") console.warn(`[Icon] unknown name: "${name}"`);
          return null;
        }
        return /*#__PURE__*/ React.createElement(
          "svg",
          _extends(
            {
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
                ...style,
              },
              "aria-hidden": "true",
              focusable: "false",
            },
            rest,
          ),
          body,
        );
      }

      /** All available icon names (for pickers / docs). */
      const IconNames = Object.keys(PATHS);
      /** @deprecated lowercase alias — not exposed on the bundle namespace; use IconNames. */
      const iconNames = IconNames;
      Object.assign(__ds_scope, { Icon, IconNames, iconNames });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/icons/Icon.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/core/Badge.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * Badge — a hero/header-level status or type indicator (pill).
       * Tones: active (green), neutral (grey), info (steel-blue), gold (amber).
       * Optional `led` dot or leading `icon`.
       */
      function Badge({ tone = "neutral", led = false, icon, children, className = "", ...rest }) {
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: 13,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "span",
          _extends(
            {
              className: ["atp-badge", `atp-badge--${tone}`, className].filter(Boolean).join(" "),
            },
            rest,
          ),
          led &&
            /*#__PURE__*/ React.createElement("span", {
              className: "atp-badge__led",
            }),
          ic,
          children,
        );
      }
      Object.assign(__ds_scope, { Badge });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/Badge.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/core/Button.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      function resolveIcon(icon, size) {
        return typeof icon === "string"
          ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
              name: icon,
              size: size,
            })
          : icon;
      }

      /**
       * Button — the product's action control.
       * Variants: primary (amber fill), ghost (outline), ai (amber-tinted "Perguntar à IA"),
       * wa (WhatsApp/green), danger (destructive outline).
       */
      function Button({
        variant = "primary",
        size = "md",
        icon,
        iconRight,
        children,
        className = "",
        type = "button",
        ...rest
      }) {
        const cls = [
          "atp-btn",
          `atp-btn--${variant}`,
          size !== "md" ? `atp-btn--${size}` : "",
          className,
        ]
          .filter(Boolean)
          .join(" ");
        const gs = size === "sm" ? 15 : 16;
        return /*#__PURE__*/ React.createElement(
          "button",
          _extends(
            {
              type: type,
              className: cls,
            },
            rest,
          ),
          resolveIcon(icon, gs),
          children != null &&
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "atp-btn__label",
              },
              children,
            ),
          resolveIcon(iconRight, gs),
        );
      }
      Object.assign(__ds_scope, { Button });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/Button.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/core/Chip.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * Chip — a neutral tag with an amber icon (e.g. equipment the operator is cleared for).
       */
      function Chip({ icon, children, className = "", ...rest }) {
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: 15,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "span",
          _extends(
            {
              className: ["atp-chip", className].filter(Boolean).join(" "),
            },
            rest,
          ),
          ic,
          children,
        );
      }
      Object.assign(__ds_scope, { Chip });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/Chip.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/core/IconButton.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * IconButton — square, icon-only control (theme toggle, row actions, toolbar).
       * Always pass `label` for accessibility (used as aria-label + tooltip).
       */
      function IconButton({ icon, label, size = "md", className = "", ...rest }) {
        const gs = size === "sm" ? 15 : 18;
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: gs,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "button",
          _extends(
            {
              type: "button",
              "aria-label": label,
              title: label,
              className: ["atp-icon-btn", size === "sm" ? "atp-icon-btn--sm" : "", className]
                .filter(Boolean)
                .join(" "),
            },
            rest,
          ),
          ic,
        );
      }
      Object.assign(__ds_scope, { IconButton });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/IconButton.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/core/StatusChip.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * StatusChip — compact status pill for table cells and list rows.
       * Tones map to the product's status colours; pass `led` for a dot or `icon` for a glyph.
       */
      function StatusChip({
        tone = "neutral",
        led = false,
        icon,
        children,
        className = "",
        ...rest
      }) {
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: 12,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "span",
          _extends(
            {
              className: ["atp-status", `atp-status--${tone}`, className].filter(Boolean).join(" "),
            },
            rest,
          ),
          led &&
            /*#__PURE__*/ React.createElement("span", {
              className: "atp-status__led",
            }),
          ic,
          children,
        );
      }
      Object.assign(__ds_scope, { StatusChip });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/StatusChip.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/data/Note.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * Note — a dashed-border informational callout with a leading icon.
       * `default` uses an amber-dim icon; `steel` for legacy/read-only context (Farolti).
       */
      function Note({ icon = "info", tone = "default", children, className = "", ...rest }) {
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: 15,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "div",
          _extends(
            {
              className: ["atp-note", tone === "steel" ? "atp-note--steel" : "", className]
                .filter(Boolean)
                .join(" "),
            },
            rest,
          ),
          ic,
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "atp-note__t",
            },
            children,
          ),
        );
      }
      Object.assign(__ds_scope, { Note });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/data/Note.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/navigation/NavItem.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
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
        className = "",
        ...rest
      }) {
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: 17,
              })
            : icon;
        const cls = ["atp-nav-item", active ? "is-active" : "", className]
          .filter(Boolean)
          .join(" ");
        const inner = /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          ic,
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "atp-nav-item__label",
            },
            children,
          ),
          count != null &&
            !active &&
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "atp-nav-item__count",
              },
              count,
            ),
          active &&
            dot &&
            /*#__PURE__*/ React.createElement("span", {
              className: "atp-nav-item__dot",
            }),
        );
        if (href)
          return /*#__PURE__*/ React.createElement(
            "a",
            _extends(
              {
                href: href,
                className: cls,
              },
              rest,
            ),
            inner,
          );
        return /*#__PURE__*/ React.createElement(
          "div",
          _extends(
            {
              role: "button",
              tabIndex: 0,
              className: cls,
            },
            rest,
          ),
          inner,
        );
      }
      Object.assign(__ds_scope, { NavItem });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/navigation/NavItem.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/surfaces/Avatar.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * Avatar — initials or an icon in a coloured square/circle.
       * `flat` (solid amber, e.g. header user) or `brand` (amber gradient + glow, e.g. hero).
       */
      function Avatar({
        initials,
        icon,
        shape = "circle",
        size = 28,
        tone = "flat",
        className = "",
        style,
        ...rest
      }) {
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: Math.round(size * 0.48),
                strokeWidth: 1.7,
              })
            : icon;
        const radius = shape === "circle" ? "50%" : Math.max(10, Math.round(size * 0.23));
        return /*#__PURE__*/ React.createElement(
          "span",
          _extends(
            {
              className: ["atp-avatar", tone === "brand" ? "atp-avatar--brand" : "", className]
                .filter(Boolean)
                .join(" "),
              style: {
                width: size,
                height: size,
                borderRadius: radius,
                fontSize: Math.round(size * 0.42),
                ...style,
              },
            },
            rest,
          ),
          ic || initials,
        );
      }
      Object.assign(__ds_scope, { Avatar });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/surfaces/Avatar.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/surfaces/Hazard.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * Hazard — the signature diagonal amber/dark construction-tape bar.
       * Use as a brand emphasis stripe (under the sidebar wordmark, atop the content area).
       * `default` = 8px, `header` = 6px thinner variant.
       */
      function Hazard({ variant = "default", height, className = "", style, ...rest }) {
        return /*#__PURE__*/ React.createElement(
          "div",
          _extends(
            {
              className: ["atp-hazard", variant === "header" ? "atp-hazard--header" : "", className]
                .filter(Boolean)
                .join(" "),
              style: {
                ...(height
                  ? {
                      height,
                    }
                  : {}),
                ...style,
              },
              role: "presentation",
            },
            rest,
          ),
        );
      }
      Object.assign(__ds_scope, { Hazard });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/surfaces/Hazard.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/surfaces/IconTile.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * IconTile — the small rounded square that holds an icon throughout the UI
       * (card headers, KPI corners, data rows). Tones set the fill + icon colour.
       */
      function IconTile({
        icon,
        size = "md",
        tone = "amber",
        className = "",
        style,
        children,
        ...rest
      }) {
        const px =
          {
            sm: 28,
            md: 30,
            lg: 34,
          }[size] || 30;
        const gs =
          {
            sm: 15,
            md: 16,
            lg: 18,
          }[size] || 16;
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: gs,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "span",
          _extends(
            {
              className: ["atp-tile", `atp-tile--${tone}`, className].filter(Boolean).join(" "),
              style: {
                width: px,
                height: px,
                ...style,
              },
            },
            rest,
          ),
          ic || children,
        );
      }
      Object.assign(__ds_scope, { IconTile });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/surfaces/IconTile.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/data/DataRow.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
      /**
       * DataRow — a key/value row for "Dados cadastrais"-style lists: a muted icon tile,
       * an uppercase key, and a value below. Rows divide with a soft hairline.
       */
      function DataRow({ icon, label, children, className = "", ...rest }) {
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: 16,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "div",
          _extends(
            {
              className: ["atp-datarow", className].filter(Boolean).join(" "),
            },
            rest,
          ),
          icon != null &&
            /*#__PURE__*/ React.createElement(
              __ds_scope.IconTile,
              {
                size: "md",
                tone: "muted",
                className: "atp-datarow__i",
              },
              ic,
            ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "atp-datarow__c",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "atp-datarow__k",
              },
              label,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "atp-datarow__v",
              },
              children,
            ),
          ),
        );
      }
      Object.assign(__ds_scope, { DataRow });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/data/DataRow.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/data/KpiCard.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
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
        className = "",
        ...rest
      }) {
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: 17,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "div",
          _extends(
            {
              className: ["atp-kpi", warn ? "atp-kpi--warn" : "", className]
                .filter(Boolean)
                .join(" "),
            },
            rest,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "atp-kpi__top",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "atp-kpi__label",
              },
              label,
            ),
            /*#__PURE__*/ React.createElement(
              __ds_scope.IconTile,
              {
                size: "md",
                tone: "amber",
                className: "atp-kpi__ic",
              },
              ic,
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: mono ? "atp-kpi__val atp-kpi__val--mono" : "atp-kpi__val",
            },
            value,
            unit != null &&
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "atp-kpi__u",
                },
                unit,
              ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "atp-kpi__foot",
            },
            trend &&
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: `atp-trend atp-trend--${trend.dir}`,
                },
                /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                  name: "arrow-up-right",
                  size: 13,
                  style:
                    trend.dir === "down"
                      ? {
                          transform: "rotate(90deg)",
                        }
                      : undefined,
                }),
                trend.value,
              ),
            foot,
          ),
          spark != null &&
            (Array.isArray(spark)
              ? /*#__PURE__*/ React.createElement(__ds_scope.Sparkline, {
                  points: spark,
                  className: "atp-kpi__spark",
                })
              : /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "atp-kpi__spark",
                  },
                  spark,
                )),
        );
      }
      Object.assign(__ds_scope, { KpiCard });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/data/KpiCard.jsx",
      error: String((e && e.message) || e),
    });
  }

  // components/surfaces/Card.jsx
  try {
    (() => {
      function _extends() {
        return (
          (_extends = Object.assign
            ? Object.assign.bind()
            : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }),
          _extends.apply(null, arguments)
        );
      }
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
        className = "",
        ...rest
      }) {
        const hasHeader = title != null || icon != null || headerRight != null;
        const ic =
          typeof icon === "string"
            ? /*#__PURE__*/ React.createElement(__ds_scope.Icon, {
                name: icon,
                size: 16,
              })
            : icon;
        return /*#__PURE__*/ React.createElement(
          "section",
          _extends(
            {
              className: ["atp-card", className].filter(Boolean).join(" "),
            },
            rest,
          ),
          hasHeader &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "atp-card__h",
              },
              icon != null &&
                /*#__PURE__*/ React.createElement(
                  __ds_scope.IconTile,
                  {
                    size: "md",
                    tone: "amber",
                  },
                  ic,
                ),
              title != null &&
                /*#__PURE__*/ React.createElement(
                  "h3",
                  {
                    className: "atp-card__title",
                  },
                  title,
                ),
              headerRight != null &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "atp-card__right",
                  },
                  headerRight,
                ),
            ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: padded ? "atp-card__body atp-card__body--pad" : "atp-card__body",
            },
            children,
          ),
        );
      }
      Object.assign(__ds_scope, { Card });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/surfaces/Card.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/App.jsx
  try {
    (() => {
      /* Retaguarda — app shell + simple screen routing.
   Defines window.App; each HTML entry mounts it (optionally with `initial`). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Hazard } = NS;
      function App({ initial }) {
        const [module, setModule] = React.useState((initial && initial.module) || "clientes");
        const [selected, setSelected] = React.useState((initial && initial.entity) || null);
        const navigate = (id) => {
          setModule(id);
          setSelected(null);
        };
        const P = window.RTG.placeholders;
        const crumbs = [
          {
            label: "Retaguarda",
          },
        ];
        let screen;
        if (module === "dashboard") {
          crumbs.push({
            label: "Dashboard",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Dashboard, {
            onNavigate: navigate,
          });
        } else if (module === "os") {
          crumbs.push({
            label: "Ordens de Serviço",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.OSList, null);
        } else if (module === "orcamentos") {
          crumbs.push({
            label: "Orçamentos",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.OrcamentosList, null);
        } else if (module === "precos") {
          crumbs.push({
            label: "Preços",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.PrecosList, null);
        } else if (module === "rentabilidade") {
          crumbs.push({
            label: "Rentabilidade",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Rentabilidade, null);
        } else if (module === "comprovantes") {
          crumbs.push({
            label: "Comprovantes",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.ComprovantesList, null);
        } else if (module === "manutencao") {
          crumbs.push({
            label: "Manutenção",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Manutencao, null);
        } else if (module === "painel") {
          crumbs.push({
            label: "Painel Gerencial",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.PainelGerencial, null);
        } else if (module === "financeiro") {
          crumbs.push({
            label: "Financeiro",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Financeiro, null);
        } else if (module === "custohora") {
          crumbs.push({
            label: "Custo da Hora",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.CustoHora, null);
        } else if (module === "equipamentos") {
          crumbs.push({
            label: "Equipamentos",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.EquipamentosList, null);
        } else if (module === "diesel") {
          crumbs.push({
            label: "Diesel",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Diesel, null);
        } else if (module === "faturamento") {
          crumbs.push({
            label: "Faturamento",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Faturamento, null);
        } else if (module === "parametros") {
          crumbs.push({
            label: "Parâmetros",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Parametros, null);
        } else if (module === "sobre") {
          crumbs.push({
            label: "Sobre",
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Sobre, null);
        } else if (module === "clientes") {
          if (selected) {
            crumbs.push(
              {
                label: "Clientes",
              },
              {
                label: selected.nome,
                here: true,
              },
            );
            screen = /*#__PURE__*/ React.createElement(window.ClienteDetail, {
              cliente: selected,
              onBack: () => setSelected(null),
            });
          } else {
            crumbs.push({
              label: "Clientes",
              here: true,
            });
            screen = /*#__PURE__*/ React.createElement(window.ClientesList, {
              onOpen: setSelected,
            });
          }
        } else if (module === "operadores") {
          if (selected) {
            crumbs.push(
              {
                label: "Operadores",
              },
              {
                label: selected.nome,
                here: true,
              },
            );
            screen = /*#__PURE__*/ React.createElement(window.OperadorDetail, {
              operador: selected,
              onBack: () => setSelected(null),
            });
          } else {
            crumbs.push({
              label: "Operadores",
              here: true,
            });
            screen = /*#__PURE__*/ React.createElement(window.OperadoresList, {
              onOpen: setSelected,
            });
          }
        } else {
          const p = P[module] || {
            icon: "dashboard",
            label: module,
          };
          crumbs.push({
            label: p.label,
            here: true,
          });
          screen = /*#__PURE__*/ React.createElement(window.Placeholder, {
            icon: p.icon,
            label: p.label,
          });
        }
        return /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "rtg-app",
          },
          /*#__PURE__*/ React.createElement(window.Sidebar, {
            module: module,
            onNavigate: navigate,
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-main",
            },
            /*#__PURE__*/ React.createElement(Hazard, {
              variant: "header",
            }),
            /*#__PURE__*/ React.createElement(window.Header, {
              crumbs: crumbs,
            }),
            /*#__PURE__*/ React.createElement(
              "main",
              {
                className: "rtg-content",
              },
              screen,
            ),
          ),
        );
      }
      window.App = App;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/App.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/ClienteDetail.jsx
  try {
    (() => {
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
        Icon,
      } = NS;

      /* Example detail data (Vale Verde) used for the rich sections. */
      const CLI_OS = [
        {
          n: "OS-021",
          t: "Terraplenagem — lote industrial",
          h: "62 h",
          d: "desde 01/07",
          v: "R$ 24.800",
          tone: "amber",
          st: "Em andamento",
          led: true,
        },
        {
          n: "OS-018",
          t: "Abertura de acesso e drenagem",
          h: "40 h",
          d: "desde 20/06",
          v: "R$ 16.200",
          tone: "amber",
          st: "Em andamento",
          led: true,
        },
        {
          n: "OS-012",
          t: "Fundação de galpão — estacas",
          h: "88 h",
          d: "02–24/05",
          v: "R$ 41.000",
          tone: "success",
          st: "Concluída",
          led: true,
        },
        {
          n: "OS-007",
          t: "Nivelamento de pátio",
          h: "30 h",
          d: "08–19/04",
          v: "R$ 12.500",
          tone: "success",
          st: "Concluída",
          led: true,
        },
      ];
      const CLI_NF = [
        {
          doc: "NF 1042",
          em: "05/07",
          vc: "20/07",
          v: "R$ 12.400",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "NF 1038",
          em: "28/06",
          vc: "12/07",
          v: "R$ 8.900",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "NF 1035",
          em: "20/06",
          vc: "05/07",
          v: "R$ 11.100",
          tone: "danger",
          icon: "circle-alert",
          st: "Vencido",
        },
        {
          doc: "NF 1029",
          em: "05/06",
          vc: "20/06",
          v: "R$ 9.500",
          tone: "success",
          icon: "check",
          st: "Pago",
        },
        {
          doc: "NF 1021",
          em: "20/05",
          vc: "04/06",
          v: "R$ 15.200",
          tone: "success",
          icon: "check",
          st: "Pago",
        },
      ];
      const CLI_ORC = [
        {
          t: "Terraplenagem — fase 2",
          m: "ORC-055 · 02/07",
          v: "R$ 58.000",
          tone: "info",
          st: "Aberto",
        },
        {
          t: "Drenagem de acesso",
          m: "ORC-051 · 24/06",
          v: "R$ 22.400",
          tone: "info",
          st: "Aberto",
        },
        {
          t: "Pátio de manobra",
          m: "ORC-047 · 12/06",
          v: "R$ 18.900",
          tone: "info",
          st: "Aberto",
        },
        {
          t: "Fundação do anexo",
          m: "ORC-039 · 20/04",
          v: "R$ 41.000",
          tone: "success",
          st: "Aprovado",
        },
        {
          t: "Limpeza de terreno",
          m: "ORC-030 · 08/03",
          v: "R$ 9.800",
          tone: "neutral",
          st: "Perdido",
        },
      ];
      const CLI_COMP = [
        {
          icon: "credit-card",
          t: "PIX recebido — NF 1029",
          m: "20/06 · 14:22",
          v: "R$ 9.500",
        },
        {
          icon: "landmark",
          t: "TED recebida — NF 1021",
          m: "04/06 · 09:10",
          v: "R$ 15.200",
        },
        {
          icon: "link",
          t: "Boleto pago — NF 1015",
          m: "22/05 · 16:40",
          v: "R$ 7.300",
        },
      ];
      const CLI_FAROLTI = [
        {
          k: "Faturado (LTV)",
          ic: "wallet",
          v: "R$ 512.300",
          mono: true,
        },
        {
          k: "Ticket médio",
          ic: "dollar-sign",
          v: "R$ 8.740",
          mono: true,
        },
        {
          k: "OS realizadas",
          ic: "file-text",
          v: "59",
        },
        {
          k: "Curva ABC",
          ic: "trending-up",
          v: "A",
          s: "alto valor histórico",
          abc: true,
        },
        {
          k: "Primeira OS",
          ic: "calendar",
          v: "03/2019",
          mono: true,
        },
        {
          k: "Última OS",
          ic: "calendar",
          v: "02/2022",
          mono: true,
        },
        {
          k: "Recência",
          ic: "history",
          v: "38 meses",
          s: "desde a última OS no legado",
        },
        {
          k: "Origem",
          ic: "database",
          v: "ERP Farolti",
          s: "Migração jun/2024",
        },
      ];
      function ClienteDetail({ cliente, onBack }) {
        const c = cliente || window.RTG.clientes[0];
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "button",
            {
              className: "rtg-back",
              onClick: onBack,
            },
            /*#__PURE__*/ React.createElement(Icon, {
              name: "arrow-left",
              size: 16,
            }),
            " Clientes",
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-hero",
            },
            /*#__PURE__*/ React.createElement(Avatar, {
              icon: c.tipo === "PJ" ? "building-2" : "user",
              size: 78,
              shape: "square",
              tone: "brand",
            }),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-hero-main",
              },
              /*#__PURE__*/ React.createElement("h1", null, c.nome),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-hero-sub",
                },
                c.ativo
                  ? /*#__PURE__*/ React.createElement(
                      Badge,
                      {
                        tone: "active",
                        led: true,
                      },
                      "Ativo",
                    )
                  : /*#__PURE__*/ React.createElement(
                      Badge,
                      {
                        tone: "neutral",
                        led: true,
                      },
                      "Inativo",
                    ),
                /*#__PURE__*/ React.createElement(
                  Badge,
                  {
                    tone: "info",
                    icon: "building-2",
                  },
                  c.tipo === "PJ" ? "Pessoa Jurídica" : "Pessoa Física",
                ),
                c.recorrente &&
                  /*#__PURE__*/ React.createElement(
                    Badge,
                    {
                      tone: "gold",
                      icon: "badge-check",
                    },
                    "Cliente recorrente",
                  ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-qf",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    c.tipo === "PJ" ? "CNPJ" : "CPF",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v mono",
                    },
                    c.doc,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "Telefone",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v mono",
                    },
                    c.telefone,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "Cliente desde",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v",
                    },
                    c.desde || "mar/2022 · 3 anos",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "\xDAltima OS",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v",
                    },
                    c.ultimaOS || "08/07/2025",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-hero-actions",
              },
              /*#__PURE__*/ React.createElement(
                Button,
                {
                  variant: "ghost",
                  icon: "pencil",
                },
                "Editar",
              ),
              /*#__PURE__*/ React.createElement(
                Button,
                {
                  variant: "wa",
                  icon: "message-circle",
                },
                "WhatsApp",
              ),
              /*#__PURE__*/ React.createElement(
                Button,
                {
                  variant: "primary",
                  icon: "file-plus",
                },
                "Novo or\xE7amento",
              ),
              /*#__PURE__*/ React.createElement(
                Button,
                {
                  variant: "danger",
                  icon: "ban",
                },
                "Inativar",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Faturado em 2025",
              value: c.faturado || "R$ 148.500",
              mono: true,
              icon: "credit-card",
              trend: {
                dir: "up",
                value: "18%",
              },
              foot: "vs. 2024",
              spark: [19, 17, 18, 12, 13, 8, 9, 4],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Saldo a receber",
              value: c.saldo || "R$ 32.400",
              mono: true,
              warn: true,
              icon: "hand-coins",
              foot: /*#__PURE__*/ React.createElement(
                React.Fragment,
                null,
                "3 t\xEDtulos \xB7 ",
                /*#__PURE__*/ React.createElement(
                  "b",
                  {
                    style: {
                      color: "var(--danger-fg)",
                      fontWeight: 600,
                    },
                  },
                  "1 vencido",
                ),
              ),
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "OS ativas",
              value: String(c.osAtivas ?? 2),
              icon: "clipboard-list",
              foot: "em andamento no per\xEDodo",
              spark: [13, 14, 10, 11, 9, 10, 7, 8],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Or\xE7amentos abertos",
              value: String(c.orcAbertos ?? 3),
              icon: "file-text",
              foot: "R$ 99.300 em propostas",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Ordens de Servi\xE7o",
                  icon: "clipboard-list",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "4 vinculadas"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-oslist",
                  },
                  CLI_OS.map((o) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "rtg-osrow",
                        key: o.n,
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "rtg-osnum",
                        },
                        o.n,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-osbody",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "t",
                          },
                          o.t,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "m",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: "clock",
                              size: 12,
                            }),
                            " ",
                            o.h,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: "calendar",
                              size: 12,
                            }),
                            " ",
                            o.d,
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-osend",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-osval",
                          },
                          o.v,
                        ),
                        /*#__PURE__*/ React.createElement(
                          StatusChip,
                          {
                            tone: o.tone,
                            led: o.led,
                          },
                          o.st,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Contas a receber",
                  icon: "wallet",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "R$ 32.400 em aberto"),
                },
                /*#__PURE__*/ React.createElement(
                  "table",
                  {
                    className: "rtg-table",
                  },
                  /*#__PURE__*/ React.createElement(
                    "thead",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "tr",
                      null,
                      /*#__PURE__*/ React.createElement("th", null, "Documento"),
                      /*#__PURE__*/ React.createElement("th", null, "Emiss\xE3o"),
                      /*#__PURE__*/ React.createElement("th", null, "Vencimento"),
                      /*#__PURE__*/ React.createElement(
                        "th",
                        {
                          className: "r",
                        },
                        "Valor",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "th",
                        {
                          className: "r",
                        },
                        "Situa\xE7\xE3o",
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "tbody",
                    null,
                    CLI_NF.map((n) =>
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        {
                          key: n.doc,
                        },
                        /*#__PURE__*/ React.createElement(
                          "td",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "rtg-doc",
                            },
                            n.doc,
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "td",
                          {
                            className: "mono",
                          },
                          n.em,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "td",
                          {
                            className: "mono",
                          },
                          n.vc,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "td",
                          {
                            className: "r rtg-val",
                          },
                          n.v,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "td",
                          {
                            className: "r",
                          },
                          /*#__PURE__*/ React.createElement(
                            StatusChip,
                            {
                              tone: n.tone,
                              led: n.led,
                              icon: n.icon,
                            },
                            n.st,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Dados cadastrais",
                  icon: "contact",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "building-2",
                    label: "Raz\xE3o / Fantasia",
                  },
                  c.nome,
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, c.fantasia || c.nome),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "briefcase",
                    label: "Segmento",
                  },
                  c.segmento,
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, c.tipo),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "mail",
                    label: "E-mail",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    c.email || "contato@cliente.com.br",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "phone",
                    label: "Telefone",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    c.telefone,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "map-pin",
                    label: "Endere\xE7o",
                  },
                  c.endereco || c.cidade || "Santo Ângelo/RS",
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "user",
                    label: "Contato",
                  },
                  c.contato || "Setor de compras",
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, c.contatoArea || "Compras"),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Or\xE7amentos",
                  icon: "file-text",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "5 no total"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-clist",
                  },
                  CLI_ORC.map((o) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "rtg-crow",
                        key: o.m,
                      },
                      /*#__PURE__*/ React.createElement(IconTile, {
                        icon: "file-text",
                        tone: "amber",
                        size: "md",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cb",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "ct",
                          },
                          o.t,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "cm",
                          },
                          o.m,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cv",
                        },
                        o.v,
                        /*#__PURE__*/ React.createElement(
                          StatusChip,
                          {
                            tone: o.tone,
                            style: {
                              padding: "2px 7px",
                            },
                          },
                          o.st,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Comprovantes recentes",
                  icon: "receipt",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-clist",
                  },
                  CLI_COMP.map((o) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "rtg-crow",
                        key: o.t,
                      },
                      /*#__PURE__*/ React.createElement(IconTile, {
                        icon: o.icon,
                        tone: "amber",
                        size: "md",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cb",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "ct",
                          },
                          o.t,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "cm",
                          },
                          o.m,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cv",
                        },
                        o.v,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-farolti",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-farolti-h",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "fi",
                },
                /*#__PURE__*/ React.createElement(Icon, {
                  name: "database",
                  size: 18,
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "ft",
                },
                /*#__PURE__*/ React.createElement(
                  "h3",
                  null,
                  "Hist\xF3rico no ERP legado (Farolti)",
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  null,
                  "Snapshot importado no cadastro (c\xF3digo 781) \u2014 n\xE3o \xE9 recalculado ao vivo pelo sistema.",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "rtg-farolti-badge",
                },
                /*#__PURE__*/ React.createElement(Icon, {
                  name: "archive",
                  size: 12,
                }),
                " Importado \xB7 congelado",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-farolti-grid",
              },
              CLI_FAROLTI.map((f) =>
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: f.abc ? "rtg-fstat abc" : "rtg-fstat",
                    key: f.k,
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-fstat-top",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "k",
                      },
                      f.k,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "fic",
                      },
                      /*#__PURE__*/ React.createElement(Icon, {
                        name: f.ic,
                        size: 15,
                      }),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: f.mono ? "v mono" : "v",
                    },
                    f.v,
                  ),
                  f.s &&
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "s",
                      },
                      f.s,
                    ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              style: {
                marginTop: 22,
              },
            },
            /*#__PURE__*/ React.createElement(
              Note,
              {
                icon: "info",
              },
              "Os n\xFAmeros do ",
              /*#__PURE__*/ React.createElement("b", null, "snapshot Farolti"),
              " refletem o hist\xF3rico anterior \xE0 migra\xE7\xE3o e permanecem congelados. A atividade a partir de jun/2024 \xE9 calculada em tempo real pelo sistema (blocos acima).",
            ),
          ),
        );
      }
      window.ClienteDetail = ClienteDetail;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/ClienteDetail.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/ClientesList.jsx
  try {
    (() => {
      /* Retaguarda — Clientes list (click a row to open the detail). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, StatusChip, Badge, IconTile, Button } = NS;
      function ClientesList({ onOpen }) {
        const rows = window.RTG.clientes;
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Clientes",
            ),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "file-plus",
              },
              "Novo cliente",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            Card,
            null,
            /*#__PURE__*/ React.createElement(
              "table",
              {
                className: "rtg-table rtg-clickable",
              },
              /*#__PURE__*/ React.createElement(
                "thead",
                null,
                /*#__PURE__*/ React.createElement(
                  "tr",
                  null,
                  /*#__PURE__*/ React.createElement("th", null, "Cliente"),
                  /*#__PURE__*/ React.createElement("th", null, "Tipo"),
                  /*#__PURE__*/ React.createElement("th", null, "Cidade"),
                  /*#__PURE__*/ React.createElement(
                    "th",
                    {
                      className: "r",
                    },
                    "OS ativas",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "th",
                    {
                      className: "r",
                    },
                    "Saldo",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "th",
                    {
                      className: "r",
                    },
                    "Situa\xE7\xE3o",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "tbody",
                null,
                rows.map((c) =>
                  /*#__PURE__*/ React.createElement(
                    "tr",
                    {
                      key: c.id,
                      onClick: () => onOpen(c),
                    },
                    /*#__PURE__*/ React.createElement(
                      "td",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-namecell",
                        },
                        /*#__PURE__*/ React.createElement(IconTile, {
                          icon: c.tipo === "PJ" ? "building-2" : "user",
                          tone: "amber",
                          size: "md",
                        }),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "nm",
                            },
                            c.nome,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "sub",
                            },
                            c.segmento,
                          ),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "td",
                      null,
                      /*#__PURE__*/ React.createElement(
                        Badge,
                        {
                          tone: c.tipo === "PJ" ? "info" : "neutral",
                        },
                        c.tipo,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement("td", null, c.cidade || "Santo Ângelo/RS"),
                    /*#__PURE__*/ React.createElement(
                      "td",
                      {
                        className: "r rtg-val",
                      },
                      c.osAtivas,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "td",
                      {
                        className: "r rtg-val",
                      },
                      c.saldo,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "td",
                      {
                        className: "r",
                      },
                      c.ativo
                        ? /*#__PURE__*/ React.createElement(
                            StatusChip,
                            {
                              tone: "success",
                              led: true,
                            },
                            "Ativo",
                          )
                        : /*#__PURE__*/ React.createElement(
                            StatusChip,
                            {
                              tone: "neutral",
                            },
                            "Inativo",
                          ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.ClientesList = ClientesList;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/ClientesList.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/ComprovantesList.jsx
  try {
    (() => {
      /* Retaguarda — Comprovantes (recibos de pagamento; filtro por forma). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, Button, Pill, Icon } = NS;
      const CMP_ROWS = [
        {
          data: "05/07",
          forma: "PIX",
          ic: "credit-card",
          t: "PIX recebido — NF 1041",
          cli: "Agro Vale Verde",
          nf: "NF 1041",
          v: "R$ 9.600",
        },
        {
          data: "03/07",
          forma: "TED",
          ic: "landmark",
          t: "TED recebida — NF 1033",
          cli: "Construtora Sul",
          nf: "NF 1033",
          v: "R$ 7.800",
        },
        {
          data: "20/06",
          forma: "PIX",
          ic: "credit-card",
          t: "PIX recebido — NF 1029",
          cli: "Construtora Vale Verde",
          nf: "NF 1029",
          v: "R$ 9.500",
        },
        {
          data: "04/06",
          forma: "TED",
          ic: "landmark",
          t: "TED recebida — NF 1021",
          cli: "Construtora Vale Verde",
          nf: "NF 1021",
          v: "R$ 15.200",
        },
        {
          data: "22/05",
          forma: "Boleto",
          ic: "link",
          t: "Boleto pago — NF 1015",
          cli: "Essavado Ltda.",
          nf: "NF 1015",
          v: "R$ 7.300",
        },
        {
          data: "12/05",
          forma: "PIX",
          ic: "credit-card",
          t: "PIX recebido — NF 1012",
          cli: "Metalúrgica Boa Vista",
          nf: "NF 1012",
          v: "R$ 6.400",
        },
      ];
      const CMP_FILTERS = ["Todos", "PIX", "TED", "Boleto"];
      function ComprovantesList() {
        const [filter, setFilter] = React.useState("Todos");
        const rows = filter === "Todos" ? CMP_ROWS : CMP_ROWS.filter((r) => r.forma === filter);
        const count = (id) =>
          id === "Todos" ? CMP_ROWS.length : CMP_ROWS.filter((r) => r.forma === id).length;
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Comprovantes",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "R$ 55.800 no per\xEDodo"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "file-plus",
              },
              "Anexar comprovante",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-filters",
            },
            CMP_FILTERS.map((f) =>
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  key: f,
                  type: "button",
                  className: filter === f ? "rtg-filter is-active" : "rtg-filter",
                  onClick: () => setFilter(f),
                },
                f,
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "ct",
                  },
                  count(f),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            Card,
            null,
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-tablewrap",
              },
              /*#__PURE__*/ React.createElement(
                "table",
                {
                  className: "rtg-table",
                },
                /*#__PURE__*/ React.createElement(
                  "thead",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "tr",
                    null,
                    /*#__PURE__*/ React.createElement("th", null, "Data"),
                    /*#__PURE__*/ React.createElement("th", null, "Comprovante"),
                    /*#__PURE__*/ React.createElement("th", null, "Cliente"),
                    /*#__PURE__*/ React.createElement("th", null, "NF"),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Valor",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "tbody",
                  null,
                  rows.map((r, i) =>
                    /*#__PURE__*/ React.createElement(
                      "tr",
                      {
                        key: i,
                      },
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "mono",
                        },
                        r.data,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "rtg-eqcell",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "atp-tile atp-tile--amber",
                              style: {
                                width: 26,
                                height: 26,
                              },
                            },
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: r.ic,
                              size: 15,
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "nm",
                            },
                            r.t,
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement("td", null, r.cli),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-doc",
                          },
                          r.nf,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.v,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.ComprovantesList = ComprovantesList;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/ComprovantesList.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/CustoHora.jsx
  try {
    (() => {
      /* Retaguarda — Custo da Hora (custo horário por equipamento; clique numa linha
   para ver a composição). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { KpiCard, Card, Button, Pill, IconTile, Icon, Note, StatusChip } = NS;
      const CH_ROWS = [
        {
          id: "cat",
          eq: "Escavadeira CAT 320",
          ic: "truck",
          horas: "148 h",
          custo: "R$ 232",
          preco: "R$ 400",
          margem: "42%",
          dir: "up",
          comp: [
            ["fuel", "Diesel", "R$ 98/h", 42],
            ["wrench", "Manutenção", "R$ 41/h", 18],
            ["hard-hat", "Operador", "R$ 62/h", 27],
            ["history", "Depreciação", "R$ 31/h", 13],
          ],
        },
        {
          id: "jcb",
          eq: "Retroescavadeira JCB 3CX",
          ic: "tractor",
          horas: "96 h",
          custo: "R$ 178",
          preco: "R$ 320",
          margem: "44%",
          dir: "up",
          comp: [
            ["fuel", "Diesel", "R$ 72/h", 40],
            ["wrench", "Manutenção", "R$ 30/h", 17],
            ["hard-hat", "Operador", "R$ 55/h", 31],
            ["history", "Depreciação", "R$ 21/h", 12],
          ],
        },
        {
          id: "xcmg",
          eq: "Pá Carregadeira XCMG",
          ic: "forklift",
          horas: "74 h",
          custo: "R$ 195",
          preco: "R$ 300",
          margem: "35%",
          dir: "up",
          comp: [
            ["fuel", "Diesel", "R$ 84/h", 43],
            ["wrench", "Manutenção", "R$ 38/h", 20],
            ["hard-hat", "Operador", "R$ 52/h", 27],
            ["history", "Depreciação", "R$ 21/h", 10],
          ],
        },
        {
          id: "basc",
          eq: "Caminhão basculante 01",
          ic: "truck",
          horas: "58 h",
          custo: "R$ 174",
          preco: "R$ 220",
          margem: "21%",
          dir: "down",
          comp: [
            ["fuel", "Diesel", "R$ 81/h", 47],
            ["wrench", "Manutenção", "R$ 44/h", 25],
            ["hard-hat", "Operador", "R$ 35/h", 20],
            ["history", "Depreciação", "R$ 14/h", 8],
          ],
        },
      ];
      function CustoHora() {
        const [sel, setSel] = React.useState(CH_ROWS[0]);
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Custo da Hora",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "julho/2025"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "calculator",
              },
              "Recalcular custos",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
              style: {
                marginTop: 0,
              },
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Custo m\xE9dio da hora",
              value: "R$ 198",
              mono: true,
              icon: "calculator",
              foot: "ponderado pelas horas",
              spark: [15, 16, 14, 15, 13, 14, 12, 13],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Horas faturadas",
              value: "376",
              unit: "h",
              icon: "clock",
              trend: {
                dir: "up",
                value: "6%",
              },
              foot: "vs. junho",
              spark: [19, 17, 18, 13, 14, 9, 11, 6],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Diesel no m\xEAs",
              value: "R$ 28.400",
              mono: true,
              warn: true,
              icon: "fuel",
              foot: "9.400 L consumidos",
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Margem m\xE9dia",
              value: "38%",
              icon: "trending-up",
              trend: {
                dir: "up",
                value: "3 p.p.",
              },
              foot: "vs. junho",
              spark: [14, 13, 14, 12, 11, 10, 9, 7],
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Custo por equipamento",
                  icon: "calculator",
                  headerRight: /*#__PURE__*/ React.createElement(
                    Pill,
                    null,
                    CH_ROWS.length,
                    " equipamentos",
                  ),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-tablewrap",
                  },
                  /*#__PURE__*/ React.createElement(
                    "table",
                    {
                      className: "rtg-table rtg-clickable",
                    },
                    /*#__PURE__*/ React.createElement(
                      "thead",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        null,
                        /*#__PURE__*/ React.createElement("th", null, "Equipamento"),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Horas (m\xEAs)",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Custo/h",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Pre\xE7o/h",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Margem",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "tbody",
                      null,
                      CH_ROWS.map((r) =>
                        /*#__PURE__*/ React.createElement(
                          "tr",
                          {
                            key: r.id,
                            className: sel.id === r.id ? "is-selected" : "",
                            onClick: () => setSel(r),
                          },
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "rtg-eqcell",
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "atp-tile atp-tile--amber",
                                  style: {
                                    width: 26,
                                    height: 26,
                                  },
                                },
                                /*#__PURE__*/ React.createElement(Icon, {
                                  name: r.ic,
                                  size: 15,
                                }),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "nm",
                                },
                                r.eq,
                              ),
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.horas,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.custo,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.preco,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: `atp-trend atp-trend--${r.dir}`,
                                style: {
                                  fontSize: 13,
                                },
                              },
                              /*#__PURE__*/ React.createElement(Icon, {
                                name: "arrow-up-right",
                                size: 13,
                                style:
                                  r.dir === "down"
                                    ? {
                                        transform: "rotate(90deg)",
                                      }
                                    : undefined,
                              }),
                              r.margem,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Note,
                {
                  icon: "info",
                },
                "O custo da hora soma ",
                /*#__PURE__*/ React.createElement("b", null, "diesel"),
                ", ",
                /*#__PURE__*/ React.createElement("b", null, "manuten\xE7\xE3o"),
                ", ",
                /*#__PURE__*/ React.createElement("b", null, "operador"),
                " e ",
                /*#__PURE__*/ React.createElement("b", null, "deprecia\xE7\xE3o"),
                " por hor\xEDmetro. Valores ficam restritos a este m\xF3dulo, ",
                /*#__PURE__*/ React.createElement("b", null, "Financeiro"),
                " e ",
                /*#__PURE__*/ React.createElement("b", null, "Rentabilidade"),
                ", conforme o particionamento de acesso.",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: `Composição — ${sel.eq}`,
                  icon: sel.ic,
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, sel.custo, "/h"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-clist",
                    style: {
                      padding: "10px 18px 16px",
                    },
                  },
                  sel.comp.map(([ic, t, v, pct]) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        key: t,
                        style: {
                          padding: "10px 0",
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          },
                        },
                        /*#__PURE__*/ React.createElement(IconTile, {
                          icon: ic,
                          tone: "amber",
                          size: "sm",
                        }),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            style: {
                              flex: 1,
                              fontSize: 13.5,
                              fontWeight: 600,
                            },
                          },
                          t,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-val",
                            style: {
                              fontSize: 12.5,
                            },
                          },
                          v,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            style: {
                              font: "600 11px/1 var(--font-mono)",
                              color: "var(--muted-2)",
                              width: 34,
                              textAlign: "right",
                            },
                          },
                          pct,
                          "%",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            height: 5,
                            borderRadius: 3,
                            background: "var(--surface-2)",
                            marginTop: 8,
                          },
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          style: {
                            height: "100%",
                            width: pct + "%",
                            borderRadius: 3,
                            background:
                              "linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))",
                          },
                        }),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Pre\xE7o de tabela",
                  icon: "tag",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      style: {
                        flex: 1,
                      },
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        style: {
                          font: "600 10px/1 var(--font-display)",
                          letterSpacing: ".12em",
                          textTransform: "uppercase",
                          color: "var(--muted-2)",
                        },
                      },
                      sel.eq,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        style: {
                          font: "600 23px/1 var(--font-mono)",
                          marginTop: 8,
                        },
                      },
                      sel.preco,
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          style: {
                            fontSize: 13,
                            color: "var(--muted)",
                          },
                        },
                        "/h",
                      ),
                    ),
                  ),
                  sel.dir === "up"
                    ? /*#__PURE__*/ React.createElement(
                        StatusChip,
                        {
                          tone: "success",
                          led: true,
                        },
                        "Margem saud\xE1vel",
                      )
                    : /*#__PURE__*/ React.createElement(
                        StatusChip,
                        {
                          tone: "danger",
                          icon: "circle-alert",
                        },
                        "Margem apertada",
                      ),
                ),
              ),
            ),
          ),
        );
      }
      window.CustoHora = CustoHora;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/CustoHora.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Dashboard.jsx
  try {
    (() => {
      /* Retaguarda — Dashboard (company-wide operational overview). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { KpiCard, Card, StatusChip, Pill, IconTile, Icon } = NS;
      const DASH_OS = [
        {
          n: "OS-021",
          t: "Terraplenagem — lote industrial",
          cli: "Construtora Vale Verde",
          h: "62 h",
          d: "desde 01/07",
          tone: "amber",
          st: "Em andamento",
        },
        {
          n: "OS-019",
          t: "Abertura de acesso e drenagem",
          cli: "Construtora Sul",
          h: "28 h",
          d: "desde 24/06",
          tone: "amber",
          st: "Em andamento",
        },
        {
          n: "OS-018",
          t: "Abertura de acesso e drenagem",
          cli: "Essavado Ltda.",
          h: "40 h",
          d: "desde 20/06",
          tone: "amber",
          st: "Em andamento",
        },
        {
          n: "OS-024",
          t: "Nivelamento de pátio",
          cli: "Agro Vale Verde",
          h: "8 h",
          d: "desde 05/07",
          tone: "info",
          st: "Aberta",
        },
      ];
      const DASH_APONT = [
        {
          op: "Adelar Machado",
          eq: "Escavadeira CAT 320",
          eqIcon: "truck",
          h0: "4.210",
          h1: "4.218",
          hrs: "8,0 h",
          os: "OS-021",
        },
        {
          op: "Vilson Prediger",
          eq: "Retroescavadeira JCB 3CX",
          eqIcon: "tractor",
          h0: "1.888",
          h1: "1.895",
          hrs: "7,0 h",
          os: "OS-019",
        },
        {
          op: "Nelson Kunz",
          eq: "Pá Carregadeira XCMG",
          eqIcon: "forklift",
          h0: "998",
          h1: "1.004",
          hrs: "6,0 h",
          os: "OS-024",
        },
        {
          op: "Ivo Scherer",
          eq: "Caminhão basculante",
          eqIcon: "truck",
          h0: "2.130",
          h1: "2.138",
          hrs: "8,0 h",
          os: "OS-018",
        },
      ];
      const DASH_FROTA = [
        {
          eq: "Escavadeira CAT 320",
          ic: "truck",
          tone: "success",
          st: "Em operação",
        },
        {
          eq: "Retroescavadeira JCB 3CX",
          ic: "tractor",
          tone: "success",
          st: "Em operação",
        },
        {
          eq: "Pá Carregadeira XCMG",
          ic: "forklift",
          tone: "amber",
          st: "Em manutenção",
        },
        {
          eq: "Caminhão basculante 02",
          ic: "truck",
          tone: "neutral",
          st: "Parado",
        },
      ];
      const DASH_VENC = [
        {
          doc: "NF 1042",
          cli: "Construtora Vale Verde",
          m: "vence 20/07",
          v: "R$ 12.400",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "NF 1038",
          cli: "Construtora Vale Verde",
          m: "vence 12/07",
          v: "R$ 8.900",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "NF 1035",
          cli: "Essavado Ltda.",
          m: "venceu 05/07",
          v: "R$ 11.100",
          tone: "danger",
          icon: "circle-alert",
          st: "Vencido",
        },
      ];
      const DASH_BARS = [
        ["S1", 58],
        ["S2", 66],
        ["S3", 61],
        ["S4", 74],
        ["S5", 70],
        ["S6", 79],
        ["S7", 68],
        ["S8", 88],
      ];
      function Dashboard({ onNavigate }) {
        const [tab, setTab] = React.useState("geral");
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Dashboard",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "julho/2025"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "rtg-pagesub",
            },
            "Vis\xE3o geral da opera\xE7\xE3o \u2014 equipamentos, ordens e faturamento.",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-tabs",
              role: "tablist",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": tab === "geral",
                className: tab === "geral" ? "rtg-tab is-active" : "rtg-tab",
                onClick: () => setTab("geral"),
              },
              "Vis\xE3o geral",
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": tab === "op",
                className: tab === "op" ? "rtg-tab is-active" : "rtg-tab",
                onClick: () => setTab("op"),
              },
              "Operacional",
            ),
          ),
          tab === "op"
            ? /*#__PURE__*/ React.createElement(window.DashboardOperacional, {
                onNavigate: onNavigate,
              })
            : /*#__PURE__*/ React.createElement(
                React.Fragment,
                null,
                /*#__PURE__*/ React.createElement(
                  "section",
                  {
                    className: "rtg-kpis",
                    style: {
                      marginTop: 0,
                    },
                  },
                  /*#__PURE__*/ React.createElement(KpiCard, {
                    label: "Faturamento no m\xEAs",
                    value: "R$ 86.200",
                    mono: true,
                    icon: "credit-card",
                    trend: {
                      dir: "up",
                      value: "11%",
                    },
                    foot: "vs. junho",
                    spark: [18, 16, 17, 12, 13, 9, 10, 5],
                  }),
                  /*#__PURE__*/ React.createElement(KpiCard, {
                    label: "Horas apontadas",
                    value: "640",
                    unit: "h",
                    icon: "clock",
                    trend: {
                      dir: "up",
                      value: "6%",
                    },
                    foot: "vs. junho",
                    spark: [19, 17, 18, 13, 14, 9, 11, 6],
                  }),
                  /*#__PURE__*/ React.createElement(KpiCard, {
                    label: "OS em andamento",
                    value: "7",
                    icon: "clipboard-list",
                    foot: "3 abrem esta semana",
                    spark: [14, 15, 11, 12, 9, 11, 8, 9],
                  }),
                  /*#__PURE__*/ React.createElement(KpiCard, {
                    label: "Saldo a receber",
                    value: "R$ 61.900",
                    mono: true,
                    warn: true,
                    icon: "hand-coins",
                    foot: /*#__PURE__*/ React.createElement(
                      React.Fragment,
                      null,
                      "5 t\xEDtulos \xB7 ",
                      /*#__PURE__*/ React.createElement(
                        "b",
                        {
                          style: {
                            color: "var(--danger-fg)",
                            fontWeight: 600,
                          },
                        },
                        "2 vencidos",
                      ),
                    ),
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-grid",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-stack",
                    },
                    /*#__PURE__*/ React.createElement(
                      Card,
                      {
                        title: "OS em andamento",
                        icon: "clipboard-list",
                        headerRight: /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-link",
                            onClick: () => onNavigate && onNavigate("os"),
                          },
                          "Ver todas ",
                          /*#__PURE__*/ React.createElement(Icon, {
                            name: "chevron-right",
                            size: 14,
                          }),
                        ),
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-oslist",
                        },
                        DASH_OS.map((s) =>
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "rtg-osrow",
                              key: s.n,
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "rtg-osnum",
                              },
                              s.n,
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "rtg-osbody",
                              },
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "t",
                                },
                                s.t,
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "m",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  null,
                                  /*#__PURE__*/ React.createElement(Icon, {
                                    name: "user",
                                    size: 12,
                                  }),
                                  " ",
                                  s.cli,
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  null,
                                  /*#__PURE__*/ React.createElement(Icon, {
                                    name: "clock",
                                    size: 12,
                                  }),
                                  " ",
                                  s.h,
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  null,
                                  /*#__PURE__*/ React.createElement(Icon, {
                                    name: "calendar",
                                    size: 12,
                                  }),
                                  " ",
                                  s.d,
                                ),
                              ),
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "rtg-osend",
                              },
                              /*#__PURE__*/ React.createElement(
                                StatusChip,
                                {
                                  tone: s.tone,
                                  led: true,
                                },
                                s.st,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      Card,
                      {
                        title: "Apontamentos de hoje",
                        icon: "gauge",
                        headerRight: /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-link",
                            onClick: () => onNavigate && onNavigate("operadores"),
                          },
                          "Ver todos ",
                          /*#__PURE__*/ React.createElement(Icon, {
                            name: "chevron-right",
                            size: 14,
                          }),
                        ),
                      },
                      /*#__PURE__*/ React.createElement(
                        "table",
                        {
                          className: "rtg-table",
                        },
                        /*#__PURE__*/ React.createElement(
                          "thead",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "tr",
                            null,
                            /*#__PURE__*/ React.createElement("th", null, "Operador"),
                            /*#__PURE__*/ React.createElement("th", null, "Equipamento"),
                            /*#__PURE__*/ React.createElement("th", null, "Hor\xEDmetro"),
                            /*#__PURE__*/ React.createElement(
                              "th",
                              {
                                className: "r",
                              },
                              "Horas",
                            ),
                            /*#__PURE__*/ React.createElement(
                              "th",
                              {
                                className: "r",
                              },
                              "OS",
                            ),
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "tbody",
                          null,
                          DASH_APONT.map((a, i) =>
                            /*#__PURE__*/ React.createElement(
                              "tr",
                              {
                                key: i,
                              },
                              /*#__PURE__*/ React.createElement(
                                "td",
                                {
                                  style: {
                                    fontWeight: 600,
                                  },
                                },
                                a.op,
                              ),
                              /*#__PURE__*/ React.createElement(
                                "td",
                                null,
                                /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className: "rtg-eqcell",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className: "atp-tile atp-tile--amber",
                                      style: {
                                        width: 26,
                                        height: 26,
                                      },
                                    },
                                    /*#__PURE__*/ React.createElement(Icon, {
                                      name: a.eqIcon,
                                      size: 15,
                                    }),
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className: "nm",
                                    },
                                    a.eq,
                                  ),
                                ),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "td",
                                null,
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  {
                                    className: "rtg-horim",
                                  },
                                  /*#__PURE__*/ React.createElement("b", null, a.h0),
                                  " \u2192 ",
                                  /*#__PURE__*/ React.createElement("b", null, a.h1),
                                ),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "td",
                                {
                                  className: "r",
                                  style: {
                                    fontWeight: 600,
                                  },
                                },
                                a.hrs,
                              ),
                              /*#__PURE__*/ React.createElement(
                                "td",
                                {
                                  className: "r",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  {
                                    className: "rtg-ostag",
                                  },
                                  a.os,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-stack",
                    },
                    /*#__PURE__*/ React.createElement(
                      Card,
                      {
                        title: "Frota",
                        icon: "truck",
                        headerRight: /*#__PURE__*/ React.createElement(
                          Pill,
                          null,
                          "14 equipamentos",
                        ),
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-clist",
                        },
                        DASH_FROTA.map((f) =>
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "rtg-crow",
                              key: f.eq,
                            },
                            /*#__PURE__*/ React.createElement(IconTile, {
                              icon: f.ic,
                              tone: "amber",
                              size: "md",
                            }),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "cb",
                              },
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "ct",
                                },
                                f.eq,
                              ),
                            ),
                            /*#__PURE__*/ React.createElement(
                              StatusChip,
                              {
                                tone: f.tone,
                                led: f.tone !== "neutral",
                              },
                              f.st,
                            ),
                          ),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      Card,
                      {
                        title: "Vencimentos pr\xF3ximos",
                        icon: "wallet",
                        headerRight: /*#__PURE__*/ React.createElement(Pill, null, "R$ 32.400"),
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-clist",
                        },
                        DASH_VENC.map((v) =>
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "rtg-crow",
                              key: v.doc,
                            },
                            /*#__PURE__*/ React.createElement(IconTile, {
                              icon: "file-check",
                              tone: "amber",
                              size: "md",
                            }),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "cb",
                              },
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "ct",
                                },
                                v.doc,
                                " \u2014 ",
                                v.cli,
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "cm",
                                },
                                v.m,
                              ),
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "cv",
                              },
                              v.v,
                              /*#__PURE__*/ React.createElement(
                                StatusChip,
                                {
                                  tone: v.tone,
                                  led: v.led,
                                  icon: v.icon,
                                  style: {
                                    padding: "2px 7px",
                                  },
                                },
                                v.st,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      Card,
                      {
                        title: "Horas por semana",
                        icon: "bar-chart",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-bars-wrap",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "rtg-bars",
                          },
                          DASH_BARS.map(([lbl, h], i) =>
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "rtg-barcol",
                                key: lbl,
                              },
                              /*#__PURE__*/ React.createElement("div", {
                                className: i === DASH_BARS.length - 1 ? "rtg-bar hi" : "rtg-bar",
                                style: {
                                  height: h + "%",
                                },
                              }),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "rtg-barlbl",
                                },
                                lbl,
                              ),
                            ),
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "rtg-bars-meta",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "M\xE9dia ",
                            /*#__PURE__*/ React.createElement("b", null, "158 h"),
                            "/semana",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Pico ",
                            /*#__PURE__*/ React.createElement("b", null, "176 h"),
                            " (S8)",
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
        );
      }
      window.Dashboard = Dashboard;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Dashboard.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/DashboardOperacional.jsx
  try {
    (() => {
      /* Retaguarda — Dashboard · aba Operacional (tempo real: mapa, ordens, financeiro, manutenção preditiva). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, Pill, Icon, Sparkline, Button, StatusChip } = NS;
      const OP_SVG = {
        truck:
          '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
        tractor:
          '<path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20"/><path d="M16 18h-5"/><path d="M18 5a1 1 0 0 0-1 1v5.573"/><path d="M3 4h8.129a1 1 0 0 1 .99.863L13 11.246"/><path d="M4 11V4"/><path d="M7 15h.01"/><path d="M8 10.1V4"/><circle cx="18" cy="18" r="2"/><circle cx="7" cy="15" r="5"/>',
        forklift:
          '<path d="M12 12H5a2 2 0 0 0-2 2v5"/><path d="M15 19h7"/><path d="M16 19V2"/><path d="M6 12V7a2 2 0 0 1 2-2h2.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 16 10.828"/><path d="M7 19h4"/><circle cx="13" cy="19" r="2"/><circle cx="5" cy="19" r="2"/>',
      };
      const OP_PINS = [
        {
          ll: [-28.296, -54.281],
          eq: "Escavadeira CAT 320",
          os: "OS-021",
          op: "Adelar Machado",
          g: "truck",
        },
        {
          ll: [-28.308, -54.252],
          eq: "Retroescavadeira JCB 3CX",
          os: "OS-019",
          op: "Vilson Prediger",
          g: "tractor",
        },
        {
          ll: [-28.313, -54.272],
          eq: "Pá Carregadeira XCMG",
          os: "OS-024",
          op: "Nelson Kunz",
          g: "forklift",
        },
        {
          ll: [-28.291, -54.259],
          eq: "Caminhão basculante",
          os: "OS-018",
          op: "Ivo Scherer",
          g: "truck",
        },
      ];
      const OP_NOVAS = [40, 80, 0, 40, 0, 80, 40];
      const OP_MANUT = [
        {
          eq: "Pá Carregadeira XCMG",
          ic: "forklift",
          al: "Plano 1.000 h — óleo e filtros",
          v: "vencida · −18 h",
          pct: 100,
          c: "var(--danger)",
          late: true,
        },
        {
          eq: "Escavadeira Volvo EC140",
          ic: "truck",
          al: "Plano 7.500 h — filtros e óleos",
          v: "em 12 h",
          pct: 92,
          c: "var(--amarelo)",
        },
        {
          eq: "Escavadeira CAT 320",
          ic: "truck",
          al: "Plano 4.300 h — filtros e graxa",
          v: "em 82 h",
          pct: 58,
          c: "var(--success-fg)",
        },
        {
          eq: "Retroescavadeira JCB 3CX",
          ic: "tractor",
          al: "Plano 2.000 h — revisão geral",
          v: "em 105 h",
          pct: 48,
          c: "var(--success-fg)",
        },
        {
          eq: "Rolo compactador CA25",
          ic: "tractor",
          al: "Plano 3.000 h — óleo e filtros",
          v: "em 130 h",
          pct: 35,
          c: "var(--success-fg)",
        },
      ];
      const OP_RECV_MAX = 21300;
      const OP_RECV = [
        {
          cli: "Construtora Vale Verde",
          total: "R$ 21.300",
          seg: [
            {
              v: 12400,
              c: "var(--amarelo)",
            },
            {
              v: 8900,
              c: "var(--amarelo-deep)",
            },
          ],
        },
        {
          cli: "Construtora Sul",
          total: "R$ 19.900",
          seg: [
            {
              v: 19900,
              c: "var(--danger)",
            },
          ],
        },
        {
          cli: "Essavado Ltda.",
          total: "R$ 11.100",
          seg: [
            {
              v: 11100,
              c: "var(--danger)",
            },
          ],
        },
        {
          cli: "Agro Vale Verde",
          total: "R$ 9.600",
          seg: [
            {
              v: 9600,
              c: "var(--amarelo)",
            },
          ],
        },
      ];
      const OP_HOJE = [
        {
          os: "OS-021",
          op: "Adelar Machado",
          h: "8,0 h",
        },
        {
          os: "OS-019",
          op: "Vilson Prediger",
          h: "7,0 h",
        },
        {
          os: "OS-024",
          op: "Nelson Kunz",
          h: "6,0 h",
        },
      ];
      function DashboardOperacional({ onNavigate }) {
        const mapEl = React.useRef(null);
        const mapObj = React.useRef(null);
        const [mapErr, setMapErr] = React.useState(false);
        React.useEffect(() => {
          let dead = false;
          function init() {
            if (dead || !mapEl.current || mapObj.current || !window.L) return;
            const L = window.L;
            const map = L.map(mapEl.current, {
              scrollWheelZoom: false,
            }).setView([-28.302, -54.266], 14);
            map.attributionControl.setPosition("topright");
            L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              {
                maxZoom: 18,
                attribution: "Imagens © Esri",
              },
            ).addTo(map);
            OP_PINS.forEach((p) => {
              L.marker(p.ll, {
                icon: L.divIcon({
                  className: "rtg-pin",
                  html:
                    '<div class="bx"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    OP_SVG[p.g] +
                    '</svg></div><div class="tl"></div>',
                  iconSize: [30, 38],
                  iconAnchor: [15, 38],
                  popupAnchor: [0, -34],
                }),
              })
                .addTo(map)
                .bindPopup("<b>" + p.eq + "</b><br>" + p.os + " — " + p.op);
            });
            mapObj.current = map;
          }
          if (window.L) init();
          else {
            if (!document.getElementById("leaflet-css")) {
              const css = document.createElement("link");
              css.id = "leaflet-css";
              css.rel = "stylesheet";
              css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
              document.head.appendChild(css);
            }
            let s = document.getElementById("leaflet-js");
            if (!s) {
              s = document.createElement("script");
              s.id = "leaflet-js";
              s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
              document.head.appendChild(s);
            }
            s.addEventListener("load", init);
            s.addEventListener("error", () => {
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
        return /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "rtg-opgrid",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-stack",
            },
            /*#__PURE__*/ React.createElement(
              Card,
              {
                title: "Operacional em tempo real",
                icon: "map-pin",
                headerRight: /*#__PURE__*/ React.createElement(
                  Pill,
                  null,
                  "4 equipamentos em campo",
                ),
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-map-wrap",
                },
                /*#__PURE__*/ React.createElement("div", {
                  ref: mapEl,
                  className: "rtg-map",
                }),
                mapErr &&
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-map-fallback",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(Icon, {
                        name: "map-pin",
                        size: 22,
                      }),
                      /*#__PURE__*/ React.createElement("br", null),
                      "Mapa indispon\xEDvel offline \u2014 4 equipamentos em campo (OS-018, 019, 021, 024).",
                    ),
                  ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "rtg-map-live",
                  },
                  /*#__PURE__*/ React.createElement("i", null),
                  "Ao vivo",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-map-ov",
                  },
                  /*#__PURE__*/ React.createElement(Icon, {
                    name: "sun",
                    size: 15,
                  }),
                  " ",
                  /*#__PURE__*/ React.createElement("b", null, "17\xB0"),
                  "\xA0\xB7 Santo \xC2ngelo \u2014 RS \xB7 c\xE9u limpo",
                  /*#__PURE__*/ React.createElement("span", {
                    className: "sep",
                  }),
                  /*#__PURE__*/ React.createElement(Icon, {
                    name: "hard-hat",
                    size: 15,
                  }),
                  " 4 operadores em campo",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              Card,
              {
                title: "Manuten\xE7\xE3o preditiva",
                icon: "wrench",
                headerRight: /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "rtg-link",
                    onClick: () => onNavigate && onNavigate("manutencao"),
                  },
                  "Ver todas ",
                  /*#__PURE__*/ React.createElement(Icon, {
                    name: "chevron-right",
                    size: 14,
                  }),
                ),
              },
              /*#__PURE__*/ React.createElement(
                "table",
                {
                  className: "rtg-table",
                },
                /*#__PURE__*/ React.createElement(
                  "thead",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "tr",
                    null,
                    /*#__PURE__*/ React.createElement("th", null, "Equipamento"),
                    /*#__PURE__*/ React.createElement("th", null, "Alerta"),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Vence",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Sa\xFAde",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "tbody",
                  null,
                  OP_MANUT.map((m) =>
                    /*#__PURE__*/ React.createElement(
                      "tr",
                      {
                        key: m.eq,
                      },
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "rtg-eqcell",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "atp-tile atp-tile--amber",
                              style: {
                                width: 26,
                                height: 26,
                              },
                            },
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: m.ic,
                              size: 15,
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "nm",
                            },
                            m.eq,
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          style: {
                            color: "var(--muted)",
                          },
                        },
                        m.al,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "mono",
                            style: {
                              fontWeight: 600,
                              color: m.late ? "var(--danger-fg)" : "var(--fg)",
                            },
                          },
                          m.v,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-health",
                          },
                          /*#__PURE__*/ React.createElement("i", {
                            style: {
                              width: m.pct + "%",
                              background: m.c,
                            },
                          }),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-stack",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "eyebrow rtg-opsec",
                },
                "Ordens e horas",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-optiles",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-optile",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "k",
                    },
                    "Abertas",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "v",
                    },
                    "4",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-minibars",
                    },
                    OP_NOVAS.map((h, i) =>
                      /*#__PURE__*/ React.createElement("i", {
                        key: i,
                        className: h ? "" : "z",
                        style: {
                          height: (h || 8) + "%",
                        },
                      }),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "s",
                    },
                    "Novas OS \xB7 \xFAltimos 7 dias",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-optile",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "k",
                    },
                    "Em andamento",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "v",
                    },
                    "7",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-statlist",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "r",
                      },
                      /*#__PURE__*/ React.createElement("i", {
                        style: {
                          background: "var(--amarelo)",
                        },
                      }),
                      "Em andamento",
                      /*#__PURE__*/ React.createElement("b", null, "7"),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "r",
                      },
                      /*#__PURE__*/ React.createElement("i", {
                        style: {
                          background: "var(--info-fg)",
                        },
                      }),
                      "Abertas",
                      /*#__PURE__*/ React.createElement("b", null, "4"),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "r",
                      },
                      /*#__PURE__*/ React.createElement("i", {
                        style: {
                          background: "var(--success-fg)",
                        },
                      }),
                      "Conclu\xEDdas no m\xEAs",
                      /*#__PURE__*/ React.createElement("b", null, "6"),
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-optile",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "k",
                    },
                    "Horas apontadas",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "v",
                    },
                    "640",
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "u",
                      },
                      "h",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-minirows",
                    },
                    OP_HOJE.map((r) =>
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "r",
                          key: r.os,
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-ostag",
                            style: {
                              padding: "2px 6px",
                              fontSize: 11,
                            },
                          },
                          r.os,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "nm",
                          },
                          r.op.split(" ")[0],
                        ),
                        /*#__PURE__*/ React.createElement("b", null, r.h),
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "s",
                    },
                    "Hoje \xB7 21 h em 3 OS",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "eyebrow rtg-opsec",
                },
                "Financeiro",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-optiles",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-optile",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "k",
                    },
                    "Executado",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "v mono",
                    },
                    "R$ 98.400",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "s",
                    },
                    "servi\xE7o executado no m\xEAs",
                  ),
                  /*#__PURE__*/ React.createElement(Sparkline, {
                    points: [19, 17, 18, 13, 14, 10, 11, 5],
                    width: 170,
                    height: 30,
                    style: {
                      display: "block",
                      marginTop: 12,
                    },
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-optile",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "k",
                    },
                    "Faturado",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "v mono",
                    },
                    "R$ 86.200",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "s",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "atp-trend atp-trend--up",
                      },
                      /*#__PURE__*/ React.createElement(Icon, {
                        name: "arrow-up-right",
                        size: 12,
                      }),
                      "11%",
                    ),
                    " vs. junho",
                  ),
                  /*#__PURE__*/ React.createElement(Sparkline, {
                    points: [18, 16, 17, 12, 13, 9, 10, 5],
                    width: 170,
                    height: 30,
                    style: {
                      display: "block",
                      marginTop: 12,
                    },
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-optile",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "k",
                    },
                    "Recebido",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "v mono",
                    },
                    "R$ 55.800",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "s",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "atp-trend atp-trend--down",
                      },
                      /*#__PURE__*/ React.createElement(Icon, {
                        name: "arrow-up-right",
                        size: 12,
                        style: {
                          transform: "rotate(90deg)",
                        },
                      }),
                      "4%",
                    ),
                    " vs. junho",
                  ),
                  /*#__PURE__*/ React.createElement(Sparkline, {
                    points: [16, 17, 14, 15, 12, 13, 12, 14],
                    width: 170,
                    height: 30,
                    stroke: "var(--amarelo-dim)",
                    style: {
                      display: "block",
                      marginTop: 12,
                    },
                  }),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              Card,
              {
                title: "Contas a receber por cliente",
                icon: "hand-coins",
                headerRight: /*#__PURE__*/ React.createElement(Pill, null, "R$ 61.900 em aberto"),
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-recv",
                },
                OP_RECV.map((r) =>
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-recv-row",
                      key: r.cli,
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "nm",
                      },
                      r.cli,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "rtg-recv-bar",
                      },
                      r.seg.map((s, i) =>
                        /*#__PURE__*/ React.createElement("i", {
                          key: i,
                          style: {
                            width: (s.v / OP_RECV_MAX) * 100 + "%",
                            background: s.c,
                          },
                        }),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "vl",
                      },
                      r.total,
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-recv-legend",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    null,
                    /*#__PURE__*/ React.createElement("i", {
                      style: {
                        background: "var(--amarelo)",
                      },
                    }),
                    "A vencer \xB7 0\u201315 dias",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    null,
                    /*#__PURE__*/ React.createElement("i", {
                      style: {
                        background: "var(--amarelo-deep)",
                      },
                    }),
                    "A vencer \xB7 16\u201330 dias",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    null,
                    /*#__PURE__*/ React.createElement("i", {
                      style: {
                        background: "var(--danger)",
                      },
                    }),
                    "Vencida",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "eyebrow rtg-opsec",
                },
                "Atalhos e a\xE7\xF5es r\xE1pidas",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-shortcuts",
                },
                /*#__PURE__*/ React.createElement(
                  Button,
                  {
                    variant: "primary",
                    icon: "file-plus",
                    onClick: () => onNavigate && onNavigate("os"),
                  },
                  "Nova O.S.",
                ),
                /*#__PURE__*/ React.createElement(
                  Button,
                  {
                    variant: "ghost",
                    icon: "file-text",
                    onClick: () => onNavigate && onNavigate("orcamentos"),
                  },
                  "Novo or\xE7amento",
                ),
                /*#__PURE__*/ React.createElement(
                  Button,
                  {
                    variant: "ghost",
                    icon: "users",
                    onClick: () => onNavigate && onNavigate("clientes"),
                  },
                  "Novo cliente",
                ),
                /*#__PURE__*/ React.createElement(
                  Button,
                  {
                    variant: "ghost",
                    icon: "fuel",
                    onClick: () => onNavigate && onNavigate("diesel"),
                  },
                  "Registrar abastecimento",
                ),
                /*#__PURE__*/ React.createElement(
                  Button,
                  {
                    variant: "ghost",
                    icon: "bar-chart",
                    onClick: () => onNavigate && onNavigate("painel"),
                  },
                  "Gerar relat\xF3rio",
                ),
              ),
            ),
          ),
        );
      }
      window.DashboardOperacional = DashboardOperacional;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/DashboardOperacional.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Diesel.jsx
  try {
    (() => {
      /* Retaguarda — Diesel (abastecimentos, consumo por equipamento, tanque interno). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { KpiCard, Card, Button, Pill, IconTile, Icon, Note } = NS;
      const DSL_ABAST = [
        {
          data: "09/07",
          eq: "Escavadeira CAT 320",
          ic: "truck",
          orig: "Tanque interno",
          hor: "4.218",
          l: "110 L",
          rl: "R$ 5,84",
          v: "R$ 642",
        },
        {
          data: "08/07",
          eq: "Caminhão basculante 01",
          ic: "truck",
          orig: "Posto Missões",
          hor: "2.138",
          l: "180 L",
          rl: "R$ 6,04",
          v: "R$ 1.087",
        },
        {
          data: "07/07",
          eq: "Retroescavadeira JCB 3CX",
          ic: "tractor",
          orig: "Tanque interno",
          hor: "1.895",
          l: "85 L",
          rl: "R$ 5,84",
          v: "R$ 496",
        },
        {
          data: "05/07",
          eq: "Pá Carregadeira XCMG",
          ic: "forklift",
          orig: "Tanque interno",
          hor: "1.004",
          l: "95 L",
          rl: "R$ 5,84",
          v: "R$ 555",
        },
        {
          data: "04/07",
          eq: "Escavadeira CAT 320",
          ic: "truck",
          orig: "Posto Missões",
          hor: "4.203",
          l: "120 L",
          rl: "R$ 6,04",
          v: "R$ 725",
        },
        {
          data: "03/07",
          eq: "Rolo compactador CA25",
          ic: "tractor",
          orig: "Tanque interno",
          hor: "2.880",
          l: "60 L",
          rl: "R$ 5,84",
          v: "R$ 350",
        },
      ];
      const DSL_CONSUMO = [
        {
          eq: "Basculante 01",
          ic: "truck",
          v: "18,4 L/h",
          pct: 100,
        },
        {
          eq: "CAT 320",
          ic: "truck",
          v: "14,2 L/h",
          pct: 77,
        },
        {
          eq: "Pá XCMG",
          ic: "forklift",
          v: "11,5 L/h",
          pct: 63,
        },
        {
          eq: "Retro JCB 3CX",
          ic: "tractor",
          v: "9,8 L/h",
          pct: 53,
        },
        {
          eq: "Rolo CA25",
          ic: "tractor",
          v: "8,6 L/h",
          pct: 47,
        },
      ];
      function Diesel() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Diesel",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "julho/2025"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "fuel",
              },
              "Novo abastecimento",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
              style: {
                marginTop: 0,
              },
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Diesel no m\xEAs",
              value: "R$ 28.400",
              mono: true,
              warn: true,
              icon: "fuel",
              foot: /*#__PURE__*/ React.createElement(
                React.Fragment,
                null,
                "vs. junho ",
                /*#__PURE__*/ React.createElement(
                  "b",
                  {
                    style: {
                      color: "var(--down)",
                      fontWeight: 600,
                    },
                  },
                  "+9%",
                ),
              ),
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Litros no m\xEAs",
              value: "9.400",
              unit: "L",
              mono: true,
              icon: "gauge",
              foot: "42 abastecimentos",
              spark: [14, 15, 13, 16, 14, 17, 15, 18],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Pre\xE7o m\xE9dio do litro",
              value: "R$ 5,92",
              mono: true,
              icon: "dollar-sign",
              foot: "tanque R$ 5,84 \xB7 posto R$ 6,04",
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Consumo m\xE9dio",
              value: "13,8",
              unit: "L/h",
              mono: true,
              icon: "truck",
              foot: "frota em opera\xE7\xE3o",
              spark: [15, 14, 15, 13, 14, 13, 14, 12],
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Abastecimentos",
                  icon: "fuel",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "42 no m\xEAs"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-tablewrap rtg-tablewrap--wide",
                  },
                  /*#__PURE__*/ React.createElement(
                    "table",
                    {
                      className: "rtg-table",
                    },
                    /*#__PURE__*/ React.createElement(
                      "thead",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        null,
                        /*#__PURE__*/ React.createElement("th", null, "Data"),
                        /*#__PURE__*/ React.createElement("th", null, "Equipamento"),
                        /*#__PURE__*/ React.createElement("th", null, "Origem"),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Hor\xEDmetro",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Litros",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "R$/L",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Valor",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "tbody",
                      null,
                      DSL_ABAST.map((a, i) =>
                        /*#__PURE__*/ React.createElement(
                          "tr",
                          {
                            key: i,
                          },
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "mono",
                            },
                            a.data,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "rtg-eqcell",
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "atp-tile atp-tile--amber",
                                  style: {
                                    width: 26,
                                    height: 26,
                                  },
                                },
                                /*#__PURE__*/ React.createElement(Icon, {
                                  name: a.ic,
                                  size: 15,
                                }),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "nm",
                                },
                                a.eq,
                              ),
                            ),
                          ),
                          /*#__PURE__*/ React.createElement("td", null, a.orig),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            a.hor,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            a.l,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            a.rl,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            a.v,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Note,
                {
                  icon: "info",
                },
                "Cada abastecimento entra no c\xE1lculo do ",
                /*#__PURE__*/ React.createElement("b", null, "Custo da Hora"),
                " pelo hor\xEDmetro do equipamento. Compras de diesel aparecem em ",
                /*#__PURE__*/ React.createElement("b", null, "Financeiro \u203A Contas a pagar"),
                ".",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Consumo por equipamento",
                  icon: "gauge",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "L/h no m\xEAs"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    style: {
                      padding: "10px 18px 16px",
                    },
                  },
                  DSL_CONSUMO.map((c) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        key: c.eq,
                        style: {
                          padding: "10px 0",
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          },
                        },
                        /*#__PURE__*/ React.createElement(IconTile, {
                          icon: c.ic,
                          tone: "amber",
                          size: "sm",
                        }),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            style: {
                              flex: 1,
                              fontSize: 13.5,
                              fontWeight: 600,
                            },
                          },
                          c.eq,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-val",
                            style: {
                              fontSize: 12.5,
                            },
                          },
                          c.v,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            height: 5,
                            borderRadius: 3,
                            background: "var(--surface-2)",
                            marginTop: 8,
                          },
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          style: {
                            height: "100%",
                            width: c.pct + "%",
                            borderRadius: 3,
                            background:
                              "linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))",
                          },
                        }),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Tanque interno",
                  icon: "database",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      style: {
                        font: "600 23px/1 var(--font-mono)",
                      },
                    },
                    "1.230 L",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 12.5,
                        color: "var(--muted)",
                      },
                    },
                    "de 2.000 L \xB7 62%",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    style: {
                      height: 8,
                      borderRadius: 4,
                      background: "var(--surface-2)",
                      margin: "12px 0 10px",
                    },
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    style: {
                      height: "100%",
                      width: "62%",
                      borderRadius: 4,
                      background: "linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))",
                    },
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "var(--muted-2)",
                    },
                  },
                  "\xDAltima compra ",
                  /*#__PURE__*/ React.createElement(
                    "b",
                    {
                      style: {
                        color: "var(--fg)",
                        fontFamily: "var(--font-mono)",
                      },
                    },
                    "02/07",
                  ),
                  " \xB7 4.000 L \xB7 Posto Miss\xF5es",
                ),
              ),
            ),
          ),
        );
      }
      window.Diesel = Diesel;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Diesel.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/EquipamentosList.jsx
  try {
    (() => {
      /* Retaguarda — Equipamentos list (frota; filtro por situação). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, StatusChip, Badge, Button, Pill, Icon } = NS;
      const EQ_ROWS = [
        {
          id: "cat320",
          nome: "Escavadeira CAT 320",
          sub: "Caterpillar · 2019",
          ic: "truck",
          tipo: "Escavadeira",
          hor: "4.218",
          mes: "148 h",
          diesel: "14,2 L/h",
          prox: "em 82 h",
          st: "Em operação",
          tone: "success",
        },
        {
          id: "jcb",
          nome: "Retroescavadeira JCB 3CX",
          sub: "JCB · 2021",
          ic: "tractor",
          tipo: "Retroescavadeira",
          hor: "1.895",
          mes: "96 h",
          diesel: "9,8 L/h",
          prox: "em 105 h",
          st: "Em operação",
          tone: "success",
        },
        {
          id: "xcmg",
          nome: "Pá Carregadeira XCMG",
          sub: "XCMG LW300 · 2020",
          ic: "forklift",
          tipo: "Pá carregadeira",
          hor: "1.004",
          mes: "74 h",
          diesel: "11,5 L/h",
          prox: "vencida",
          proxLate: true,
          st: "Em manutenção",
          tone: "amber",
        },
        {
          id: "volvo",
          nome: "Escavadeira Volvo EC140",
          sub: "Volvo · 2017",
          ic: "truck",
          tipo: "Escavadeira",
          hor: "7.612",
          mes: "0 h",
          diesel: "15,1 L/h",
          prox: "em 12 h",
          st: "Em manutenção",
          tone: "amber",
        },
        {
          id: "basc01",
          nome: "Caminhão basculante 01",
          sub: "VW Constellation · 2018",
          ic: "truck",
          tipo: "Caminhão",
          hor: "2.138",
          mes: "58 h",
          diesel: "18,4 L/h",
          prox: "em 60 h",
          st: "Em operação",
          tone: "success",
        },
        {
          id: "basc02",
          nome: "Caminhão basculante 02",
          sub: "Mercedes Axor · 2015",
          ic: "truck",
          tipo: "Caminhão",
          hor: "3.410",
          mes: "0 h",
          diesel: "19,0 L/h",
          prox: "—",
          st: "Parado",
          tone: "neutral",
        },
        {
          id: "rolo",
          nome: "Rolo compactador CA25",
          sub: "Dynapac · 2016",
          ic: "tractor",
          tipo: "Compactador",
          hor: "2.880",
          mes: "22 h",
          diesel: "8,6 L/h",
          prox: "em 130 h",
          st: "Em operação",
          tone: "success",
        },
        {
          id: "prancha",
          nome: "Prancha de transporte",
          sub: "Randon · 2019",
          ic: "truck",
          tipo: "Implemento",
          hor: "—",
          mes: "16 h",
          diesel: "—",
          prox: "em 90 dias",
          st: "Em operação",
          tone: "success",
        },
      ];
      const EQ_FILTERS = [
        {
          id: "todos",
          label: "Todos",
        },
        {
          id: "Em operação",
          label: "Em operação",
          tone: "success",
        },
        {
          id: "Em manutenção",
          label: "Em manutenção",
          tone: "amber",
        },
        {
          id: "Parado",
          label: "Parados",
          tone: "neutral",
        },
      ];
      function EquipamentosList() {
        const [filter, setFilter] = React.useState("todos");
        const rows = filter === "todos" ? EQ_ROWS : EQ_ROWS.filter((r) => r.st === filter);
        const count = (id) =>
          id === "todos" ? EQ_ROWS.length : EQ_ROWS.filter((r) => r.st === id).length;
        const ledColor = (tone) =>
          tone === "success"
            ? "var(--success-fg)"
            : tone === "amber"
              ? "var(--amarelo)"
              : "var(--muted-2)";
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Equipamentos",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "14 na frota"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "file-plus",
              },
              "Novo equipamento",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-filters",
            },
            EQ_FILTERS.map((f) =>
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  key: f.id,
                  type: "button",
                  className: filter === f.id ? "rtg-filter is-active" : "rtg-filter",
                  onClick: () => setFilter(f.id),
                },
                f.tone &&
                  /*#__PURE__*/ React.createElement("span", {
                    className: "led",
                    style: {
                      color: ledColor(f.tone),
                    },
                  }),
                f.label,
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "ct",
                  },
                  count(f.id),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            Card,
            null,
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-tablewrap rtg-tablewrap--wide",
              },
              /*#__PURE__*/ React.createElement(
                "table",
                {
                  className: "rtg-table",
                },
                /*#__PURE__*/ React.createElement(
                  "thead",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "tr",
                    null,
                    /*#__PURE__*/ React.createElement("th", null, "Equipamento"),
                    /*#__PURE__*/ React.createElement("th", null, "Tipo"),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Hor\xEDmetro",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Horas (m\xEAs)",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Diesel m\xE9dio",
                    ),
                    /*#__PURE__*/ React.createElement("th", null, "Pr\xF3x. manuten\xE7\xE3o"),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Situa\xE7\xE3o",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "tbody",
                  null,
                  rows.map((r) =>
                    /*#__PURE__*/ React.createElement(
                      "tr",
                      {
                        key: r.id,
                      },
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "rtg-namecell",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "atp-tile atp-tile--amber",
                              style: {
                                width: 30,
                                height: 30,
                              },
                            },
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: r.ic,
                              size: 16,
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "nm",
                              },
                              r.nome,
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "sub",
                              },
                              r.sub,
                            ),
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          Badge,
                          {
                            tone: "neutral",
                          },
                          r.tipo,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.hor,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.mes,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.diesel,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "mono",
                          style: r.proxLate
                            ? {
                                color: "var(--danger-fg)",
                                fontWeight: 600,
                              }
                            : undefined,
                        },
                        r.prox,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r",
                        },
                        /*#__PURE__*/ React.createElement(
                          StatusChip,
                          {
                            tone: r.tone,
                            led: r.tone !== "neutral",
                          },
                          r.st,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.EquipamentosList = EquipamentosList;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/EquipamentosList.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Faturamento.jsx
  try {
    (() => {
      /* Retaguarda — Faturamento (NFs emitidas, OS a faturar, evolução mensal). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { KpiCard, Card, StatusChip, Button, Pill, Icon } = NS;
      const FAT_NFS = [
        {
          nf: "NF 1042",
          cli: "Construtora Vale Verde",
          os: "OS-021",
          em: "05/07",
          v: "R$ 12.400",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          nf: "NF 1041",
          cli: "Agro Vale Verde",
          os: "OS-024",
          em: "03/07",
          v: "R$ 9.600",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          nf: "NF 1038",
          cli: "Construtora Vale Verde",
          os: "OS-018",
          em: "28/06",
          v: "R$ 8.900",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          nf: "NF 1035",
          cli: "Essavado Ltda.",
          os: "OS-016",
          em: "20/06",
          v: "R$ 11.100",
          tone: "danger",
          icon: "circle-alert",
          st: "Vencida",
        },
        {
          nf: "NF 1029",
          cli: "Construtora Vale Verde",
          os: "OS-012",
          em: "05/06",
          v: "R$ 9.500",
          tone: "success",
          icon: "check",
          st: "Paga",
        },
        {
          nf: "NF 1021",
          cli: "Construtora Vale Verde",
          os: "OS-007",
          em: "20/05",
          v: "R$ 15.200",
          tone: "success",
          icon: "check",
          st: "Paga",
        },
      ];
      const FAT_PENDENTES = [
        {
          os: "OS-015",
          t: "Fundação de galpão — estacas",
          cli: "Metalúrgica Boa Vista",
          v: "R$ 19.800",
        },
        {
          os: "OS-011",
          t: "Limpeza de terreno",
          cli: "Construtora Sul",
          v: "R$ 6.400",
        },
      ];
      const FAT_MESES = [
        ["fev", 52],
        ["mar", 61],
        ["abr", 58],
        ["mai", 74],
        ["jun", 78],
        ["jul", 88],
      ];
      function Faturamento() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Faturamento",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "julho/2025"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "file-check",
              },
              "Emitir NF",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
              style: {
                marginTop: 0,
              },
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Faturado no m\xEAs",
              value: "R$ 86.200",
              mono: true,
              icon: "credit-card",
              trend: {
                dir: "up",
                value: "11%",
              },
              foot: "vs. junho",
              spark: [18, 16, 17, 12, 13, 9, 10, 5],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "NFs emitidas",
              value: "12",
              icon: "file-check",
              foot: "no m\xEAs",
              spark: [15, 14, 15, 12, 13, 10, 11, 8],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "A faturar",
              value: "R$ 26.200",
              mono: true,
              warn: true,
              icon: "clipboard-list",
              foot: "2 OS conclu\xEDdas sem NF",
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Ticket m\xE9dio",
              value: "R$ 7.183",
              mono: true,
              icon: "dollar-sign",
              foot: "por NF no m\xEAs",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Notas fiscais emitidas",
                  icon: "file-check",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "12 no m\xEAs"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-tablewrap",
                  },
                  /*#__PURE__*/ React.createElement(
                    "table",
                    {
                      className: "rtg-table",
                    },
                    /*#__PURE__*/ React.createElement(
                      "thead",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        null,
                        /*#__PURE__*/ React.createElement("th", null, "NF"),
                        /*#__PURE__*/ React.createElement("th", null, "Cliente"),
                        /*#__PURE__*/ React.createElement("th", null, "OS"),
                        /*#__PURE__*/ React.createElement("th", null, "Emiss\xE3o"),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Valor",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Situa\xE7\xE3o",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "tbody",
                      null,
                      FAT_NFS.map((n) =>
                        /*#__PURE__*/ React.createElement(
                          "tr",
                          {
                            key: n.nf,
                          },
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "rtg-doc",
                              },
                              n.nf,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement("td", null, n.cli),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "rtg-ostag",
                              },
                              n.os,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "mono",
                            },
                            n.em,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            n.v,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r",
                            },
                            /*#__PURE__*/ React.createElement(
                              StatusChip,
                              {
                                tone: n.tone,
                                led: n.led,
                                icon: n.icon,
                              },
                              n.st,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "A faturar",
                  icon: "clipboard-list",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "R$ 26.200"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-clist",
                  },
                  FAT_PENDENTES.map((p) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "rtg-crow",
                        key: p.os,
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "rtg-ostag",
                        },
                        p.os,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cb",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "ct",
                          },
                          p.t,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "cm",
                          },
                          p.cli,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cv",
                        },
                        p.v,
                      ),
                      /*#__PURE__*/ React.createElement(
                        Button,
                        {
                          size: "sm",
                          variant: "ghost",
                          icon: "file-check",
                        },
                        "Emitir",
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Faturamento por m\xEAs",
                  icon: "bar-chart",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-bars-wrap",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-bars",
                    },
                    FAT_MESES.map(([lbl, h], i) =>
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-barcol",
                          key: lbl,
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          className: i === FAT_MESES.length - 1 ? "rtg-bar hi" : "rtg-bar",
                          style: {
                            height: h + "%",
                          },
                        }),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-barlbl",
                          },
                          lbl,
                        ),
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-bars-meta",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "M\xE9dia ",
                      /*#__PURE__*/ React.createElement("b", null, "R$ 71.400"),
                      "/m\xEAs",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "Pico ",
                      /*#__PURE__*/ React.createElement("b", null, "R$ 86.200"),
                      " (jul)",
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.Faturamento = Faturamento;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Faturamento.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Financeiro.jsx
  try {
    (() => {
      /* Retaguarda — Financeiro (contas a receber / a pagar, comprovantes). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { KpiCard, Card, StatusChip, Button, Pill, IconTile, Icon } = NS;
      const FIN_RECEBER = [
        {
          doc: "NF 1042",
          cli: "Construtora Vale Verde",
          em: "05/07",
          vc: "20/07",
          v: "R$ 12.400",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "NF 1041",
          cli: "Agro Vale Verde",
          em: "03/07",
          vc: "18/07",
          v: "R$ 9.600",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "NF 1038",
          cli: "Construtora Vale Verde",
          em: "28/06",
          vc: "12/07",
          v: "R$ 8.900",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "NF 1035",
          cli: "Essavado Ltda.",
          em: "20/06",
          vc: "05/07",
          v: "R$ 11.100",
          tone: "danger",
          icon: "circle-alert",
          st: "Vencido",
        },
        {
          doc: "NF 1033",
          cli: "Construtora Sul",
          em: "18/06",
          vc: "02/07",
          v: "R$ 7.800",
          tone: "danger",
          icon: "circle-alert",
          st: "Vencido",
        },
        {
          doc: "NF 1029",
          cli: "Construtora Vale Verde",
          em: "05/06",
          vc: "20/06",
          v: "R$ 9.500",
          tone: "success",
          icon: "check",
          st: "Pago",
        },
      ];
      const FIN_PAGAR = [
        {
          doc: "BOL 8821",
          forn: "Posto Missões — diesel",
          ic: "fuel",
          vc: "15/07",
          v: "R$ 14.300",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "NF 5540",
          forn: "Peças CAT — manutenção",
          ic: "wrench",
          vc: "22/07",
          v: "R$ 6.850",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "FOLHA 07",
          forn: "Folha — operadores",
          ic: "hard-hat",
          vc: "30/07",
          v: "R$ 31.200",
          tone: "amber",
          led: true,
          st: "A vencer",
        },
        {
          doc: "AP 2207",
          forn: "Seguro da frota",
          ic: "truck",
          vc: "02/07",
          v: "R$ 4.980",
          tone: "success",
          icon: "check",
          st: "Pago",
        },
      ];
      const FIN_COMP = [
        {
          icon: "credit-card",
          t: "PIX recebido — NF 1029",
          m: "20/06 · 14:22",
          v: "R$ 9.500",
        },
        {
          icon: "landmark",
          t: "TED recebida — NF 1021",
          m: "04/06 · 09:10",
          v: "R$ 15.200",
        },
        {
          icon: "link",
          t: "Boleto pago — NF 1015",
          m: "22/05 · 16:40",
          v: "R$ 7.300",
        },
      ];
      const FIN_FORMAS = [
        {
          icon: "credit-card",
          t: "PIX",
          m: "12 recebimentos",
          v: "R$ 38.400",
        },
        {
          icon: "landmark",
          t: "TED",
          m: "5 recebimentos",
          v: "R$ 29.100",
        },
        {
          icon: "link",
          t: "Boleto",
          m: "7 recebimentos",
          v: "R$ 18.700",
        },
      ];
      function Financeiro() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Financeiro",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "julho/2025"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "file-plus",
              },
              "Novo lan\xE7amento",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
              style: {
                marginTop: 0,
              },
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "A receber",
              value: "R$ 61.900",
              mono: true,
              warn: true,
              icon: "hand-coins",
              foot: /*#__PURE__*/ React.createElement(
                React.Fragment,
                null,
                "5 t\xEDtulos \xB7 ",
                /*#__PURE__*/ React.createElement(
                  "b",
                  {
                    style: {
                      color: "var(--danger-fg)",
                      fontWeight: 600,
                    },
                  },
                  "2 vencidos",
                ),
              ),
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "A pagar",
              value: "R$ 52.350",
              mono: true,
              icon: "wallet",
              foot: "3 t\xEDtulos at\xE9 30/07",
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Recebido no m\xEAs",
              value: "R$ 86.200",
              mono: true,
              icon: "credit-card",
              trend: {
                dir: "up",
                value: "11%",
              },
              foot: "vs. junho",
              spark: [18, 16, 17, 12, 13, 9, 10, 5],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Saldo do m\xEAs",
              value: "R$ 33.850",
              mono: true,
              icon: "trending-up",
              foot: "recebido \u2212 pago",
              spark: [16, 15, 14, 12, 11, 9, 8, 6],
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Contas a receber",
                  icon: "hand-coins",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "R$ 61.900 em aberto"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-tablewrap rtg-tablewrap--wide",
                  },
                  /*#__PURE__*/ React.createElement(
                    "table",
                    {
                      className: "rtg-table",
                    },
                    /*#__PURE__*/ React.createElement(
                      "thead",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        null,
                        /*#__PURE__*/ React.createElement("th", null, "Documento"),
                        /*#__PURE__*/ React.createElement("th", null, "Cliente"),
                        /*#__PURE__*/ React.createElement("th", null, "Emiss\xE3o"),
                        /*#__PURE__*/ React.createElement("th", null, "Vencimento"),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Valor",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Situa\xE7\xE3o",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "tbody",
                      null,
                      FIN_RECEBER.map((n) =>
                        /*#__PURE__*/ React.createElement(
                          "tr",
                          {
                            key: n.doc,
                          },
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "rtg-doc",
                              },
                              n.doc,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement("td", null, n.cli),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "mono",
                            },
                            n.em,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "mono",
                            },
                            n.vc,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            n.v,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r",
                            },
                            /*#__PURE__*/ React.createElement(
                              StatusChip,
                              {
                                tone: n.tone,
                                led: n.led,
                                icon: n.icon,
                              },
                              n.st,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Contas a pagar",
                  icon: "wallet",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "R$ 52.350 em aberto"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-tablewrap rtg-tablewrap--wide",
                  },
                  /*#__PURE__*/ React.createElement(
                    "table",
                    {
                      className: "rtg-table",
                    },
                    /*#__PURE__*/ React.createElement(
                      "thead",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        null,
                        /*#__PURE__*/ React.createElement("th", null, "Documento"),
                        /*#__PURE__*/ React.createElement("th", null, "Fornecedor"),
                        /*#__PURE__*/ React.createElement("th", null, "Vencimento"),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Valor",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Situa\xE7\xE3o",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "tbody",
                      null,
                      FIN_PAGAR.map((n) =>
                        /*#__PURE__*/ React.createElement(
                          "tr",
                          {
                            key: n.doc,
                          },
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "rtg-doc",
                              },
                              n.doc,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "rtg-eqcell",
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "atp-tile atp-tile--amber",
                                  style: {
                                    width: 26,
                                    height: 26,
                                  },
                                },
                                /*#__PURE__*/ React.createElement(Icon, {
                                  name: n.ic,
                                  size: 15,
                                }),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "nm",
                                },
                                n.forn,
                              ),
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "mono",
                            },
                            n.vc,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            n.v,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r",
                            },
                            /*#__PURE__*/ React.createElement(
                              StatusChip,
                              {
                                tone: n.tone,
                                led: n.led,
                                icon: n.icon,
                              },
                              n.st,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Recebimentos por forma",
                  icon: "credit-card",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "24 no m\xEAs"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-clist",
                  },
                  FIN_FORMAS.map((o) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "rtg-crow",
                        key: o.t,
                      },
                      /*#__PURE__*/ React.createElement(IconTile, {
                        icon: o.icon,
                        tone: "amber",
                        size: "md",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cb",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "ct",
                          },
                          o.t,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "cm",
                          },
                          o.m,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cv",
                        },
                        o.v,
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Comprovantes recentes",
                  icon: "receipt",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-clist",
                  },
                  FIN_COMP.map((o) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "rtg-crow",
                        key: o.t,
                      },
                      /*#__PURE__*/ React.createElement(IconTile, {
                        icon: o.icon,
                        tone: "amber",
                        size: "md",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cb",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "ct",
                          },
                          o.t,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "cm",
                          },
                          o.m,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cv",
                        },
                        o.v,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.Financeiro = Financeiro;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Financeiro.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Header.jsx
  try {
    (() => {
      /* Retaguarda — sticky top header (breadcrumbs + AI + theme + user). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Button, IconButton, Avatar, Icon } = NS;
      function Header({ crumbs }) {
        return /*#__PURE__*/ React.createElement(
          "header",
          {
            className: "rtg-header",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-crumbs",
            },
            crumbs.map((c, i) =>
              /*#__PURE__*/ React.createElement(
                React.Fragment,
                {
                  key: i,
                },
                i > 0 &&
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "sep",
                    },
                    /*#__PURE__*/ React.createElement(Icon, {
                      name: "chevron-right",
                      size: 15,
                    }),
                  ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: c.here ? "here" : "",
                  },
                  c.label,
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement("div", {
            className: "rtg-spacer",
          }),
          /*#__PURE__*/ React.createElement(
            Button,
            {
              variant: "ai",
              icon: "sparkles",
            },
            "Perguntar \xE0 IA",
          ),
          /*#__PURE__*/ React.createElement(IconButton, {
            icon: "sun",
            label: "Tema claro",
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-user",
            },
            /*#__PURE__*/ React.createElement(Avatar, {
              initials: "AA",
              size: 28,
            }),
            " ",
            /*#__PURE__*/ React.createElement("b", null, "Admin AILA"),
          ),
        );
      }
      window.Header = Header;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Header.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Manutencao.jsx
  try {
    (() => {
      /* Retaguarda — Manutenção (ordens de manutenção + planos por horímetro). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { KpiCard, Card, StatusChip, Badge, Button, Pill, IconTile, Icon, Note } = NS;
      const MNT_ORDENS = [
        {
          data: "08/07",
          eq: "Pá Carregadeira XCMG",
          ic: "forklift",
          tipo: "Corretiva",
          t: "Vazamento no comando hidráulico",
          custo: "R$ 3.400",
          st: "Em andamento",
          tone: "amber",
        },
        {
          data: "07/07",
          eq: "Escavadeira Volvo EC140",
          ic: "truck",
          tipo: "Preventiva",
          t: "Plano 7.500 h — filtros e óleos",
          custo: "R$ 2.750",
          st: "Em andamento",
          tone: "amber",
        },
        {
          data: "15/07",
          eq: "Retroescavadeira JCB 3CX",
          ic: "tractor",
          tipo: "Preventiva",
          t: "Plano 2.000 h — revisão geral",
          custo: "—",
          st: "Agendada",
          tone: "info",
        },
        {
          data: "02/07",
          eq: "Escavadeira CAT 320",
          ic: "truck",
          tipo: "Preventiva",
          t: "Plano 4.200 h — filtros e graxa",
          custo: "R$ 1.850",
          st: "Concluída",
          tone: "success",
        },
        {
          data: "26/06",
          eq: "Caminhão basculante 01",
          ic: "truck",
          tipo: "Corretiva",
          t: "Troca de embreagem",
          custo: "R$ 3.850",
          st: "Concluída",
          tone: "success",
        },
      ];
      const MNT_PLANOS = [
        {
          eq: "Pá Carregadeira XCMG",
          ic: "forklift",
          m: "plano 1.000 h",
          v: "vencida",
          late: true,
        },
        {
          eq: "Escavadeira Volvo EC140",
          ic: "truck",
          m: "plano 7.500 h",
          v: "em 12 h",
          late: false,
        },
        {
          eq: "Escavadeira CAT 320",
          ic: "truck",
          m: "plano 4.300 h",
          v: "em 82 h",
          late: false,
        },
        {
          eq: "Retroescavadeira JCB 3CX",
          ic: "tractor",
          m: "plano 2.000 h",
          v: "em 105 h",
          late: false,
        },
        {
          eq: "Rolo compactador CA25",
          ic: "tractor",
          m: "plano 3.000 h",
          v: "em 130 h",
          late: false,
        },
      ];
      function Manutencao() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Manuten\xE7\xE3o",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "julho/2025"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "wrench",
              },
              "Nova manuten\xE7\xE3o",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
              style: {
                marginTop: 0,
              },
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Manuten\xE7\xF5es no m\xEAs",
              value: "6",
              icon: "wrench",
              foot: "4 preventivas \xB7 2 corretivas",
              spark: [12, 13, 11, 14, 12, 13, 12, 14],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Custo de manuten\xE7\xE3o",
              value: "R$ 11.850",
              mono: true,
              warn: true,
              icon: "calculator",
              foot: /*#__PURE__*/ React.createElement(
                React.Fragment,
                null,
                "vs. junho ",
                /*#__PURE__*/ React.createElement(
                  "b",
                  {
                    style: {
                      color: "var(--down)",
                      fontWeight: 600,
                    },
                  },
                  "+14%",
                ),
              ),
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Em manuten\xE7\xE3o",
              value: "2",
              icon: "truck",
              foot: "XCMG \xB7 Volvo EC140",
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Planos a vencer",
              value: "2",
              icon: "gauge",
              foot: /*#__PURE__*/ React.createElement(
                React.Fragment,
                null,
                "pr\xF3ximas 50 h \xB7 ",
                /*#__PURE__*/ React.createElement(
                  "b",
                  {
                    style: {
                      color: "var(--danger-fg)",
                      fontWeight: 600,
                    },
                  },
                  "1 vencido",
                ),
              ),
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Ordens de manuten\xE7\xE3o",
                  icon: "wrench",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "6 no m\xEAs"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-tablewrap rtg-tablewrap--wide",
                  },
                  /*#__PURE__*/ React.createElement(
                    "table",
                    {
                      className: "rtg-table",
                    },
                    /*#__PURE__*/ React.createElement(
                      "thead",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        null,
                        /*#__PURE__*/ React.createElement("th", null, "Data"),
                        /*#__PURE__*/ React.createElement("th", null, "Equipamento"),
                        /*#__PURE__*/ React.createElement("th", null, "Tipo"),
                        /*#__PURE__*/ React.createElement("th", null, "Descri\xE7\xE3o"),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Custo",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Situa\xE7\xE3o",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "tbody",
                      null,
                      MNT_ORDENS.map((r, i) =>
                        /*#__PURE__*/ React.createElement(
                          "tr",
                          {
                            key: i,
                          },
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "mono",
                            },
                            r.data,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "rtg-eqcell",
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "atp-tile atp-tile--amber",
                                  style: {
                                    width: 26,
                                    height: 26,
                                  },
                                },
                                /*#__PURE__*/ React.createElement(Icon, {
                                  name: r.ic,
                                  size: 15,
                                }),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "nm",
                                },
                                r.eq,
                              ),
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              Badge,
                              {
                                tone: r.tipo === "Corretiva" ? "gold" : "neutral",
                              },
                              r.tipo,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement("td", null, r.t),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.custo,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r",
                            },
                            /*#__PURE__*/ React.createElement(
                              StatusChip,
                              {
                                tone: r.tone,
                                led: true,
                              },
                              r.st,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Note,
                {
                  icon: "info",
                },
                "Manuten\xE7\xF5es alimentam o ",
                /*#__PURE__*/ React.createElement("b", null, "Custo da Hora"),
                " do equipamento; o alerta antecipado de ",
                /*#__PURE__*/ React.createElement("b", null, "50 h"),
                " \xE9 definido em ",
                /*#__PURE__*/ React.createElement("b", null, "Par\xE2metros"),
                ".",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Planos por hor\xEDmetro",
                  icon: "gauge",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "5 planos"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-clist",
                  },
                  MNT_PLANOS.map((p) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "rtg-crow",
                        key: p.eq,
                      },
                      /*#__PURE__*/ React.createElement(IconTile, {
                        icon: p.ic,
                        tone: "amber",
                        size: "md",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "cb",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "ct",
                          },
                          p.eq,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "cm",
                          },
                          p.m,
                        ),
                      ),
                      p.late
                        ? /*#__PURE__*/ React.createElement(
                            StatusChip,
                            {
                              tone: "danger",
                              icon: "circle-alert",
                            },
                            "Vencida",
                          )
                        : /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "rtg-val",
                              style: {
                                fontSize: 12.5,
                              },
                            },
                            p.v,
                          ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.Manutencao = Manutencao;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Manutencao.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/OSList.jsx
  try {
    (() => {
      /* Retaguarda — Ordens de Serviço list (filter by status via the chips). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, StatusChip, Button, Pill, IconTile, Icon } = NS;
      const OS_ROWS = [
        {
          n: "OS-024",
          t: "Nivelamento de pátio",
          cli: "Agro Vale Verde",
          op: "Adelar Machado",
          eq: "Pá Carregadeira XCMG",
          eqIcon: "forklift",
          h: "8 h",
          per: "desde 05/07",
          v: "R$ 9.600",
          st: "Aberta",
          tone: "info",
        },
        {
          n: "OS-021",
          t: "Terraplenagem — lote industrial",
          cli: "Construtora Vale Verde",
          op: "Adelar Machado",
          eq: "Escavadeira CAT 320",
          eqIcon: "truck",
          h: "62 h",
          per: "desde 01/07",
          v: "R$ 24.800",
          st: "Em andamento",
          tone: "amber",
        },
        {
          n: "OS-019",
          t: "Abertura de acesso e drenagem",
          cli: "Construtora Sul",
          op: "Vilson Prediger",
          eq: "Retroescavadeira JCB 3CX",
          eqIcon: "tractor",
          h: "28 h",
          per: "desde 24/06",
          v: "R$ 11.200",
          st: "Em andamento",
          tone: "amber",
        },
        {
          n: "OS-018",
          t: "Abertura de acesso e drenagem",
          cli: "Essavado Ltda.",
          op: "Nelson Kunz",
          eq: "Escavadeira CAT 320",
          eqIcon: "truck",
          h: "40 h",
          per: "desde 20/06",
          v: "R$ 16.200",
          st: "Em andamento",
          tone: "amber",
        },
        {
          n: "OS-015",
          t: "Fundação de galpão — estacas",
          cli: "Metalúrgica Boa Vista",
          op: "Adelar Machado",
          eq: "Escavadeira CAT 320",
          eqIcon: "truck",
          h: "44 h",
          per: "06–20/06",
          v: "R$ 19.800",
          st: "Concluída",
          tone: "success",
        },
        {
          n: "OS-012",
          t: "Fundação de galpão — estacas",
          cli: "Construtora Vale Verde",
          op: "Vilson Prediger",
          eq: "Retroescavadeira JCB 3CX",
          eqIcon: "tractor",
          h: "88 h",
          per: "02–24/05",
          v: "R$ 41.000",
          st: "Concluída",
          tone: "success",
        },
        {
          n: "OS-007",
          t: "Nivelamento de pátio",
          cli: "Construtora Vale Verde",
          op: "Nelson Kunz",
          eq: "Pá Carregadeira XCMG",
          eqIcon: "forklift",
          h: "30 h",
          per: "08–19/04",
          v: "R$ 12.500",
          st: "Concluída",
          tone: "success",
        },
      ];
      const OS_FILTERS = [
        {
          id: "todas",
          label: "Todas",
        },
        {
          id: "Aberta",
          label: "Abertas",
          tone: "info",
        },
        {
          id: "Em andamento",
          label: "Em andamento",
          tone: "amber",
        },
        {
          id: "Concluída",
          label: "Concluídas",
          tone: "success",
        },
      ];
      function OSList() {
        const [filter, setFilter] = React.useState("todas");
        const rows = filter === "todas" ? OS_ROWS : OS_ROWS.filter((r) => r.st === filter);
        const count = (id) =>
          id === "todas" ? OS_ROWS.length : OS_ROWS.filter((r) => r.st === id).length;
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Ordens de Servi\xE7o",
            ),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "file-plus",
              },
              "Nova OS",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-filters",
            },
            OS_FILTERS.map((f) =>
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  key: f.id,
                  type: "button",
                  className: filter === f.id ? "rtg-filter is-active" : "rtg-filter",
                  onClick: () => setFilter(f.id),
                },
                f.tone &&
                  /*#__PURE__*/ React.createElement("span", {
                    className: "led",
                    style: {
                      color: `var(--${f.tone === "amber" ? "amarelo" : f.tone === "info" ? "info-fg" : "success-fg"})`,
                    },
                  }),
                f.label,
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "ct",
                  },
                  count(f.id),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            Card,
            null,
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-tablewrap rtg-tablewrap--wide",
              },
              /*#__PURE__*/ React.createElement(
                "table",
                {
                  className: "rtg-table",
                },
                /*#__PURE__*/ React.createElement(
                  "thead",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "tr",
                    null,
                    /*#__PURE__*/ React.createElement("th", null, "OS"),
                    /*#__PURE__*/ React.createElement("th", null, "Servi\xE7o"),
                    /*#__PURE__*/ React.createElement("th", null, "Cliente"),
                    /*#__PURE__*/ React.createElement("th", null, "Equipamento"),
                    /*#__PURE__*/ React.createElement("th", null, "Operador"),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Horas",
                    ),
                    /*#__PURE__*/ React.createElement("th", null, "Per\xEDodo"),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Valor",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Situa\xE7\xE3o",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "tbody",
                  null,
                  rows.map((r) =>
                    /*#__PURE__*/ React.createElement(
                      "tr",
                      {
                        key: r.n,
                      },
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-ostag",
                          },
                          r.n,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          style: {
                            fontWeight: 600,
                          },
                        },
                        r.t,
                      ),
                      /*#__PURE__*/ React.createElement("td", null, r.cli),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "rtg-eqcell",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "atp-tile atp-tile--amber",
                              style: {
                                width: 26,
                                height: 26,
                              },
                            },
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: r.eqIcon,
                              size: 15,
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "nm",
                            },
                            r.eq,
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement("td", null, r.op),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.h,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "mono",
                        },
                        r.per,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.v,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r",
                        },
                        /*#__PURE__*/ React.createElement(
                          StatusChip,
                          {
                            tone: r.tone,
                            led: true,
                          },
                          r.st,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.OSList = OSList;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/OSList.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/OperadorDetail.jsx
  try {
    (() => {
      /* Retaguarda — Operador detail (recreation of mock-detalhe-operador). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Avatar, Badge, Button, KpiCard, Card, StatusChip, DataRow, Chip, Note, Pill, Icon } =
        NS;
      const OP_APONT = [
        {
          data: "09/07",
          eq: "Escavadeira CAT 320",
          eqIcon: "truck",
          h0: "4.210",
          h1: "4.218",
          hrs: "8,0 h",
          os: "OS-021",
        },
        {
          data: "08/07",
          eq: "Escavadeira CAT 320",
          eqIcon: "truck",
          h0: "4.203",
          h1: "4.210",
          hrs: "7,5 h",
          os: "OS-021",
        },
        {
          data: "07/07",
          eq: "Retroescavadeira JCB 3CX",
          eqIcon: "tractor",
          h0: "1.882",
          h1: "1.888",
          hrs: "6,0 h",
          os: "OS-019",
        },
        {
          data: "05/07",
          eq: "Pá Carregadeira XCMG",
          eqIcon: "forklift",
          h0: "990",
          h1: "998",
          hrs: "8,0 h",
          os: "OS-024",
        },
        {
          data: "04/07",
          eq: "Escavadeira CAT 320",
          eqIcon: "truck",
          h0: "4.195",
          h1: "4.203",
          hrs: "8,0 h",
          os: "OS-021",
        },
      ];
      const OP_OS = [
        {
          n: "OS-021",
          t: "Terraplenagem — lote industrial",
          cli: "Essavado Ltda.",
          h: "62 h",
          d: "desde 01/07",
          tone: "amber",
          st: "Em andamento",
          led: true,
        },
        {
          n: "OS-019",
          t: "Abertura de acesso e drenagem",
          cli: "Construtora Sul",
          h: "28 h",
          d: "desde 24/06",
          tone: "amber",
          st: "Em andamento",
          led: true,
        },
        {
          n: "OS-024",
          t: "Nivelamento de pátio",
          cli: "Agro Vale Verde",
          h: "8 h",
          d: "desde 05/07",
          tone: "info",
          st: "Aberta",
          led: true,
        },
        {
          n: "OS-015",
          t: "Fundação de galpão — estacas",
          cli: "Metalúrgica Boa Vista",
          h: "44 h",
          d: "06–20/06",
          tone: "success",
          st: "Concluída",
          led: true,
        },
      ];
      const OP_BARS = [
        ["S1", 62],
        ["S2", 71],
        ["S3", 56],
        ["S4", 80],
        ["S5", 68],
        ["S6", 76],
        ["S7", 64],
        ["S8", 92],
      ];
      const OP_EQUIP = [
        ["truck", "Escavadeira CAT 320"],
        ["tractor", "Retro JCB 3CX"],
        ["forklift", "Pá XCMG"],
        ["truck", "Basculante"],
      ];
      function OperadorDetail({ operador, onBack }) {
        const o = operador || window.RTG.operadores[0];
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "button",
            {
              className: "rtg-back",
              onClick: onBack,
            },
            /*#__PURE__*/ React.createElement(Icon, {
              name: "arrow-left",
              size: 16,
            }),
            " Operadores",
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-hero",
            },
            /*#__PURE__*/ React.createElement(Avatar, {
              initials: o.iniciais,
              size: 78,
              shape: "square",
              tone: "brand",
            }),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-hero-main",
              },
              /*#__PURE__*/ React.createElement("h1", null, o.nome),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-hero-sub",
                },
                o.ativo
                  ? /*#__PURE__*/ React.createElement(
                      Badge,
                      {
                        tone: "active",
                        led: true,
                      },
                      "Ativo",
                    )
                  : /*#__PURE__*/ React.createElement(
                      Badge,
                      {
                        tone: "neutral",
                        led: true,
                      },
                      "Inativo",
                    ),
                /*#__PURE__*/ React.createElement(
                  Badge,
                  {
                    tone: "neutral",
                    icon: "briefcase",
                  },
                  "Operador \xB7 ",
                  o.vinculo,
                ),
                o.app
                  ? /*#__PURE__*/ React.createElement(
                      Badge,
                      {
                        tone: "info",
                        icon: "smartphone",
                      },
                      "Acesso ao app",
                    )
                  : /*#__PURE__*/ React.createElement(
                      Badge,
                      {
                        tone: "neutral",
                        icon: "smartphone",
                      },
                      "Sem acesso ao app",
                    ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-qf",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "CPF",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v mono",
                    },
                    o.doc,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "Telefone",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v mono",
                    },
                    o.telefone,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "Operador desde",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v",
                    },
                    o.desde || "mar/2021 · 4 anos",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "\xDAltima atividade",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v",
                    },
                    o.ultimaAtividade || "Hoje, 07:42",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-hero-actions",
              },
              /*#__PURE__*/ React.createElement(
                Button,
                {
                  variant: "ghost",
                  icon: "pencil",
                },
                "Editar",
              ),
              /*#__PURE__*/ React.createElement(
                Button,
                {
                  variant: "wa",
                  icon: "message-circle",
                },
                "WhatsApp",
              ),
              /*#__PURE__*/ React.createElement(
                Button,
                {
                  variant: "danger",
                  icon: "ban",
                },
                "Inativar",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Horas apontadas",
              value: o.horas || "182",
              unit: "h",
              icon: "clock",
              trend: {
                dir: "up",
                value: "12%",
              },
              foot: "vs. junho",
              spark: [20, 17, 19, 12, 14, 8, 10, 4],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "OS ativas",
              value: String(o.osAtivas ?? 3),
              icon: "clipboard-list",
              foot: "2 em andamento \xB7 1 aberta",
              spark: [14, 15, 10, 12, 9, 11, 7, 8],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "OS conclu\xEDdas",
              value: String(o.osConcluidas ?? 17),
              icon: "circle-check-big",
              trend: {
                dir: "up",
                value: "3",
              },
              foot: "no m\xEAs",
              spark: [22, 18, 16, 17, 11, 13, 7, 5],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Equipamentos",
              value: String(o.equipamentos ?? 4),
              icon: "truck",
              foot: "operados no per\xEDodo",
              spark: [16, 16, 13, 13, 10, 10, 8, 8],
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Apontamentos recentes",
                  icon: "gauge",
                  headerRight: /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "rtg-link",
                    },
                    "Ver todos ",
                    /*#__PURE__*/ React.createElement(Icon, {
                      name: "chevron-right",
                      size: 14,
                    }),
                  ),
                },
                /*#__PURE__*/ React.createElement(
                  "table",
                  {
                    className: "rtg-table",
                  },
                  /*#__PURE__*/ React.createElement(
                    "thead",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "tr",
                      null,
                      /*#__PURE__*/ React.createElement("th", null, "Data"),
                      /*#__PURE__*/ React.createElement("th", null, "Equipamento"),
                      /*#__PURE__*/ React.createElement("th", null, "Hor\xEDmetro"),
                      /*#__PURE__*/ React.createElement(
                        "th",
                        {
                          className: "r",
                        },
                        "Horas",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "th",
                        {
                          className: "r",
                        },
                        "OS",
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "tbody",
                    null,
                    OP_APONT.map((a, i) =>
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        {
                          key: i,
                        },
                        /*#__PURE__*/ React.createElement(
                          "td",
                          {
                            className: "mono",
                          },
                          a.data,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "td",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "rtg-eqcell",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "atp-tile atp-tile--amber",
                                style: {
                                  width: 26,
                                  height: 26,
                                },
                              },
                              /*#__PURE__*/ React.createElement(Icon, {
                                name: a.eqIcon,
                                size: 15,
                              }),
                            ),
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "nm",
                              },
                              a.eq,
                            ),
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "td",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "rtg-horim",
                            },
                            /*#__PURE__*/ React.createElement("b", null, a.h0),
                            " \u2192 ",
                            /*#__PURE__*/ React.createElement("b", null, a.h1),
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "td",
                          {
                            className: "r",
                            style: {
                              fontWeight: 600,
                            },
                          },
                          a.hrs,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "td",
                          {
                            className: "r",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "rtg-ostag",
                            },
                            a.os,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Ordens de Servi\xE7o",
                  icon: "clipboard-list",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "4 vinculadas"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-oslist",
                  },
                  OP_OS.map((s) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "rtg-osrow",
                        key: s.n,
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "rtg-osnum",
                        },
                        s.n,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-osbody",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "t",
                          },
                          s.t,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "m",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: "user",
                              size: 12,
                            }),
                            " ",
                            s.cli,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: "clock",
                              size: 12,
                            }),
                            " ",
                            s.h,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: "calendar",
                              size: 12,
                            }),
                            " ",
                            s.d,
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-osend",
                        },
                        /*#__PURE__*/ React.createElement(
                          StatusChip,
                          {
                            tone: s.tone,
                            led: s.led,
                          },
                          s.st,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Dados cadastrais",
                  icon: "contact",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "id-card",
                    label: "CNH",
                  },
                  o.cnh || "Categoria E · válida até 03/2028",
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "cake",
                    label: "Nascimento",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    o.nascimento || "14/09/1985 · 39 anos",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "briefcase",
                    label: "V\xEDnculo",
                  },
                  o.vinculo,
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "admiss\xE3o mar/2021"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "phone",
                    label: "Telefone",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    o.telefone,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "map-pin",
                    label: "Base",
                  },
                  o.base,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Horas por semana",
                  icon: "bar-chart",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-bars-wrap",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-bars",
                    },
                    OP_BARS.map(([lbl, h], i) =>
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-barcol",
                          key: lbl,
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          className: i === OP_BARS.length - 1 ? "rtg-bar hi" : "rtg-bar",
                          style: {
                            height: h + "%",
                          },
                        }),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-barlbl",
                          },
                          lbl,
                        ),
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-bars-meta",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "M\xE9dia ",
                      /*#__PURE__*/ React.createElement("b", null, "42 h"),
                      "/semana",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "Pico ",
                      /*#__PURE__*/ React.createElement("b", null, "46 h"),
                      " (S8)",
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Equipamentos habilitados",
                  icon: "wrench",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-chips",
                  },
                  OP_EQUIP.map(([ic, nm], i) =>
                    /*#__PURE__*/ React.createElement(
                      Chip,
                      {
                        key: i,
                        icon: ic,
                      },
                      nm,
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Acesso ao app",
                  icon: "smartphone",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-appcard",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-appstatus",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "ico",
                      },
                      /*#__PURE__*/ React.createElement(Icon, {
                        name: "check",
                        size: 18,
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "tt",
                        },
                        "App liberado",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "ss",
                        },
                        "Login ativo no dispositivo",
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-appgrid",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "k",
                        },
                        "\xDAltimo acesso",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "v",
                        },
                        "Hoje, 07:42",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "k",
                        },
                        "Dispositivo",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "v",
                        },
                        "Android \xB7 Moto G",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "k",
                        },
                        "Vers\xE3o",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "v mono",
                        },
                        "v0.1 \xB7 funda\xE7\xE3o",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "k",
                        },
                        "Aponta via",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "v",
                        },
                        "App de campo",
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              style: {
                marginTop: 22,
              },
            },
            /*#__PURE__*/ React.createElement(
              Note,
              {
                icon: "lock",
                tone: "steel",
              },
              "Perfil operacional \u2014 sem dados financeiros. Custo-hora e valores ficam restritos \xE0s telas de ",
              /*#__PURE__*/ React.createElement("b", null, "Custo da Hora"),
              ", ",
              /*#__PURE__*/ React.createElement("b", null, "Financeiro"),
              " e ",
              /*#__PURE__*/ React.createElement("b", null, "Rentabilidade"),
              ", conforme o particionamento de acesso.",
            ),
          ),
        );
      }
      window.OperadorDetail = OperadorDetail;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/OperadorDetail.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/OperadoresList.jsx
  try {
    (() => {
      /* Retaguarda — Operadores list (click a row to open the detail). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, StatusChip, Badge, Avatar, Button } = NS;
      function OperadoresList({ onOpen }) {
        const rows = window.RTG.operadores;
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Operadores",
            ),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "file-plus",
              },
              "Novo operador",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            Card,
            null,
            /*#__PURE__*/ React.createElement(
              "table",
              {
                className: "rtg-table rtg-clickable",
              },
              /*#__PURE__*/ React.createElement(
                "thead",
                null,
                /*#__PURE__*/ React.createElement(
                  "tr",
                  null,
                  /*#__PURE__*/ React.createElement("th", null, "Operador"),
                  /*#__PURE__*/ React.createElement("th", null, "V\xEDnculo"),
                  /*#__PURE__*/ React.createElement("th", null, "Base"),
                  /*#__PURE__*/ React.createElement(
                    "th",
                    {
                      className: "r",
                    },
                    "Horas (m\xEAs)",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "th",
                    {
                      className: "r",
                    },
                    "App",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "th",
                    {
                      className: "r",
                    },
                    "Situa\xE7\xE3o",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "tbody",
                null,
                rows.map((o) =>
                  /*#__PURE__*/ React.createElement(
                    "tr",
                    {
                      key: o.id,
                      onClick: () => onOpen(o),
                    },
                    /*#__PURE__*/ React.createElement(
                      "td",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-namecell",
                        },
                        /*#__PURE__*/ React.createElement(Avatar, {
                          initials: o.iniciais,
                          size: 34,
                        }),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "nm",
                            },
                            o.nome,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "sub",
                            },
                            o.osAtivas,
                            " OS ativas",
                          ),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "td",
                      null,
                      /*#__PURE__*/ React.createElement(
                        Badge,
                        {
                          tone: "neutral",
                        },
                        o.vinculo,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement("td", null, o.base),
                    /*#__PURE__*/ React.createElement(
                      "td",
                      {
                        className: "r rtg-val",
                      },
                      o.horas,
                      " h",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "td",
                      {
                        className: "r",
                      },
                      o.app
                        ? /*#__PURE__*/ React.createElement(
                            StatusChip,
                            {
                              tone: "info",
                              led: true,
                            },
                            "Liberado",
                          )
                        : /*#__PURE__*/ React.createElement(
                            StatusChip,
                            {
                              tone: "neutral",
                            },
                            "Sem acesso",
                          ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "td",
                      {
                        className: "r",
                      },
                      o.ativo
                        ? /*#__PURE__*/ React.createElement(
                            StatusChip,
                            {
                              tone: "success",
                              led: true,
                            },
                            "Ativo",
                          )
                        : /*#__PURE__*/ React.createElement(
                            StatusChip,
                            {
                              tone: "neutral",
                            },
                            "Inativo",
                          ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.OperadoresList = OperadoresList;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/OperadoresList.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/OrcamentosList.jsx
  try {
    (() => {
      /* Retaguarda — Orçamentos (pipeline comercial; filtro por situação). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, StatusChip, Button, Pill } = NS;
      const ORC_ROWS = [
        {
          n: "ORC-055",
          t: "Terraplenagem — fase 2",
          cli: "Construtora Vale Verde",
          data: "02/07",
          val: "01/08",
          v: "R$ 58.000",
          st: "Aberto",
          tone: "info",
        },
        {
          n: "ORC-051",
          t: "Drenagem de acesso",
          cli: "Construtora Vale Verde",
          data: "24/06",
          val: "24/07",
          v: "R$ 22.400",
          st: "Aberto",
          tone: "info",
        },
        {
          n: "ORC-047",
          t: "Pátio de manobra",
          cli: "Construtora Vale Verde",
          data: "12/06",
          val: "12/07",
          v: "R$ 18.900",
          st: "Aberto",
          tone: "info",
        },
        {
          n: "ORC-042",
          t: "Acesso rural — cascalhamento",
          cli: "Agro Vale Verde",
          data: "28/05",
          val: "—",
          v: "R$ 12.600",
          st: "Aprovado",
          tone: "success",
        },
        {
          n: "ORC-039",
          t: "Fundação do anexo",
          cli: "Construtora Vale Verde",
          data: "20/04",
          val: "—",
          v: "R$ 41.000",
          st: "Aprovado",
          tone: "success",
        },
        {
          n: "ORC-030",
          t: "Limpeza de terreno",
          cli: "Construtora Vale Verde",
          data: "08/03",
          val: "—",
          v: "R$ 9.800",
          st: "Perdido",
          tone: "neutral",
        },
      ];
      const ORC_FILTERS = [
        {
          id: "todos",
          label: "Todos",
        },
        {
          id: "Aberto",
          label: "Abertos",
          tone: "info",
        },
        {
          id: "Aprovado",
          label: "Aprovados",
          tone: "success",
        },
        {
          id: "Perdido",
          label: "Perdidos",
          tone: "neutral",
        },
      ];
      function OrcamentosList() {
        const [filter, setFilter] = React.useState("todos");
        const rows = filter === "todos" ? ORC_ROWS : ORC_ROWS.filter((r) => r.st === filter);
        const count = (id) =>
          id === "todos" ? ORC_ROWS.length : ORC_ROWS.filter((r) => r.st === id).length;
        const ledColor = (tone) =>
          tone === "success"
            ? "var(--success-fg)"
            : tone === "info"
              ? "var(--info-fg)"
              : "var(--muted-2)";
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Or\xE7amentos",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "R$ 99.300 em aberto"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "file-plus",
              },
              "Novo or\xE7amento",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-filters",
            },
            ORC_FILTERS.map((f) =>
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  key: f.id,
                  type: "button",
                  className: filter === f.id ? "rtg-filter is-active" : "rtg-filter",
                  onClick: () => setFilter(f.id),
                },
                f.tone &&
                  /*#__PURE__*/ React.createElement("span", {
                    className: "led",
                    style: {
                      color: ledColor(f.tone),
                    },
                  }),
                f.label,
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "ct",
                  },
                  count(f.id),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            Card,
            null,
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-tablewrap",
              },
              /*#__PURE__*/ React.createElement(
                "table",
                {
                  className: "rtg-table",
                },
                /*#__PURE__*/ React.createElement(
                  "thead",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "tr",
                    null,
                    /*#__PURE__*/ React.createElement("th", null, "Or\xE7amento"),
                    /*#__PURE__*/ React.createElement("th", null, "Servi\xE7o"),
                    /*#__PURE__*/ React.createElement("th", null, "Cliente"),
                    /*#__PURE__*/ React.createElement("th", null, "Emiss\xE3o"),
                    /*#__PURE__*/ React.createElement("th", null, "Validade"),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Valor",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Situa\xE7\xE3o",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "tbody",
                  null,
                  rows.map((r) =>
                    /*#__PURE__*/ React.createElement(
                      "tr",
                      {
                        key: r.n,
                      },
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-doc",
                          },
                          r.n,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          style: {
                            fontWeight: 600,
                          },
                        },
                        r.t,
                      ),
                      /*#__PURE__*/ React.createElement("td", null, r.cli),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "mono",
                        },
                        r.data,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "mono",
                        },
                        r.val,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.v,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r",
                        },
                        /*#__PURE__*/ React.createElement(
                          StatusChip,
                          {
                            tone: r.tone,
                            led: r.tone !== "neutral",
                          },
                          r.st,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.OrcamentosList = OrcamentosList;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/OrcamentosList.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/PainelGerencial.jsx
  try {
    (() => {
      /* Retaguarda — Painel Gerencial (visão executiva consolidada do ano). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { KpiCard, Card, Button, Pill, IconTile, Icon, Note } = NS;
      const PG_MESES = [
        ["jan", 48],
        ["fev", 52],
        ["mar", 61],
        ["abr", 58],
        ["mai", 74],
        ["jun", 78],
        ["jul", 88],
      ];
      const PG_TOP = [
        {
          cli: "Construtora Vale Verde",
          os: 18,
          rec: "R$ 148.500",
          m: "39%",
          dir: "up",
        },
        {
          cli: "Metalúrgica Boa Vista",
          os: 9,
          rec: "R$ 84.200",
          m: "37%",
          dir: "up",
        },
        {
          cli: "Construtora Sul",
          os: 8,
          rec: "R$ 71.600",
          m: "33%",
          dir: "up",
        },
        {
          cli: "Agro Vale Verde",
          os: 7,
          rec: "R$ 58.900",
          m: "31%",
          dir: "up",
        },
        {
          cli: "Essavado Ltda.",
          os: 5,
          rec: "R$ 46.300",
          m: "16%",
          dir: "down",
        },
      ];
      const PG_ABC = [
        {
          k: "Curva A",
          m: "4 clientes · 68% da receita",
          pct: 68,
        },
        {
          k: "Curva B",
          m: "7 clientes · 22% da receita",
          pct: 22,
        },
        {
          k: "Curva C",
          m: "11 clientes · 10% da receita",
          pct: 10,
        },
      ];
      const PG_FROTA = [
        {
          eq: "Escavadeira CAT 320",
          ic: "truck",
          pct: 81,
        },
        {
          eq: "Retro JCB 3CX",
          ic: "tractor",
          pct: 72,
        },
        {
          eq: "Pá XCMG",
          ic: "forklift",
          pct: 54,
        },
        {
          eq: "Basculante 01",
          ic: "truck",
          pct: 38,
        },
      ];
      function PainelGerencial() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Painel Gerencial",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "2025 \xB7 acumulado"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
              style: {
                marginTop: 0,
              },
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Receita 2025",
              value: "R$ 512.400",
              mono: true,
              icon: "credit-card",
              trend: {
                dir: "up",
                value: "14%",
              },
              foot: "vs. 2024",
              spark: [18, 17, 16, 14, 13, 11, 9, 5],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Resultado 2025",
              value: "R$ 189.300",
              mono: true,
              icon: "wallet",
              foot: "receita \u2212 custo",
              spark: [17, 16, 15, 13, 12, 10, 8, 6],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Margem m\xE9dia",
              value: "37%",
              icon: "trending-up",
              trend: {
                dir: "up",
                value: "2 p.p.",
              },
              foot: "vs. 2024",
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Horas faturadas",
              value: "2.140",
              unit: "h",
              mono: true,
              icon: "clock",
              foot: "47 OS no ano",
              spark: [19, 18, 17, 15, 13, 11, 9, 6],
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Resultado por m\xEAs",
                  icon: "line-chart",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "R$ mil"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-bars-wrap",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-bars",
                    },
                    PG_MESES.map(([lbl, h], i) =>
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "rtg-barcol",
                          key: lbl,
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          className: i === PG_MESES.length - 1 ? "rtg-bar hi" : "rtg-bar",
                          style: {
                            height: h + "%",
                          },
                        }),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-barlbl",
                          },
                          lbl,
                        ),
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "rtg-bars-meta",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "M\xE9dia ",
                      /*#__PURE__*/ React.createElement("b", null, "R$ 27.000"),
                      "/m\xEAs",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "Pico ",
                      /*#__PURE__*/ React.createElement("b", null, "R$ 33.850"),
                      " (jul)",
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Top clientes \u2014 2025",
                  icon: "users",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "22 ativos"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-tablewrap",
                  },
                  /*#__PURE__*/ React.createElement(
                    "table",
                    {
                      className: "rtg-table",
                    },
                    /*#__PURE__*/ React.createElement(
                      "thead",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        null,
                        /*#__PURE__*/ React.createElement("th", null, "Cliente"),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "OS",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Receita",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Margem",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "tbody",
                      null,
                      PG_TOP.map((r) =>
                        /*#__PURE__*/ React.createElement(
                          "tr",
                          {
                            key: r.cli,
                          },
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "rtg-eqcell",
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "atp-tile atp-tile--amber",
                                  style: {
                                    width: 26,
                                    height: 26,
                                  },
                                },
                                /*#__PURE__*/ React.createElement(Icon, {
                                  name: "building-2",
                                  size: 15,
                                }),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "nm",
                                },
                                r.cli,
                              ),
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.os,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.rec,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: `atp-trend atp-trend--${r.dir}`,
                                style: {
                                  fontSize: 13,
                                },
                              },
                              /*#__PURE__*/ React.createElement(Icon, {
                                name: "arrow-up-right",
                                size: 13,
                                style:
                                  r.dir === "down"
                                    ? {
                                        transform: "rotate(90deg)",
                                      }
                                    : undefined,
                              }),
                              r.m,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Curva ABC de clientes",
                  icon: "trending-up",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    style: {
                      padding: "10px 18px 16px",
                    },
                  },
                  PG_ABC.map((c) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        key: c.k,
                        style: {
                          padding: "10px 0",
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          },
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            style: {
                              font: "700 13px/1 var(--font-display)",
                              color: "var(--amarelo)",
                              width: 60,
                            },
                          },
                          c.k,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            style: {
                              flex: 1,
                              fontSize: 12.5,
                              color: "var(--muted)",
                            },
                          },
                          c.m,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-val",
                            style: {
                              fontSize: 12.5,
                            },
                          },
                          c.pct,
                          "%",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            height: 5,
                            borderRadius: 3,
                            background: "var(--surface-2)",
                            marginTop: 8,
                          },
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          style: {
                            height: "100%",
                            width: c.pct + "%",
                            borderRadius: 3,
                            background:
                              "linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))",
                          },
                        }),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Utiliza\xE7\xE3o da frota",
                  icon: "truck",
                  headerRight: /*#__PURE__*/ React.createElement(
                    Pill,
                    null,
                    "horas \xF7 dispon\xEDvel",
                  ),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    style: {
                      padding: "10px 18px 16px",
                    },
                  },
                  PG_FROTA.map((f) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        key: f.eq,
                        style: {
                          padding: "10px 0",
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          },
                        },
                        /*#__PURE__*/ React.createElement(IconTile, {
                          icon: f.ic,
                          tone: "amber",
                          size: "sm",
                        }),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            style: {
                              flex: 1,
                              fontSize: 13.5,
                              fontWeight: 600,
                            },
                          },
                          f.eq,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-val",
                            style: {
                              fontSize: 12.5,
                            },
                          },
                          f.pct,
                          "%",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            height: 5,
                            borderRadius: 3,
                            background: "var(--surface-2)",
                            marginTop: 8,
                          },
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          style: {
                            height: "100%",
                            width: f.pct + "%",
                            borderRadius: 3,
                            background:
                              "linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))",
                          },
                        }),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Note,
                {
                  icon: "lock",
                  tone: "steel",
                },
                "Vis\xE3o restrita \xE0 gest\xE3o \u2014 consolida ",
                /*#__PURE__*/ React.createElement("b", null, "OS"),
                ", ",
                /*#__PURE__*/ React.createElement("b", null, "Faturamento"),
                ", ",
                /*#__PURE__*/ React.createElement("b", null, "Financeiro"),
                " e ",
                /*#__PURE__*/ React.createElement("b", null, "Custo da Hora"),
                ". Meses fecham junto com a contabilidade.",
              ),
            ),
          ),
        );
      }
      window.PainelGerencial = PainelGerencial;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/PainelGerencial.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Parametros.jsx
  try {
    (() => {
      /* Retaguarda — Parâmetros (configurações operacionais, financeiras e de acesso). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, DataRow, StatusChip, Button, Pill, Note } = NS;
      function Parametros() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Par\xE2metros",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "v0.1 \xB7 funda\xE7\xE3o"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "history",
              },
              "Hist\xF3rico de altera\xE7\xF5es",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "pencil",
              },
              "Editar par\xE2metros",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
              style: {
                gridTemplateColumns: "1fr 1fr",
                marginTop: 0,
              },
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Empresa",
                  icon: "building-2",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "building-2",
                    label: "Raz\xE3o social",
                  },
                  "Antonello Terraplanagem Ltda.",
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "id-card",
                    label: "CNPJ",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "04.887.210/0001-33",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "map-pin",
                    label: "Sede",
                  },
                  "Av. das M\xE1quinas, 1200 \u2014 Santo \xC2ngelo/RS",
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "phone",
                    label: "Telefone",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "(55) 3313-4400",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Opera\xE7\xE3o",
                  icon: "clipboard-list",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "clock",
                    label: "Jornada padr\xE3o",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "8,0 h",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "por dia \xFAtil"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "gauge",
                    label: "Toler\xE2ncia de hor\xEDmetro",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "\xB1 0,2 h",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "por apontamento"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "wrench",
                    label: "Alerta de manuten\xE7\xE3o",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "50 h",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "antes do plano"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "fuel",
                    label: "Diesel \u2014 tanque interno",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "R$ 5,84/L",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "atualizado 02/07"),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Custo da Hora",
                  icon: "calculator",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "history",
                    label: "Deprecia\xE7\xE3o padr\xE3o",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "10% a.a.",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "sobre valor de mercado"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "hard-hat",
                    label: "Custo do operador",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "R$ 62/h",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "encargos inclusos"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "trending-up",
                    label: "Margem m\xEDnima",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "30%",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "alerta abaixo disso"),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Faturamento & financeiro",
                  icon: "file-check",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "calendar",
                    label: "Vencimento padr\xE3o",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "15 dias",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "ap\xF3s emiss\xE3o da NF"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "wallet",
                    label: "Juros e multa",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "1% a.m. + 2%",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "t\xEDtulos vencidos"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "file-text",
                    label: "S\xE9rie de NF",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "S\xE9rie 1",
                  ),
                  " \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "numera\xE7\xE3o autom\xE1tica"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "credit-card",
                    label: "Recebimento padr\xE3o",
                  },
                  "PIX \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "chave CNPJ"),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "App de campo & acesso",
                  icon: "smartphone",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "smartphone",
                    label: "Apontamento via app",
                  },
                  /*#__PURE__*/ React.createElement(
                    StatusChip,
                    {
                      tone: "success",
                      led: true,
                    },
                    "Ativado",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "check",
                    label: "Aprova\xE7\xE3o de apontamentos",
                  },
                  "Supervisor \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "fecha o dia at\xE9 20h"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "lock",
                    label: "Particionamento financeiro",
                  },
                  /*#__PURE__*/ React.createElement(
                    StatusChip,
                    {
                      tone: "success",
                      led: true,
                    },
                    "Ativado",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Note,
                {
                  icon: "info",
                },
                "Alterar par\xE2metros recalcula o ",
                /*#__PURE__*/ React.createElement("b", null, "Custo da Hora"),
                " e a ",
                /*#__PURE__*/ React.createElement("b", null, "Rentabilidade"),
                " a partir do m\xEAs vigente \u2014 meses fechados n\xE3o s\xE3o reprocessados.",
              ),
            ),
          ),
        );
      }
      window.Parametros = Parametros;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Parametros.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Placeholder.jsx
  try {
    (() => {
      /* Retaguarda — placeholder for modules not yet recreated in this UI kit. */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Icon } = NS;
      function Placeholder({ icon, label }) {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "h1",
            {
              className: "rtg-pagetitle",
              style: {
                marginBottom: 16,
              },
            },
            label,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-empty",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-empty-ic",
              },
              /*#__PURE__*/ React.createElement(Icon, {
                name: icon,
                size: 26,
              }),
            ),
            /*#__PURE__*/ React.createElement("h2", null, "Em constru\xE7\xE3o"),
            /*#__PURE__*/ React.createElement(
              "p",
              null,
              "Este m\xF3dulo existe no sistema Retaguarda e est\xE1 em constru\xE7\xE3o neste UI kit.",
            ),
          ),
        );
      }
      window.Placeholder = Placeholder;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Placeholder.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/PrecosList.jsx
  try {
    (() => {
      /* Retaguarda — Preços (tabela de preços por equipamento/serviço). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, Button, Pill, Icon, Note } = NS;
      const PRC_ROWS = [
        {
          item: "Escavadeira CAT 320",
          ic: "truck",
          un: "hora",
          preco: "R$ 400",
          custo: "R$ 232",
          margem: "42%",
          dir: "up",
          atual: "01/07",
        },
        {
          item: "Retroescavadeira JCB 3CX",
          ic: "tractor",
          un: "hora",
          preco: "R$ 320",
          custo: "R$ 178",
          margem: "44%",
          dir: "up",
          atual: "01/07",
        },
        {
          item: "Pá Carregadeira XCMG",
          ic: "forklift",
          un: "hora",
          preco: "R$ 300",
          custo: "R$ 195",
          margem: "35%",
          dir: "up",
          atual: "01/07",
        },
        {
          item: "Rolo compactador CA25",
          ic: "tractor",
          un: "hora",
          preco: "R$ 260",
          custo: "R$ 168",
          margem: "35%",
          dir: "up",
          atual: "01/06",
        },
        {
          item: "Caminhão basculante",
          ic: "truck",
          un: "hora",
          preco: "R$ 220",
          custo: "R$ 174",
          margem: "21%",
          dir: "down",
          atual: "01/06",
        },
        {
          item: "Mobilização — prancha",
          ic: "truck",
          un: "km",
          preco: "R$ 8,50",
          custo: "R$ 6,10",
          margem: "28%",
          dir: "down",
          atual: "01/05",
        },
      ];
      function PrecosList() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Pre\xE7os",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "tabela vigente \xB7 jul/2025"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "history",
              },
              "Tabelas anteriores",
            ),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "primary",
                icon: "pencil",
              },
              "Editar pre\xE7os",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            Card,
            {
              title: "Tabela de pre\xE7os",
              icon: "tag",
              headerRight: /*#__PURE__*/ React.createElement(Pill, null, PRC_ROWS.length, " itens"),
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-tablewrap",
              },
              /*#__PURE__*/ React.createElement(
                "table",
                {
                  className: "rtg-table",
                },
                /*#__PURE__*/ React.createElement(
                  "thead",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "tr",
                    null,
                    /*#__PURE__*/ React.createElement("th", null, "Item"),
                    /*#__PURE__*/ React.createElement("th", null, "Unidade"),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Pre\xE7o",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Custo ref.",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "th",
                      {
                        className: "r",
                      },
                      "Margem",
                    ),
                    /*#__PURE__*/ React.createElement("th", null, "Atualizado"),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "tbody",
                  null,
                  PRC_ROWS.map((r) =>
                    /*#__PURE__*/ React.createElement(
                      "tr",
                      {
                        key: r.item,
                      },
                      /*#__PURE__*/ React.createElement(
                        "td",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "rtg-eqcell",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "atp-tile atp-tile--amber",
                              style: {
                                width: 26,
                                height: 26,
                              },
                            },
                            /*#__PURE__*/ React.createElement(Icon, {
                              name: r.ic,
                              size: 15,
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "nm",
                            },
                            r.item,
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement("td", null, r.un),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.preco,
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            style: {
                              color: "var(--muted-2)",
                              fontWeight: 500,
                            },
                          },
                          "/",
                          r.un === "km" ? "km" : "h",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r rtg-val",
                        },
                        r.custo,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "r",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: `atp-trend atp-trend--${r.dir}`,
                            style: {
                              fontSize: 13,
                            },
                          },
                          /*#__PURE__*/ React.createElement(Icon, {
                            name: "arrow-up-right",
                            size: 13,
                            style:
                              r.dir === "down"
                                ? {
                                    transform: "rotate(90deg)",
                                  }
                                : undefined,
                          }),
                          r.margem,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "td",
                        {
                          className: "mono",
                        },
                        r.atual,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              style: {
                marginTop: 16,
              },
            },
            /*#__PURE__*/ React.createElement(
              Note,
              {
                icon: "info",
              },
              "Os pre\xE7os alimentam os ",
              /*#__PURE__*/ React.createElement("b", null, "or\xE7amentos"),
              "; a margem \xE9 calculada contra o ",
              /*#__PURE__*/ React.createElement("b", null, "Custo da Hora"),
              " vigente. Itens abaixo da margem m\xEDnima (30%, definida em Par\xE2metros) aparecem em laranja.",
            ),
          ),
        );
      }
      window.PrecosList = PrecosList;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/PrecosList.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Rentabilidade.jsx
  try {
    (() => {
      /* Retaguarda — Rentabilidade (resultado por OS e por cliente). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { KpiCard, Card, StatusChip, Pill, IconTile, Icon, Note, Button } = NS;
      const RENT_OS = [
        {
          n: "OS-012",
          cli: "Construtora Vale Verde",
          rec: "R$ 41.000",
          cus: "R$ 24.100",
          res: "R$ 16.900",
          m: "41%",
          dir: "up",
          st: "Concluída",
          tone: "success",
        },
        {
          n: "OS-015",
          cli: "Metalúrgica Boa Vista",
          rec: "R$ 19.800",
          cus: "R$ 12.400",
          res: "R$ 7.400",
          m: "37%",
          dir: "up",
          st: "Concluída",
          tone: "success",
        },
        {
          n: "OS-021",
          cli: "Construtora Vale Verde",
          rec: "R$ 24.800",
          cus: "R$ 15.900",
          res: "R$ 8.900",
          m: "36%",
          dir: "up",
          st: "Em andamento",
          tone: "amber",
        },
        {
          n: "OS-007",
          cli: "Construtora Vale Verde",
          rec: "R$ 12.500",
          cus: "R$ 8.100",
          res: "R$ 4.400",
          m: "35%",
          dir: "up",
          st: "Concluída",
          tone: "success",
        },
        {
          n: "OS-016",
          cli: "Essavado Ltda.",
          rec: "R$ 11.100",
          cus: "R$ 9.300",
          res: "R$ 1.800",
          m: "16%",
          dir: "down",
          st: "Concluída",
          tone: "success",
        },
      ];
      const RENT_CLI = [
        {
          cli: "Construtora Vale Verde",
          v: "39%",
          pct: 89,
        },
        {
          cli: "Metalúrgica Boa Vista",
          v: "37%",
          pct: 84,
        },
        {
          cli: "Construtora Sul",
          v: "33%",
          pct: 75,
        },
        {
          cli: "Agro Vale Verde",
          v: "31%",
          pct: 70,
        },
        {
          cli: "Essavado Ltda.",
          v: "16%",
          pct: 36,
        },
      ];
      function Rentabilidade() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-listhead",
            },
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className: "rtg-pagetitle",
              },
              "Rentabilidade",
            ),
            /*#__PURE__*/ React.createElement(Pill, null, "julho/2025"),
            /*#__PURE__*/ React.createElement("div", {
              style: {
                flex: 1,
              },
            }),
            /*#__PURE__*/ React.createElement(
              Button,
              {
                variant: "ghost",
                icon: "arrow-up-right",
              },
              "Exportar",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-kpis",
              style: {
                marginTop: 0,
              },
            },
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Margem m\xE9dia",
              value: "38%",
              icon: "trending-up",
              trend: {
                dir: "up",
                value: "3 p.p.",
              },
              foot: "vs. junho",
              spark: [14, 13, 14, 12, 11, 10, 9, 7],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Resultado no m\xEAs",
              value: "R$ 33.850",
              mono: true,
              icon: "wallet",
              foot: "receita \u2212 custo",
              spark: [16, 15, 14, 12, 11, 9, 8, 6],
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Receita",
              value: "R$ 86.200",
              mono: true,
              icon: "credit-card",
              trend: {
                dir: "up",
                value: "11%",
              },
              foot: "vs. junho",
            }),
            /*#__PURE__*/ React.createElement(KpiCard, {
              label: "Custo total",
              value: "R$ 52.350",
              mono: true,
              warn: true,
              icon: "calculator",
              foot: "diesel + manuten\xE7\xE3o + folha",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Rentabilidade por OS",
                  icon: "trending-up",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "5 no per\xEDodo"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-tablewrap rtg-tablewrap--wide",
                  },
                  /*#__PURE__*/ React.createElement(
                    "table",
                    {
                      className: "rtg-table",
                    },
                    /*#__PURE__*/ React.createElement(
                      "thead",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "tr",
                        null,
                        /*#__PURE__*/ React.createElement("th", null, "OS"),
                        /*#__PURE__*/ React.createElement("th", null, "Cliente"),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Receita",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Custo",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Resultado",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Margem",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "th",
                          {
                            className: "r",
                          },
                          "Situa\xE7\xE3o",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "tbody",
                      null,
                      RENT_OS.map((r) =>
                        /*#__PURE__*/ React.createElement(
                          "tr",
                          {
                            key: r.n,
                          },
                          /*#__PURE__*/ React.createElement(
                            "td",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "rtg-ostag",
                              },
                              r.n,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement("td", null, r.cli),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.rec,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.cus,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r rtg-val",
                            },
                            r.res,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: `atp-trend atp-trend--${r.dir}`,
                                style: {
                                  fontSize: 13,
                                },
                              },
                              /*#__PURE__*/ React.createElement(Icon, {
                                name: "arrow-up-right",
                                size: 13,
                                style:
                                  r.dir === "down"
                                    ? {
                                        transform: "rotate(90deg)",
                                      }
                                    : undefined,
                              }),
                              r.m,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "td",
                            {
                              className: "r",
                            },
                            /*#__PURE__*/ React.createElement(
                              StatusChip,
                              {
                                tone: r.tone,
                                led: true,
                              },
                              r.st,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Note,
                {
                  icon: "lock",
                  tone: "steel",
                },
                "Valores vis\xEDveis apenas para perfis com acesso ao ",
                /*#__PURE__*/ React.createElement("b", null, "particionamento financeiro"),
                " \u2014 operadores n\xE3o veem custos nem margens.",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Margem por cliente",
                  icon: "users",
                  headerRight: /*#__PURE__*/ React.createElement(Pill, null, "per\xEDodo: 2025"),
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    style: {
                      padding: "10px 18px 16px",
                    },
                  },
                  RENT_CLI.map((c) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        key: c.cli,
                        style: {
                          padding: "10px 0",
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          },
                        },
                        /*#__PURE__*/ React.createElement(IconTile, {
                          icon: "building-2",
                          tone: "amber",
                          size: "sm",
                        }),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            style: {
                              flex: 1,
                              fontSize: 13.5,
                              fontWeight: 600,
                            },
                          },
                          c.cli,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "rtg-val",
                            style: {
                              fontSize: 12.5,
                            },
                          },
                          c.v,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          style: {
                            height: 5,
                            borderRadius: 3,
                            background: "var(--surface-2)",
                            marginTop: 8,
                          },
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          style: {
                            height: "100%",
                            width: c.pct + "%",
                            borderRadius: 3,
                            background:
                              "linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))",
                          },
                        }),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      window.Rentabilidade = Rentabilidade;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Rentabilidade.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Sidebar.jsx
  try {
    (() => {
      /* Retaguarda — persistent sidebar (brand + grouped nav). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { NavItem, Hazard } = NS;
      const RTG_NAV = [
        {
          group: "Operação",
          items: [
            ["dashboard", "dashboard", "Dashboard"],
            ["os", "clipboard-list", "Ordens de Serviço"],
            ["comprovantes", "receipt", "Comprovantes"],
          ],
        },
        {
          group: "Cadastros",
          items: [
            ["equipamentos", "truck", "Equipamentos", 14],
            ["operadores", "hard-hat", "Operadores", 38],
            ["clientes", "users", "Clientes", 22],
          ],
        },
        {
          group: "Comercial",
          items: [
            ["precos", "tag", "Preços"],
            ["orcamentos", "file-text", "Orçamentos"],
          ],
        },
        {
          group: "Financeiro",
          items: [
            ["faturamento", "file-check", "Faturamento"],
            ["financeiro", "wallet", "Financeiro"],
            ["custohora", "calculator", "Custo da Hora"],
            ["rentabilidade", "trending-up", "Rentabilidade"],
            ["painel", "line-chart", "Painel Gerencial"],
          ],
        },
        {
          group: "Frota",
          items: [
            ["manutencao", "wrench", "Manutenção"],
            ["diesel", "fuel", "Diesel"],
          ],
        },
        {
          group: "Sistema",
          items: [
            ["parametros", "sliders", "Parâmetros"],
            ["sobre", "info", "Sobre"],
          ],
        },
      ];
      function Sidebar({ module, onNavigate }) {
        return /*#__PURE__*/ React.createElement(
          "aside",
          {
            className: "rtg-sidebar",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-brand",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-brand-row",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-logo",
                },
                /*#__PURE__*/ React.createElement(
                  "svg",
                  {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "#16140f",
                    strokeWidth: "2.1",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                  },
                  /*#__PURE__*/ React.createElement("path", {
                    d: "M3 20h18",
                  }),
                  /*#__PURE__*/ React.createElement("path", {
                    d: "M6 20v-4h4v4",
                  }),
                  /*#__PURE__*/ React.createElement("path", {
                    d: "m10 16 3-7 5 4v3",
                  }),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-brand-name",
                },
                "ANTONELLO",
                /*#__PURE__*/ React.createElement("small", null, "TERRAPLANAGEM"),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-hazard",
              },
              /*#__PURE__*/ React.createElement(Hazard, null),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "nav",
            {
              className: "rtg-nav",
            },
            RTG_NAV.map((g) =>
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-group",
                  key: g.group,
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "eyebrow",
                  },
                  g.group,
                ),
                g.items.map(([id, icon, label, count]) =>
                  /*#__PURE__*/ React.createElement(
                    NavItem,
                    {
                      key: id,
                      icon: icon,
                      count: count,
                      active: module === id,
                      onClick: () => onNavigate(id),
                    },
                    label,
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-foot",
            },
            "v0.1 \xB7 funda\xE7\xE3o",
          ),
        );
      }
      window.Sidebar = Sidebar;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Sidebar.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/Sobre.jsx
  try {
    (() => {
      /* Retaguarda — Sobre (o sistema, os produtos e a migração do legado). */
      const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
      const { Card, DataRow, Badge, Chip, Note, Icon } = NS;
      const SOBRE_MODULOS = [
        ["dashboard", "Dashboard"],
        ["clipboard-list", "Ordens de Serviço"],
        ["receipt", "Comprovantes"],
        ["truck", "Equipamentos"],
        ["hard-hat", "Operadores"],
        ["users", "Clientes"],
        ["tag", "Preços"],
        ["file-text", "Orçamentos"],
        ["file-check", "Faturamento"],
        ["wallet", "Financeiro"],
        ["calculator", "Custo da Hora"],
        ["trending-up", "Rentabilidade"],
        ["wrench", "Manutenção"],
        ["fuel", "Diesel"],
      ];
      function Sobre() {
        return /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            "section",
            {
              className: "rtg-hero",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                style: {
                  width: 78,
                  height: 78,
                  borderRadius: 18,
                  background: "var(--amarelo)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow: "var(--shadow-amarelo)",
                },
              },
              /*#__PURE__*/ React.createElement(
                "svg",
                {
                  width: "44",
                  height: "44",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "#16140f",
                  strokeWidth: "2.1",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                },
                /*#__PURE__*/ React.createElement("path", {
                  d: "M3 20h18",
                }),
                /*#__PURE__*/ React.createElement("path", {
                  d: "M6 20v-4h4v4",
                }),
                /*#__PURE__*/ React.createElement("path", {
                  d: "m10 16 3-7 5 4v3",
                }),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-hero-main",
              },
              /*#__PURE__*/ React.createElement("h1", null, "Antonello Terraplanagem"),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-hero-sub",
                },
                /*#__PURE__*/ React.createElement(
                  Badge,
                  {
                    tone: "gold",
                    led: true,
                  },
                  "v0.1 \xB7 funda\xE7\xE3o",
                ),
                /*#__PURE__*/ React.createElement(
                  Badge,
                  {
                    tone: "neutral",
                    icon: "dashboard",
                  },
                  "Retaguarda",
                ),
                /*#__PURE__*/ React.createElement(
                  Badge,
                  {
                    tone: "info",
                    icon: "smartphone",
                  },
                  "App de campo",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "rtg-qf",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "Desenvolvido por",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v",
                    },
                    "AILA \u2014 Intelig\xEAncia Aplicada",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "\xDAltima atualiza\xE7\xE3o",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v mono",
                    },
                    "08/07/2025",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "qf",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "k",
                    },
                    "Ambiente",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "v",
                    },
                    "Produ\xE7\xE3o",
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "rtg-grid",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "O sistema",
                  icon: "info",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    style: {
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      color: "var(--muted)",
                    },
                  },
                  "Sistema de gest\xE3o da opera\xE7\xE3o de terraplenagem: ordens de servi\xE7o, apontamentos por hor\xEDmetro, frota, diesel, faturamento e custo da hora \u2014 do or\xE7amento ao recebimento. A ",
                  /*#__PURE__*/ React.createElement(
                    "b",
                    {
                      style: {
                        color: "var(--fg)",
                      },
                    },
                    "Retaguarda",
                  ),
                  " concentra a gest\xE3o no escrit\xF3rio; o",
                  " ",
                  /*#__PURE__*/ React.createElement(
                    "b",
                    {
                      style: {
                        color: "var(--fg)",
                      },
                    },
                    "App de campo",
                  ),
                  " (Android) registra os apontamentos dos operadores direto da m\xE1quina.",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "M\xF3dulos",
                  icon: "dashboard",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "rtg-chips",
                  },
                  SOBRE_MODULOS.map(([ic, nome]) =>
                    /*#__PURE__*/ React.createElement(
                      Chip,
                      {
                        key: nome,
                        icon: ic,
                      },
                      nome,
                    ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "rtg-stack",
              },
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Instala\xE7\xE3o",
                  icon: "contact",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "badge-check",
                    label: "Licenciado para",
                  },
                  "Antonello Terraplanagem Ltda.",
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "calendar",
                    label: "Em opera\xE7\xE3o desde",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "jun/2024",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "hard-hat",
                    label: "Usu\xE1rios",
                  },
                  "6 na retaguarda \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "38 no app de campo"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "mail",
                    label: "Suporte",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mono",
                    },
                    "suporte@ailainteligente.com",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Card,
                {
                  title: "Legado",
                  icon: "database",
                  padded: true,
                },
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "database",
                    label: "ERP anterior",
                  },
                  "Farolti \xB7 ",
                  /*#__PURE__*/ React.createElement("small", null, "at\xE9 jun/2024"),
                ),
                /*#__PURE__*/ React.createElement(
                  DataRow,
                  {
                    icon: "archive",
                    label: "Snapshot",
                  },
                  "Importado \xB7 congelado",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                Note,
                {
                  icon: "info",
                  tone: "steel",
                },
                "O hist\xF3rico do ",
                /*#__PURE__*/ React.createElement("b", null, "ERP Farolti"),
                " foi importado como snapshot no cadastro de cada cliente e n\xE3o \xE9 recalculado ao vivo \u2014 a atividade desde jun/2024 \xE9 calculada pelo sistema.",
              ),
            ),
          ),
        );
      }
      window.Sobre = Sobre;
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/Sobre.jsx",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/retaguarda/data.js
  try {
    (() => {
      /* Retaguarda — demo data (fictional). Assigned to window.RTG. */
      window.RTG = {
        clientes: [
          {
            id: "valeverde",
            nome: "Construtora Vale Verde",
            fantasia: "Vale Verde",
            tipo: "PJ",
            recorrente: true,
            ativo: true,
            segmento: "Construção civil",
            doc: "12.345.678/0001-90",
            telefone: "(55) 3312-8800",
            email: "financeiro@valeverde.com.br",
            endereco: "Rua das Indústrias, 480 — Santo Ângelo/RS",
            contato: "Marcos Feltrin",
            contatoArea: "Compras",
            desde: "mar/2022 · 3 anos",
            ultimaOS: "08/07/2025",
            faturado: "R$ 148.500",
            saldo: "R$ 32.400",
            osAtivas: 2,
            orcAbertos: 3,
          },
          {
            id: "essavado",
            nome: "Essavado Ltda.",
            tipo: "PJ",
            ativo: true,
            segmento: "Terraplenagem",
            doc: "08.221.114/0001-52",
            telefone: "(55) 3321-7744",
            cidade: "Guarani das Missões/RS",
            osAtivas: 1,
            saldo: "R$ 12.800",
          },
          {
            id: "sul",
            nome: "Construtora Sul",
            tipo: "PJ",
            ativo: true,
            segmento: "Construção civil",
            doc: "19.552.803/0001-10",
            telefone: "(55) 3025-1180",
            cidade: "Santa Rosa/RS",
            osAtivas: 1,
            saldo: "R$ 0",
          },
          {
            id: "agrovv",
            nome: "Agro Vale Verde",
            tipo: "PJ",
            ativo: true,
            segmento: "Agronegócio",
            doc: "27.104.559/0001-73",
            telefone: "(55) 99640-2210",
            cidade: "Giruá/RS",
            osAtivas: 1,
            saldo: "R$ 4.100",
          },
          {
            id: "boavista",
            nome: "Metalúrgica Boa Vista",
            tipo: "PJ",
            ativo: true,
            segmento: "Indústria",
            doc: "11.870.442/0001-06",
            telefone: "(55) 3512-9090",
            cidade: "Santo Ângelo/RS",
            osAtivas: 0,
            saldo: "R$ 0",
          },
          {
            id: "beletti",
            nome: "João Beletti",
            tipo: "PF",
            ativo: false,
            segmento: "Particular",
            doc: "702.114.330-55",
            telefone: "(55) 99988-1201",
            cidade: "Ubiretama/RS",
            osAtivas: 0,
            saldo: "R$ 0",
          },
        ],
        operadores: [
          {
            id: "adelar",
            nome: "Adelar Machado",
            iniciais: "AM",
            ativo: true,
            app: true,
            vinculo: "CLT",
            doc: "044.428.710-86",
            telefone: "(55) 99912-3040",
            desde: "mar/2021 · 4 anos",
            ultimaAtividade: "Hoje, 07:42",
            nascimento: "14/09/1985 · 39 anos",
            cnh: "Categoria E · válida até 03/2028",
            base: "Santo Ângelo — RS",
            horas: "182",
            osAtivas: 3,
            osConcluidas: 17,
            equipamentos: 4,
          },
          {
            id: "vilson",
            nome: "Vilson Prediger",
            iniciais: "VP",
            ativo: true,
            app: true,
            vinculo: "CLT",
            doc: "551.209.880-44",
            telefone: "(55) 99671-8890",
            base: "Santo Ângelo — RS",
            horas: "164",
            osAtivas: 2,
          },
          {
            id: "nelson",
            nome: "Nelson Kunz",
            iniciais: "NK",
            ativo: true,
            app: true,
            vinculo: "CLT",
            doc: "318.774.560-19",
            telefone: "(55) 99815-4402",
            base: "Giruá — RS",
            horas: "151",
            osAtivas: 2,
          },
          {
            id: "ivo",
            nome: "Ivo Scherer",
            iniciais: "IS",
            ativo: true,
            app: false,
            vinculo: "PJ",
            doc: "22.905.118/0001-30",
            telefone: "(55) 99404-7781",
            base: "Santa Rosa — RS",
            horas: "96",
            osAtivas: 1,
          },
          {
            id: "darci",
            nome: "Darci Bregalda",
            iniciais: "DB",
            ativo: false,
            app: false,
            vinculo: "CLT",
            doc: "609.330.221-70",
            telefone: "(55) 99120-6655",
            base: "Santo Ângelo — RS",
            horas: "0",
            osAtivas: 0,
          },
        ],
        /* Modules without a built screen yet (shown as a labelled placeholder). */
        placeholders: {
          dashboard: {
            icon: "dashboard",
            label: "Dashboard",
          },
          os: {
            icon: "clipboard-list",
            label: "Ordens de Serviço",
          },
          comprovantes: {
            icon: "receipt",
            label: "Comprovantes",
          },
          equipamentos: {
            icon: "truck",
            label: "Equipamentos",
          },
          precos: {
            icon: "tag",
            label: "Preços",
          },
          orcamentos: {
            icon: "file-text",
            label: "Orçamentos",
          },
          faturamento: {
            icon: "file-check",
            label: "Faturamento",
          },
          financeiro: {
            icon: "wallet",
            label: "Financeiro",
          },
          custohora: {
            icon: "calculator",
            label: "Custo da Hora",
          },
          rentabilidade: {
            icon: "trending-up",
            label: "Rentabilidade",
          },
          painel: {
            icon: "line-chart",
            label: "Painel Gerencial",
          },
          manutencao: {
            icon: "wrench",
            label: "Manutenção",
          },
          diesel: {
            icon: "fuel",
            label: "Diesel",
          },
        },
      };
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/retaguarda/data.js",
      error: String((e && e.message) || e),
    });
  }

  // ui_kits/site/image-slot.js
  try {
    (() => {
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
        const STATE_FILE = ".image-slots.state.json";

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
        const UNSPLASH_HOMEPAGE_HREF =
          "https://unsplash.com/?utm_source=claude_design&utm_medium=referral";
        // Host rule mirrors the hotlink validator that admits Unsplash srcs into
        // pages in the first place (cdn$ in unsplash.ts: apex or any subdomain)
        // — Unsplash+ results serve from plus.unsplash.com, not just images.*,
        // and an admitted-but-uncredited photo must error whatever unsplash
        // host it rides on.
        // Trailing-dot FQDNs (images.unsplash.com.) are the same host to the
        // browser but would miss the regex — strip one dot so the check fails
        // CLOSED (unrecognized-but-real Unsplash srcs must error, not render).
        const isUnsplashHost = (u) => {
          try {
            return /(^|\.)unsplash\.com$/.test(
              new URL(u, document.baseURI).hostname.replace(/\.$/, ""),
            );
          } catch {
            return false;
          }
        };
        // Render-time referral normalization for links back to Unsplash:
        // appends utm_source/utm_medium when absent, preserves every existing
        // query param, never overwrites an existing utm_source, and passes
        // non-Unsplash URLs through untouched. Input is an ABSOLUTE validated
        // http(s) URL (the credit render funnel resolves + validates first).
        const withReferral = (href) => {
          try {
            const u = new URL(href);
            if (!/(^|\.)unsplash\.com$/.test(u.hostname.replace(/\.$/, ""))) {
              return href;
            }
            if (!u.searchParams.has("utm_source")) {
              u.searchParams.set("utm_source", "claude_design");
            }
            if (!u.searchParams.has("utm_medium")) {
              u.searchParams.set("utm_medium", "referral");
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
        const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/avif"];

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
          loadP = fetch(STATE_FILE)
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
              // Merge: sidecar loses to any in-memory change that raced ahead of
              // the fetch (drop or clear) so neither is clobbered by hydration.
              if (j && typeof j === "object") {
                const merged = Object.assign({}, j, slots);
                // A framing-only write that raced ahead of hydration must not
                // drop a user image that's only on disk — inherit u from the
                // sidecar for any in-memory entry that lacks one.
                for (const k in slots) {
                  if (merged[k] && !merged[k].u && j[k]) {
                    merged[k].u = typeof j[k] === "string" ? j[k] : j[k].u;
                  }
                }
                for (const id of tombstones) delete merged[id];
                slots = merged;
              }
              tombstones.clear();
            })
            .catch(() => {})
            .then(() => {
              loaded = true;
              subs.forEach((fn) => fn());
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
          Promise.resolve(w(STATE_FILE, JSON.stringify(slots)))
            .catch(() => {})
            .then(() => {
              saving = false;
              if (saveDirty) {
                saveDirty = false;
                save();
              }
            });
        }
        const S_MAX = 5;
        const clampS = (s) => Math.max(1, Math.min(S_MAX, s));

        // Normalize a stored slot value. Pre-reframe sidecars stored a bare
        // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
        function getSlot(id) {
          const v = slots[id];
          if (!v) return null;
          return typeof v === "string"
            ? {
                u: v,
                s: 1,
                x: 0,
                y: 0,
              }
            : v;
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
          subs.forEach((fn) => fn());
          // A drop is rare + high-value — write immediately so nav-away can't lose
          // it. Gate on the initial read so we don't overwrite a sidecar we haven't
          // merged yet; the merge in load() keeps this change once the read lands.
          if (loaded) save();
          else load().then(save);
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
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
            return canvas.toDataURL("image/webp", 0.85);
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
          ":host{display:block;position:relative;" +
          "  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);" +
          "  width:100%;height:100%;aspect-ratio:3/2}" +
          ".frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}" +
          // .frame img (clipped) and .spill (unclipped ghost + handles) share the
          // same left/top/width/height in frame-%, computed by _applyView(), so the
          // inside-mask crop and the outside-mask spill stay pixel-aligned.
          ".frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);" +
          "  -webkit-user-drag:none;user-select:none;touch-action:none}" +
          // Reframe mode (double-click): the full image spills past the mask. The
          // spill layer is sized to the IMAGE bounds so its corners are where the
          // resize handles belong. The ghost <img> inside is translucent; the real
          // clipped <img> underneath shows the opaque in-mask crop.
          // popover=manual promotes the spill to the top layer on reframe, so it is
          // not clipped by any overflow:hidden / clip-path / scroll-container
          // ancestor (a plain z-index can't escape overflow clipping). UA popover
          // defaults (inset:0;margin:auto) are reset; _applyView sets viewport px.
          ".spill{position:fixed;margin:0;inset:auto;border:0;padding:0;background:transparent;" +
          "  overflow:visible;transform:translate(-50%,-50%);z-index:1;cursor:grab;touch-action:none}" +
          ":host([data-panning]) .spill{cursor:grabbing}" +
          ".spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;" +
          "  pointer-events:none;-webkit-user-drag:none;user-select:none;" +
          "  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}" +
          ".spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;" +
          "  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);" +
          "  transform:translate(-50%,-50%)}" +
          ".spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}" +
          ".spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}" +
          ".spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}" +
          ".spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}" +
          ":host([data-reframe]){z-index:10}" +
          ":host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}" +
          ".empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;" +
          "  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;" +
          "  cursor:pointer;user-select:none}" +
          ".empty svg{opacity:.45}" +
          ".empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}" +
          ".empty .sub{font-size:11px}" +
          ".empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}" +
          ".empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}" +
          ":host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;" +
          "  background:rgba(201,100,66,.10)}" +
          ".ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);" +
          "  transition:border-color .12s}" +
          ":host([data-over]) .ring{border-color:#c96442}" +
          ":host([data-filled]) .ring{display:none}" +
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
          ".ctl{position:absolute;inset:auto;top:8px;right:8px;margin:0;border:0;padding:0;" +
          "  background:transparent;overflow:visible;" +
          "  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;" +
          "  white-space:nowrap}" +
          // While reframing, the spill owns the top layer and would swallow every
          // click on the in-frame controls. Promoting .ctl into the top layer
          // ABOVE the spill (shown after it — later popovers stack higher) keeps
          // Edit-as-toggle and Replace clickable mid-reframe. _applyView pins it
          // to the frame's top-right in viewport px (translateX(-100%)
          // right-aligns against the computed left edge); inset:auto clears the
          // base rule's top/right so the inline left/top position it alone.
          ".ctl:popover-open{position:fixed;inset:auto;transform:translateX(-100%)}" +
          ":host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl" +
          "  {opacity:1;pointer-events:auto}" +
          ".ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;" +
          "  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;" +
          "  backdrop-filter:blur(6px)}" +
          ".ctl button:hover{background:rgba(0,0,0,.8)}" +
          ".err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;" +
          "  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}" +
          // Replacement in flight: after a src swap the browser keeps painting
          // the PREVIOUS image until the new one decodes, so a Replace would
          // flash the old photo and then pop. Hide the stale frame (visibility,
          // not display — _applyView geometry still applies) and spin until the
          // new image reports in (load/error clears data-swapping).
          ":host([data-swapping]) .frame img{visibility:hidden}" +
          ".loading{position:absolute;inset:0;display:none;align-items:center;" +
          "  justify-content:center;pointer-events:none}" +
          ":host([data-swapping]) .loading{display:flex}" +
          '.loading::after{content:"";width:22px;height:22px;border-radius:50%;' +
          "  border:2px solid rgba(0,0,0,.12);border-top-color:rgba(0,0,0,.45);" +
          "  animation:om-slot-spin .7s linear infinite}" +
          "@keyframes om-slot-spin{to{transform:rotate(360deg)}}" +
          // Reduced motion: the static two-tone ring still reads as "working".
          "@media (prefers-reduced-motion:reduce){.loading::after{animation:none}}" +
          ".credit{position:absolute;left:6px;bottom:6px;max-width:calc(100% - 12px);display:none;" +
          "  padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.55);color:#fff;" +
          "  font:10px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;" +
          "  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(6px)}" +
          // The credit is a SPAN holding one or two <a>s (Unsplash's prescribed
          // form links the photographer AND Unsplash) — anchors style inline so
          // the overlay reads as one line of text.
          ".credit a{color:inherit;text-decoration:none}" +
          ".credit a:hover,.credit a:focus-visible{text-decoration:underline}" +
          ":host([data-filled][data-credit]) .credit{display:block}" +
          // Exports must ship JUST the image — no hover controls, no credit chip
          // (the host marks <html data-om-exporting> for the capture window; the
          // page-level hide script can't reach shadow DOM, this rule can).
          ":host-context([data-om-exporting]) .ctl," +
          ":host-context([data-om-exporting]) .credit{display:none !important}" +
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
          ".attr-error{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;" +
          "  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;" +
          "  background:#f2f1ef;color:#6e6c66;user-select:none;" +
          "  font:13px/1.45 system-ui,-apple-system,sans-serif}" +
          ".attr-error svg{opacity:.55}" +
          ".attr-error .cap{max-width:92%;font-weight:500;letter-spacing:.01em}" +
          ":host([data-attribution-error]) .attr-error{display:flex}" +
          ":host([data-attribution-error]) .ring{display:none}";
        const icon =
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' +
          '<path d="m21 15-5-5L5 21"/></svg>';
        const warnIcon =
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' +
          '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
        class ImageSlot extends HTMLElement {
          static get observedAttributes() {
            return [
              "shape",
              "radius",
              "mask",
              "fit",
              "placeholder",
              "src",
              "id",
              "credit",
              "credit-href",
            ];
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
            if (typeof fromId !== "string" || !fromId) return null;
            // Pre-hydration the store can't veto candidates or source the copy
            // — degrade to the strip (today's behavior) rather than mint
            // against keys we can't see yet. Any rendered (= droppable) slot
            // means load() has already settled.
            if (!loaded) return null;
            const stem = fromId.replace(/-\d+$/, "") || fromId;
            for (let n = 2; n < 100; n++) {
              const toId = stem + "-" + n;
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
                if (
                  !(
                    prev &&
                    cur &&
                    prev.u &&
                    prev.u === cur.u &&
                    prev.s === cur.s &&
                    prev.x === cur.x &&
                    prev.y === cur.y &&
                    (typeof isFree !== "function" || isFree(toId))
                  )
                )
                  continue;
                return toId;
              }
              if (typeof isFree === "function" && !isFree(toId)) continue;
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
            const root =
              this.shadowRoot ||
              this.attachShadow({
                mode: "open",
                clonable: true,
              });
            // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
            // on the frame (circle, pill, rounded) can't clip them.
            root.innerHTML =
              "<style>" +
              stylesheet +
              "</style>" +
              '<div class="frame" part="frame">' +
              '  <img part="image" alt="" draggable="false" style="display:none">' +
              '  <div class="empty" part="empty">' +
              icon +
              '    <div class="cap"></div>' +
              '    <div class="sub">or <u>browse files</u></div></div>' +
              '  <div class="attr-error" part="attribution-error">' +
              warnIcon +
              '    <div class="cap">This photo needs attribution</div></div>' +
              '  <div class="loading" part="loading"></div>' +
              '  <div class="ring" part="ring"></div>' +
              "</div>" +
              // Outside .frame, like .spill/.ctl — the frame's overflow:hidden +
              // border-radius/clip-path would cut the credit off on circle/pill/mask.
              // A SPAN, not an <a>: the prescribed Unsplash credit holds two links
              // (photographer + Unsplash), built per-render in _render().
              '<span class="credit" part="credit"></span>' +
              '<div class="spill" popover="manual" data-dc-edit-transparent>' +
              '  <img class="ghost" alt="" draggable="false">' +
              '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' +
              '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' +
              "</div>" +
              // data-dc-edit-transparent: the DC editor's edit-mode picker lets
              // clicks through for chrome marked with it (EDIT_TRANSPARENT_SEL)
              // — without it, Replace/Edit clicks in Edit mode are swallowed by
              // element selection and the controls look dead.
              '<div class="ctl" popover="manual" data-dc-edit-transparent><button data-act="replace" title="Replace image">Replace</button>' +
              '  <button data-act="edit" title="Reframe image">Edit</button></div>' +
              '<input type="file" accept="' +
              ACCEPT.join(",") +
              '" hidden>';
            this._frame = root.querySelector(".frame");
            this._ring = root.querySelector(".ring");
            this._img = root.querySelector(".frame img");
            this._empty = root.querySelector(".empty");
            this._cap = root.querySelector(".cap");
            this._sub = root.querySelector(".sub");
            this._spill = root.querySelector(".spill");
            this._ctl = root.querySelector(".ctl");
            this._credit = root.querySelector(".credit");
            this._attrError = root.querySelector(".attr-error");
            // Credit clicks open the link, not browse/reframe.
            this._credit.addEventListener("click", (e) => e.stopPropagation());
            this._credit.addEventListener("dblclick", (e) => e.stopPropagation());
            this._ghost = root.querySelector(".ghost");
            this._err = null;
            this._input = root.querySelector("input");
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
              y: 0,
            };
            this._subFn = () => this._render();
            // Shadow-DOM listeners live with the shadow DOM — bound once here so
            // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
            this._empty.addEventListener("click", () => this._input.click());
            root.addEventListener("click", (e) => {
              const act = e.target && e.target.getAttribute && e.target.getAttribute("data-act");
              if (!act) return;
              // The hidden controls are opacity-0 but still tabbable — without
              // this gate a keyboard user could drive them on a read-only share
              // link (mirrors the dblclick handler's editable gate).
              if (!this.hasAttribute("data-editable")) return;
              if (act === "replace") {
                this._exitReframe(true);
                // Host-owned picker (Unsplash modal; it also offers local import).
                this.dispatchEvent(
                  new CustomEvent("image-slot:pick", {
                    bubbles: true,
                    composed: true,
                    detail: {
                      id: this.id || null,
                    },
                  }),
                );
              }
              if (act === "edit") {
                if (!this._reframes()) return;
                if (this.hasAttribute("data-reframe")) this._exitReframe(true);
                else this._enterReframe();
              }
            });
            this._input.addEventListener("change", () => {
              const f = this._input.files && this._input.files[0];
              if (f) this._ingest(f);
              this._input.value = "";
            });
            // naturalWidth/Height aren't known until load — re-apply so the cover
            // baseline is computed from real dimensions, not the 100%×100% fallback.
            // load/error also release the replacement-in-flight mask (via the
            // single discipline in _releaseMask): the swap is only revealed once
            // the new image can actually paint (on error the frame shows its
            // background, same as a fresh slot with a broken src).
            this._img.addEventListener("load", () => {
              this._loadPending = false;
              this._releaseMask(true);
              this._applyView();
            });
            this._img.addEventListener("error", () => {
              this._loadPending = false;
              this._releaseMask(true);
            });
            // Gated only on editable — any filled slot can be repositioned/scaled,
            // regardless of fit. Share links (no writeFile) stay static.
            this.addEventListener("dblclick", (e) => {
              if (!this.hasAttribute("data-editable") || !this._reframes()) return;
              e.preventDefault();
              if (this.hasAttribute("data-reframe")) this._exitReframe(true);
              else this._enterReframe();
            });
            // Pan + resize both originate on the spill layer. A handle pointerdown
            // drives an aspect-locked resize anchored at the opposite corner; any
            // other pointerdown on the spill pans. Offsets are frame-% so a
            // reframed slot survives responsive resize / PPTX export.
            this._spill.addEventListener("pointerdown", (e) => {
              if (e.button !== 0 || !this.hasAttribute("data-reframe")) return;
              e.preventDefault();
              e.stopPropagation();
              this._spill.setPointerCapture(e.pointerId);
              const rect = this.getBoundingClientRect();
              const fw = rect.width || 1,
                fh = rect.height || 1;
              const corner = e.target.getAttribute && e.target.getAttribute("data-c");
              let move;
              if (corner) {
                // Resize about the OPPOSITE corner. Viewport-px throughout (rect
                // fw/fh, not clientWidth) so the math survives a transform:scale()
                // ancestor — deck_stage renders slides scaled-to-fit.
                const iw = this._img.naturalWidth || 1,
                  ih = this._img.naturalHeight || 1;
                const contain = (this.getAttribute("fit") || "cover").toLowerCase() === "contain";
                const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
                const sx = corner.includes("e") ? 1 : -1;
                const sy = corner.includes("s") ? 1 : -1;
                const s0 = this._view.s;
                const w0 = iw * base * s0,
                  h0 = ih * base * s0;
                const cx0 = ((50 + this._view.x) / 100) * fw;
                const cy0 = ((50 + this._view.y) / 100) * fh;
                const ox = cx0 - (sx * w0) / 2,
                  oy = cy0 - (sy * h0) / 2;
                const diag0 = Math.hypot(w0, h0);
                const ux = (sx * w0) / diag0,
                  uy = (sy * h0) / diag0;
                move = (ev) => {
                  const proj =
                    (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
                  const s = clampS((s0 * proj) / diag0);
                  const d = (diag0 * s) / s0;
                  this._view.s = s;
                  this._view.x = ((ox + (ux * d) / 2) / fw) * 100 - 50;
                  this._view.y = ((oy + (uy * d) / 2) / fh) * 100 - 50;
                  this._clampView();
                  this._applyView();
                };
              } else {
                this.setAttribute("data-panning", "");
                const start = {
                  px: e.clientX,
                  py: e.clientY,
                  x: this._view.x,
                  y: this._view.y,
                };
                move = (ev) => {
                  this._view.x = start.x + ((ev.clientX - start.px) / fw) * 100;
                  this._view.y = start.y + ((ev.clientY - start.py) / fh) * 100;
                  this._clampView();
                  this._applyView();
                };
              }
              const up = () => {
                try {
                  this._spill.releasePointerCapture(e.pointerId);
                } catch {}
                this._spill.removeEventListener("pointermove", move);
                this._spill.removeEventListener("pointerup", up);
                this._spill.removeEventListener("pointercancel", up);
                this.removeAttribute("data-panning");
                this._dragUp = null;
              };
              // Stashed so _exitReframe (Escape / outside-click mid-drag) can
              // tear the capture + listeners down synchronously.
              this._dragUp = up;
              this._spill.addEventListener("pointermove", move);
              this._spill.addEventListener("pointerup", up);
              this._spill.addEventListener("pointercancel", up);
            });
            // Wheel zoom stays available inside reframe mode as a trackpad nicety —
            // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
            this.addEventListener(
              "wheel",
              (e) => {
                if (!this.hasAttribute("data-reframe")) return;
                e.preventDefault();
                const r = this.getBoundingClientRect();
                const cx = ((e.clientX - r.left) / r.width) * 100 - 50;
                const cy = ((e.clientY - r.top) / r.height) * 100 - 50;
                const prev = this._view.s;
                const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
                if (next === prev) return;
                const k = next / prev;
                this._view.s = next;
                this._view.x = cx * (1 - k) + this._view.x * k;
                this._view.y = cy * (1 - k) + this._view.y * k;
                this._clampView();
                this._applyView();
              },
              {
                passive: false,
              },
            );
          }
          connectedCallback() {
            // Warn once per page — an id-less slot works for the session but
            // cannot persist, and two id-less slots would share nothing.
            if (!this.id && !ImageSlot._warned) {
              ImageSlot._warned = true;
              console.warn("<image-slot> without an id will not persist its dropped image.");
            }
            this.addEventListener("dragenter", this);
            this.addEventListener("dragover", this);
            this.addEventListener("dragleave", this);
            this.addEventListener("drop", this);
            subs.add(this._subFn);
            // The host may inject window.omelette.writeFile AFTER the first render;
            // re-render on hover so the editable-gated controls reliably appear.
            this.addEventListener("pointerenter", this._subFn);
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
            this.removeEventListener("pointerenter", this._subFn);
            this.removeEventListener("dragenter", this);
            this.removeEventListener("dragover", this);
            this.removeEventListener("dragleave", this);
            this.removeEventListener("drop", this);
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
            if (this.hasAttribute("data-reframe")) return;
            this.setAttribute("data-reframe", "");
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
            window.addEventListener("pagehide", this._pagehide);
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
              if (this.hasAttribute("data-reframe")) this._applyView();
            };
            window.addEventListener("scroll", this._reposition, true);
            window.addEventListener("resize", this._reposition);
            this._lastRect = "";
            this._watch = () => {
              if (!this.hasAttribute("data-reframe")) return;
              const r = this.getBoundingClientRect();
              const key = r.left + "," + r.top + "," + r.width + "," + r.height;
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
            this._outside = (e) => {
              if (e.composedPath && e.composedPath().includes(this)) return;
              this._exitReframe(true);
            };
            this._esc = (e) => {
              if (e.key === "Escape") this._exitReframe(true);
            };
            document.addEventListener("pointerdown", this._outside, true);
            document.addEventListener("keydown", this._esc, true);
          }
          _exitReframe(commit) {
            if (!this.hasAttribute("data-reframe")) return;
            if (this._dragUp) this._dragUp();
            this.removeAttribute("data-reframe");
            this.removeAttribute("data-panning");
            if (this._outside) document.removeEventListener("pointerdown", this._outside, true);
            if (this._esc) document.removeEventListener("keydown", this._esc, true);
            this._outside = this._esc = null;
            if (this._reposition) {
              window.removeEventListener("scroll", this._reposition, true);
              window.removeEventListener("resize", this._reposition);
              this._reposition = null;
            }
            if (this._watchId) {
              cancelAnimationFrame(this._watchId);
              this._watchId = 0;
            }
            if (this._pagehide) {
              window.removeEventListener("pagehide", this._pagehide);
              this._pagehide = null;
            }
            try {
              this._spill.hidePopover();
            } catch {}
            try {
              this._ctl.hidePopover();
            } catch {}
            this._ctl.style.left = "";
            this._ctl.style.top = "";
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
            target.dispatchEvent(
              new CustomEvent("image-slot:reframe", {
                bubbles: true,
                composed: true,
                detail: {
                  active: active,
                  id: this.id || null,
                },
              }),
            );
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
            if (e.type === "dragenter" || e.type === "dragover") {
              // Without preventDefault the browser never fires 'drop'.
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
              if (e.type === "dragenter") this._depth++;
              this.setAttribute("data-over", "");
            } else if (e.type === "dragleave") {
              // dragenter/leave fire for every descendant crossing — count depth
              // so hovering the icon inside the empty state doesn't flicker.
              if (--this._depth <= 0) {
                this._depth = 0;
                this.removeAttribute("data-over");
              }
            } else if (e.type === "drop") {
              e.preventDefault();
              e.stopPropagation();
              this._depth = 0;
              this.removeAttribute("data-over");
              const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
              if (f) this._ingest(f);
            }
          }
          async _ingest(file) {
            this._setError(null);
            if (!file || ACCEPT.indexOf(file.type) < 0) {
              this._setError("Drop a PNG, JPEG, WebP, or AVIF image.");
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
            if (this.hasAttribute("data-filled")) {
              this.setAttribute("data-swapping", "");
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
                y: 0,
              };
              setSlot(this.id || "", val);
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
              this._setError("Could not read that image.");
              console.warn("<image-slot> ingest failed:", err);
            }
          }
          _setError(msg) {
            if (this._err) {
              this._err.remove();
              this._err = null;
            }
            if (!msg) return;
            const d = document.createElement("div");
            d.className = "err";
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
            return this.hasAttribute("data-filled");
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
              this.removeAttribute("data-swapping");
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
            const contain = (this.getAttribute("fit") || "cover").toLowerCase() === "contain";
            const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
            return {
              iw,
              ih,
              fw,
              fh,
              base,
            };
          }
          _clampView() {
            // Pan range on each axis is half the overflow past the frame edge.
            const g = this._geom();
            if (!g) return;
            const mx = Math.max(0, ((g.iw * g.base * this._view.s) / g.fw - 1) * 50);
            const my = Math.max(0, ((g.ih * g.base * this._view.s) / g.fh - 1) * 50);
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
            if (this.hasAttribute("data-reframe")) {
              let onTop = false;
              try {
                onTop = this._ctl.matches(":popover-open");
              } catch {}
              if (onTop) {
                const r = this.getBoundingClientRect();
                this._ctl.style.left = r.right - 8 + "px";
                this._ctl.style.top = r.top + 8 + "px";
              }
            }
            if (!g) {
              // Dimensions not known yet (before img load) — centered fit so there
              // is no flash of an unpositioned image before the geometry lands.
              const contain = (this.getAttribute("fit") || "cover").toLowerCase() === "contain";
              this._img.style.width = "100%";
              this._img.style.height = "100%";
              this._img.style.left = "50%";
              this._img.style.top = "50%";
              this._img.style.objectFit = contain ? "contain" : "cover";
              return;
            }
            // Baseline (cover-fill or contain-fit) × view scale. Width/height and
            // left/top are all frame-% — depends only on the frame aspect ratio, so
            // a responsive resize keeps the same crop. The spill layer mirrors the
            // same box so its corners = image corners.
            const k = g.base * this._view.s;
            const w = ((g.iw * k) / g.fw) * 100 + "%";
            const h = ((g.ih * k) / g.fh) * 100 + "%";
            const l = 50 + this._view.x + "%";
            const t = 50 + this._view.y + "%";
            this._img.style.width = w;
            this._img.style.height = h;
            this._img.style.left = l;
            this._img.style.top = t;
            this._img.style.objectFit = "";
            if (this.hasAttribute("data-reframe")) {
              // Top-layer spill: position in viewport px over the frame. The top
              // layer escapes ancestor transforms entirely, so EVERY term must be
              // in viewport units: getBoundingClientRect gives the frame's scaled
              // origin AND size, and the rect/layout ratio rescales the ghost —
              // sizing from layout px alone renders it 1/scale too large under a
              // scaled deck slide. Inner ghost + handles stay box-relative.
              const r = this.getBoundingClientRect();
              const sx = g.fw ? r.width / g.fw : 1;
              const sy = g.fh ? r.height / g.fh : 1;
              this._spill.style.width = g.iw * k * sx + "px";
              this._spill.style.height = g.ih * k * sy + "px";
              this._spill.style.left = r.left + ((50 + this._view.x) / 100) * r.width + "px";
              this._spill.style.top = r.top + ((50 + this._view.y) / 100) * r.height + "px";
            }
          }
          _commitView() {
            const v = {
              s: this._view.s,
              x: this._view.x,
              y: this._view.y,
            };
            if (this._userUrl) v.u = this._userUrl;
            // Framing-only (no u) persists too so an author-src slot remembers its
            // crop; clearing the sidecar still falls through to src=.
            if (this.id) setSlot(this.id, v);
            else {
              this._local = v;
            }
          }
          _render() {
            // Shape / mask. Presets use border-radius so the dashed ring can
            // follow the rounded outline; clip-path is only applied for an
            // explicit `mask` (the ring is hidden there since a rectangle
            // dashed border chopped by an arbitrary polygon looks broken).
            const mask = this.getAttribute("mask");
            const shape = (this.getAttribute("shape") || "rounded").toLowerCase();
            let radius = "";
            if (shape === "circle") radius = "50%";
            else if (shape === "pill") radius = "9999px";
            else if (shape === "rounded") {
              const n = parseFloat(this.getAttribute("radius"));
              radius = (Number.isFinite(n) ? n : 12) + "px";
            }
            this._frame.style.borderRadius = mask ? "" : radius;
            this._frame.style.clipPath = mask || "";
            this._ring.style.borderRadius = mask ? "" : radius;
            this._ring.style.display = mask ? "none" : "";

            // Controls and reframe entry gate on this so share links stay read-only.
            const editable = !!(window.omelette && window.omelette.writeFile);
            this.toggleAttribute("data-editable", editable);
            this._sub.style.display = editable ? "" : "none";

            // Content. The sidecar is also writable by the agent's write_file
            // tool, so its value isn't guaranteed canvas-originated — only accept
            // data:image/ URLs from it. The `src` attribute is author-controlled
            // (Claude wrote it into the HTML) so it passes through unchanged.
            let stored = this.id ? getSlot(this.id) : this._local;
            if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
            const srcAttr = this.getAttribute("src") || "";
            this._userUrl = (stored && stored.u) || null;
            const url = this._userUrl || srcAttr;
            // Don't clobber an in-flight reframe with a store-triggered re-render.
            if (!this.hasAttribute("data-reframe")) {
              this._view = {
                s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
                x: stored && Number.isFinite(stored.x) ? stored.x : 0,
                y: stored && Number.isFinite(stored.y) ? stored.y : 0,
              };
            }
            this._cap.textContent = this.getAttribute("placeholder") || "Drop an image";
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
            const credit = (this.getAttribute("credit") || "").trim();
            const attrError = !!(!credit && !this._userUrl && srcAttr && isUnsplashHost(srcAttr));
            this.toggleAttribute("data-attribution-error", attrError);
            if (url && !attrError) {
              const prev = this._img.getAttribute("src");
              if (prev !== url) {
                // Replacing an already-shown image: mark the swap BEFORE setting
                // src so the stale frame is never revealed (see the data-swapping
                // stylesheet rules). First fill (prev empty) keeps the existing
                // placeholder-until-load behavior — no spinner. _hidShowing
                // covers the pick path's transient attribution-error wipe: prev
                // is gone, but an image WAS showing, so this is a replacement.
                if (prev || this._hidShowing) this.setAttribute("data-swapping", "");
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
              this._img.style.display = "block";
              this._empty.style.display = "none";
              this.setAttribute("data-filled", "");
              this._clampView();
              this._applyView();
            } else {
              this.removeAttribute("data-swapping");
              // The src is being removed — no load/error will ever fire for it.
              this._loadPending = false;
              // A transient attribution-error wipe of a showing image happens on
              // the pick path: the host sets src one setAttribute before credit,
              // so render N hides the old image (attrError) and render N+1
              // restores a URL. Remember the wipe so that restore renders as a
              // replacement (spinner), not a first fill (blank frame).
              this._hidShowing = attrError && !!this._img.getAttribute("src");
              this._img.style.display = "none";
              this._img.removeAttribute("src");
              this._ghost.removeAttribute("src");
              // The error tile owns the blocked-photo state; .empty stays for
              // the genuinely-empty slot.
              this._empty.style.display = attrError ? "none" : "flex";
              this.removeAttribute("data-filled");
            }

            // Credit belongs to the author src, so a user drop hides it.
            // textContent + the http(s)-only funnel keep external strings inert.
            const showCredit = !!(url && credit && !this._userUrl && !attrError);
            this._credit.textContent = "";
            if (showCredit) {
              // Validate once (resolved against the document, http(s) only),
              // then append the terms-required utm referral params to links
              // that point back at unsplash.com.
              let href = "";
              const rawHref = this.getAttribute("credit-href") || "";
              if (rawHref) {
                try {
                  const u = new URL(rawHref, document.baseURI);
                  if (u.protocol === "http:" || u.protocol === "https:") {
                    href = withReferral(u.href);
                  }
                } catch {}
              }
              const mkLink = (text, linkHref) => {
                const a = document.createElement("a");
                a.setAttribute("target", "_blank");
                a.setAttribute("rel", "noopener noreferrer");
                a.setAttribute("href", linkHref);
                a.textContent = text;
                return a;
              };
              // Unsplash's prescribed credit is TWO links — the photographer's
              // name to their profile (credit-href) and 'Unsplash' to the
              // homepage. Render that split whenever the text has the canonical
              // shape; other text keeps the legacy single-link rendering.
              const m = /^Photo by (.+) on Unsplash$/.exec(credit);
              if (m) {
                this._credit.appendChild(document.createTextNode("Photo by "));
                this._credit.appendChild(href ? mkLink(m[1], href) : document.createTextNode(m[1]));
                this._credit.appendChild(document.createTextNode(" on "));
                this._credit.appendChild(mkLink("Unsplash", UNSPLASH_HOMEPAGE_HREF));
              } else if (href) {
                this._credit.appendChild(mkLink(credit, href));
              } else {
                this._credit.textContent = credit;
              }
            }
            this.toggleAttribute("data-credit", showCredit);
          }
        }
        if (!customElements.get("image-slot")) {
          customElements.define("image-slot", ImageSlot);
        }
      })();
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/site/image-slot.js",
      error: String((e && e.message) || e),
    });
  }

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
