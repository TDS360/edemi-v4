/* ===== 14-games-voice.js  Games 6-8: the "say it out loud" games.
     Say It   - see a word, say it.
     Echo     - see a phrase for 3 seconds, then say it from memory.
     Recall   - see only the English, say the Yorùbá.
   HOW THE CHECK WORKS (honest version):
   1. Auto-check: if the browser has speech recognition (SpeechRecognition), the game listens and compares what it heard
      with the target, ignoring tone marks. Yorùbá is poorly supported by browsers, so it can miss words that were said
      correctly. A "Count it" button lets you overrule it.
   2. Self-check: if the browser has no recognition, or the page may not use the microphone (as in a published Claude
      artifact), you say it out loud and then rate yourself. Nothing is recorded or sent anywhere.
   The game switches to self-check on its own if auto-check fails. ===== */

const VSR=window.SpeechRecognition||window.webkitSpeechRecognition||null;
const VLANGS=['yo-NG','yo'];
let vRec=null,vTimer=0;
function vStop(){clearInterval(vTimer);vTimer=0;try{if(vRec){vRec.onresult=vRec.onerror=vRec.onend=null;vRec.abort()}}catch(e){}vRec=null}
STOPS.push(vStop);

/* Similarity 0..1 between what was heard and the target, ignoring tone marks, case and punctuation. */
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,j)=>j);
  for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
const vnorm=s=>wnorm(s).replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
function similarity(heard,target){const a=vnorm(heard),b=vnorm(target);if(!a||!b)return 0;return 1-lev(a,b)/Math.max(a.length,b.length)}

const VGAMES={
 say:{n:8,pool:()=>poolFor(i=>!unit(i.unit).build&&i.yo.split(' ').length<=2&&i.yo.length<=16&&i.en.length<=36,12),
  ask:'Say this word out loud'},
 echo:{n:6,pool:()=>poolFor(i=>{const w=i.yo.split(' ').length;return w>=2&&w<=5&&i.yo.length<=34&&i.en.length<=60},8),
  ask:'Remember it, then say it'},
 recall:{n:8,pool:()=>poolFor(i=>!unit(i.unit).build&&i.yo.split(' ').length<=3&&i.yo.length<=22&&i.en.length<=34,12),
  ask:'Say this in Yorùbá'}};

/* current check mode: 'auto' when the browser can listen, 'self' otherwise */
const vMode=()=>S.vmode||(S.vmode=VSR?'auto':'self');

function startVoice(id){
  vStop();
  const cfg=VGAMES[id],items=shuf(cfg.pool()).slice(0,cfg.n);
  if(items.length<4){toast('Finish a lesson or two first so there are words to play with.');return}
  S.g={phase:'play',game:id,items,i:0,step:id==='echo'?'show':'prep',score:0,right:0,combo:0,tries:0,heard:'',ok:null,pts:0,note:'',count:3,lang:0};
  render();vArm();
}
ACT.startsay=()=>startVoice('say');
ACT.startecho=()=>startVoice('echo');
ACT.startrecall=()=>startVoice('recall');
ACT.vmode=()=>{S.vmode=vMode()==='auto'?'self':'auto';render()};

/* Echo: the phrase is visible for 3 seconds, then it hides. */
function vArm(){
  const g=S.g;vStop();if(!g||g.game!=='echo'||g.step!=='show')return;
  g.count=3;
  vTimer=setInterval(()=>{if(S.g!==g)return vStop();g.count--;if(g.count<=0){vStop();g.step='prep';render()}else{const e=$('#vcount');if(e)e.textContent=g.count}},1000);
}

