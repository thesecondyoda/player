(() => {
 const cfg=window.KIRIN_CONFIG||{};
 window.kirinClient=(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes("YOUR_"))?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
 window.kirinReady=()=>!!window.kirinClient;
 window.kirinSettings=async()=>{if(!window.kirinClient)return {};const {data}=await window.kirinClient.from("site_settings").select("*").eq("id",1).maybeSingle();return data||{}};
 window.applyKirinTheme=(s={})=>{const r=document.documentElement;r.style.setProperty("--accent",s.accent_color||"#6c8cff");r.style.setProperty("--bg",s.background_color||"#080b14");r.style.setProperty("--text",s.text_color||"#edf1ff");document.querySelectorAll(".brand span:last-child").forEach(el=>el.textContent=s.site_name||"KIRIN");document.querySelectorAll(".brand-mark").forEach(el=>{if(s.logo_path&&window.kirinClient){const u=window.kirinClient.storage.from("covers").getPublicUrl(s.logo_path).data.publicUrl;el.innerHTML=`<img src="${u}" alt="" style="width:100%;height:100%;object-fit:contain">`}else el.textContent=s.logo_text||"K"});if(s.site_name)document.title=`${s.site_name} — KIRIN`;};
 window.escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 window.slugify=s=>String(s||"").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"");
 document.addEventListener("click",e=>{if(e.target.closest("#themeToggle")||e.target.closest("#readerTheme")){document.body.classList.toggle("light-mode");localStorage.setItem("kirin-theme",document.body.classList.contains("light-mode")?"light":"dark") }});
 if(localStorage.getItem("kirin-theme")==="light")document.body.classList.add("light-mode");
 document.addEventListener("contextmenu",e=>{if(e.target.closest(".reader-pages"))e.preventDefault()});
 document.addEventListener("dragstart",e=>{if(e.target.closest(".reader-pages"))e.preventDefault()});
})();