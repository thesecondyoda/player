(() => {
 const $=s=>document.querySelector(s), db=window.kirinSupabase, params=new URLSearchParams(location.search), chapterId=params.get("id");
 let pages=[],index=0,layout=localStorage.getItem("kirin-layout")||"scroll",fit="contain",hideTimer;
 const stage=$("#readerStage"),container=$("#readerPages");
 function msg(t){$("#readerLoading").textContent=t;$("#readerLoading").hidden=false;}
 function hideMsg(){$("#readerLoading").hidden=true;}
 function updateCounter(){$("#pageCounter").textContent=pages.length?`${index+1} / ${pages.length}`:"— / —";}
 function render(){container.className="reader-pages"+(layout==="single"?" single":"");container.innerHTML="";pages.forEach((p,i)=>{const img=document.createElement("img");img.className="reader-page";img.alt="";img.draggable=false;img.decoding="async";img.loading=i<3?"eager":"lazy";img.src=p.url;img.addEventListener("contextmenu",e=>e.preventDefault());container.appendChild(img);});updateCounter();hideMsg();if(layout==="single")showPage(index);}
 function showPage(n){index=Math.max(0,Math.min(n,pages.length-1));[...container.children].forEach((el,i)=>el.hidden=i!==index);updateCounter();}
 async function load(){if(!db){msg("—");return;}if(!chapterId){msg("—");return;}msg("…");const {data:ch,error}=await db.from("chapters").select("id,title,chapter_number").eq("id",chapterId).eq("published",true).single();if(error||!ch){msg("—");return;}$("#chapterName").textContent=ch.title||`Chapter ${ch.chapter_number}`;$("#chapterSeries").textContent=window.KIRIN_CONFIG.seriesTitle||"KIRIN";
 const {data:result,error:fnError}=await db.functions.invoke("chapter-pages",{body:{chapter_id:chapterId}});if(fnError||!result?.pages?.length){msg("—");return;}pages=result.pages;render();const saved=Number(localStorage.getItem("kirin-progress-"+chapterId)||0);if(saved>0&&saved<pages.length){index=saved;if(layout==="single")showPage(index);else stage.scrollTop=0;}
 }
 function next(){if(layout==="single")showPage(index+1);else{stage.scrollBy({top:Math.max(500,stage.clientHeight*.85),behavior:"smooth"});}}
 function prev(){if(layout==="single")showPage(index-1);else stage.scrollBy({top:-Math.max(500,stage.clientHeight*.85),behavior:"smooth"});}
 $("#nextPage").onclick=next;$("#prevPage").onclick=prev;
 $("#layoutToggle").onclick=()=>{layout=layout==="scroll"?"single":"scroll";localStorage.setItem("kirin-layout",layout);render();};
 $("#fitToggle").onclick=()=>{fit=fit==="contain"?"width":"contain";container.querySelectorAll("img").forEach(img=>img.style.width=fit==="width"?"100%":"auto");};
 $("#fullscreenToggle").onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();};
 $("#hideBarToggle").onclick=()=>document.body.classList.toggle("reader-hidden");
 $("#nextChapter").onclick=()=>navigateChapter(1);$("#prevChapter").onclick=()=>navigateChapter(-1);
 async function navigateChapter(delta){if(!db)return;const {data}=await db.from("chapters").select("id,chapter_number").eq("published",true).order("chapter_number",{ascending:true});if(!data)return;let i=data.findIndex(x=>x.id===chapterId),target=data[i+delta];if(target)location.href=`reader.html?id=${encodeURIComponent(target.id)}`;}
 stage.addEventListener("scroll",()=>{if(layout==="scroll"){let imgs=[...container.children],mid=stage.scrollTop+stage.clientHeight*.45,best=0;imgs.forEach((el,i)=>{if(el.offsetTop<=mid)best=i;});index=best;updateCounter();localStorage.setItem("kirin-progress-"+chapterId,index);}});
 document.addEventListener("keydown",e=>{if(["ArrowRight","ArrowLeft","PageDown"].includes(e.key)){e.preventDefault();next();}if(["PageUp"].includes(e.key)){e.preventDefault();prev();}if(e.key==="Escape")document.body.classList.remove("reader-hidden");});
 document.addEventListener("contextmenu",e=>e.preventDefault());document.addEventListener("dragstart",e=>e.preventDefault());document.addEventListener("copy",e=>e.preventDefault());
 document.addEventListener("visibilitychange",()=>{if(document.hidden)document.body.classList.add("reader-hidden");});
 document.addEventListener("mousemove",()=>{document.body.classList.remove("reader-hidden");clearTimeout(hideTimer);hideTimer=setTimeout(()=>document.body.classList.add("reader-hidden"),4500);});
 document.addEventListener("touchstart",()=>{document.body.classList.remove("reader-hidden");clearTimeout(hideTimer);hideTimer=setTimeout(()=>document.body.classList.add("reader-hidden"),4500);},{passive:true});
 const originalRender=render;load();
})();