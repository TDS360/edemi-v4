/* ===== 08-audiolab.js  Audio Lab (Course 12)
   - Import real recordings (for example from OpenSLR SLR86) into this browser's IndexedDB.
   - Drills: hear a clip and pick its transcript, or hear it and type it.
   - Word listening with the device's Yorùbá voice, when the device has one.
   Clips never leave the browser. WebAudio decodes them, so no hosting or media permissions are needed. ===== */

const AUD={db:null,clips:[],cache:new Map(),src:null,busy:false,msg:'',err:'',loaded:false,confirmDel:false};
const MAX_CLIPS=2000,MAX_SEC=25;


/* ---------- IndexedDB (one store: clips {id,name,text,data,dur,size}) ---------- */
function idb(){return new Promise((res,rej)=>{
  if(AUD.db)return res(AUD.db);let r;
  try{r=indexedDB.open('ede-mi-audio',1)}catch(e){return rej(e)}
  r.onupgradeneeded=()=>{r.result.createObjectStore('clips',{keyPath:'id'})};
  r.onsuccess=()=>{AUD.db=r.result;res(AUD.db)};r.onerror=()=>rej(r.error)})}
const idbTx=(mode,fn)=>idb().then(db=>new Promise((res,rej)=>{
  const t=db.transaction('clips',mode),out=fn(t.objectStore('clips'));
  t.oncomplete=()=>res(out&&'result' in out?out.result:undefined);t.onerror=t.onabort=()=>rej(t.error)}));
async function loadClips(){
  try{AUD.clips=(await idbTx('readonly',st=>st.getAll()))||[];AUD.err=''}
  catch(e){AUD.clips=[];AUD.err='This browser would not let the page keep audio files, so importing is off here.'}
  AUD.loaded=true;if(S.view==='audio')render();
}
const labeled=()=>AUD.clips.filter(c=>c.text&&c.text.trim());
const totalMB=()=>AUD.clips.reduce((a,c)=>a+(c.size||0),0)/1048576;

/* ---------- transcript parsing ---------- */
const stemOf=n=>String(n).split(/[\\/]/).pop().replace(/\.[^.]+$/,'').trim().toLowerCase();
/* Accepts clips.json ([{file,text}] or {stem:text}) and OpenSLR tab-separated line_index files (first column = id, last = sentence). */
function parseTranscripts(txt,name){
  const m=new Map(),clean=t=>String(t||'').normalize('NFC').replace(/\s+/g,' ').trim();
  if(/\.json$/i.test(name)){
    let j;try{j=JSON.parse(txt)}catch(e){return m}
    if(Array.isArray(j))j.forEach(o=>{if(o&&typeof o==='object'){const f=o.file||o.id||o.name,t=o.text||o.transcript||o.sentence;if(f&&t)m.set(stemOf(f),clean(t))}});
    else if(j&&typeof j==='object')Object.keys(j).forEach(k=>{if(typeof j[k]==='string')m.set(stemOf(k),clean(j[k]))});
    return m;
  }
  txt.split(/\r?\n/).forEach(line=>{const c=line.split('\t');if(c.length>=2){const t=clean(c[c.length-1]);if(c[0].trim()&&t)m.set(stemOf(c[0]),t)}});
  return m;
}
const isAudioFile=f=>/^audio\//.test(f.type)||/\.(wav|mp3|ogg|oga|flac|m4a|aac|webm)$/i.test(f.name);
const isTextFile=f=>/\.(json|tsv|txt|csv)$/i.test(f.name);

