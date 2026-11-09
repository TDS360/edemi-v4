/* ===== 12-game-scramble-speed.js  Game 4: Word Scramble.  Game 5: Speed Quiz. ===== */

/* ================= WORD SCRAMBLE ================= */
/* Splits a word into letters, keeping tone marks and underdots attached to their letter (and "gb" together). */
function letters(w){
  const out=[];for(const ch of String(w).normalize('NFD')){
    if(/[̀-ͯ]/.test(ch)&&out.length)out[out.length-1]+=ch;
    else if(ch.toLowerCase()==='b'&&out.length&&out[out.length-1].toLowerCase()==='g')out[out.length-1]+=ch;
    else out.push(ch)}
  return out;
}
let scrTimer=0,scrNext=0;
function scrStop(){clearInterval(scrTimer);clearTimeout(scrNext);scrTimer=0}
STOPS.push(scrStop);
const SCR_SECS=90,SCR_WORDS=7;
function scrWord(it){
  const L=letters(it.yo);let t;
  for(let i=0;i<12;i++){t=shuf(L.map((s,k)=>({s,id:k})));if(t.map(x=>x.s).join('')!==L.join(''))break}
  return{it,L,tiles:t,placed:[],hint:0,penalty:0,solved:false};
}
ACT.startscramble=()=>{
  scrStop();
  const pool=poolFor(i=>{if(/[\s-]/.test(i.yo)||unit(i.unit).build)return false;const n=letters(i.yo).length;return n>=3&&n<=8},SCR_WORDS+3);
  if(pool.length<SCR_WORDS){toast('Finish a lesson or two first so there are words to unscramble.');return}
  const words=shuf(pool).slice(0,SCR_WORDS).map(scrWord);
  S.g={phase:'play',game:'scramble',words,wi:0,score:0,solved:0,left:SCR_SECS};
  scrTimer=setInterval(()=>{const g=S.g;if(!g||g.game!=='scramble'||g.phase!=='play')return;g.left--;const e=$('#stime');if(e)e.textContent=g.left+'s';if(g.left<=0)scrEnd()},1000);
  render();
};
function scrEnd(){
  const g=S.g;scrStop();
  const score=g.score+(g.solved===SCR_WORDS?g.left*5:0);
  finishGame(GAMES[3],{score,xp:5+g.solved*4,lines:[`${g.solved} of ${SCR_WORDS} words${g.solved===SCR_WORDS?`, with ${g.left} seconds to spare`:''}.`]});
}
function scrAdvance(){
  const g=S.g;if(!g||g.phase!=='play')return;
  g.wi++;if(g.wi>=g.words.length)scrEnd();else render();
}
function scrCheck(){
  const g=S.g,w=g.words[g.wi];
  if(w.placed.length!==w.L.length)return;
  const got=w.placed.map(id=>w.tiles.find(t=>t.id===id).s).join('').normalize('NFD');
  if(got===w.L.join('').normalize('NFD')){
    w.solved=true;g.solved++;g.score+=Math.max(20,100-w.penalty);sfx('ok');render();
    clearTimeout(scrNext);scrNext=setTimeout(scrAdvance,1100);
  }else{sfx('bad');w.shake=true;render();w.shake=false}
}
ACT.sput=d=>{const g=S.g,w=g&&g.words&&g.words[g.wi];if(!w||w.solved||w.placed.includes(+d.id))return;w.placed.push(+d.id);sfx('tick');render();scrCheck()};
ACT.stake=d=>{const g=S.g,w=g&&g.words&&g.words[g.wi];if(!w||w.solved)return;w.placed.splice(+d.k,1);render()};
ACT.sclear=()=>{const w=S.g.words[S.g.wi];if(!w.solved){w.placed=[];render()}};
ACT.shint=()=>{
  const g=S.g,w=g.words[g.wi];if(w.solved)return;
  /* keep the correct letters already in place, then add the next right one */
  let k=0;while(k<w.placed.length&&w.tiles.find(t=>t.id===w.placed[k]).s===w.L[k])k++;
  w.placed=w.placed.slice(0,k);
  const t=w.tiles.find(t=>t.s===w.L[k]&&!w.placed.includes(t.id));
  if(t){w.placed.push(t.id);w.penalty+=40;sfx('tick');render();scrCheck()}
};
ACT.sskip=()=>{const g=S.g;if(g&&g.words[g.wi]&&!g.words[g.wi].solved)scrAdvance()};
function scrambleView(){
  if(overPhase('scramble'))return gameOver();
  const g=S.g;
  if(!g||g.game!=='scramble')return intro(GAMES[3],`Unscramble ${SCR_WORDS} words in ${SCR_SECS} seconds. Tap letters in order, tone marks included. Each word is worth up to 100 points; a hint costs 40.`,'Start the clock');
  const w=g.words[g.wi];
  return `<div class="gbar"><span>Word <b>${g.wi+1}</b>/${g.words.length}</span><span>Score <b>${g.score}</b></span><span><b id="stime">${g.left}s</b></span></div>
  <div class="panel cen"><div class="q-label" style="margin-top:0">Meaning</div><div class="prompt" style="font-size:1.4rem">${esc(w.it.en)}</div>
    <div class="slots sc" style="justify-content:center" aria-label="Your answer">${w.L.map((_,k)=>{const id=w.placed[k];return id===undefined?`<span class="tok blank" aria-hidden="true"></span>`
      :`<button class="tok${w.solved?' okt':''}" data-act="stake" data-k="${k}" ${w.solved?'disabled':''}>${esc(w.tiles.find(t=>t.id===id).s.normalize('NFC'))}</button>`}).join('')}</div>
    <div class="bank" style="justify-content:center">${w.tiles.map(t=>`<button class="tok${w.placed.includes(t.id)?' used':''}" data-act="sput" data-id="${t.id}" ${w.solved?'disabled':''}>${esc(t.s.normalize('NFC'))}</button>`).join('')}</div>
    ${w.solved?`<div class="fb ok" style="text-align:left"><b>Correct</b><span class="yo">${esc(w.it.yo)}</span></div>`:`<div class="row"><button class="btn alt" data-act="sclear">Clear</button><button class="btn alt" data-act="shint">Hint (−40)</button><button class="btn alt" data-act="sskip">Skip</button></div>`}</div>`;
}
VIEWS.scramble=scrambleView;

