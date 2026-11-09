/* ===== 13-home-profile-write.js  Home page, Profile (stats, daily goal, sound, badges, reset), Writing Lab (Courses 16 and 21) ===== */

/* ---------- home ---------- */
const FEATS=[
 {v:'courses',i:'courses',t:'Courses',d:'21 courses in four tiers, from first greetings to proverbs.'},
 {v:'games',i:'games',t:'Game Hub',d:'Eight games (three you play out loud), a tower to build and leaderboards.'},
 {v:'chat',i:'chat',t:'Chat',d:'Text with a Yorùbá speaker. Get fixes as you type and a rating at the end.'},
 {v:'call',i:'call',t:'Phone call',d:'Talk out loud on a call. Needs a microphone; if the device cannot, you are sent Home.'},
 {v:'audio',i:'audio',t:'Audio Lab',d:'Listening drills, and your own OpenSLR recordings.'},
 {v:'write',i:'write',t:'Writing Lab',d:'Write in Yorùbá and get your spelling and tone marks checked.'},
 {v:'words',i:'words',t:'Phrasebook',d:'Search every word and phrase, and tap to listen.'},
 {v:'review',i:'review',t:'Flashcards',d:'Flip through the words you have learned.'},
 {v:'tones',i:'tones',t:'Tone Lab',d:'Hear low, mid and high pitch, then test your ear.'},
 {v:'alpha',i:'alpha',t:'Alphabet',d:'All 25 letters with sound hints.'},
 {v:'culture',i:'culture',t:'Culture',d:'Greetings, proverbs, names and where Yorùbá is spoken.'},
 {v:'profile',i:'profile',t:'Profile',d:'Your stats, daily goal, badges and settings.'}];

/* A new word each day, the same for the whole day. */
function wordOfDay(){
  const pool=uniqBy(ALL.filter(i=>!unit(i.unit).build&&i.yo.length<=20&&i.en.length<=40),i=>i.yo);
  const d=new Date(),n=d.getFullYear()*372+d.getMonth()*31+d.getDate();return pool[n%pool.length];
}
const goalBar=()=>{const g=P.goal||30,x=Math.min(todayXP(),g);return `<div class="goal"><div class="bar" aria-hidden="true"><i style="width:${x/g*100}%"></i></div><span class="meta">${todayXP()>=g?'Daily goal reached':`${todayXP()} / ${g} XP today`}</span></div>`};

function home(){
  const nx=nextUnit(),w=wordOfDay();
  return `<header class="hero"><div class="wrap">
    <div class="eyebrow">Èdè Mi · Learn Yorùbá</div>
    <h1><span>Ẹ káàbọ̀${P.name?', '+esc(P.name):''}</span></h1>
    <p>Yorùbá is spoken by over 40 million people, mostly in Nigeria, Benin and Togo. Pick a feature below, or carry on with your next lesson.</p>
    <div class="stats"><span><b>${liveStreak()}</b>day streak</span><span><b>${P.xp}</b>XP</span><span><b>Lv ${level()}</b></span><span><b>${coursesDone()}/${COURSES.length}</b>courses</span></div>
    <div class="herogoal">${goalBar()}</div>
  </div></header>
  ${nx?`<button class="unit" style="margin-top:18px;width:100%" data-act="open" data-id="${nx.id}"><span class="n">${nx.n||'•'}</span><h3>Continue: ${esc(nx.title)}</h3><span class="yoname">${esc(nx.yo)}</span><span class="meta">Course ${nx.course}</span></button>`:''}
  <div class="panel wotd"><div><div class="eyebrow muted">Word of the day</div><div class="yo" style="font-size:1.8rem;margin-top:6px">${esc(w.yo)}</div><div class="muted">${esc(w.en)}</div></div>${spkBtn(w.yo)}</div>
  <div class="sec"><h2>Everything in Èdè Mi</h2></div>
  <div class="units">${FEATS.map(f=>`<button class="unit" data-act="tab" data-v="${f.v}"><span class="n">${ic(f.i)}</span><h3>${esc(f.t)}</h3><span class="meta">${esc(f.d)}</span></button>`).join('')}</div>`;
}
VIEWS.home=home;

