/* Conector web de JS GRACE: registra visitas (con UTM) y clics a WhatsApp, y expone JSGRACE.send().
   Uso: <script src="jsgrace-connector.js" data-endpoint="https://TU-PROYECTO.supabase.co/functions/v1/capture-lead"></script> */
(function () {
  var endpoint = document.currentScript.dataset.endpoint;
  if (!endpoint) return;

  var utm = {}, q = new URLSearchParams(location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
    if (q.get(k)) utm[k] = q.get(k);
  });
  try {
    if (Object.keys(utm).length) sessionStorage.setItem("jsg_utm", JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem("jsg_utm") || "{}");
  } catch (e) {}

  function send(payload) {
    return fetch(endpoint, {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({}, utm, payload))
    });
  }
  window.JSGRACE = { send: send };

  send({ kind: "event", event_type: "page_view", page: location.href }).catch(function () {});

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"]');
    if (a) send({ kind: "event", event_type: "whatsapp_click", page: location.href }).catch(function () {});
  });
})();
