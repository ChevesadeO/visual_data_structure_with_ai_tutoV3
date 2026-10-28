// Tutor IA — botón + respuesta bajo el feedback (usa textContent: sin riesgo de XSS)
function tutorBoton(contenedor, datos) {
  const previo = contenedor.querySelector(".tutor-wrap");
  if (previo) previo.remove();
  const wrap = document.createElement("div");
  wrap.className = "tutor-wrap";
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "btn btn-primary tutor-btn";
  btn.textContent = "🤖 Pedir ayuda al tutor IA";
  const out = document.createElement("p");
  out.className = "tutor-out";
  btn.addEventListener("click", async () => {
    btn.disabled = true; out.textContent = "El tutor está pensando…";
    try {
      const r = await fetch("api/tutor.php", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos)
      });
      const j = await r.json();
      out.textContent = j.ok ? j.texto : (j.error || "No se pudo contactar al tutor.");
      if (!j.ok) btn.disabled = false;
    } catch (e) {
      out.textContent = "Sin conexión con el tutor. Intenta de nuevo."; btn.disabled = false;
    }
  });
  wrap.append(btn, out);
  contenedor.appendChild(wrap);
}
