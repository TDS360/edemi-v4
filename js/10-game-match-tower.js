/* ===== 10-game-match-tower.js  Game 1: Match Game.  Game 2: Tone Tower (the pronunciation-style game). ===== */

/* ---------- shared intro card ---------- */
const intro=(g,text,btn)=>`<div class="panel cen"><div class="gic" style="display:inline-block">${gicon(g.id,84)}</div><h2 style="margin-top:8px">${esc(g.t)}</h2><div class="yoname">${esc(g.yo)}</div>
  <p style="margin:12px auto 0;max-width:46ch">${text}</p><div class="row"><button class="btn" data-act="start${g.id}">${btn||'Start'}</button></div>
  ${P.best[g.lb]?`<p class="meta" style="margin:12px 0 0">Your best: ${P.best[g.lb].toLocaleString()}</p>`:''}</div>`;

/* ================= MATCH GAME ================= */
let matchTimer=0,matchLock=0;
function matchStop(){clearInterval(matchTimer);clearTimeout(matchLock);matchTimer=0}
STOPS.push(matchStop);
ACT.startmatch=()=>{
  matchStop();
  const pool=uniqBy(poolFor(i=>!unit(i.unit).build&&i.yo.split(' ').length<=2&&i.yo.length<=16&&i.en.length<=26,6),i=>i.en);
  const pick=uniqBy(shuf(pool),i=>i.yo).slice(0,6);
  /* ids are assigned after shuffling so a card's id is its position */
  const cards=shuf(pick.flatMap((it,k)=>[{k,t:it.yo,side:'yo'},{k,t:it.en,side:'en'}])).map((c,i)=>Object.assign(c,{id:i}));
  S.g={phase:'play',game:'match',cards,open:[],done:new Set(),moves:0,t0:Date.now(),secs:0};
  matchTimer=setInterval(()=>{if(S.g&&S.g.game==='match'&&S.g.phase==='play'){S.g.secs=Math.floor((Date.now()-S.g.t0)/1000);const e=$('#mtime');if(e)e.textContent=S.g.secs+'s'}},500);
  render();
};
ACT.mflip=d=>{
  const g=S.g;if(!g||g.phase!=='play'||g.open.length>=2)return;
  const id=+d.id;if(g.open.includes(id)||g.done.has(id))return;
  g.open.push(id);sfx('flip');
  if(g.open.length===2){
    g.moves++;const[a,b]=g.open.map(i=>g.cards[i]);
    if(a.k===b.k&&a.side!==b.side){
      g.done.add(a.id);g.done.add(b.id);g.open=[];sfx('ok');
      if(g.done.size===g.cards.length){matchStop();matchFinish();return}
    }else{sfx('bad');matchLock=setTimeout(()=>{if(S.g===g){g.open=[];render()}},750)}
  }
  render();
};
function matchFinish(){
  const g=S.g,secs=Math.floor((Date.now()-g.t0)/1000),pairs=g.cards.length/2;
  const score=Math.max(100,1000-(g.moves-pairs)*40-secs*5);
  finishGame(GAMES[0],{score,xp:10+pairs,lines:[`${pairs} pairs in ${g.moves} moves, ${secs} seconds.`,`Fewer moves and less time score higher.`]});
}
function matchView(){
  if(overPhase('match'))return gameOver();
  const g=S.g;
  if(!g||g.game!=='match')return intro(GAMES[0],'Flip two cards at a time. Match each Yorùbá word with its English meaning. Fewer moves and a faster time score more.','Deal the cards');
  return `<div class="gbar"><span><b>${g.done.size/2}</b>/${g.cards.length/2} pairs</span><span><b>${g.moves}</b> moves</span><span><b id="mtime">${g.secs}s</b></span></div>
  <div class="mgrid">${g.cards.map(c=>{const up=g.open.includes(c.id)||g.done.has(c.id);
    return `<button class="mcard${up?' up':''}${g.done.has(c.id)?' ok':''}${c.side==='yo'?' yo':''}" data-act="mflip" data-id="${c.id}" ${up?'disabled':''} aria-label="${up?esc(c.t):'Hidden card'}">${up?esc(c.t):'<span class="mback" aria-hidden="true"></span>'}</button>`}).join('')}</div>`;
}
VIEWS.match=matchView;

/* ================= TONE TOWER =================
   Browsers cannot listen to Yorùbá speech, so instead of speaking, you train the same skill by ear:
   hear the pitch pattern of a word, then pick the word whose tone marks match. */
