(async()=>{
 const db=window.kirinClient,$=id=>document.getElementById(id);if(!db){$("pages").innerHTML='<div class="empty-state">Connect Supabase in js/config.js.</div>';return}
 const chapterId=new URLSearchParams(location.search).get("chapter");if(!chapterId){$("pages").innerHTML='<div class="empty-state">CHAPTER NOT FOUND</div>';return}
 const settings=await window.kirinSettings();window.applyKirinTheme(settings);
 const {data:chapter}=await db.from("chapters").select("*,works(id,title,slug)").eq("id",chapterId).eq("status","published").maybeSingle();
 if(!chapter){$("pages").innerHTML='<div class="empty-state">CHAPTER NOT FOUND</div>';return}
 $("readerTitle").textContent=`${chapter.works.title} — ${chapter.title||"Chapter "+chapter.chapter_number}`;document.title=$("readerTitle").textContent;
 $("backWork").href=`work.html?slug=${encodeURIComponent(chapter.works.slug)}`;
 const {data:all}=await db.from("chapters").select("id,chapter_number").eq("work_id",chapter.work_id).eq("status","published").order("chapter_number");
 const idx=(all||[]).findIndex(c=>c.id===chapter.id);if(idx>0)$("prevChapter").href=`reader.html?chapter=${all[idx-1].id}`;else $("prevChapter").style.visibility="hidden";if(idx>=0&&idx<all.length-1)$("nextChapter").href=`reader.html?chapter=${all[idx+1].id}`;else $("nextChapter").style.visibility="hidden";
 const {data:session}=await db.auth.getSession();const token=session?.session?.access_token;
 const res=await fetch(`${window.KIRIN_CONFIG.FUNCTIONS_BASE_URL}/chapter-pages?chapter_id=${encodeURIComponent(chapterId)}`,{headers:{apikey:window.KIRIN_CONFIG.SUPABASE_ANON_KEY,Authorization:`Bearer ${token||window.KIRIN_CONFIG.SUPABASE_ANON_KEY}`}});const payload=await res.json();
 if(!res.ok){$("pages").innerHTML=`<div class="empty-state">${window.escapeHTML(payload.error||"Unable to load pages")}</div>`;return}
 const pages=(payload.pages||[]).sort((a,b)=>a.page_number-b.page_number);$("pages").innerHTML=pages.map(p=>`<img class="manga-page" loading="lazy" draggable="false" src="${p.signed_url}" alt="Page ${p.page_number}">`).join("")||'<div class="empty-state">NO PAGES</div>';
 let mode=localStorage.getItem("kirin-reader-mode")||settings.default_reader_mode||"scroll";
 function setMode(){const single=mode==="single";$("pages").classList.toggle("single-mode",single);$("readerMode").textContent=single?"SINGLE":"SCROLL";if(single){const imgs=[...$("pages").querySelectorAll("img")];let n=0;imgs.forEach((im,i)=>im.hidden=i!==n);$("pages").onclick=()=>{n=(n+1)%imgs.length;imgs.forEach((im,i)=>im.hidden=i!==n)}}else{$("pages").onclick=null;$("pages").querySelectorAll("img").forEach(im=>im.hidden=false)}}
 $("readerMode").onclick=()=>{mode=mode==="scroll"?"single":"scroll";localStorage.setItem("kirin-reader-mode",mode);setMode()};setMode();
 $("fullScreen").onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
 const key=e=>{if(mode!=="single")return;const imgs=[...$("pages").querySelectorAll("img")],i=imgs.findIndex(x=>!x.hidden);if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();imgs[(i+1)%imgs.length].hidden=false;imgs[i].hidden=true}if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();imgs[(i-1+imgs.length)%imgs.length].hidden=false;imgs[i].hidden=true}};document.addEventListener("keydown",key);
 if(settings.reading_progress!=="false"){const key=`kirin-progress-${chapterId}`;window.addEventListener("scroll",()=>localStorage.setItem(key,String(Math.round(window.scrollY))),{passive:true});const y=Number(localStorage.getItem(key)||0);if(y>0&&mode==="scroll")setTimeout(()=>window.scrollTo(0,y),300)}
})();