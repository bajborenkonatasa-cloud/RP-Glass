(() => {
"use strict";
const VERSION = "0.3.1";

function classify() {
  document.querySelectorAll("#chat .mes").forEach((mes) => {
    mes.classList.add("rp-glass-message");
    const text = mes.querySelector(".mes_text");
    if (!text) return;

    const h1 = text.querySelector(":scope > h1");
    if (h1 && /📅|🕒|📍|🌫/.test(h1.textContent || "")) h1.classList.add("rpg-scene-header");

    text.querySelectorAll("details").forEach((d) => {
      const label = (d.querySelector("summary")?.textContent || "").toLowerCase();

      if (/мысл|thought|распаковать/.test(label)) {
        d.classList.add("rpg-thoughts");
        if (!d.querySelector(":scope > .rpg-stars")) {
          const stars = document.createElement("span");
          stars.className = "rpg-stars";
          stars.setAttribute("aria-hidden", "true");
          stars.innerHTML = "<i>✦</i><i>✧</i><i>⋆</i><i>✦</i><i>✧</i><i>⋆</i>";
          d.prepend(stars);
        }
      }
      if (/независим|читател|reader/.test(label)) d.classList.add("rpg-reader");
    });
  });
}

function boot() {
  document.documentElement.classList.add("rp-glass-loaded");
  const wait = () => {
    const chat = document.querySelector("#chat");
    if (!chat) return setTimeout(wait, 400);
    classify();
    new MutationObserver(() => requestAnimationFrame(classify))
      .observe(chat, { childList:true, subtree:true });
  };
  wait();
  console.log(`💜 RP Glass v${VERSION} loaded`);
}
document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", boot, {once:true})
  : boot();
})();