/* ================= SPEED QUIZ ================= */
let spdTimer=0,spdNext=0;
function spdStop(){clearInterval(spdTimer);clearTimeout(spdNext);spdTimer=0}
STOPS.push(spdStop);
const SPD_SECS=60;
function spdQ(){
  const pool=poolFor(i=>!unit(i.unit).build&&i.yo.length<=26&&i.en.length<=36,12);
  const it=pool[Math.floor(Math.random()*pool.length)];
  return mcQ(it,Math.random()<.5?'yo2en':'en2yo',pool);
}
ACT.startspeed=()=>{
  spdStop();
  S.g={phase:'play',game:'speed',score:0,lives:3,combo:0,best:0,right:0,total:0,left:SPD_SECS,q:spdQ(),pick:null};
  spdTimer=setInterval(()=>{const g=S.g;if(!g||g.game!=='speed'||g.phase!=='play')return;g.left--;
    const e=$('#qtime'),b=$('#qbar');if(e)e.textContent=g.left+'s';if(b)b.style.width=(g.left/SPD_SECS*100)+'%';
    if(g.left<=0)spdEnd()},1000);
  render();
};
function spdEnd(){
  const g=S.g;spdStop();
  finishGame(GAMES[4],{score:g.score,xp:5+Math.floor(g.score/25),lines:[`${g.right} of ${g.total} right. Best combo ${g.best}.`]});
}
ACT.sans=d=>{
  const g=S.g;if(!g||g.phase!=='play'||g.pick!==null)return;
  const ok=d.v===g.q.answer;g.pick=d.v;g.total++;
  if(ok){g.right++;g.combo++;g.best=Math.max(g.best,g.combo);g.score+=10*Math.min(4,1+Math.floor(g.combo/3))}
  else{g.combo=0;g.lives--}
  sfx(ok?'ok':'bad');render();
  clearTimeout(spdNext);spdNext=setTimeout(()=>{if(S.g!==g||g.phase!=='play')return;if(g.lives<=0){spdEnd();return}g.q=spdQ();g.pick=null;render()},ok?350:900);
};
function speedView(){
  if(overPhase('speed'))return gameOver();
  const g=S.g;
  if(!g||g.game!=='speed')return intro(GAMES[4],`${SPD_SECS} seconds, three lives. Answer as fast as you can. Three right in a row raises your multiplier, up to 4×. A wrong answer costs a life and resets the combo.`,'Start the clock');
  const q=g.q,mult=Math.min(4,1+Math.floor(g.combo/3));
  return `<div class="gbar"><span>Score <b>${g.score}</b></span><span>${'♥'.repeat(Math.max(0,g.lives))}${'♡'.repeat(3-Math.max(0,g.lives))}</span><span>×<b>${mult}</b></span><span><b id="qtime">${g.left}s</b></span></div>
  <div class="bar" style="height:8px;margin:2px 0 4px" aria-hidden="true"><i id="qbar" style="width:${g.left/SPD_SECS*100}%"></i></div>
  <div class="panel"><div class="q-label" style="margin-top:0">${q.dir==='yo2en'?'What does this mean?':'How do you say this in Yorùbá?'}</div>
    <div class="prompt${q.dir==='yo2en'?' yo':''}">${esc(q.prompt)}</div>
    <div class="opts">${q.options.map(o=>{let cl='opt'+(q.dir==='en2yo'?' yo':'');if(g.pick!==null){if(o===q.answer)cl+=' right';else if(o===g.pick)cl+=' wrong'}
      return `<button class="${cl}" data-act="sans" data-v="${esc(o)}" ${g.pick!==null?'disabled':''}>${esc(o)}</button>`}).join('')}</div></div>`;
}
VIEWS.speed=speedView;