/* Start speaking */
ACT.vsay=()=>{
  const g=S.g;if(!g||g.step!=='prep')return;
  const it=g.items[g.i];
  if(vMode()==='auto'&&VSR){
    g.step='listen';g.note='';render();
    let done=false;const finish=r=>{if(done)return;done=true;vStop();vResult(r)};
    try{
      vRec=new VSR();vRec.lang=VLANGS[g.lang]||'yo-NG';vRec.interimResults=false;vRec.maxAlternatives=5;vRec.continuous=false;
      vRec.onresult=e=>finish({alts:[...e.results[0]].map(x=>x.transcript)});
      vRec.onerror=e=>finish({err:e.error});
      vRec.onend=()=>finish({err:'no-speech'});
      vRec.start();
      setTimeout(()=>{if(!done)try{vRec&&vRec.stop()}catch(e){}},7000);
    }catch(e){finish({err:'start-failed'})}
  }else{
    /* self-check: a 4-second window to say it, then rate yourself */
    g.step='self';g.count=4;render();
    vTimer=setInterval(()=>{if(S.g!==g)return vStop();g.count--;if(g.count<=0){vStop();g.step='rate';render()}else{const e=$('#vcount');if(e)e.textContent=g.count}},1000);
  }
};
function vResult(r){
  const g=S.g;if(!g||g.step!=='listen')return;
  if(r.err){
    if(r.err==='language-not-supported'&&g.lang<VLANGS.length-1){g.lang++;g.step='prep';render();return ACT.vsay()}
    if(r.err==='no-speech'||r.err==='aborted'){g.step='prep';g.note='I did not hear anything. Tap the microphone and try again.';render();return}
    /* blocked or unavailable: switch to self-check for the rest of the session */
    S.vmode='self';g.step='prep';g.note=r.err==='not-allowed'||r.err==='service-not-allowed'
      ?'This page cannot use your microphone here, so the game switched to self-check: say it out loud, then rate yourself.'
      :'Speech recognition is not working in this browser, so the game switched to self-check.';
    render();return;
  }
  const it=g.items[g.i],best=Math.max(...r.alts.map(a=>similarity(a,it.yo)));
  g.heard=r.alts[0]||'';g.sim=best;g.ok=best>=.7;
  vScore(g.ok?'full':'miss');
}
/* Self-rating: 'full' | 'half' | 'miss' */
function vScore(kind){
  const g=S.g;
  if(kind==='full'){g.right++;g.combo++;g.pts=100+25*Math.min(g.combo-1,4)}
  else if(kind==='half'){g.combo=0;g.pts=50}else{g.combo=0;g.pts=0}
  g.score+=g.pts;g.kind=kind;g.step='res';sfx(kind==='miss'?'bad':'ok');render();
}
ACT.vrate=d=>{if(S.g&&S.g.step==='rate')vScore(d.k)};
ACT.vcount=()=>{const g=S.g;if(g&&g.step==='res'&&g.kind==='miss'&&g.heard){g.score-=g.pts;g.right++;g.combo++;g.pts=100;g.score+=100;g.kind='full';g.ok=true;sfx('ok');render()}};
ACT.vlisten=()=>{const g=S.g;if(g){const it=g.items[g.i];if(!speak(it.yo))playSeq([...toneOf(it.yo)])}};
ACT.vnext=()=>{
  const g=S.g;vStop();g.i++;
  if(g.i>=g.items.length){
    const gm=GAMES.find(x=>x.id===g.game);
    finishGame(gm,{score:g.score,xp:6+g.right*3,pieces:g.right,lines:[`${g.right} of ${g.items.length} said well.`,vMode()==='auto'?'Checked by speech recognition, which can miss Yorùbá.':'Self-checked, so this score is on the honor system.']});
    return;
  }
  g.step=g.game==='echo'?'show':'prep';g.count=3;g.heard='';g.ok=null;g.note='';g.kind=null;render();vArm();
};

