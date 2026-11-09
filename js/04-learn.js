/* ===== 04-learn.js  Courses page (21 courses in 4 tiers), course detail, lessons, quizzes, results, flashcards ===== */

/* ---------- quiz building ---------- */
/* Multiple choice. Distractors are unique values so two options never read the same. */
function mcQ(it,dir,pool){
  const key=dir==='yo2en'?'en':'yo';
  const seen=new Set([it[key]]),others=[];
  for(const x of shuf(pool)){if(others.length>=3)break;if(!seen.has(x[key])){seen.add(x[key]);others.push(x[key])}}
  return{type:'mc',dir,item:it,prompt:dir==='yo2en'?it.yo:it.en,answer:it[key],options:shuf([it[key],...others])};
}
function buildQ(it){const toks=it.yo.split(' ');return{type:'build',item:it,prompt:it.en,answer:toks,bank:shuf(toks.map((t,i)=>({t,i})))}}
/* Reading passages: the questions come straight from the lesson data. */
function readQs(u){return u.read.qs.map(a=>({type:'mc',dir:'read',item:{yo:u.read.text,en:u.read.en,note:''},prompt:a[0],answer:a[1][a[2]],options:shuf(a[1])}))}
function makeQuiz(u){
  let qs;
  if(u.read)qs=readQs(u);
  else if(u.build){qs=shuf(u.items).map(buildQ).concat(shuf(u.items).slice(0,2).map(it=>mcQ(it,'yo2en',u.items)));qs=shuf(qs)}
  else if(u.oneway){qs=shuf(u.items).slice(0,8).map(it=>Object.assign(mcQ(it,'yo2en',u.items),{dir:'ask',label:u.ask}))}
  else{const pool=u.items.length>=4?u.items:ALL;
    const all=[];u.items.forEach(it=>{all.push(mcQ(it,'yo2en',pool));all.push(mcQ(it,'en2yo',pool))});
    qs=shuf(all).slice(0,Math.min(10,all.length))}
  qs.forEach(q=>q.tries=0);return qs;
}

/* ---------- course progress ---------- */
/* Courses made of lessons count finished lessons. Practice-only courses finish when you complete one activity. */
function courseProg(c){
  if(c.units.length){const d=c.units.filter(id=>id in P.done).length;return{done:d,total:c.units.length}}
  const m={12:P.audioDone,20:P.calls+(P.chats||0),21:P.writes}[c.id]||0;return{done:m>0?1:0,total:1};
}
const tierOf=id=>TIERS.find(t=>t.id===id);
const nextUnit=()=>{for(const c of COURSES){const u=c.units.find(id=>!(id in P.done));if(u)return unit(u)}return null};

