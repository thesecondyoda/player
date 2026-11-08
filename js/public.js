(async()=>{
 const db=window.kirinClient; const $=id=>document.getElementById(id); const esc=window.escapeHTML|| (s=>s);
 if($("langToggle"))$("langToggle").addEventListener("click",()=>{const ar=document.documentElement.lang!=="ar";document.documentElement.lang=ar?"ar":"en";document.documentElement.dir=ar?"rtl":"ltr";$("langToggle").textContent=ar?"EN":"文"});
 if(!db){if($("emptyState")){$("emptyState").hidden=false;$("emptyState").textContent="Connect Supabase in js/config.js to load the library."}return}
 const settings=await window.kirinSettings();window.applyKirinTheme(settings);
 if($("siteTitle"))$("siteTitle").textContent=settings.site_name||"LIBRARY";
 if($("siteSubtitle"))$("siteSubtitle").textContent=settings.site_subtitle||"";
 if($("footerText"))$("footerText").textContent=settings.footer_text||"READING ARCHIVE";
 const path=location.pathname.split("/").pop();
 if(path==="work.html"){await loadWork();return}
 await loadLibrary();
 async function loadLibrary(){
  let {data:works,error}=await db.from("works").select("*").eq("status","published").order("updated_at",{ascending:false});
  if(error){$("emptyState").hidden=false;$("emptyState").textContent=error.message;return}
  works=works||[];let selected="";const genres=[...new Set(works.flatMap(w=>w.genres||[]))].sort();
  $("genreFilters").innerHTML=genres.map(g=>`<button class="chip" data-genre="${esc(g)}">${esc(g)}</button>`).join("");
  $("genreFilters").addEventListener("click",e=>{const b=e.target.closest("[data-genre]");if(!b)return;selected=selected===b.dataset.genre?"":b.dataset.genre;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("selected",x.dataset.genre===selected));render()});
  $("workSearch").addEventListener("input",render);$("sortWorks").addEventListener("change",render);
  render();
  async function render(){let list=works.filter(w=>(!selected||(w.genres||[]).includes(selected))&&`${w.title} ${w.alt_title||""} ${(w.genres||[]).join(" ")}`.toLowerCase().includes($("workSearch").value.toLowerCase()));const sort=$("sortWorks").value;if(sort==="title")list.sort((a,b)=>a.title.localeCompare(b.title));if(sort==="year")list.sort((a,b)=>(b.release_year||0)-(a.release_year||0));$("workGrid").innerHTML=list.map(w=>`<a class="work-card" href="work.html?slug=${encodeURIComponent(w.slug)}"><div class="cover-wrap">${w.cover_path?`<img loading="lazy" src="${esc(db.storage.from("covers").getPublicUrl(w.cover_path).data.publicUrl)}" alt="">`:`<div class="cover-placeholder">K</div>`}<span class="type-tag">${esc(w.work_type||"Manga")}</span></div><div class="work-card-info"><h3>${esc(w.title)}</h3><p>${esc((w.genres||[]).slice(0,3).join(" · "))}</p><small>${w.release_year||""}</small></div></a>`).join("");$("emptyState").hidden=list.length>0}
 }
 async function loadWork(){
  const slug=new URLSearchParams(location.search).get("slug");const {data:w}=await db.from("works").select("*").eq("slug",slug).eq("status","published").maybeSingle();
  if(!w){$("workHero").innerHTML='<div class="empty-state">WORK NOT FOUND</div>';return}
  document.title=`${w.title} — KIRIN`;const cover=w.cover_path?db.storage.from("covers").getPublicUrl(w.cover_path).data.publicUrl:"";
  $("workHero").innerHTML=`<div class="detail-cover">${cover?`<img src="${esc(cover)}" alt="">`:'<div class="cover-placeholder">K</div>'}</div><div class="work-copy"><p class="eyebrow">${esc(w.work_type||"MANGA")} / ${w.release_year||"—"}</p><h1>${esc(w.title)}</h1>${w.alt_title?`<p class="muted">${esc(w.alt_title)}</p>`:""}<p class="work-description">${esc(w.description||"")}</p><div class="meta-grid">${w.author?`<span><b>AUTHOR</b>${esc(w.author)}</span>`:""}${w.artist?`<span><b>ARTIST</b>${esc(w.artist)}</span>`:""}<span><b>GENRES</b>${esc((w.genres||[]).join(" · "))}</span></div></div>`;
  const {data:chs}=await db.from("chapters").select("*").eq("work_id",w.id).eq("status","published").order("chapter_number",{ascending:false});const rows=chs||[];$("chapterCount").textContent=`${rows.length} CHAPTERS`;
  $("chapterList").innerHTML=rows.map(c=>`<a class="chapter-row" href="reader.html?chapter=${c.id}"><span class="chapter-number">CH. ${esc(c.chapter_number)}</span><span>${esc(c.title||"Chapter "+c.chapter_number)}</span><span class="chapter-date">${c.published_at?new Date(c.published_at).toLocaleDateString():""}</span><span>→</span></a>`).join("")||'<div class="empty-state">NO CHAPTERS PUBLISHED</div>';
 }
})();