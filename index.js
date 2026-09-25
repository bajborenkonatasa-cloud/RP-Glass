(() => {
"use strict";
const VERSION = "0.7.0";

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


const MOODS = new Set(["neutral","soft","romantic","dreamy","sad","angry","fear","magic","playful"]);

function semanticPass(text){
  if(text.dataset.rpgSemanticDone==="1") return;

  // Optional tiny metadata understood by RP-Glass:
  // [[speaker:Name]][[mood:angry]] followed by the paragraph it belongs to.
  // The markers are removed from the visible story after being read.
  const walker=document.createTreeWalker(text,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);

  let pendingSpeaker="", pendingMood="";
  const rx=/\[\[(speaker|mood):([^\]]+)\]\]/gi;

  nodes.forEach(node=>{
    if(node.parentElement?.closest("details")) return;
    const original=node.nodeValue||"";
    if(!original.includes("[[")) return;

    let found=false;
    const cleaned=original.replace(rx,(_,kind,value)=>{
      found=true;
      value=(value||"").trim();
      if(kind.toLowerCase()==="speaker") pendingSpeaker=value.slice(0,40);
      if(kind.toLowerCase()==="mood"){
        const m=value.toLowerCase();
        pendingMood=MOODS.has(m)?m:"neutral";
      }
      return "";
    });
    if(found) node.nodeValue=cleaned;

    let target=node.parentElement?.closest("p,blockquote");
    if(!target){
      let next=node.parentElement?.nextElementSibling;
      if(next?.matches?.("p,blockquote")) target=next;
    }
    if(target && (pendingSpeaker||pendingMood)){
      target.classList.add("rpg-dialogue");
      if(pendingMood) target.classList.add(`rpg-mood-${pendingMood}`);
      if(pendingSpeaker){
        target.dataset.rpgSpeaker=pendingSpeaker;
        target.style.setProperty("--rpg-speaker", `"${pendingSpeaker.replace(/"/g,"'")}"`);
      }
      pendingSpeaker=""; pendingMood="";
    }
  });

  text.dataset.rpgSemanticDone="1";
}


/* v0.7: compact the real SillyTavern header only when it is safe to do so.
   We move existing DOM nodes; we do not clone/delete controls. */
function compactHeader(mes){
  if(!mes || mes.dataset.rpgHeaderV7==="1") return;
  const avatar=mes.querySelector(":scope > .avatar, :scope > .mesAvatarWrapper .avatar, .avatar");
  const header=mes.querySelector(".mes_header");
  const text=mes.querySelector(".mes_text");
  if(!avatar || !header || !text) return;

  const block=header.closest(".mes_block") || text.closest(".mes_block");
  if(!block) return;

  // Make a dedicated compact row before story text.
  let row=block.querySelector(":scope > .rpg-compact-head");
  if(!row){
    row=document.createElement("div");
    row.className="rpg-compact-head";
    block.insertBefore(row, block.firstChild);
  }

  // Move the original avatar and original header into one row.
  // SillyTavern event handlers remain attached because nodes are moved, not recreated.
  row.appendChild(avatar);
  row.appendChild(header);
  mes.classList.add("rpg-header-compact");
  mes.dataset.rpgHeaderV7="1";
}

function compactAllHeaders(){
  document.querySelectorAll("#chat .mes").forEach(compactHeader);
}

function classify(){
  document.querySelectorAll("#chat .mes").forEach(mes=>{
    mes.classList.add("rp-glass-message");
    const text=mes.querySelector(".mes_text");
    if(!text) return;
    semanticPass(text);

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
