const CLAVE_CORRECTA="AppDN2026.";
let DATA=null,IMAGES=[];
const $=s=>document.querySelector(s),home=$("#home"),detail=$("#detail"),gallery=$("#gallery");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const show=n=>{home.classList.toggle("hidden",n!=="home");detail.classList.toggle("hidden",n!=="detail");gallery.classList.toggle("hidden",n!=="gallery");};

function renderHome(){
 if(!DATA)return; show("home");
 home.innerHTML=`<div class="search"><span>⌕</span><input id="q" placeholder="Buscar equipo, componente o controlador..." autocomplete="off"></div>
 <div class="section"><h2>Áreas de mantenimiento</h2>${DATA.categories.map(c=>`<div class="category"><div class="catHead"><div class="catIcon">${esc(c.icon)}</div><div><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p></div></div><div class="chips">${c.equipment.map(e=>`<button class="chip equipment-chip" data-equipment="${esc(e)}">${esc(e)}</button>`).join("")}</div></div>`).join("")}</div>
 <div class="notice"><b>⚠ La seguridad, ante todo</b><br>Desconectar, bloquear y etiquetar antes de intervenir componentes eléctricos.</div>`;
 $("#q").addEventListener("input",e=>search(e.target.value));
 document.querySelectorAll(".equipment-chip").forEach(b=>b.addEventListener("click",()=>openEq(b.dataset.equipment)));
}
function search(q){
 q=q.toLowerCase().trim();
 document.querySelectorAll(".category").forEach(cat=>{let n=0;cat.querySelectorAll(".equipment-chip").forEach(b=>{
 const e=DATA.equipment[b.dataset.equipment]||{},text=[b.dataset.equipment,e.brand,e.category,e.temp,...(e.steps||[]),...(e.params||[]),...(e.notes||[])].join(" ").toLowerCase(),ok=!q||text.includes(q);
 b.style.display=ok?"":"none";if(ok)n++;});cat.style.display=n?"":"none";});
}
function openEq(name){
 const e=DATA?.equipment?.[name];if(!e)return;show("detail");
 const imgs=IMAGES.filter(x=>x.category===name||(name.includes("WIND")&&x.category==="Hornos Polin WIND 5")).slice(0,12);
 detail.innerHTML=`<button class="back" id="backHome">← Volver</button><div class="card"><h2>${esc(name)}</h2><div class="meta"><span class="pill">${esc(e.brand||"")}</span>${e.temp?`<span class="pill">Rango: ${esc(e.temp)}</span>`:""}</div></div>
 <div class="card"><h3>Rutina de mantenimiento</h3>${(e.steps||[]).map((s,i)=>`<div class="step"><div class="num">${i+1}</div><div>${esc(s)}</div></div>`).join("")}</div>
 ${e.params?.length?`<div class="card"><h3>Parámetros y referencias</h3><table class="table">${e.params.map(p=>`<tr><td>${esc(p)}</td></tr>`).join("")}</table></div>`:""}
 ${e.notes?.length?`<div class="card"><h3>Notas importantes</h3>${e.notes.map(n=>`<p class="small">• ${esc(n)}</p>`).join("")}</div>`:""}
 ${imgs.length?`<div class="card"><h3>Imágenes de referencia</h3><div class="galleryGrid">${imgs.map(x=>`<div class="galleryItem image-ref" data-file="${esc(x.file)}" data-caption="${esc(x.caption||"Referencia técnica")}"><img src="${esc(x.file)}" loading="lazy"><p>${esc(x.caption||"Referencia técnica")}</p></div>`).join("")}</div></div>`:""}`;
 $("#backHome").onclick=renderHome;document.querySelectorAll(".image-ref").forEach(el=>el.onclick=()=>zoom(el.dataset.file,el.dataset.caption));window.scrollTo(0,0);
}
function renderGallery(filter="Todas"){
 show("gallery");const cats=["Todas",...new Set(IMAGES.map(x=>x.category).filter(Boolean))],list=filter==="Todas"?IMAGES:IMAGES.filter(x=>x.category===filter);
 gallery.innerHTML=`<div class="section"><h2>Galería técnica</h2><p class="small">Imágenes organizadas para consulta en campo.</p></div>${IMAGES.length?`<div class="filterRow">${cats.map(c=>`<button class="chip gallery-filter" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}</div><div class="galleryGrid">${list.map(x=>`<div class="galleryItem image-ref" data-file="${esc(x.file)}" data-caption="${esc(x.caption||"Referencia técnica")}"><img src="${esc(x.file)}" loading="lazy"><p>${esc(x.category||"Referencia técnica")}</p></div>`).join("")}</div>`:`<div class="notice">La galería no está disponible todavía. La información de mantenimiento continúa funcionando.</div>`}`;
 document.querySelectorAll(".gallery-filter").forEach(b=>b.onclick=()=>renderGallery(b.dataset.filter));document.querySelectorAll(".image-ref").forEach(el=>el.onclick=()=>zoom(el.dataset.file,el.dataset.caption));
}
function zoom(file,cap){$("#modalImg").src=file;$("#modalCap").textContent=cap;$("#modal").classList.remove("hidden")}
function safety(){show("detail");detail.innerHTML=`<div class="section"><h2>Seguridad y EPP</h2><div class="card">${(DATA?.safety||[]).map(s=>`<div class="safetyItem"><span>⚠</span><span>${esc(s)}</span></div>`).join("")}</div></div>`}
$("#modal").onclick=e=>{if(e.target.id==="modal"||e.target.classList.contains("close"))$("#modal").classList.add("hidden")};
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>b.dataset.nav==="gallery"?renderGallery():b.dataset.nav==="safety"?safety():renderHome());
const overlay=$("#login-overlay"),input=$("#app-password"),error=$("#login-error");
function login(){if(input.value===CLAVE_CORRECTA){localStorage.setItem("app_acceso_autorizado","true");overlay.style.display="none"}else{error.style.display="block";input.select()}}
$("#login-button").onclick=login;input.onkeydown=e=>{if(e.key==="Enter")login()};if(localStorage.getItem("app_acceso_autorizado")==="true")overlay.style.display="none";
async function load(){try{let r=await fetch("data.json");if(!r.ok)throw Error();DATA=await r.json()}catch(e){home.innerHTML='<div class="notice">No se pudo cargar la información técnica.</div>';return}try{let r=await fetch("assets/images.json");if(r.ok){let a=await r.json();IMAGES=Array.isArray(a)?a:[]}}catch(e){console.warn("Galería opcional",e)}renderHome()}
load();