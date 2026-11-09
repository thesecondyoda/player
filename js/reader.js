(async () => {
  const db=window.kirinClient, $=id=>document.getElementById(id), esc=window.escapeHTML;
  const fail=t=>{$('pages').innerHTML=`<div class="empty-state">${esc(t)}</div>`;};
  if(!db){fail('يرجى إعداد اتصال Supabase أولاً.');return;}
  const chapterId=new URLSearchParams(location.search).get('chapter'); if(!chapterId){fail('لم يتم تحديد الفصل.');return;}
  try {
    const settings=await window.kirinSettings(); window.applyKirinTheme(settings);
    const {data:chapter,error}=await db.from('chapters').select('id,work_id,title,chapter_number,works(id,title,slug)').eq('id',chapterId).eq('status','published').maybeSingle();
    if(error)throw error; if(!chapter||!chapter.works){fail('الفصل غير موجود أو لم يتم نشره.');return;}
    $('readerTitle').textContent=`${chapter.works.title} — ${chapter.title||'الفصل '+chapter.chapter_number}`; document.title=$('readerTitle').textContent; $('backWork').href=`index.html#chapters`;
    const {data:all,error:ae}=await db.from('chapters').select('id,chapter_number').eq('work_id',chapter.work_id).eq('status','published').order('chapter_number',{ascending:true}); if(ae)throw ae; const idx=(all||[]).findIndex(c=>c.id===chapter.id);
    if(idx>0)$('prevChapter').href=`reader.html?chapter=${all[idx-1].id}`;else $('prevChapter').hidden=true; if(idx>=0&&idx<(all||[]).length-1)$('nextChapter').href=`reader.html?chapter=${all[idx+1].id}`;else $('nextChapter').hidden=true;
    const {data:pr,error:pe}=await db.from('chapter_pages').select('page_number,storage_path').eq('chapter_id',chapterId).order('page_number',{ascending:true}); if(pe)throw pe;
    let pages=[]; if((pr||[]).length){const {data:su,error:se}=await db.storage.from('chapter-pages').createSignedUrls(pr.map(p=>p.storage_path),3600); if(se)throw se; pages=pr.map((p,i)=>({page_number:p.page_number,signed_url:su[i]&&su[i].signedUrl})).filter(p=>p.signed_url);} if(!pages.length){fail('لا توجد صفحات مضافة إلى هذا الفصل.');return;}
    $('pages').innerHTML=pages.map(p=>`<img class="manga-page" loading="lazy" draggable="false" src="${esc(p.signed_url)}" alt="صفحة ${p.page_number}" data-page="${p.page_number}">`).join('');
    const imgs=[...$('pages').querySelectorAll('img')]; imgs.forEach(im=>im.addEventListener('error',()=>{im.alt='تعذر تحميل الصفحة';im.classList.add('image-error');}));
    let mode=localStorage.getItem('kirin-reader-mode')||settings.default_reader_mode||'scroll'; let current=0; const progressKey=`kirin-progress-${chapterId}`;
    function updateIndicator(){ if(mode==='single')$('readProgress').style.width=((current+1)/imgs.length*100)+'%'; $('pageIndicator').textContent=`${Math.min(current+1,imgs.length)} / ${imgs.length}`; $('pagePrev').disabled=current<=0; $('pageNext').disabled=current>=imgs.length-1; }
    function showPage(n,scroll=true){current=Math.max(0,Math.min(imgs.length-1,n));imgs.forEach((im,i)=>im.hidden=i!==current);updateIndicator();if(scroll)window.scrollTo({top:0,behavior:'auto'});}
    function setMode(){const single=mode==='single';$('pages').classList.toggle('single-mode',single);$('readerMode').textContent=single?'صفحة واحدة':'تمرير';document.querySelector('.reader-bottom-nav').hidden=!single;if(single){showPage(current,false);}else{imgs.forEach(im=>im.hidden=false);const saved=Number(localStorage.getItem(progressKey)||0);if(saved>0)requestAnimationFrame(()=>window.scrollTo(0,saved));}}
    $('readerMode').onclick=()=>{mode=mode==='scroll'?'single':'scroll';localStorage.setItem('kirin-reader-mode',mode);setMode();}; $('pagePrev').onclick=()=>showPage(current-1); $('pageNext').onclick=()=>showPage(current+1); $('pages').addEventListener('click',e=>{if(mode==='single'&&e.target.matches('img'))showPage(current+1);});
    document.addEventListener('keydown',e=>{if(mode!=='single')return;if(['ArrowRight','ArrowDown','PageDown'].includes(e.key)){e.preventDefault();showPage(current+1);}if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();showPage(current-1);}});
    $('fullScreen').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.();else await document.exitFullscreen?.();}catch(e){console.warn(e);}};
    if(settings.reading_progress!==false){let timer;window.addEventListener('scroll',()=>{if(mode!=='scroll')return;clearTimeout(timer);timer=setTimeout(()=>localStorage.setItem(progressKey,String(window.scrollY)),150);},{passive:true});} window.addEventListener('scroll',()=>{if(mode!=='scroll')return;const h=document.documentElement.scrollHeight-innerHeight;$('readProgress').style.width=(h>0?Math.min(100,scrollY/h*100):0)+'%';},{passive:true}); localStorage.setItem('kirin-last',chapterId); try{db.rpc('kirin_hit_chapter',{p_chapter:chapterId}).then(()=>{},()=>{});}catch(e){} setMode();
  } catch(err){console.error(err);fail(err.message||'حدث خطأ أثناء تحميل الفصل.');}
})();