/* ---------- profile ---------- */
function profile(){
  const stats=[[P.xp,'XP'],[level(),'Level'],[liveStreak(),'Day streak'],[P.maxStreak||0,'Best streak'],[unitsDone(),'Lessons done'],[coursesDone(),'Courses done'],[P.calls,'Calls'],[P.chats||0,'Chats'],[P.tower,'Tower pieces'],[P.coins,'Cowries'],[Object.values(P.plays).reduce((a,b)=>a+b,0),'Games played']];
  return `<div class="sec"><h2>Profile</h2><span class="meta">Saved in this browser</span></div>
  <div class="panel" style="margin-top:0"><label class="meta" for="pname">Your leaderboard name</label>
    <input id="pname" class="search" type="text" maxlength="16" autocomplete="off" value="${esc(P.name||'')}" placeholder="Choose a name (no real name needed)" style="margin-top:6px">
    <div class="eyebrow muted" style="margin-top:18px">Level ${level()}</div><div class="bar" style="margin-top:8px" aria-hidden="true"><i style="width:${Math.round(levelFrac()*100)}%"></i></div></div>
  <div class="statgrid">${stats.map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>
  <div class="panel"><h3>Daily goal</h3><p class="muted" style="margin:6px 0 10px">${goalBar().replace('<div class="goal">','<div class="goal" style="margin:0">')}</p>
    <div class="chips" role="group" aria-label="Daily XP goal">${[20,30,50,100].map(g=>`<button class="chip${P.goal===g?' on':''}" data-act="setgoal" data-g="${g}" aria-pressed="${P.goal===g}">${g} XP</button>`).join('')}</div></div>
  <div class="panel"><h3>Sound</h3><p class="muted" style="margin:6px 0 10px">Game and quiz sound effects. Pitch practice in the Tone Lab always plays.</p>
    <button class="chip${P.sound?' on':''}" data-act="togglesound" aria-pressed="${P.sound}">Sound effects: ${P.sound?'on':'off'}</button></div>
  <div class="sec"><h2>Badges</h2><span class="meta">${P.badges.length} of ${BADGES.length}</span></div>
  <div class="badges">${BADGES.map(b=>{const on=P.badges.includes(b.id);return `<div class="badge${on?' on':''}"><span class="bi" aria-hidden="true">${on?'★':'☆'}</span><b>${esc(b.t)}</b><span class="meta">${esc(b.d)}</span></div>`}).join('')}</div>
  <div class="panel"><h3>Reset</h3><p class="muted" style="margin:6px 0 10px">Erase XP, streaks, lesson progress, games and badges from this browser. Imported audio clips are removed separately in the Audio Lab.</p>
    ${S.confirmReset?`<div class="row" style="justify-content:flex-start"><span class="meta">This cannot be undone.</span><button class="btn" style="background:var(--end);color:#fff" data-act="resetyes">Yes, erase it</button><button class="btn alt" data-act="resetno">Keep my progress</button></div>`:`<button class="chip" data-act="resetask">Reset my progress</button>`}</div>`;
}
ACT.setgoal=d=>{P.goal=+d.g;save();render()};
ACT.togglesound=()=>{P.sound=!P.sound;save();render();sfx('ok')};
ACT.resetask=()=>{S.confirmReset=true;render()};
ACT.resetno=()=>{S.confirmReset=false;render()};
ACT.resetyes=()=>{P=DEF();save();S.confirmReset=false;S.rv=null;toast('Progress reset.');render()};
document.addEventListener('input',e=>{if(e.target.id==='pname'){P.name=e.target.value.replace(/[<>]/g,'').slice(0,16);save()}});
VIEWS.profile=profile;

/* ---------- writing lab ---------- */
const WPROMPTS=[
 ['Introduce yourself','Write 2 to 4 short sentences: your name, where you live, and one thing you like.','b'],
 ['My family','Describe the people in your family with a few simple sentences.','b'],
 ['My day','Say what you do in the morning and at night. Use ń, ti or máa if you can.','i'],
 ['At the market','Write a short conversation or story about buying food.','i'],
 ['Explain your opinion','Tell us what you think about school or phones, and give one reason with nítorí pé.','a'],
 ['A letter to an elder','Write a short, respectful greeting and say what you are learning.','a'],
 ['A tiny story','Write 4 to 6 sentences of any story you like.','a']];