function voiceView(id){
  if(overPhase(id))return gameOver();
  const gm=GAMES.find(x=>x.id===id),g=S.g;
  const auto=vMode()==='auto'&&VSR;
  if(!g||g.game!==id){
    const text={say:'A word appears. Say it out loud. Then you get points and, if you nailed it, a tower piece.',
      echo:'A phrase shows for 3 seconds. Memorize it, then say it out loud after it disappears.',
      recall:'Only the English shows. Say the Yorùbá out loud from memory, then see how you did.'}[id];
    return intro(gm,text+`<br><span class="meta">${auto?'Auto-check: your browser will listen and compare what it hears. Yorùbá recognition is shaky, so you can overrule it.':'Self-check: nothing is recorded. You say it out loud, then rate yourself.'}</span>`,'Start')+
      (VSR?`<div class="row"><button class="chip${auto?' on':''}" data-act="vmode" aria-pressed="${auto}">Auto-check: ${auto?'on':'off'}</button></div>`:'<p class="fine" style="text-align:center">This browser has no speech recognition, so the game uses self-check.</p>');
  }
  const it=g.items[g.i],cfg=VGAMES[id];
  const revealed=['res','rate'].includes(g.step);
  const hidden=id==='echo'&&g.step!=='show'&&!revealed;
  const showYo=!hidden&&!(id==='recall'&&!revealed);
  let body='';
  if(g.step==='show')body=`<div class="meta" style="margin-top:10px">Memorize it. Hiding in <b id="vcount">${g.count}</b>…</div><div class="row"><button class="btn alt" data-act="vlisten">▶ Hear it</button></div>`;
  else if(g.step==='prep')body=`${g.note?`<div class="fb tip" style="margin:10px 0 0"><span>${esc(g.note)}</span></div>`:''}<div class="row"><button class="btn mic" data-act="vsay" aria-label="Start speaking">🎤 Say it</button>${id==='say'?'<button class="btn alt" data-act="vlisten">▶ Hear it</button>':''}</div>${id==='recall'?'':''}`;
  else if(g.step==='listen')body=`<div class="listening" role="status"><span></span><span></span><span></span></div><p class="meta" style="text-align:center;margin:6px 0 0">Listening… say it now</p>`;
  else if(g.step==='self')body=`<div class="listening" role="status"><span></span><span></span><span></span></div><p style="text-align:center;margin:6px 0 0">Say it out loud now <b id="vcount">${g.count}</b></p>`;
  else if(g.step==='rate')body=`<p style="text-align:center;margin:10px 0 0">How did it go?</p><div class="row"><button class="btn" data-act="vrate" data-k="full">Nailed it</button><button class="btn alt" data-act="vrate" data-k="half">Close</button><button class="btn alt" data-act="vrate" data-k="miss">Missed it</button></div>`;
  else body=`<div class="fb ${g.kind==='miss'?'no':'ok'}"><b>${g.kind==='full'?'Nice! +'+g.pts+(g.right?' · tower piece':''):g.kind==='half'?'Close. +50':'Not this time'}</b>
      <span><span class="yo">${esc(it.yo)}</span> means “${esc(it.en)}”.${g.heard?`<br><span class="meta">Heard: “${esc(g.heard)}”</span>`:''}</span></div>
      <div class="row">${g.kind==='miss'&&g.heard?'<button class="btn alt" data-act="vcount">Count it, I said it right</button>':''}<button class="btn alt" data-act="vlisten">▶ Hear it</button><button class="btn" data-act="vnext">${g.i+1>=g.items.length?'Finish':'Next'}</button></div>`;
  return `<div class="gbar"><span>${g.i+1}<b>/${g.items.length}</b></span><span>Combo <b>${g.combo}</b></span><span>Score <b>${g.score}</b></span></div>
  <div class="panel cen"><div class="q-label" style="margin-top:0">${esc(cfg.ask)}</div>
    ${showYo?`<div class="big yo" style="margin:6px 0">${esc(it.yo)}</div>${id==='say'||revealed?contour(toneOf(it.yo)||'M').replace('<svg','<svg style="max-width:150px;margin:0 auto;display:block"'):''}`:`<div class="big yo" style="margin:6px 0;opacity:.35" aria-label="Hidden">· · ·</div>`}
    <div class="en" style="margin-top:4px">${esc(it.en)}</div>${body}</div>
  <p class="fine">${auto?'Auto-check listens through your microphone using your browser’s speech recognition. Audio is handled by your browser, not by this app.':'Self-check: nothing is recorded.'}</p>`;
}
VIEWS.say=()=>voiceView('say');VIEWS.echo=()=>voiceView('echo');VIEWS.recall=()=>voiceView('recall');