function courseCard(c){
  const p=courseProg(c),pct=Math.round(p.done/p.total*100),done=p.done>=p.total;
  return `<button class="unit course${done?' done':''}" data-act="opencourse" data-id="${c.id}">
    <span class="n">${done?'✓':c.id}</span>
    <h3>${esc(c.title)}</h3>
    <span class="meta">${esc(c.blurb)}</span>
    <span class="cmeta"><span class="bar" aria-hidden="true"><i style="width:${pct}%"></i></span><span class="meta">${c.units.length?`${p.done}/${p.total} lessons`:(done?'Done':'Practice')}${c.draft?' · draft':''}</span></span>
  </button>`;
}
function courses(){
  const t=S.tier||'all',nx=nextUnit();
  const tabs=[['all','All 21'],...TIERS.map(x=>[x.id,x.name])];
  const doneN=coursesDone();
  const groups=(t==='all'?TIERS:TIERS.filter(x=>x.id===t)).map(tr=>{
    const list=COURSES.filter(c=>c.tier===tr.id);
    return `<section class="tiersec"><div class="sec"><h2>${esc(tr.name)}</h2><span class="meta">${list.length} courses</span></div>
      <p class="meta" style="margin:-6px 0 10px">${esc(tr.goal)}</p><div class="units">${list.map(courseCard).join('')}</div></section>`}).join('');
  return `<div class="sec" style="padding-top:max(14px,env(safe-area-inset-top,0px))"><h2>Courses</h2><span class="meta">${doneN} of ${COURSES.length} complete</span></div>
  ${nx?`<button class="unit" style="width:100%" data-act="open" data-id="${nx.id}"><span class="n">${nx.n||'•'}</span><h3>Continue: ${esc(nx.title)}</h3><span class="yoname">${esc(nx.yo)}</span><span class="meta">Course ${nx.course}. ${esc(COURSES.find(c=>c.id===nx.course).title)}</span></button>`:''}
  <div class="chips tabs" role="tablist" aria-label="Course tiers">${tabs.map(x=>`<button class="chip${t===x[0]?' on':''}" role="tab" aria-selected="${t===x[0]}" data-act="ctier" data-id="${x[0]}">${esc(x[1])}</button>`).join('')}</div>
  ${groups}
  <p class="fine">Courses marked “draft” were written with AI help and have not been checked by a Yorùbá teacher. Treat them as study notes and confirm with a fluent speaker. Tone marks and spellings also vary between sources and regions.</p>`;
}
function course(){
  const c=COURSES.find(x=>x.id===S.cid)||COURSES[0],tr=tierOf(c.tier),p=courseProg(c);
  const lessons=c.units.map(id=>unit(id)).map((u,k)=>{const b=P.done[u.id],d=b!==undefined;
    const cnt=u.read?'reading passage':`${u.items.length} ${u.build?'sentences':'words'}`;
    return `<button class="unit${d?' done':''}" data-act="open" data-id="${u.id}"><span class="n">${d?'✓':k+1}</span><h3>${esc(u.title)}</h3><span class="yoname">${esc(u.yo)}</span><span class="meta">${cnt}${d?' · best '+b+'%':''}</span></button>`}).join('');
  const link=c.link?`<button class="unit linkcard" data-act="tab" data-v="${c.link.page}"><span class="n">${ic({tones:'tones',audio:'audio',call:'call',chat:'chat',write:'write'}[c.link.page]||'home')}</span><h3>${esc(c.link.label)}</h3><span class="meta">${c.id===12?'Counts when you finish a listening round (Audio Lab) or a Tone Tower game.':c.id===20?'Counts when you finish a practice chat or call.':c.id===21?'Counts when you get a piece of writing checked.':'Extra practice for this course.'}</span></button>`:'';
  return `<div class="panel" style="margin-top:8px"><div class="eyebrow muted">${esc(tr.name)} · Course ${c.id}</div><h2 style="margin-top:6px">${esc(c.title)}</h2>
    <p style="margin:8px 0 0">${esc(c.blurb)}</p>
    <div class="bar" style="margin-top:14px" aria-hidden="true"><i style="width:${Math.round(p.done/p.total*100)}%"></i></div>
    <div class="meta" style="margin-top:6px">${c.units.length?`${p.done} of ${p.total} lessons finished`:(p.done?'Done':'Not started')}</div>
    ${c.draft?`<div class="note" style="margin-top:12px">Early draft. This course was written with AI help and has not been reviewed by a Yorùbá teacher. Confirm anything important with a fluent speaker.</div>`:''}</div>
  ${c.units.length?`<div class="sec"><h2>Lessons</h2></div><div class="units">${lessons}</div>`:''}
  ${link?`<div class="sec"><h2>Practice</h2></div><div class="units">${link}</div>`:''}`;
}

/* ---------- lesson screens ---------- */
function learn(){
  const u=unit(S.uid);
  if(u.read){
    return `<div class="top"><button class="x" data-act="leave" aria-label="Close lesson">×</button><div class="bar" aria-hidden="true"><i style="width:10%"></i></div></div>
    <div class="panel"><div class="eyebrow muted">${esc(u.title)}</div><p style="margin:8px 0 0">${esc(u.tip)}</p></div>
    <div class="panel card"><div class="eyebrow muted">Read</div><div class="yo" style="font-size:1.5rem;line-height:1.5;text-align:center">${esc(u.read.text)}</div>${spkBtn(u.read.text)}
      <details class="note"><summary>Show English</summary><p style="margin:8px 0 0">${esc(u.read.en)}</p></details></div>
    <div class="row"><button class="btn" data-act="quiz">Answer questions</button></div>`;
  }
  const it=u.items[S.i],last=S.i===u.items.length-1;
  return `<div class="top"><button class="x" data-act="leave" aria-label="Close lesson">×</button><div class="bar" aria-hidden="true"><i style="width:${(S.i+1)/u.items.length*100}%"></i></div></div>
  ${S.i===0&&u.tip?`<div class="panel"><div class="eyebrow muted">${esc(u.title)}</div><p style="margin:8px 0 0">${esc(u.tip)}</p></div>`:''}
  <div class="panel card"><div class="eyebrow muted">New ${u.build?'sentence':'word'} · ${S.i+1} of ${u.items.length}</div>
    <div class="big yo">${esc(it.yo)}</div>${spkBtn(it.yo)}<div class="en">${esc(it.en)}</div>
    ${it.note?`<div class="note">${esc(it.note)}</div>`:''}</div>
  <div class="row">${S.i>0?'<button class="btn alt" data-act="prev">Back</button>':''}
    <button class="btn" data-act="${last?'quiz':'next'}">${last?'Start quiz':'Next'}</button></div>`;
}