let SAMPLE_W=null;
const wrk=()=>S.wr||(S.wr={p:0,text:'',res:null,busy:false,err:'',paid:{}});
function knownShare(text){
  const known=new Set(ALL.flatMap(i=>i.yo.split(/\s+/)).map(w=>wnorm(w.replace(/[.,!?;:“”"()]/g,''))).filter(Boolean));
  const toks=text.split(/\s+/).map(w=>wnorm(w.replace(/[.,!?;:“”"()]/g,''))).filter(Boolean);
  return{n:toks.length,k:toks.filter(t=>known.has(t)).length};
}
function writeView(){
  const W=wrk(),pr=WPROMPTS[W.p],r=W.res,ks=knownShare(W.text||'');
  return `<div class="sec"><h2>Writing Lab</h2><span class="meta">Courses 16 and 21 · ${P.writes} checked</span></div>
  <div class="chips tabs" role="tablist" aria-label="Prompts">${WPROMPTS.map((x,i)=>`<button class="chip${W.p===i?' on':''}" role="tab" aria-selected="${W.p===i}" data-act="wprompt" data-i="${i}">${esc(x[0])}</button>`).join('')}</div>
  <div class="panel"><div class="eyebrow muted">${{b:'Beginner',i:'Intermediate',a:'Advanced'}[pr[2]]} prompt</div><p style="margin:8px 0 12px">${esc(pr[1])}</p>
    <textarea id="wtext" class="search" rows="6" placeholder="Write in Yorùbá here. Tone marks and underdots help, but you can add them later." aria-label="Your writing" ${W.busy?'disabled':''}></textarea>
    <div class="keys" style="margin-top:8px" aria-label="Special letters">${['ẹ','ọ','ṣ','à','á','è','é','ì','í','ò','ó','ù','ú'].map(k=>`<button class="key" data-act="wins" data-c="${k}">${k}</button>`).join('')}</div>
    <div class="row" style="justify-content:space-between;align-items:center"><span class="meta" id="wstat">${ks.n} words · ${ks.k} from your lessons</span>
      <button class="btn" data-act="wcheck" ${W.busy||!SAMPLE?'disabled':''}>${W.busy?'Checking…':'Check my writing'}</button></div>
    ${SAMPLE===null?'<div class="fb no">Checking needs Claude, which is not available where you opened this page. You can still write and count words.</div>':''}
    ${W.err?`<div class="fb no">${esc(W.err)}</div>`:''}</div>
  ${r?`<div class="panel"><div class="eyebrow muted">Feedback</div>${stars(r.stars)}<p style="margin:6px 0 0;text-align:center">${esc(r.summary)}</p>
    ${r.corrected?`<div class="rsec"><div class="q-label">Polished version</div><div class="prov">${esc(r.corrected)}</div>${spkBtn(r.corrected)}</div>`:''}
    ${r.issues.length?`<div class="rsec"><div class="q-label">Fixes</div><ul class="l">${r.issues.map(x=>`<li><span class="said">${esc(x.said)}</span> → <span class="yo">${esc(x.better)}</span><br><span class="meta">${esc(x.why)}</span></li>`).join('')}</ul></div>`:''}
    ${r.next?`<div class="note" style="margin-top:14px"><b>Next:</b> ${esc(r.next)}</div>`:''}
    <p class="fine">Feedback comes from Claude and can make mistakes, especially with tone marks. Check anything important with a Yorùbá speaker.</p></div>`:''}`;
}
function cleanWrite(r){r=r||{};const n=Math.max(1,Math.min(5,Math.round(Number(r.stars))||3));
  return{stars:n,summary:String(r.summary||''),corrected:String(r.corrected||''),next:String(r.next||''),
    issues:(Array.isArray(r.issues)?r.issues:[]).slice(0,6).map(x=>({said:String(x&&x.said||''),better:String(x&&x.better||''),why:String(x&&x.why||'')}))}}
ACT.wprompt=d=>{const W=wrk();W.text=($('#wtext')||{}).value||W.text;W.p=+d.i;W.res=null;W.err='';W.text='';render()};
ACT.wins=d=>{const el=$('#wtext');if(!el)return;const s=el.selectionStart==null?el.value.length:el.selectionStart,e2=el.selectionEnd==null?s:el.selectionEnd;el.setRangeText(d.c,s,e2,'end');wrk().text=el.value;el.focus();updWStat()};
function updWStat(){const e=$('#wstat');if(e){const k=knownShare(wrk().text||'');e.textContent=`${k.n} words · ${k.k} from your lessons`}}
document.addEventListener('input',e=>{if(e.target.id==='wtext'){wrk().text=e.target.value;updWStat()}});
ACT.wcheck=async()=>{
  const W=wrk(),el=$('#wtext');if(el)W.text=el.value;
  const text=(W.text||'').trim();
  if(!SAMPLE){return}
  if(text.split(/\s+/).length<3){W.err='Write at least a few words first.';render();return}
  W.busy=true;W.err='';render();
  const pr=WPROMPTS[W.p],lvl={b:'beginner',i:'intermediate',a:'advanced'}[pr[2]];
  const prompt=`You are a kind Yorùbá teacher checking writing from a teenage ${lvl} learner. Prompt they were given: "${pr[1]}"\nTheir text:\n"""${text}"""\n\nCheck spelling, word choice, word order, grammar and tone marks or underdots that change meaning. Do not penalise missing diacritics; mention them once as a tip. If you are not sure about a correction, say so in "why". Reply with ONLY one JSON object and no other text, in this shape:\n{"stars":4,"summary":"two short, encouraging sentences","corrected":"their text corrected, with tone marks and underdots","issues":[{"said":"the part they wrote","better":"the better Yorùbá","why":"one short teen-friendly sentence"}],"next":"one short suggestion for what to try next"}\nstars is a whole number 1 to 5. issues has up to 5 items.`;
  try{
    const r=await SAMPLE.json(prompt,{cache:false});
    W.res=cleanWrite(r);W.busy=false;
    if(!W.paid[W.p]){W.paid[W.p]=true;P.writes++;addXP(15)}
  }catch(e){W.busy=false;W.err=sampleErr(e)}
  render();
};
AFTER.write=()=>{const el=$('#wtext');if(el)el.value=wrk().text||''};
VIEWS.write=writeView;
