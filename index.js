(() => {
"use strict";
const VERSION="0.9.0";
const scriptSrc=document.currentScript?.src||[...document.scripts].reverse().find(s=>/RP-Glass.*\/index\.js/i.test(s.src||""))?.src||"";
const ASSET=scriptSrc?scriptSrc.replace(/index\.js(?:\?.*)?$/i,"assets/"):"assets/";
const MOODS=new Set(["neutral","soft","romantic","dreamy","sad","angry","fear","magic","playful","happy"]);
const portrait={neutral:"dreamy",soft:"dreamy",romantic:"dreamy",dreamy:"dreamy",magic:"dreamy",sad:"sad",fear:"sad",angry:"angry",playful:"happy",happy:"happy"};
let lastActivity=Date.now(), lastMood="dreamy", peekTimer=null, runTimer=null;
function asset(n){return ASSET+n+"?v=090"}
function particles(host,cls,glyphs,count){if(host.querySelector(`:scope > .${cls}`))return;const b=document.createElement("span");b.className=cls;b.setAttribute("aria-hidden","true");for(let i=0;i<count;i++){const s=document.createElement("i");s.textContent=glyphs[i%glyphs.length];s.style.setProperty("--i",i);b.appendChild(s)}host.prepend(b)}
function semanticPass(text){
 const rx=/\[\[(speaker|mood|thought):([^\]]+)\]\]/gi; let speaker="",mood="",thought="";
 [...text.querySelectorAll(":scope > p,:scope > blockquote,:scope > h1,:scope > h2,:scope > h3")].forEach(el=>{
   let found=false; el.innerHTML=el.innerHTML.replace(rx,(_,k,v)=>{found=true;v=(v||"").trim();k=k.toLowerCase();if(k==="speaker")speaker=v.slice(0,40);if(k==="thought")thought=v.slice(0,40);if(k==="mood"){let m=v.toLowerCase();mood=MOODS.has(m)?m:"neutral"}return ""});
   if(found && !(el.textContent||"").trim()){el.classList.add("rpg-marker-empty");return}
   if((speaker||mood) && (el.matches("p,blockquote"))){el.classList.add("rpg-dialogue",`rpg-mood-${mood||"neutral"}`);if(speaker)el.dataset.rpgSpeaker=speaker;speaker="";mood=""}
 });
 if(thought) text.querySelector("details.rpg-thoughts summary")?.setAttribute("data-rpg-owner",thought);
 text.querySelectorAll(".rpg-marker-empty").forEach(e=>e.remove());
}
function classify(){
 document.querySelectorAll("#chat .mes").forEach(mes=>{
  mes.classList.add("rp-glass-message"); const text=mes.querySelector(".mes_text"); if(!text)return;
  semanticPass(text);
  const scene=[...text.querySelectorAll(":scope > h1,:scope > h2,:scope > h3,:scope > p,:scope > blockquote")].find(e=>/📅|🕒|📍|🌫/.test(e.textContent||""));
  const name=mes.querySelector(".ch_name"); if(scene&&name){let meta=mes.querySelector(".rpg-meta-row");if(!meta){meta=document.createElement("div");meta.className="rpg-meta-row rpg-scene-header";name.insertAdjacentElement("afterend",meta)}meta.replaceChildren(...scene.childNodes);scene.remove();particles(meta,"rpg-header-sparkles",["✦","✧"],5)}
  text.querySelectorAll("details").forEach(d=>{const l=(d.querySelector("summary")?.textContent||"").toLowerCase();if(/мысл|thought|распаковать/.test(l)){d.classList.add("rpg-thoughts");particles(d,"rpg-stars",["✦","✧","⋆","·"],12)}if(/независим|читател|reader/.test(l)){d.classList.add("rpg-reader");particles(d,"rpg-reader-ambience",["",""],3);particles(d,"rpg-reader-dust",["✦","·","✧"],7)}})
 });
 updateMood();
}
function detectMood(){
 const last=[...document.querySelectorAll("#chat .mes")].at(-1); if(!last)return "dreamy";
 const marked=last.querySelector('[class*="rpg-mood-"]'); if(marked){const c=[...marked.classList].find(x=>x.startsWith("rpg-mood-"));if(c)return c.slice(9)}
 const s=(last.textContent||"").toLowerCase();
 if(/зл|ярост|гнев|бесит|ненавиж|крич|angry|rage/.test(s))return"angry";
 if(/груст|слез|плач|печал|боль|sad|cry/.test(s))return"sad";
 if(/сме|улыб|радост|хохот|весел|laugh|happy/.test(s))return"happy";
 if(/люб|нежн|целу|обня|мечта|сердц|romantic|kiss|dream/.test(s))return"dreamy";
 return"dreamy";
}
function shell(){
 let root=document.getElementById("rpg-hanabi-layer");if(root)return root;
 root=document.createElement("div");root.id="rpg-hanabi-layer";root.setAttribute("aria-hidden","true");root.innerHTML=`<div class="rpg-hanabi-portrait"><span class="rpg-hanabi-glow"></span><img></div><img class="rpg-chibi rpg-chibi-input"><img class="rpg-chibi rpg-chibi-run"><img class="rpg-chibi rpg-chibi-sleep"><img class="rpg-chibi rpg-chibi-peek"><div class="rpg-fx"></div>`;
 root.querySelector(".rpg-chibi-input").src=asset("hanabi-chibi-input.webp");root.querySelector(".rpg-chibi-run").src=asset("hanabi-chibi-run.webp");root.querySelector(".rpg-chibi-sleep").src=asset("hanabi-chibi-sleep.webp");root.querySelector(".rpg-chibi-peek").src=asset("hanabi-chibi-peek.webp");
 document.body.appendChild(root);return root;
}
function updateMood(){const m=detectMood();if(m===lastMood&&shell().dataset.ready)return;lastMood=m;const r=shell();r.dataset.mood=m;r.dataset.ready="1";r.querySelector(".rpg-hanabi-portrait img").src=asset(`hanabi-${portrait[m]||"dreamy"}.webp`);burst(m);showPeek()}
function burst(m){const fx=shell().querySelector(".rpg-fx");fx.innerHTML="";const glyph=m==="angry"?["✦","!","✧"]:m==="sad"?["·","✧","☾"]:m==="happy"?["♡","✦","✧"]:["♡","✦","✧","🦋"];for(let i=0;i<8;i++){const s=document.createElement("i");s.textContent=glyph[i%glyph.length];s.style.setProperty("--i",i);fx.appendChild(s)}}
function inputEl(){return document.querySelector("#send_form")||document.querySelector("#send_textarea")?.parentElement||document.querySelector("textarea")?.parentElement}
function placeInputChibi(){const r=shell(),img=r.querySelector(".rpg-chibi-input"),inp=inputEl();if(!inp)return;const b=inp.getBoundingClientRect();img.style.left=Math.max(8,Math.min(innerWidth-112,b.right-116))+"px";img.style.bottom=Math.max(52,innerHeight-b.top-5)+"px"}
function showPeek(){clearTimeout(peekTimer);const p=shell().querySelector(".rpg-chibi-peek");p.classList.add("show");peekTimer=setTimeout(()=>p.classList.remove("show"),5200)}
function runAcross(){const r=shell(),run=r.querySelector(".rpg-chibi-run");if(Date.now()-lastActivity>70000)return;run.classList.remove("go");void run.offsetWidth;run.classList.add("go");setTimeout(()=>run.classList.remove("go"),6500)}
function idle(){const r=shell();const sleepy=Date.now()-lastActivity>90000;r.classList.toggle("is-sleeping",sleepy)}
function boot(){document.documentElement.classList.add("rp-glass-loaded");shell();placeInputChibi();classify();const attach=()=>{const chat=document.querySelector("#chat");if(!chat)return setTimeout(attach,350);if(chat.dataset.rpg9!=="1"){chat.dataset.rpg9="1";new MutationObserver(()=>requestAnimationFrame(classify)).observe(chat,{childList:true,subtree:true})}};attach();["pointerdown","keydown","input","touchstart"].forEach(e=>document.addEventListener(e,()=>{lastActivity=Date.now();shell().classList.remove("is-sleeping")},{passive:true}));addEventListener("resize",placeInputChibi,{passive:true});addEventListener("scroll",placeInputChibi,{passive:true});setInterval(()=>{placeInputChibi();idle()},2500);runTimer=setInterval(runAcross,42000);setTimeout(runAcross,12000);console.log(`💜 RP Glass v${VERSION} — Hanabi Living UI loaded`)}
if(document.body)boot();else addEventListener("DOMContentLoaded",boot,{once:true});
})();
