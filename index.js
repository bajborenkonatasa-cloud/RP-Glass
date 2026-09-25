(() => {
"use strict";
const VERSION = "0.5.0";

function addParticles(host, cls, glyphs, count){
  if (host.querySelector(`:scope > .${cls}`)) return;
  const box=document.createElement("span");
  box.className=cls; box.setAttribute("aria-hidden","true");
  for(let i=0;i<count;i++){
    const s=document.createElement("i");
    s.textContent=glyphs[i%glyphs.length];
    s.style.setProperty("--i",i);
    box.appendChild(s);
  }
  host.prepend(box);
}

function classify(){
  document.querySelectorAll("#chat .mes").forEach(mes=>{
    mes.classList.add("rp-glass-message");
    const text=mes.querySelector(".mes_text");
    if(!text) return;

    const h1=text.querySelector(":scope > h1");
    if(h1 && /📅|🕒|📍|🌫/.test(h1.textContent||"")){
      h1.classList.add("rpg-scene-header");
      addParticles(h1,"rpg-header-sparkles",["✦","✧"],5);
    }

    text.querySelectorAll("details").forEach(d=>{
      const label=(d.querySelector("summary")?.textContent||"").toLowerCase();
      if(/мысл|thought|распаковать/.test(label)){
        d.classList.add("rpg-thoughts");
        addParticles(d,"rpg-stars",["✦","✧","⋆","·"],12);
      }
      if(/независим|читател|reader/.test(label)){
        d.classList.add("rpg-reader");
        addParticles(d,"rpg-reader-ambience",["",""],3);
        addParticles(d,"rpg-reader-dust",["✦","·","✧"],7);
      }
    });
  });
}

function boot(){
 document.documentElement.classList.add("rp-glass-loaded");
 const wait=()=>{
  const chat=document.querySelector("#chat");
  if(!chat)return setTimeout(wait,350);
  classify();
  new MutationObserver(()=>requestAnimationFrame(classify)).observe(chat,{childList:true,subtree:true});
 };
 wait();
 console.log(`💜 RP Glass v${VERSION} loaded`);
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
})();