function towerPool(){
  return poolFor(i=>{if(/[\s-]/.test(i.yo)||unit(i.unit).build)return false;const n=toneOf(i.yo).length;return n>=2&&n<=4},12);
}
function towerQ(it,pool){
  const p=toneOf(it.yo);
  let d=shuf(pool.filter(x=>x.yo!==it.yo&&toneOf(x.yo)!==p&&toneOf(x.yo).length===p.length));
  if(d.length<3)d=d.concat(shuf(pool.filter(x=>x.yo!==it.yo&&toneOf(x.yo)!==p&&!d.includes(x))));
  d=uniqBy(d,x=>toneOf(x.yo)).slice(0,3);
  return{it,p,opts:shuf([it,...d])};
}
ACT.starttower=()=>{
  const pool=towerPool();
  if(pool.length<5){toast('Finish a lesson or two first so there are words to play with.');return}
  const qs=shuf(pool).slice(0,10).map(it=>towerQ(it,pool));
  S.g={phase:'play',game:'tower',qs,qi:0,score:0,combo:0,right:0,pick:null};
  render();playSeq([...qs[0].p]);
};
ACT.tpick=d=>{
  const g=S.g;if(!g||g.pick!==null)return;
  const q=g.qs[g.qi];g.pick=d.v;const ok=d.v===q.it.yo;
  if(ok){g.right++;g.combo++;g.score+=100+25*Math.min(g.combo-1,4)}else g.combo=0;
  sfx(ok?'ok':'bad');render();
};
ACT.tplay=()=>{const g=S.g;if(g)playSeq([...g.qs[g.qi].p])};
ACT.tnext=()=>{
  const g=S.g;g.qi++;g.pick=null;
  if(g.qi>=g.qs.length){
    P.audioDone++;
    finishGame(GAMES[1],{score:g.score,xp:6+g.right*3,pieces:g.right,lines:[`${g.right} of ${g.qs.length} right.`,g.right?`${g.right} piece${g.right===1?'':'s'} added to your tower.`:'No pieces this time. Listen for high, mid and low.']});
  }else{render();playSeq([...g.qs[g.qi].p])}
};
function towerView(){
  if(overPhase('tower'))return gameOver();
  const g=S.g;
  if(!g||g.game!=='tower')return intro(GAMES[1],'Press play and listen to the pitch pattern. Pick the word whose tone marks match what you heard: grave is low, no mark is mid, acute is high. Every right answer adds a piece to your tower. Voice input is not possible in this app, so this trains your ear instead.','Build my tower');
  const q=g.qs[g.qi],ans=g.pick!==null;
  return `<div class="gbar"><span>Word <b>${g.qi+1}</b>/${g.qs.length}</span><span>Combo <b>${g.combo}</b></span><span>Score <b>${g.score}</b></span></div>
  <div class="panel towerplay"><div class="tw">${towerSvg(P.tower,g.right,150)}</div>
  <div><div class="q-label" style="margin-top:0">Which word has this pitch?</div>
    <div class="row" style="justify-content:flex-start;margin-top:8px"><button class="btn" data-act="tplay">▶ Play pitch</button></div>
    <div class="meta" style="margin-top:8px">${q.p.length} syllables</div></div></div>
  <div class="opts">${q.opts.map(o=>{let cl='opt yo';if(ans){if(o.yo===q.it.yo)cl+=' right';else if(o.yo===g.pick)cl+=' wrong'}
    return `<button class="${cl}" data-act="tpick" data-v="${esc(o.yo)}" ${ans?'disabled':''}>${esc(o.yo)} <span class="meta" style="font-family:var(--f-body);font-weight:400">· ${esc(o.en)}</span></button>`}).join('')}</div>
  ${ans?`<div class="fb ${g.pick===q.it.yo?'ok':'no'}"><b>${g.pick===q.it.yo?'Right. +1 tower piece':'Not quite'}</b><span><span class="yo">${esc(q.it.yo)}</span> (${esc(q.it.en)}) is <b style="display:inline">${toneNames(q.p)}</b>.</span><div style="max-width:150px;margin-top:6px">${contour(q.p)}</div></span></div>
  <div class="row"><button class="btn" data-act="tnext">${g.qi+1>=g.qs.length?'Finish':'Next word'}</button></div>`:''}`;
}
VIEWS.tower=towerView;
