(() => {
 const $=s=>document.querySelector(s), db=window.kirinSupabase;
 const dict={en:{library:"LIBRARY",search:"Search chapters",empty:"— NO CHAPTERS —"},ar:{library:"الفصول",search:"بحث عن فصل",empty:"— لا توجد فصول —"},ja:{library:"チャプター",search:"チャプター検索",empty:"—"}};
 let lang=localStorage.getItem("kirin-lang")||"en", chapters=[];
 function applyLang(){document.documentElement.lang=lang;document.documentElement.dir=lang==="en"||lang==="ja"?"ltr":"rtl";document.querySelectorAll("[data-i18n]").forEach(e=>e.textContent=dict[lang][e.dataset.i18n]||e.textContent);document.querySelectorAll("[data-i18n-placeholder]").forEach(e=>e.placeholder=dict[lang][e.dataset.i18nPlaceholder]||e.placeholder);$("#langToggle").textContent=lang==="en"?"文":lang==="ar"?"EN":"ع";}
 function render(){let q=$("#chapterSearch").value.trim().toLowerCase(), filtered=chapters.filter(c=>(c.title||"").toLowerCase().includes(q)||String(c.chapter_number).includes(q));$("#chapterGrid").innerHTML=filtered.map(c=>`<a class="chapter-card" href="reader.html?id=${encodeURIComponent(c.id)}"><span class="num">CHAPTER ${String(c.chapter_number).padStart(2,"0")}</span><strong>${escapeHtml(c.title||"—")}</strong><span class="meta"><span>${c.page_count||0} PAGES</span><span>›</span></span></a>`).join("");$("#emptyState").hidden=filtered.length>0;$("#emptyState").textContent=dict[lang].empty;}
 function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 async function load(){if(db){const {data,error}=await db.from("chapters").select("id,title,chapter_number,page_count,created_at").eq("published",true).order("chapter_number",{ascending:false});if(!error)chapters=data||[];}render();}
 $("#langToggle").onclick=()=>{lang=lang==="en"?"ar":lang==="ar"?"ja":"en";localStorage.setItem("kirin-lang",lang);applyLang();render();};
 $("#themeToggle").onclick=()=>{document.body.classList.toggle("light-mode");localStorage.setItem("kirin-theme",document.body.classList.contains("light-mode")?"light":"dark");};
 if(localStorage.getItem("kirin-theme")==="light")document.body.classList.add("light-mode");
 $("#chapterSearch").addEventListener("input",render);$("#seriesTitle").textContent=window.KIRIN_CONFIG.seriesTitle||"KIRIN";applyLang();load();
})();