(() => {
"use strict";
const VERSION = "0.8.2";
function rpgFindScriptSrc(){
  const scripts=[...document.scripts];
  const hit=scripts.reverse().find(s=>/RP-Glass\/index\.js(?:\?|$)/i.test(s.src||""));
  return hit?.src || "";
}
const RPG_SCRIPT_SRC = rpgFindScriptSrc();
const RPG_ASSET_BASE = RPG_SCRIPT_SRC
  ? RPG_SCRIPT_SRC.replace(/index\.js(?:\?.*)?$/i,"assets/")
  : "./scripts/extensions/third-party/RP-Glass/assets/";

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



function ensureBootBadge(){
  let badge=document.getElementById("rpg-boot-badge");
  if(badge) return badge;
  badge=document.createElement("div");
  badge.id="rpg-boot-badge";
  badge.textContent="RP✓";
  badge.title="RP-Glass JavaScript is running";
  document.body.appendChild(badge);
  return badge;
}

function ensureMascot(){
  let root=document.getElementById("rpg-hanabi");
  if(root) return root;
  root=document.createElement("div");
  root.id="rpg-hanabi";
  root.className="rpg-hanabi rpg-hanabi-calm";
  root.setAttribute("aria-hidden","true");

  const aura=document.createElement("div");
  aura.className="rpg-hanabi-aura";
  const img=document.createElement("img");
  img.className="rpg-hanabi-img";
  img.alt="";
  img.src=RPG_ASSET_BASE+"hanabi-normal.webp";
  const fallback=document.createElement("div");
  fallback.className="rpg-hanabi-fallback";
  fallback.textContent="Ханаби ♡";
  const heart=document.createElement("div");
  heart.className="rpg-hanabi-heart";
  heart.textContent="♡";

  img.addEventListener("load",()=>root.classList.add("rpg-img-ok"));
  img.addEventListener("error",()=>{
    root.classList.add("rpg-img-error");
    fallback.textContent="Ханаби ♡\\nasset?";
  });

  root.append(aura,img,fallback,heart);
  document.body.appendChild(root);
  return root;
}

function ensureMoodHud(){
  let hud=document.getElementById("rpg-mood-hud");
  if(hud) return hud;
  hud=document.createElement("div");
  hud.id="rpg-mood-hud";
  hud.innerHTML=`<span class="rpg-mood-icon">✦</span><span class="rpg-mood-label">спокойствие</span>`;
  document.body.appendChild(hud);
  return hud;
}

function moodFromLastMessage(){
  const last=[...document.querySelectorAll("#chat .mes")].at(-1);
  if(!last) return "neutral";
  const marked=last.querySelector('[class*="rpg-mood-"]');
  if(marked){
    const c=[...marked.classList].find(x=>x.startsWith("rpg-mood-"));
    if(c) return c.replace("rpg-mood-","");
  }
  const s=(last.textContent||"").toLowerCase();
  if(/зл|ярост|гнев|бесит|ненавиж|angry|rage/.test(s)) return "angry";
  if(/страх|испуг|дрож|паник|fear|scared/.test(s)) return "fear";
  if(/груст|слез|плач|больн|sad|cry/.test(s)) return "sad";
  if(/люб|нежн|целу|обня|сердц|romantic|kiss/.test(s)) return "romantic";
  if(/маг|чар|заклин|magic|dream/.test(s)) return "magic";
  return "neutral";
}

const RPG_MOOD_UI={
 neutral:["✦","спокойствие"],
 romantic:["♡","романтика"],
 angry:["🔥","злость"],
 fear:["❄","страх / напряжение"],
 sad:["☾","грусть"],
 magic:["✧","особая сцена"],
 dreamy:["♡","мечтательность"],
 soft:["♡","нежность"],
 playful:["✧","игривость"]
};

function updateLivingLayer(){
  const mascot=ensureMascot(), hud=ensureMoodHud();
  const mood=moodFromLastMessage();
  mascot.dataset.mood=mood;
  hud.dataset.mood=mood;
  const [icon,label]=RPG_MOOD_UI[mood]||RPG_MOOD_UI.neutral;
  hud.querySelector(".rpg-mood-icon").textContent=icon;
  hud.querySelector(".rpg-mood-label").textContent=label;
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
  updateLivingLayer();
}

function boot(){
 document.documentElement.classList.add("rp-glass-loaded");
 ensureBootBadge();
 ensureMascot();
 ensureMoodHud();
 setTimeout(updateLivingLayer,250);
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