function quiz(){
  const c=S.cur,q=S.qs[S.qi];
  const prog=S.qi/S.qs.length*100;
  let body='';
  if(q.type==='mc'){
    const lab=q.dir==='yo2en'?'What does this mean?':q.dir==='en2yo'?'How do you say this in Yorùbá?':q.dir==='ask'?q.label:'Answer from the passage';
    const yoPrompt=q.dir==='yo2en'||q.dir==='ask';
    body=`${q.dir==='read'?`<div class="note" style="max-width:none"><span class="yo" style="font-size:1.1rem;font-weight:600">${esc(q.item.yo)}</span></div>`:''}
    <div class="q-label">${esc(lab)}</div>
    <div class="prompt${yoPrompt?' yo':''}">${esc(q.prompt)}</div>
    <div class="opts">${q.options.map(o=>{let cl='opt'+(q.dir==='en2yo'?' yo':'');
      if(c.answered){if(o===q.answer)cl+=' right';else if(o===c.picked)cl+=' wrong'}
      return `<button class="${cl}" data-act="pick" data-v="${esc(o)}" ${c.answered?'disabled':''}>${esc(o)}</button>`}).join('')}</div>`;
  }else{
    body=`<div class="q-label">Build the sentence in Yorùbá</div><div class="prompt">${esc(q.prompt)}</div>
    <div class="slots" aria-label="Your sentence">${c.placed.map((p,k)=>`<button class="tok" data-act="unplace" data-k="${k}" ${c.answered?'disabled':''}>${esc(q.bank.find(b=>b.i===p).t)}</button>`).join('')}</div>
    <div class="bank">${q.bank.map(b=>`<button class="tok${c.placed.includes(b.i)?' used':''}" data-act="place" data-i="${b.i}" ${c.answered?'disabled':''}>${esc(b.t)}</button>`).join('')}</div>
    ${c.answered?'':`<div class="row"><button class="btn" data-act="check" ${c.placed.length?'':'disabled'}>Check</button></div>`}`;
  }
  let fb='';
  if(c.answered){
    const wrong=(q.dir==='read'||q.dir==='ask')?`The answer is “${esc(q.answer)}”.`:`${esc(q.item.yo)} means “${esc(q.item.en)}”.${q.item.note?' '+esc(q.item.note):''}`;
    fb=c.ok?`<div class="fb ok"><b>Correct</b>${q.item.note?`<span>${esc(q.item.note)}</span>`:''}</div>`
      :`<div class="fb no"><b>Not quite</b><span>${wrong}</span></div>`;
    fb+=`<div class="row"><button class="btn" data-act="cont">Continue</button></div>`;
  }
  return `<div class="top"><button class="x" data-act="leave" aria-label="Close quiz">×</button><div class="bar" aria-hidden="true"><i style="width:${prog}%"></i></div></div>
  <div class="panel">${body}${fb}</div>`;
}

function results(){
  const r=S.res,u=unit(S.uid),c=COURSES.find(x=>x.id===u.course);
  const idx=c?c.units.indexOf(u.id):-1,nx=c&&idx>=0&&idx<c.units.length-1?unit(c.units[idx+1]):null;
  return `<div class="panel cen"><div class="eyebrow muted">${esc(u.title)} complete</div>
    <div class="big yo" style="margin:12px 0">${r.pct>=80?'Ẹ ṣé!':'Ẹ pẹ̀lẹ́'}</div>
    <p style="margin:0" class="muted">${r.pct>=80?'Thank you for the effort, great work.':'Keep going, you are getting there.'}</p>
    <div class="stats" style="justify-content:center;margin-top:18px"><span><b>${r.pct}%</b>first try</span><span><b>+${r.xp}</b>XP</span><span><b>${liveStreak()}</b>day streak</span></div>
    ${r.missed.length?`<div class="grp" style="margin-top:20px;text-align:left"><div class="q-label">Words to revisit</div><div class="chips">${r.missed.map(m=>`<span class="chip"><span class="yo">${esc(m.yo.length>60?m.yo.slice(0,57)+'…':m.yo)}</span>${m.en?' · '+esc(m.en.length>50?m.en.slice(0,47)+'…':m.en):''}</span>`).join('')}</div></div>`:''}
    <div class="row"><button class="btn alt" data-act="open" data-id="${u.id}">Try again</button>
    ${nx?`<button class="btn" data-act="open" data-id="${nx.id}">Next lesson</button>`:`<button class="btn" data-act="leave">Back to course</button>`}</div></div>`;
}

