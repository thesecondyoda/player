(async () => {
  const db = window.kirinClient, $ = id => document.getElementById(id), esc = window.escapeHTML;
  if (!db) { if ($('emptyState')) { $('emptyState').hidden = false; $('emptyState').textContent = 'يرجى إعداد اتصال Supabase في ملف js/config.js أولاً.'; } return; }
  try { const settings = await window.kirinSettings(); window.applyKirinTheme(settings);
    if ($('siteTitle')) $('siteTitle').textContent = settings.site_name || 'مكتبة كيرين';
    if ($('siteSubtitle')) $('siteSubtitle').textContent = settings.site_subtitle || 'اكتشف أعمالك واقرأ فصولك المفضلة.';
    if ($('footerText')) $('footerText').textContent = settings.footer_text || 'مكتبة قراءة المانغا';
    if (location.pathname.endsWith('work.html')) await loadWork(); else await loadLibrary();
  } catch (err) { console.error(err); const target = $('emptyState') || $('chapterList'); if (target) { target.hidden = false; target.textContent = 'تعذر تحميل المحتوى. تحقق من الاتصال وحاول مجدداً.'; } }
  async function loadLibrary() {
    const { data, error } = await db.from('works').select('*').eq('status','published').order('updated_at',{ascending:false});
    if (error) throw error; const works = data || []; let selected = '';
    const genres = [...new Set(works.flatMap(w => Array.isArray(w.genres) ? w.genres : []))].sort((a,b)=>a.localeCompare(b,'ar'));
    $('genreFilters').innerHTML = genres.map(g => `<button type="button" class="chip" data-genre="${esc(g)}">${esc(g)}</button>`).join('');
    $('genreFilters').addEventListener('click', e => { const b=e.target.closest('[data-genre]'); if(!b)return; selected=selected===b.dataset.genre?'':b.dataset.genre; document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('selected',x.dataset.genre===selected)); render(); });
    $('workSearch').addEventListener('input',render); $('sortWorks').addEventListener('change',render); render();
    function render() { const q=$('workSearch').value.trim().toLocaleLowerCase('ar'); let list=works.filter(w=>(!selected||(w.genres||[]).includes(selected))&&`${w.title||''} ${w.alt_title||''} ${(w.genres||[]).join(' ')}`.toLocaleLowerCase('ar').includes(q)); const sort=$('sortWorks').value; if(sort==='title')list.sort((a,b)=>(a.title||'').localeCompare(b.title||'','ar')); if(sort==='year')list.sort((a,b)=>(b.release_year||0)-(a.release_year||0));
      $('workGrid').innerHTML=list.map(w=>{const cover=w.cover_path?db.storage.from('covers').getPublicUrl(w.cover_path).data.publicUrl:'';return `<a class="work-card" href="work.html?slug=${encodeURIComponent(w.slug)}"><div class="cover-wrap">${cover?`<img loading="lazy" src="${esc(cover)}" alt="غلاف ${esc(w.title)}">`:'<div class="cover-placeholder">K</div>'}<span class="type-tag">${esc(typeAr(w.work_type))}</span></div><div class="work-card-info"><h3>${esc(w.title)}</h3><p>${esc((w.genres||[]).slice(0,3).join(' · '))}</p><small>${w.release_year||''}</small></div></a>`}).join(''); $('emptyState').hidden=list.length>0; $('emptyState').textContent='لا توجد نتائج مطابقة لبحثك.';
    }
  }
  async function loadWork() {
    const slug=new URLSearchParams(location.search).get('slug'); if(!slug){$('workHero').innerHTML='<div class="empty-state">لم يتم تحديد العمل.</div>';return;}
    const {data:w,error}=await db.from('works').select('*').eq('slug',slug).eq('status','published').maybeSingle(); if(error)throw error; if(!w){$('workHero').innerHTML='<div class="empty-state">لم يتم العثور على العمل.</div>';return;}
    document.title=`${w.title} — كيرين`; const cover=w.cover_path?db.storage.from('covers').getPublicUrl(w.cover_path).data.publicUrl:'';
    $('workHero').innerHTML=`<div class="detail-cover">${cover?`<img src="${esc(cover)}" alt="غلاف ${esc(w.title)}">`:'<div class="cover-placeholder">K</div>'}</div><div class="work-copy"><p class="eyebrow">${esc(typeAr(w.work_type))} / ${w.release_year||'—'}</p><h1>${esc(w.title)}</h1>${w.alt_title?`<p class="muted">${esc(w.alt_title)}</p>`:''}<p class="work-description">${esc(w.description||'لا يتوفر وصف لهذا العمل حالياً.')}</p><div class="meta-grid">${w.author?`<span><b>المؤلف</b>${esc(w.author)}</span>`:''}${w.artist?`<span><b>الرسام</b>${esc(w.artist)}</span>`:''}<span><b>التصنيفات</b>${esc((w.genres||[]).join(' · ')||'غير محدد')}</span><span><b>الحالة</b>${esc(w.status==='published'?'منشور':'مسودة')}</span></div></div>`;
    const {data:chs,error:ce}=await db.from('chapters').select('id,title,chapter_number,created_at,published_at').eq('work_id',w.id).eq('status','published').order('chapter_number',{ascending:false}); if(ce)throw ce; const rows=chs||[]; $('chapterCount').textContent=`${rows.length} فصل`;
    $('chapterList').innerHTML=rows.map(c=>`<a class="chapter-row" href="reader.html?chapter=${encodeURIComponent(c.id)}"><span class="chapter-number">الفصل ${esc(c.chapter_number)}</span><span>${esc(c.title||`الفصل ${c.chapter_number}`)}</span><span class="chapter-date">${c.published_at?new Date(c.published_at).toLocaleDateString('ar-IQ'):''}</span><span>←</span></a>`).join('')||'<div class="empty-state">لا توجد فصول منشورة لهذا العمل بعد.</div>';
  }
  function typeAr(v){return ({Manga:'مانغا',Manhwa:'مانهوا',Manhua:'مانها',Comic:'كوميك',Novel:'رواية'})[v]||v||'مانغا';}
})();
