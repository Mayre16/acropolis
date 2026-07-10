/**
 * Script embebible para Biblioteca Sophia (PHP u otro sitio estático).
 *
 * Uso:
 * <script src="https://editor.acropolis.adesa.com.do/oina-analytics.js"
 *         data-site="biblioteca"
 *         data-api="https://editor.acropolis.adesa.com.do/api"></script>
 */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var site = script.getAttribute("data-site") || "biblioteca";
  var apiBase = (script.getAttribute("data-api") || "https://editor.acropolis.adesa.com.do/api").replace(/\/$/, "");
  var visitorKey = "oina-analytics-vid";

  function shouldTrack() {
    try {
      if (window.parent !== window) return false;
      if (/[?&]cmsEdit=/.test(window.location.search)) return false;
    } catch (e) {
      return false;
    }
    return true;
  }

  function visitorId() {
    try {
      var id = localStorage.getItem(visitorKey);
      if (!id) {
        id = "v-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(visitorKey, id);
      }
      return id;
    } catch (e) {
      return "anon";
    }
  }

  function path() {
    return window.location.pathname || "/";
  }

  function send(payload) {
    try {
      fetch(apiBase + "/analytics/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  if (!shouldTrack()) return;

  var currentPath = path();
  var activeSection = "";
  var tickStartedAt = Date.now();
  var visible = document.visibilityState === "visible";

  function flush(section) {
    var now = Date.now();
    var elapsed = visible ? now - tickStartedAt : 0;
    if (elapsed > 0) {
      send({
        site: site,
        event: "engagement",
        path: currentPath,
        section: section || undefined,
        durationMs: Math.round(elapsed),
        visitorId: visitorId(),
      });
    }
    tickStartedAt = now;
  }

  send({
    site: site,
    event: "pageview",
    path: currentPath,
    visitorId: visitorId(),
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        var best = null;
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (!entry.isIntersecting) continue;
          var id = entry.target.getAttribute("data-oina-section");
          if (!id) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id: id, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.ratio >= 0.2 && best.id !== activeSection) {
          flush(activeSection);
          activeSection = best.id;
        }
      },
      { threshold: [0.2, 0.35, 0.5, 0.75] },
    );
    var nodes = document.querySelectorAll("[data-oina-section]");
    for (var j = 0; j < nodes.length; j++) observer.observe(nodes[j]);
  }

  setInterval(function () {
    if (!visible) return;
    flush(activeSection);
  }, 15000);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      flush(activeSection);
      visible = false;
    } else {
      visible = true;
      tickStartedAt = Date.now();
    }
  });

  window.addEventListener("pagehide", function () {
    flush(activeSection);
  });

  document.addEventListener(
    "click",
    function (ev) {
      var target = ev.target;
      if (!target || !target.closest) return;
      var anchor = target.closest("a[href]");
      if (!anchor || !anchor.href) return;
      var href = String(anchor.href);
      if (!/wa\.me|whatsapp\.com/i.test(href)) return;
      send({
        site: site,
        event: "whatsapp",
        path: currentPath,
        visitorId: visitorId(),
      });
    },
    true,
  );
})();
