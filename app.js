// Fills the Results section from data/perf.json (real measurements) and metrics.json (model metrics).
// A metric with value null is shown as "pending": nothing is estimated in advance.
(function () {
  "use strict";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function fmt(x) { return x >= 20 ? Math.round(x).toString() : x.toFixed(1); }

  function tile(n, unit, caption) {
    var t = el("div", "tile");
    var v = el("div", "n", n);
    if (unit) v.appendChild(el("small", null, unit));
    t.appendChild(v);
    t.appendChild(el("p", null, caption));
    return t;
  }

  fetch("data/perf.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (p) {
      document.getElementById("perf-meta").textContent =
        "Measured on " + p.machine.cpu + ", " + p.machine.ram_gb + " GB RAM, " + p.machine.os + ", " + p.mode + " mode, " +
        p.measured_at + ". Engines not active in this run: " + p.inactive.join(", ") + ".";
      // hero key facts carry data-perf attributes: keep them in sync with the measurements
      document.querySelectorAll("[data-perf]").forEach(function (node) {
        var v = p[node.getAttribute("data-perf")];
        if (typeof v === "number") node.textContent = node.getAttribute("data-perf") === "tests" ? String(v) : fmt(v);
      });
      var box = document.getElementById("perf-tiles");
      box.appendChild(tile(fmt(p.cascade_ms), "ms", "full cascade per file, median of " + p.files + " Windows programs"));
      box.appendChild(tile(fmt(p.warm_ms), "ms", "repeat scan of the same file via the hash cache"));
      box.appendChild(tile(fmt(p.link_ms), "ms", "link check, median"));
      box.appendChild(tile(fmt(p.idle_mb), "MB", "RAM while idle in the background"));
      box.appendChild(tile(fmt(p.idle_cpu), "%", "of one CPU core while idle"));
      box.appendChild(tile(String(p.tests), "", "automated tests, all passing"));
    })
    .catch(function () {
      document.getElementById("perf-meta").textContent = "Measurements could not be loaded.";
    });

  fetch("metrics.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (m) {
      var st = document.getElementById("metrics-status");
      var done = m.status === "done";
      st.className = "status" + (done ? " done" : "");
      st.appendChild(el("span", "dot"));
      st.appendChild(el("span", null, (done ? "Final results · updated " : "Training in progress · updated ") + m.updated + ". " + m.note));
      var box = document.getElementById("metrics");
      m.groups.forEach(function (g) {
        var c = el("div", "mcard");
        c.appendChild(el("h4", null, g.title));
        c.appendChild(el("div", "ds", g.dataset));
        g.rows.forEach(function (r) {
          var row = el("div", "mrow");
          row.appendChild(el("span", null, r.label));
          row.appendChild(r.value === null || r.value === undefined ? el("span", "pending", "pending") : el("b", null, r.value));
          c.appendChild(row);
        });
        box.appendChild(c);
      });
    })
    .catch(function () {
      document.getElementById("metrics-status").textContent = "Model metrics could not be loaded.";
    });
})();
