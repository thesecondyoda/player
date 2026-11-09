(async () => {
  const db = window.kirinClient, $ = id => document.getElementById(id), esc = window.escapeHTML;
  const toast = (t, bad) => { const e = $('toast'); e.textContent = t; e.className = 'toast show' + (bad ? ' bad' : ''); clearTimeout(toast.t); toast.t = setTimeout(() => e.className = 'toast', 4500); };
  const msg = e => { console.error(e); return (e && e.message) || 'خطأ غير معروف'; };
  const vis = (id, on) => { $(id).hidden = !on; };
  if (!db) { document.querySelector('main').innerHTML = '<p class="empty-state">اتصال Supabase غير مضبوط في js/config.js.</p>'; return; }
  let W = null, chapters = [], editing = null;
  async function toWebp(f) {
    if (f.type === 'image/webp' || f.type === 'image/avif') return f;
    try { const bm = await createImageBitmap(f), c = document.createElement('canvas'); c.width = bm.width; c.height = bm.height; c.getContext('2d').drawImage(bm, 0, 0); if (bm.close) bm.close();
      const b = await new Promise(r => c.toBlob(r, 'image/webp', 1)); if (!b || b.type !== 'image/webp' || b.size >= f.size) return f;
      return new File([b], f.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' }); } catch (e) { return f; }
  }
  const ext = f => (f.name.split('.').pop() || 'jpg').toLowerCase();
  const genres = w => (w.genres || []).flatMap(g => String(g).split(/[،,]/)).map(s => s.trim()).filter(Boolean);

  async function gate() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) { vis('login', 1); vis('app', 0); vis('logout', 0); return; }
    const { data, error } = await db.from('kirin_admins').select('user_id').eq('user_id', user.id).maybeSingle();
    if (error || !data) { vis('login', 1); vis('app', 0); $('loginMsg').textContent = error ? msg(error) : 'هذا الحساب غير مضاف إلى kirin_admins.'; vis('logout', 1); return; }
    vis('login', 0); vis('app', 1); vis('logout', 1); await load();
  }
  $('loginForm').onsubmit = async e => { e.preventDefault(); $('loginMsg').textContent = '...'; const { error } = await db.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value }); if (error) { $('loginMsg').textContent = 'تعذر الدخول: ' + error.message; return; } $('password').value = ''; await gate(); };
  $('logout').onclick = async () => { await db.auth.signOut(); await gate(); };
  const tab = t => { document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === t)); document.querySelectorAll('.view').forEach(v => v.hidden = v.id !== 'tab-' + t); window.scrollTo(0, 0); };
  document.addEventListener('click', e => { const b = e.target.closest('[data-tab],[data-go]'); if (b) tab(b.dataset.tab || b.dataset.go); });

  async function load() {
    const r = await db.from('works').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (r.error) return toast(msg(r.error), 1);
    W = r.data; const w = W || {};
    $('wTitle').value = w.title || ''; $('wAlt').value = w.alt_title || ''; $('wSlug').value = w.slug || ''; $('wAuthor').value = w.author || ''; $('wArtist').value = w.artist || '';
    $('wYear').value = w.release_year || ''; $('wType').value = w.work_type || 'Manga'; $('wStatus').value = w.status || 'published'; $('wGenres').value = genres(w).join('، '); $('wDesc').value = w.description || '';
    const u = w.cover_path ? db.storage.from('covers').getPublicUrl(w.cover_path).data.publicUrl : ''; $('coverPrev').hidden = !u; if (u) $('coverPrev').src = u;
    $('ovTitle').textContent = w.title || 'لا يوجد عمل'; await loadChapters();
  }
  $('workForm').onsubmit = async e => {
    e.preventDefault(); const b = e.submitter; b.disabled = true;
    try {
      let cover = W ? W.cover_path : null; const f = $('wCover').files[0];
      if (f) { if (!window.kirinImageValid(f)) throw new Error('الغلاف: JPG أو PNG أو WebP أو AVIF حتى 15MB.'); const p = `cover-${Date.now()}.${ext(f)}`; const u = await db.storage.from('covers').upload(p, f, { contentType: f.type }); if (u.error) throw u.error; cover = p; }
      const title = $('wTitle').value.trim();
      const row = { title, slug: $('wSlug').value.trim() || window.slugify(title) || 'work-' + Date.now(), alt_title: $('wAlt').value.trim() || null, author: $('wAuthor').value.trim() || null, artist: $('wArtist').value.trim() || null, release_year: Number($('wYear').value) || null, work_type: $('wType').value, status: $('wStatus').value, genres: $('wGenres').value.split(/[،,]/).map(s => s.trim()).filter(Boolean), description: $('wDesc').value.trim() || null, cover_path: cover, updated_at: new Date().toISOString() };
      const r = W ? await db.from('works').update(row).eq('id', W.id) : await db.from('works').insert(row);
      if (r.error) throw r.error; $('wCover').value = ''; toast('تم حفظ العمل'); await load();
    } catch (x) { toast(msg(x), 1); }
    b.disabled = false;
  };

  async function loadChapters() {
    if (!W) { chapters = []; return renderCh(); }
    const q = await db.from('chapters').select('*').or(`work_id.eq.${W.id},work_id.is.null`).order('chapter_number', { ascending: false });
    if (q.error) return toast(msg(q.error), 1); chapters = q.data || []; renderCh();
  }
  function renderCh() {
    const orph = chapters.filter(c => !c.work_id); vis('orphans', orph.length > 0); $('orphanText').textContent = `${orph.length} فصل غير مربوط بأي عمل (فصول قديمة)، لذلك لا تظهر للزوار.`;
    const pub = chapters.filter(c => c.status === 'published').length;
    $('stPub').textContent = pub; $('stDraft').textContent = chapters.length - pub; $('stPages').textContent = chapters.reduce((s, c) => s + (c.page_count || 0), 0);
    $('stViews').textContent = chapters.some(c => c.views != null) ? chapters.reduce((s, c) => s + (Number(c.views) || 0), 0) : '—';
    $('chList').innerHTML = chapters.map(c => `<div class="row" data-id="${c.id}"><span class="n mono">${esc(c.chapter_number)}</span><span>${esc(c.title || 'الفصل ' + c.chapter_number)}<span class="badge ${c.status === 'published' ? 'on' : ''}">${c.status === 'published' ? 'منشور' : 'مسودة'}</span><span class="badge">${c.page_count || 0} صفحة</span>${c.work_id ? '' : '<span class="badge">غير مربوط</span>'}</span><div class="acts"><button class="btn" data-act="toggle">${c.status === 'published' ? 'إخفاء' : 'نشر'}</button><button class="btn" data-act="edit">تعديل</button><button class="btn danger" data-act="del">حذف</button></div></div>`).join('') || '<p class="muted">لا توجد فصول بعد.</p>';
  }
  $('linkOrphans').onclick = async () => { if (!W) return toast('احفظ العمل أولاً', 1); const r = await db.from('chapters').update({ work_id: W.id }).is('work_id', null); if (r.error) return toast(msg(r.error), 1); toast('تم ربط الفصول'); await loadChapters(); };
  function resetCh() { editing = null; $('chapterForm').reset(); $('cHead').textContent = 'فصل جديد'; $('cMsg').textContent = ''; }
  $('cReset').onclick = resetCh;
  $('chList').onclick = async e => {
    const b = e.target.closest('[data-act]'); if (!b) return; const id = b.closest('.row').dataset.id, c = chapters.find(x => x.id === id); if (!c) return;
    try {
      if (b.dataset.act === 'edit') { editing = c; $('cNumber').value = c.chapter_number; $('cTitle').value = c.title || ''; $('cStatus').value = c.status || 'draft'; $('cFiles').value = ''; $('cHead').textContent = 'تعديل الفصل ' + c.chapter_number; $('chapterForm').scrollIntoView({ behavior: 'smooth' }); }
      if (b.dataset.act === 'toggle') { const pub = c.status !== 'published'; const r = await db.from('chapters').update({ status: pub ? 'published' : 'draft', published: pub, published_at: pub ? (c.published_at || new Date().toISOString()) : null }).eq('id', id); if (r.error) throw r.error; await loadChapters(); }
      if (b.dataset.act === 'del') {
        if (!confirm(`حذف الفصل ${c.chapter_number} وكل صفحاته نهائياً؟`)) return;
        const pg = await db.from('chapter_pages').select('storage_path').eq('chapter_id', id); if (pg.error) throw pg.error;
        if ((pg.data || []).length) { const rm = await db.storage.from('chapter-pages').remove(pg.data.map(p => p.storage_path)); if (rm.error) throw rm.error; }
        const d1 = await db.from('chapter_pages').delete().eq('chapter_id', id); if (d1.error) throw d1.error;
        const d2 = await db.from('chapters').delete().eq('id', id); if (d2.error) throw d2.error; toast('تم حذف الفصل'); if (editing && editing.id === id) resetCh(); await loadChapters();
      }
    } catch (x) { toast(msg(x), 1); }
  };
  $('chapterForm').onsubmit = async e => {
    e.preventDefault(); if (!W) return toast('احفظ العمل أولاً', 1); const b = e.submitter; b.disabled = true; const up = [];
    try {
      const files = [...$('cFiles').files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      for (const f of files) if (!window.kirinImageValid(f)) throw new Error('ملف غير صالح (النوع أو الحجم): ' + f.name);
      let info = '';
      if ($('cWebp').checked) { let k = 0, a = 0, z = 0; for (const [i, f] of files.entries()) { $('cMsg').textContent = `تحويل ${i + 1} / ${files.length}`; const o = await toWebp(f); if (o !== f) k++; a += f.size; z += o.size; files[i] = o; } info = ` — WebP: ${k} من ${files.length} صفحة${a > z ? '، وُفّر ' + Math.round((1 - z / a) * 100) + '%' : ''}`; }
      const st = $('cStatus').value, num = Number($('cNumber').value); if (!(num >= 0)) throw new Error('رقم الفصل مطلوب.');
      const row = { work_id: W.id, title: $('cTitle').value.trim() || null, chapter_number: num, status: st, published: st === 'published', published_at: st === 'published' ? ((editing && editing.published_at) || new Date().toISOString()) : null };
      let id = editing && editing.id;
      if (id) { const r = await db.from('chapters').update(row).eq('id', id); if (r.error) throw r.error; } else { const r = await db.from('chapters').insert(row).select('id').single(); if (r.error) throw r.error; id = r.data.id; }
      if (files.length) {
        const recs = [];
        for (const [i, f] of files.entries()) { $('cMsg').textContent = `${i + 1} / ${files.length}`; const p = `${id}/${String(i + 1).padStart(3, '0')}-${Date.now()}.${ext(f)}`; const u = await db.storage.from('chapter-pages').upload(p, f, { contentType: f.type }); if (u.error) throw u.error; up.push(p); recs.push({ chapter_id: id, page_number: i + 1, storage_path: p }); }
        const old = (await db.from('chapter_pages').select('page_number,storage_path').eq('chapter_id', id)).data || [];
        if (old.length) { const d = await db.from('chapter_pages').delete().eq('chapter_id', id); if (d.error) throw d.error; }
        const ins = await db.from('chapter_pages').insert(recs);
        if (ins.error) { if (old.length) await db.from('chapter_pages').insert(old.map(x => ({ chapter_id: id, ...x }))); throw ins.error; }
        up.length = 0; if (old.length) await db.storage.from('chapter-pages').remove(old.map(x => x.storage_path));
        await db.from('chapters').update({ page_count: files.length }).eq('id', id);
      }
      toast('تم حفظ الفصل' + info); resetCh(); await loadChapters();
    } catch (x) { if (up.length) await db.storage.from('chapter-pages').remove(up); toast(msg(x), 1); }
    b.disabled = false;
  };
  db.auth.onAuthStateChange(() => {}); await gate();
})();