/* ---------- importing ---------- */
async function importFiles(files){
  const list=[...files];if(!list.length||AUD.busy)return;
  AUD.busy=true;AUD.err='';AUD.msg='Reading transcripts…';render();
  let added=0,skipped=0,attached=0;
  try{
    const tr=new Map();
    for(const f of list.filter(isTextFile)){parseTranscripts(await f.text(),f.name).forEach((v,k)=>tr.set(k,v))}
    /* A transcript file on its own adds sentences to clips already imported. */
    if(tr.size){for(const c of AUD.clips){if(!c.text&&tr.has(c.id)){c.text=tr.get(c.id);await idbTx('readwrite',st=>st.put(c));attached++}}}
    const audio=list.filter(isAudioFile);
    for(let i=0;i<audio.length;i++){
      if(AUD.clips.length>=MAX_CLIPS){skipped+=audio.length-i;break}
      const f=audio[i];AUD.msg=`Adding clip ${i+1} of ${audio.length}…`;render();
      try{
        const data=await f.arrayBuffer(),buf=await ctx().decodeAudioData(data.slice(0));
        if(buf.duration>MAX_SEC){skipped++;continue}
        const id=stemOf(f.name),clip={id,name:f.name,text:tr.get(id)||'',data,dur:buf.duration,size:data.byteLength};
        await idbTx('readwrite',st=>st.put(clip));
        const k=AUD.clips.findIndex(c=>c.id===id);if(k>=0)AUD.clips[k]=clip;else AUD.clips.push(clip);
        AUD.cache.set(id,buf);added++;
      }catch(e){skipped++}
    }
    AUD.msg=`Added ${added} clip${added===1?'':'s'}${attached?`, attached ${attached} transcript${attached===1?'':'s'}`:''}${skipped?`, skipped ${skipped} (too long, unreadable or over the ${MAX_CLIPS}-clip limit)`:''}.${tr.size===0&&audio.length?' No transcript file was included, so these clips cannot be used in drills until you add one.':''}`;
  }catch(e){AUD.err='Something went wrong reading those files. Try fewer files at a time.';AUD.msg=''}
  AUD.busy=false;render();
}
async function clearClips(){
  try{await idbTx('readwrite',st=>st.clear())}catch(e){}
  AUD.clips=[];AUD.cache.clear();AUD.msg='All clips removed.';AUD.confirmDel=false;S.au=null;render();
}

/* ---------- playback ---------- */
async function bufFor(c){
  if(AUD.cache.has(c.id))return AUD.cache.get(c.id);
  const b=await ctx().decodeAudioData(c.data.slice(0));AUD.cache.set(c.id,b);
  if(AUD.cache.size>40)AUD.cache.delete(AUD.cache.keys().next().value);return b;
}
async function playClip(id,rate){
  const c=AUD.clips.find(x=>x.id===id);if(!c)return;
  try{
    const b=await bufFor(c),cx=ctx();
    try{if(AUD.src)AUD.src.stop()}catch(e){}
    const s=cx.createBufferSource();s.buffer=b;s.playbackRate.value=rate||1;s.connect(cx.destination);s.start();AUD.src=s;
  }catch(e){toast('That clip could not be played.')}
}
const clipBtn=(id,label)=>`<button class="btn alt" data-act="playclip" data-id="${esc(id)}">▶ ${label||'Play'}</button>`;