function review(){
  const R=S.rv;
  if(!R){
    const pool=reviewPool();
    return `<div class="sec"><h2>Flashcards</h2></div>
    <div class="panel"><p style="margin:0">${unitsDone()?`Flip through ${pool.length} words from the lessons you finished.`:'Finish a lesson to build your deck. Until then, here is a starter deck of greetings.'}</p>
    <div class="row" style="justify-content:flex-start"><button class="btn" data-act="rvstart">Start ${pool.length} cards</button></div></div>`;
  }
  if(R.i>=R.deck.length){
    return `<div class="sec"><h2>Flashcards</h2></div><div class="panel cen"><div class="big yo">Ó dára!</div><p class="muted">Deck finished. ${R.again} card${R.again===1?'':'s'} came back for another look.</p>
    <div class="row"><button class="btn" data-act="rvstart">Go again</button></div></div>`;
  }
  const c=R.deck[R.i];
  return `<div class="sec"><h2>Flashcards</h2><span class="meta">${Math.min(R.i+1,R.deck.length)} of ${R.deck.length}</span></div>
  <button class="panel card" style="width:100%;border:1px solid var(--line);background:var(--surface)" data-act="flip" aria-label="Flip card">
    <div class="big yo">${esc(c.yo)}</div>
    ${R.flip?`<div class="en">${esc(c.en)}</div>${c.note?`<div class="note">${esc(c.note)}</div>`:''}`:'<div class="muted">Tap to see the meaning</div>'}</button>
  <div class="row">${spkBtn(c.yo)}${R.flip?`<button class="btn alt" data-act="again">Again</button><button class="btn" data-act="gotit">Got it</button>`:''}</div>`;
}
const reviewPool=()=>{const l=uniqBy(ALL.filter(i=>P.done[i.unit]!==undefined),i=>i.yo);return l.length?l:unit('greet').items};

/* ---------- finishing a lesson ---------- */
function finishQuiz(){
  const u=unit(S.uid),total=S.total,first=S.firstOK;
  const pct=Math.round(first/total*100);
  const xp=first*10+(pct===100?20:0);
  P.done[u.id]=Math.max(P.done[u.id]||0,pct);addXP(xp);
  const seen=new Set();const missed=S.missed.filter(m=>!seen.has(m.yo)&&seen.add(m.yo));
  S.res={pct,xp,missed};go('results');
}
function setAnswer(ok,picked){
  const q=S.qs[S.qi];S.cur.answered=true;S.cur.ok=ok;S.cur.picked=picked;
  sfx(ok?'ok':'bad');
  if(ok){if(q.tries===0)S.firstOK++}
  else{S.missed.push(q.item);if(q.tries===0){const r=Object.assign({},q,{tries:1});if(r.type==='build')r.bank=shuf(r.bank);S.qs.push(r)}}
  q.tries++;render();
}

/* ---------- actions ---------- */
ACT.ctier=d=>{S.tier=d.id;render()};
ACT.opencourse=d=>{S.cid=+d.id;go('course')};
ACT.leave=()=>{S.cid?go('course'):go('courses')};
ACT.open=d=>{const u=unit(d.id);S.uid=d.id;S.i=0;S.cid=u.course||S.cid;go('learn')};
ACT.next=()=>{S.i++;go('learn')};
ACT.prev=()=>{S.i--;go('learn')};
ACT.quiz=()=>{const u=unit(S.uid);S.qs=makeQuiz(u);S.qi=0;S.total=S.qs.length;S.firstOK=0;S.missed=[];S.cur={placed:[],answered:false};go('quiz')};
ACT.pick=d=>{const q=S.qs[S.qi];if(S.cur.answered)return;setAnswer(d.v===q.answer,d.v)};
ACT.place=d=>{if(!S.cur.answered&&!S.cur.placed.includes(+d.i)){S.cur.placed.push(+d.i);render()}};
ACT.unplace=d=>{if(!S.cur.answered){S.cur.placed.splice(+d.k,1);render()}};
ACT.check=()=>{const q=S.qs[S.qi];const got=S.cur.placed.map(i=>q.bank.find(b=>b.i===i).t);setAnswer(got.join(' ')===q.answer.join(' '),null)};
ACT.cont=()=>{S.qi++;S.cur={placed:[],answered:false};if(S.qi>=S.qs.length)finishQuiz();else{render();window.scrollTo(0,0)}};
ACT.rvstart=()=>{S.rv={deck:shuf(reviewPool()),i:0,flip:false,again:0};render()};
ACT.flip=()=>{S.rv.flip=!S.rv.flip;render()};
ACT.again=()=>{const c=S.rv.deck[S.rv.i];S.rv.deck.push(c);S.rv.again++;S.rv.i++;S.rv.flip=false;render()};
ACT.gotit=()=>{S.rv.i++;S.rv.flip=false;render()};

VIEWS.courses=courses;VIEWS.course=course;VIEWS.learn=learn;VIEWS.quiz=quiz;VIEWS.results=results;VIEWS.review=review;
