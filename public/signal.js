(function () {
  "use strict";
  var ENDPOINT = "/api/signal";
  var RAGE_MS = 1200, RAGE_N = 3, PAUSE_MS = 22000, ABANDON_MS = 8000, COOLDOWN_MS = 60000;
  var pid = null, lastShown = 0, clicks = [], pauseT = null, abandonT = null, focusedInput = null, visible = false;

  function now() { return Date.now(); }
  function ctx() { return { url: location.href, path: location.pathname, title: document.title }; }

  function send(trigger, response) {
    if (!pid) return;
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: pid, trigger: trigger, response: response || null, context: ctx(), ts: new Date().toISOString() }), keepalive: true }).catch(function(){});
  }

  function show(trigger) {
    if (visible || now() - lastShown < COOLDOWN_MS) return;
    visible = true; lastShown = now();

    var s = document.createElement("style");
    s.textContent = "@keyframes _sIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}";
    document.head.appendChild(s);

    var box = document.createElement("div");
    box.id = "_signal";
    box.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:2147483647;width:280px;background:#18181b;border-radius:20px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.32);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;animation:_sIn .22s cubic-bezier(.34,1.56,.64,1)";

    var h = document.createElement("p");
    h.style.cssText = "margin:0 0 6px;font-size:15px;font-weight:600;color:#fff";
    h.textContent = "Need any help? I\u2019m here \uD83D\uDC4B";

    var sub = document.createElement("p");
    sub.style.cssText = "margin:0 0 12px;font-size:13px;color:#a1a1aa;line-height:1.5";
    sub.textContent = "What were you looking for?";

    var ta = document.createElement("textarea");
    ta.placeholder = "e.g. I was looking for the pricing\u2026";
    ta.rows = 2;
    ta.style.cssText = "width:100%;box-sizing:border-box;resize:none;border-radius:12px;border:1px solid #3f3f46;background:#27272a;color:#fff;font-size:13px;padding:10px 12px;outline:none;font-family:inherit;line-height:1.45";

    var row = document.createElement("div");
    row.style.cssText = "display:flex;gap:8px;margin-top:10px";

    var sendBtn = document.createElement("button");
    sendBtn.textContent = "Send";
    sendBtn.style.cssText = "flex:1;height:36px;border-radius:12px;border:none;background:#fff;color:#18181b;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit";

    var skipBtn = document.createElement("button");
    skipBtn.textContent = "Skip";
    skipBtn.style.cssText = "height:36px;padding:0 14px;border-radius:12px;border:1px solid #3f3f46;background:transparent;color:#a1a1aa;font-size:13px;cursor:pointer;font-family:inherit";

    function dismiss() { if (box.parentNode) box.parentNode.removeChild(box); visible = false; }
    sendBtn.onclick = function() { var t = ta.value.trim(); if (t) send(trigger, t); dismiss(); };
    skipBtn.onclick = function() { send(trigger, null); dismiss(); };

    row.appendChild(sendBtn); row.appendChild(skipBtn);
    box.appendChild(h); box.appendChild(sub); box.appendChild(ta); box.appendChild(row);
    document.body.appendChild(box);
    setTimeout(function() { ta.focus(); }, 50);
  }

  // Rage click
  document.addEventListener("click", function(e) {
    var t = now(); clicks.push({t:t,x:e.clientX,y:e.clientY});
    clicks = clicks.filter(function(c){return t-c.t<RAGE_MS;});
    if (clicks.length >= RAGE_N) { clicks=[]; show("rage_click"); }
  }, true);

  // Long pause on input
  document.addEventListener("focusin", function(e) {
    var tag = e.target && e.target.tagName;
    if (tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT") {
      focusedInput = e.target; clearTimeout(pauseT);
      pauseT = setTimeout(function(){ if (document.activeElement===focusedInput) show("long_pause"); }, PAUSE_MS);
    }
  }, true);
  document.addEventListener("input", function() {
    clearTimeout(pauseT);
    if (focusedInput) pauseT = setTimeout(function(){ if (document.activeElement===focusedInput) show("long_pause"); }, PAUSE_MS);
  }, true);

  // Input abandon
  document.addEventListener("focusout", function(e) {
    var tag = e.target && e.target.tagName;
    if ((tag==="INPUT"||tag==="TEXTAREA") && e.target.value && e.target.value.trim()) {
      clearTimeout(abandonT);
      abandonT = setTimeout(function(){ show("input_abandon"); }, ABANDON_MS);
    }
    clearTimeout(pauseT);
  }, true);
  document.addEventListener("submit", function(){ clearTimeout(abandonT); }, true);

  // Dead click
  document.addEventListener("click", function(e) {
    var el = e.target; if (!el) return;
    var tag = el.tagName;
    var ok = tag==="A"||tag==="BUTTON"||tag==="INPUT"||tag==="SELECT"||tag==="TEXTAREA"||tag==="LABEL"||el.getAttribute("role")==="button"||window.getComputedStyle(el).cursor==="pointer";
    if (!ok) {
      if (window._sigLast && Math.abs(window._sigLast.x-e.clientX)<20 && Math.abs(window._sigLast.y-e.clientY)<20 && now()-window._sigLast.t<3000) { show("dead_click"); window._sigLast=null; }
      else { window._sigLast={x:e.clientX,y:e.clientY,t:now()}; }
    }
  }, true);

  window.Signal = {
    init: function(cfg) { pid=cfg.projectId||"demo"; if(cfg.endpoint) ENDPOINT=cfg.endpoint; },
    _reset: function() { lastShown=0; visible=false; clicks=[]; window._sigLast=null; var el=document.getElementById("_signal"); if(el) el.parentNode.removeChild(el); },
    _triggerRageClick: function() { Signal._reset(); for(var i=0;i<4;i++) document.querySelector("h1").dispatchEvent(new MouseEvent("click",{bubbles:true,clientX:300,clientY:100})); },
    _triggerDeadClick: function() { Signal._reset(); var el=document.querySelector("h1"); el.dispatchEvent(new MouseEvent("click",{bubbles:true,clientX:300,clientY:100})); setTimeout(function(){el.dispatchEvent(new MouseEvent("click",{bubbles:true,clientX:300,clientY:100}));},300); }
  };
})();