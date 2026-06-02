(function () {
  "use strict";

  var IDLE_MS = 60000;
  var RAGE_MS = 2000;
  var RAGE_N = 3;

  var script =
    document.currentScript ||
    (function () {
      var list = document.getElementsByTagName("script");
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i].src && list[i].src.indexOf("signal.js") !== -1) return list[i];
      }
      return null;
    })();

  if (!script || !script.src) return;

  var INGEST;
  try {
    // Always post to /api/ingest on the script host (never derive from "signal.js" filename).
    INGEST = new URL("/api/ingest", script.src).href;
  } catch (e) {
    return;
  }

  var apiKey = script.getAttribute("data-key");
  if (!apiKey) return;

  var host = document.createElement("div");
  host.setAttribute("data-signal", "");
  var root = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  style.textContent =
    ":host{all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}" +
    ".wrap{position:fixed;bottom:24px;right:24px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:12px}" +
    ".fab{width:52px;height:52px;border-radius:999px;border:none;background:#18181b;color:#fff;font-size:22px;line-height:1;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.35);transition:transform .15s ease,opacity .15s ease}" +
    ".fab:hover{transform:scale(1.04)}" +
    ".fab[hidden]{display:none}" +
    ".card{width:300px;background:#18181b;border-radius:20px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.32);color:#fff;animation:sin .22s cubic-bezier(.34,1.56,.64,1)}" +
    ".card[hidden]{display:none}" +
    "@keyframes sin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}" +
    ".title{margin:0 0 12px;font-size:15px;font-weight:600;line-height:1.4;color:#fff}" +
    ".ta{width:100%;box-sizing:border-box;resize:none;border-radius:12px;border:1px solid #3f3f46;background:#27272a;color:#fff;font-size:13px;padding:10px 12px;outline:none;font-family:inherit;line-height:1.45;min-height:72px}" +
    ".ta:focus{border-color:#52525b}" +
    ".send{margin-top:10px;width:100%;height:38px;border-radius:12px;border:none;background:#fff;color:#18181b;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}" +
    ".send:disabled{opacity:.55;cursor:not-allowed}" +
    ".status{margin:10px 0 0;font-size:13px;line-height:1.45;color:#a1a1aa;min-height:1.2em}" +
    ".status.ok{color:#86efac}" +
    ".status.err{color:#fca5a5}";

  var wrap = document.createElement("div");
  wrap.className = "wrap";

  var fab = document.createElement("button");
  fab.className = "fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Open feedback");
  fab.textContent = "?";

  var card = document.createElement("div");
  card.className = "card";
  card.hidden = true;

  var title = document.createElement("p");
  title.className = "title";
  title.textContent = "Need help? Tell us what's going on";

  var ta = document.createElement("textarea");
  ta.className = "ta";
  ta.placeholder = "What were you trying to do?";
  ta.rows = 3;

  var sendBtn = document.createElement("button");
  sendBtn.className = "send";
  sendBtn.type = "button";
  sendBtn.textContent = "Send";

  var status = document.createElement("p");
  status.className = "status";

  card.appendChild(title);
  card.appendChild(ta);
  card.appendChild(sendBtn);
  card.appendChild(status);
  wrap.appendChild(card);
  wrap.appendChild(fab);
  root.appendChild(style);
  root.appendChild(wrap);
  document.documentElement.appendChild(host);

  var open = false;
  var trigger = "manual";
  var idleTimer = null;
  var rageEl = null;
  var rageTimes = [];

  function openCard(t) {
    trigger = t || "manual";
    open = true;
    fab.hidden = true;
    card.hidden = false;
    status.textContent = "";
    status.className = "status";
    sendBtn.disabled = false;
    ta.disabled = false;
    setTimeout(function () {
      ta.focus();
    }, 40);
  }

  function closeCard() {
    open = false;
    card.hidden = true;
    fab.hidden = false;
    ta.value = "";
    status.textContent = "";
    status.className = "status";
    sendBtn.disabled = false;
    ta.disabled = false;
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      openCard("idle");
    }, IDLE_MS);
  }

  function onActivity() {
    resetIdle();
  }

  function isWidgetEvent(e) {
    var path = e.composedPath ? e.composedPath() : [e.target];
    for (var i = 0; i < path.length; i++) if (path[i] === host) return true;
    return false;
  }

  function onClick(e) {
    onActivity();
    if (isWidgetEvent(e)) return;
    var el = e.target;
    if (!el) return;
    if (el !== rageEl) {
      rageEl = el;
      rageTimes = [];
    }
    var t = Date.now();
    rageTimes.push(t);
    rageTimes = rageTimes.filter(function (x) {
      return t - x < RAGE_MS;
    });
    if (rageTimes.length >= RAGE_N) {
      rageTimes = [];
      openCard("rage_click");
    }
  }

  function submit() {
    var message = ta.value.trim();
    if (!message) {
      status.textContent = "Please enter a message.";
      status.className = "status err";
      return;
    }
    sendBtn.disabled = true;
    ta.disabled = true;
    status.textContent = "";
    status.className = "status";

    fetch(INGEST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: apiKey,
        message: message,
        trigger: trigger,
        pageUrl: location.href,
        timestamp: new Date().toISOString(),
      }),
    })
      .then(function (res) {
        return res.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!res.ok) throw data;
          status.textContent = "Thanks — we'll look into it 👍";
          status.className = "status ok";
          setTimeout(closeCard, 3000);
        });
      })
      .catch(function () {
        status.textContent = "Something went wrong, try again";
        status.className = "status err";
        sendBtn.disabled = false;
        ta.disabled = false;
      });
  }

  fab.addEventListener("click", function () {
    openCard("manual");
  });
  sendBtn.addEventListener("click", submit);
  ta.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
  });

  document.addEventListener("mousemove", onActivity, { passive: true });
  document.addEventListener("mousedown", onActivity, { passive: true });
  document.addEventListener("click", onClick, true);
  document.addEventListener("scroll", onActivity, { passive: true });
  document.addEventListener("keydown", onActivity, { passive: true });
  document.addEventListener("touchstart", onActivity, { passive: true });

  resetIdle();
})();