/* ---------- clip drills ---------- */
function auNew(mode){
  const pool=labeled();
  if(pool.length<4){toast('Import at least 4 clips with transcripts first.');return}
  S.au={mode,n:0,rounds:5,score:0,q:null,pick:null,typed:'',res:null,done:false,slow:false};auNext();
}
function auNext(){
  const A=S.au,pool=labeled();
  const c=pool[Math.floor(Math.random()*pool.length)];
  const others=shuf(uniqBy(pool.filter(x=>x.text!==c.text),x=>x.text)).slice(0,3).map(x=>x.text);
  A.q={c,opts:shuf([c.text,...others])};A.pick=null;A.typed='';A.res=null;
  playClip(c.id,A.slow?.8:1);
}
/* Compare typed words to the sentence. Exact match scores 1, right letters but wrong marks scores 0.5. */
function dictScore(target,typed){
  const strip=w=>w.replace(/[.,!?;:“”"()]/g,''),T=target.split(/\s+/).map(strip).filter(Boolean),U=typed.split(/\s+/).map(strip).filter(Boolean);
  const used=new Array(U.length).fill(false),marks=[];let pts=0;
  const out=T.map(w=>{
    let k=U.findIndex((u,i)=>!used[i]&&u.normalize('NFC')===w.normalize('NFC'));
    if(k>=0){used[k]=true;pts+=1;return{w,st:'ok'}}
    k=U.findIndex((u,i)=>!used[i]&&wnorm(u)===wnorm(w));
    if(k>=0){used[k]=true;pts+=.5;return{w,st:'marks'}}
    return{w,st:'miss'}});
  return{pct:T.length?Math.round(pts/T.length*100):0,words:out};
}
function auFinish(){
  const A=S.au;A.done=true;const xp=8+Math.round(A.score/A.rounds*8);
  P.audioDone++;addXP(xp);A.xp=xp;sfx('win');render();
}

function clipPanel(){
  const A=S.au,n=AUD.clips.length,lab=labeled().length;
  if(AUD.err&&!n)return `<div class="fb no" style="margin-top:0">${esc(AUD.err)}</div>`;
  if(!n)return `<p style="margin:0">No recordings have been added yet. Real voices are the best way to train your ear, and you can add your own set from OpenSLR (steps below). Everything stays in this browser.</p>`;
  const credit=`<p class="fine" style="margin-top:14px">Recordings: Open-source Yorùbá speech corpus (OpenSLR SLR86), Copyright Google, Inc., licensed CC BY-SA 4.0 (<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">license</a>). Gutkin, Demirşahin, Kjartansson, Rivera and Túbọ̀sún, “Developing an Open-Source Corpus of Yoruba Speech,” Interspeech 2020, pp. 404–408. Clips are used as imported, without changes other than your selection. If you imported other recordings, credit their source.</p>`;
  let drill='';
  if(!A){
    drill=lab>=4?`<div class="row" style="justify-content:flex-start"><button class="btn" data-act="aunew" data-m="pick">Hear and pick</button><button class="btn alt" data-act="aunew" data-m="type">Hear and type</button></div>`
      :`<div class="note">${lab} of your ${n} clips ha${lab===1?'s':'ve'} a transcript. Add at least 4 with transcripts to unlock the drills. Import the transcript file (clips.json or line_index tsv) now to attach sentences to clips already added.</div>`;
  }else if(A.done){
    drill=`<div class="cen"><div class="big yo" style="margin:6px 0">Ó dára!</div><p class="muted" style="margin:0">Round done. ${A.mode==='pick'?`${A.score} of ${A.rounds} right.`:`Average accuracy ${Math.round(A.score/A.rounds*100)}%.`} +${A.xp} XP.</p>
      <div class="row"><button class="btn" data-act="aunew" data-m="${A.mode}">Another round</button><button class="btn alt" data-act="auquit">Done</button></div></div>`;
  }else{
    const q=A.q,head=`<div class="row" style="margin:0 0 12px;justify-content:space-between;align-items:center"><span class="meta">Clip ${A.n+1} of ${A.rounds}</span><span class="row" style="margin:0">${clipBtn(q.c.id,'Play again')}<button class="chip${A.slow?' on':''}" data-act="auslow">Slow</button></span></div>`;
    if(A.mode==='pick'){
      drill=head+`<div class="q-label" style="margin-top:0">What did you hear?</div><div class="opts" style="margin-top:8px">${q.opts.map(o=>{let cl='opt yo';if(A.pick!==null){if(o===q.c.text)cl+=' right';else if(o===A.pick)cl+=' wrong'}
        return `<button class="${cl}" data-act="aupick" data-v="${esc(o)}" ${A.pick!==null?'disabled':''}>${esc(o)}</button>`}).join('')}</div>
        ${A.pick!==null?`<div class="row"><button class="btn" data-act="aunext">${A.n+1>=A.rounds?'Finish':'Next clip'}</button></div>`:''}`;
    }else{
      drill=head+`<div class="q-label" style="margin-top:0">Type what you heard</div>
        <div class="say"><input id="audtype" class="search" type="text" autocomplete="off" autocapitalize="off" placeholder="Type the sentence (marks help, but are not required)" aria-label="Type what you heard" ${A.res?'disabled':''}><button class="btn" data-act="aucheck" ${A.res?'disabled':''}>Check</button></div>
        <div class="keys" style="margin-top:8px" aria-label="Special letters">${['ẹ','ọ','ṣ','à','á','è','é','ì','í','ò','ó','ù','ú'].map(k=>`<button class="key" data-act="auins" data-c="${k}">${k}</button>`).join('')}</div>
        ${A.res?`<div class="fb ${A.res.pct>=80?'ok':'no'}"><b>${A.res.pct}% matched</b><span>${A.res.words.map(w=>`<span class="yo" style="margin-right:6px;${w.st==='ok'?'color:var(--good)':w.st==='marks'?'color:var(--gold)':'color:var(--bad);text-decoration:underline'}">${esc(w.w)}</span>`).join('')}<br><span class="meta">Green is exact, gold has the right letters but different marks, red is missed or different.</span></span></div>
        <div class="row"><button class="btn" data-act="aunext">${A.n+1>=A.rounds?'Finish':'Next clip'}</button></div>`:''}`;
    }
  }
  return `<div class="meta" style="margin-bottom:10px">${n} clip${n===1?'':'s'} · ${lab} with transcripts · ${totalMB().toFixed(1)} MB in this browser</div>${drill}${credit}`;
}

/* ---------- word listening (device voice) ---------- */
function lsNew(){
  const pool=ALL.filter(i=>!unit(i.unit).build&&i.yo.split(' ').length<=3);
  const it=pool[Math.floor(Math.random()*pool.length)];
  const others=shuf(uniqBy(pool.filter(x=>x.en!==it.en),x=>x.en)).slice(0,3).map(x=>x.en);
  S.ls.q={it,opts:shuf([it.en,...others])};S.ls.pick=null;speak(it.yo);
}
function wordListen(){
  const v=yoVoice(),L=S.ls||(S.ls={n:0,score:0,q:null,pick:null});
  if(!v)return `<div class="note">This device has no Yorùbá voice installed, so word-by-word listening is not available here. Try a phone or computer that has one (look in its text-to-speech or language settings). Imported recordings, the Tone Lab and Tone Tower work on any device.</div>`;
  if(!L.q)return `<div class="row" style="margin-top:0;justify-content:flex-start"><button class="btn" data-act="lsnew">Play a word</button></div><p class="meta" style="margin:10px 0 0">Using the voice on this device: ${esc(v.name)}.</p>`;
  const q=L.q;
  return `<div class="row" style="margin:0 0 12px;justify-content:flex-start;align-items:center">${spkBtn(q.it.yo)}<span class="muted">Tap to hear it again · ${L.score} of ${L.n} right</span></div>
  <div class="opts" style="margin-top:0">${q.opts.map(o=>{let cl='opt';if(L.pick){if(o===q.it.en)cl+=' right';else if(o===L.pick)cl+=' wrong'}
    return `<button class="${cl}" data-act="lspick" data-v="${esc(o)}" ${L.pick?'disabled':''}>${esc(o)}</button>`}).join('')}</div>
  ${L.pick?`<div class="fb ${L.pick===q.it.en?'ok':'no'}"><b>${L.pick===q.it.en?'Correct':'Not quite'}</b><span><span class="yo">${esc(q.it.yo)}</span> means “${esc(q.it.en)}”.</span></div><div class="row"><button class="btn" data-act="lsnew">Next word</button></div>`:''}`;
}

/* ---------- page ---------- */
function audio(){
  const n=AUD.clips.length;
  return `<div class="sec" style="padding-top:max(14px,env(safe-area-inset-top,0px))"><h2>Audio Lab</h2><span class="meta">Course 12 · ${P.audioDone} round${P.audioDone===1?'':'s'} done</span></div>
  <div class="panel" style="margin-top:0"><h3>Real recordings</h3><div style="margin-top:10px">${clipPanel()}</div></div>
  <div class="panel"><h3>Add recordings</h3>
    <p class="muted" style="margin:8px 0 12px">Choose audio files (wav, mp3, ogg) and a transcript file together. Transcripts can be a clips.json file or an OpenSLR <span class="yo" style="font-weight:600">line_index</span> tsv. Up to ${MAX_CLIPS} clips of ${MAX_SEC} seconds or less.</p>
    ${AUD.err&&n?`<div class="fb no" style="margin:0 0 10px">${esc(AUD.err)}</div>`:''}
    <label class="btn filebtn${AUD.busy?' disabled':''}" for="audfiles">${AUD.busy?esc(AUD.msg||'Working…'):'Choose files'}</label>
    <input id="audfiles" type="file" multiple accept="audio/*,.wav,.mp3,.ogg,.flac,.m4a,.json,.tsv,.txt,.csv" ${AUD.busy?'disabled':''} hidden>
    ${AUD.msg&&!AUD.busy?`<p class="meta" style="margin:12px 0 0" role="status">${esc(AUD.msg)}</p>`:''}
    ${n?(AUD.confirmDel?`<div class="row" style="justify-content:flex-start"><span class="meta">Remove all ${n} clips from this browser?</span><button class="btn alt" data-act="audelyes">Yes, remove</button><button class="btn alt" data-act="audelno">Keep</button></div>`:`<div class="row" style="justify-content:flex-start"><button class="chip" data-act="audelask">Remove all clips</button></div>`):''}</div>
  <div class="panel"><h3>Word listening</h3><p class="muted" style="margin:8px 0 12px">Hear a word read by your device, then pick its meaning.</p>${wordListen()}</div>
  <div class="panel cult"><h3>More ear training</h3><p>Pitch practice works on every device.</p>
    <div class="row" style="justify-content:flex-start"><button class="btn alt" data-act="tab" data-v="tones">Tone Lab</button><button class="btn alt" data-act="tab" data-v="tower">Tone Tower game</button></div></div>
  <details class="panel cult"><summary><b>How to get OpenSLR Yorùbá clips</b></summary>
    <ol class="l"><li>Download one or both zips and the line_index files from <a href="https://www.openslr.org/86/" target="_blank" rel="noopener">openslr.org/86</a> (about 450 MB each).</li>
    <li>On your computer, run the helper script that comes with this project: <code>python3 tools/prepare_openslr.py --zip yo_ng_female.zip --tsv line_index_female.tsv --out clips --count 150</code></li>
    <li>It picks short, clean sentences and writes a <b>clips</b> folder with the audio files and <b>clips.json</b>.</li>
    <li>Come back here, tap Choose files, and select everything in that folder.</li></ol>
    <p class="muted">The helper adds the license credit for you. Keep the credit when you share clips.</p></details>`;
}

ACT.audioopen=()=>go('audio');
ACT.playclip=d=>playClip(d.id,S.au&&S.au.slow?.8:1);
ACT.aunew=d=>{auNew(d.m);render()};
ACT.auquit=()=>{S.au=null;render()};
ACT.auslow=()=>{if(S.au){S.au.slow=!S.au.slow;render()}};
ACT.aupick=d=>{const A=S.au;if(!A||A.pick!==null)return;A.pick=d.v;const ok=d.v===A.q.c.text;if(ok)A.score++;sfx(ok?'ok':'bad');render()};
ACT.aucheck=()=>{const A=S.au,el=$('#audtype');if(!A||A.res||!el)return;A.typed=el.value;A.res=dictScore(A.q.c.text,A.typed);A.score+=A.res.pct/100;sfx(A.res.pct>=80?'ok':'bad');render()};
ACT.aunext=()=>{const A=S.au;if(!A)return;A.n++;if(A.n>=A.rounds)auFinish();else{auNext();render()}};
ACT.auins=d=>{const el=$('#audtype');if(!el)return;const s=el.selectionStart==null?el.value.length:el.selectionStart,e2=el.selectionEnd==null?s:el.selectionEnd;el.setRangeText(d.c,s,e2,'end');el.focus()};
ACT.audelask=()=>{AUD.confirmDel=true;render()};
ACT.audelno=()=>{AUD.confirmDel=false;render()};
ACT.audelyes=()=>{clearClips()};
ACT.lsnew=()=>{S.ls=S.ls||{n:0,score:0,q:null,pick:null};lsNew();render()};
ACT.lspick=d=>{const L=S.ls;if(!L||!L.q||L.pick)return;L.pick=d.v;L.n++;const ok=d.v===L.q.it.en;if(ok)L.score++;sfx(ok?'ok':'bad');
  if(L.n%5===0){P.audioDone++;addXP(6)}render()};
document.addEventListener('change',e=>{if(e.target.id==='audfiles')importFiles(e.target.files)});
VIEWS.audio=audio;
AFTER.audio=()=>{const el=$('#audtype');if(el&&S.au)el.value=S.au.typed||'';if(!AUD.loaded){AUD.loaded=true;loadClips()}};
