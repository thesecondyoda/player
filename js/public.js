(async () => {
  const db = window.kirinClient, $ = id => document.getElementById(id), esc = window.escapeHTML;
  const fail = t => { $('chapterList').innerHTML = `<div class="empty-state">${esc(t)}</div>`; };
  if (!db) { fail('يرجى إعداد اتصال Supabase في js/config.js أولاً.'); return; }
  try {
    const settings = await window.kirinSettings(); window.applyKirinTheme(settings);
    if (settings.footer_text) $('footerText').textContent = settings.footer_text;
    const { data: w, error } = await db.from('works').select('*').eq('status', 'published').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!w) { $('workTitle').textContent = 'كيرين'; fail('لا يوجد عمل منشور بعد.'); return; }
    const cover = w.cover_path ? db.storage.from('covers').getPublicUrl(w.cover_path).data.publicUrl : '';
    document.title = `${w.title} — كيرين`;
    $('workTitle').textContent = w.title;
    if (w.alt_title) { $('workAlt').hidden = false; $('workAlt').textContent = w.alt_title; }
    $('workDesc').textContent = w.description || '';
    $('workTags').innerHTML = (w.genres || []).flatMap(g => String(g).split(/[،,]/)).map(g => g.trim()).filter(Boolean).map(g => `<span class="tag">${esc(g)}</span>`).join('');
    if (cover) { $('heroCover').innerHTML = `<img src="${esc(cover)}" alt="غلاف ${esc(w.title)}">`; document.body.style.setProperty('--cover', `url("${cover}")`); }
    const about = [['المؤلف', w.author], ['الرسام', w.artist], ['سنة الإصدار', w.release_year], ['النوع', ({ Manga: 'مانغا', Manhwa: 'مانهوا', Manhua: 'مانها', Comic: 'كوميك', Novel: 'رواية' })[w.work_type] || w.work_type]].filter(x => x[1]);
    if (about.length) { $('about').hidden = false; $('about').innerHTML = about.map(([k, v]) => `<div><b>${k}</b>${esc(v)}</div>`).join(''); }
    let res = await db.from('chapters').select('id,title,chapter_number,published_at,views').eq('work_id', w.id).eq('status', 'published');
    if (res.error) res = await db.from('chapters').select('id,title,chapter_number,published_at').eq('work_id', w.id).eq('status', 'published');
    if (res.error) throw res.error;
    const rows = (res.data || []).sort((a, b) => a.chapter_number - b.chapter_number);
    let desc = true;
    const fmt = d => d ? new Date(d).toLocaleDateString('ar-IQ') : '';
    function render() {
      const q = $('chapterSearch').value.trim();
      const list = rows.filter(c => !q || String(c.chapter_number).includes(q)); if (desc) list.reverse();
      $('chapterList').innerHTML = list.map(c => `<a class="chapter-row${localStorage.getItem('kirin-progress-' + c.id) !== null ? ' read' : ''}" href="reader.html?chapter=${encodeURIComponent(c.id)}"><span class="n num">${esc(c.chapter_number)}</span><span class="t">${esc(c.title || 'الفصل ' + c.chapter_number)}</span><span class="m">${fmt(c.published_at)}${c.views != null ? ' · ' + c.views : ''}</span><span>←</span></a>`).join('') || `<div class="empty-state">${rows.length ? 'لا يوجد فصل بهذا الرقم.' : 'لا توجد فصول منشورة بعد.'}</div>`;
    }
    $('chapterSearch').addEventListener('input', render);
    $('sortBtn').addEventListener('click', () => { desc = !desc; $('sortBtn').textContent = desc ? 'الأحدث أولاً' : 'الأقدم أولاً'; render(); });
    render();
    if (rows.length) {
      const link = (id, c) => { $(id).hidden = false; $(id).href = `reader.html?chapter=${encodeURIComponent(c.id)}`; };
      link('btnStart', rows[0]); link('btnLatest', rows[rows.length - 1]);
      const last = rows.find(c => c.id === localStorage.getItem('kirin-last'));
      if (last) { link('btnContinue', last); $('btnContinue').textContent = `تابع من الفصل ${last.chapter_number}`; $('btnStart').classList.remove('primary'); }
      $('stats').hidden = false; $('stCount').textContent = rows.length;
      $('stLatest').textContent = fmt(rows[rows.length - 1].published_at) || '—';
      const vs = rows.reduce((s, c) => s + (Number(c.views) || 0), 0); $('stViews').textContent = rows.some(c => c.views != null) ? vs : '—';
      $('stStatus').textContent = 'مستمر';
    }
  } catch (err) { console.error(err); fail('تعذر تحميل المحتوى. حدّث الصفحة وحاول مجدداً.'); }
})();
