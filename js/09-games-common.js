/* ===== 09-games-common.js  Game Hub, icons, tower, leaderboard (simulated rivals), shared results screen.
   Each game lives in its own file (10-… to 14-…) and plugs in with VIEWS[id], ACT[...] and STOPS. ===== */

/* ---------- the eight games ---------- */
const GAMES=[
 {id:'match',t:'Match Game',yo:'Ìdàpọ̀',d:'Flip cards and pair each Yorùbá word with its meaning.',lb:'match'},
 {id:'tower',t:'Tone Tower',yo:'Ilé gíga',d:'Hear a pitch pattern, pick the matching word, and stack tower pieces.',lb:'tone'},
 {id:'runner',t:'Cowrie Run',yo:'Sáré',d:'Dash through the market, dodge hurdles, grab cowries and build your tower.',lb:'runner'},
 {id:'scramble',t:'Word Scramble',yo:'Àkójọ lẹ́tà',d:'Put the jumbled letters back in order, tone marks and all.',lb:'scramble'},
 {id:'speed',t:'Speed Quiz',yo:'Yára',d:'Sixty seconds. Answer fast, build a combo, keep your lives.',lb:'speed'},
 {id:'say',t:'Say It',yo:'Sọ ọ́',d:'Voice game: a word appears, you say it out loud for points and tower pieces.',lb:'say'},
 {id:'echo',t:'Echo',yo:'Àwòdì ohùn',d:'Voice game: memorize a phrase for 3 seconds, then say it from memory.',lb:'echo'},
 {id:'recall',t:'Recall',yo:'Ranti',d:'Voice game: see the English, say the Yorùbá out loud.',lb:'recall'}];
const LB=[['runner','Cowrie Run'],['tone','Tone Tower'],['match','Match Game'],['scramble','Word Scramble'],['speed','Speed Quiz'],['say','Say It'],['echo','Echo'],['recall','Recall'],['tower','Tower height']];

/* Clean custom icons, 64px, drawn with theme colors. */
const GI={
 match:`<rect x="6" y="14" width="24" height="34" rx="5" fill="var(--tint)" stroke="currentColor" stroke-width="3"/><rect x="34" y="18" width="24" height="34" rx="5" fill="var(--gold)" stroke="currentColor" stroke-width="3"/><path d="M18 26v10M13 31h10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M46 29l-4 6h8l-4 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
 tower:`<rect x="20" y="46" width="24" height="10" rx="2" fill="var(--gold)" stroke="currentColor" stroke-width="3"/><rect x="23" y="35" width="18" height="10" rx="2" fill="var(--tint)" stroke="currentColor" stroke-width="3"/><rect x="26" y="24" width="12" height="10" rx="2" fill="var(--gold)" stroke="currentColor" stroke-width="3"/><path d="M32 12l4 6h-8z" fill="currentColor"/><path d="M8 28q-3 4 0 8M13 25q-5 7 0 14M56 28q3 4 0 8M51 25q5 7 0 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
 runner:`<path d="M10 56L26 8h12l16 48" fill="var(--tint)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M32 12v8M32 28v8M32 44v8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="22" r="5" fill="var(--gold)" stroke="currentColor" stroke-width="3"/><path d="M32 27v10l-6 8M32 33l7-4M32 37l7 8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
 scramble:`<rect x="6" y="22" width="22" height="22" rx="5" fill="var(--gold)" stroke="currentColor" stroke-width="3"/><rect x="36" y="22" width="22" height="22" rx="5" fill="var(--tint)" stroke="currentColor" stroke-width="3"/><path d="M17 38v-9l-3 4M17 29l3 4" fill="none" stroke="currentColor" stroke-width="0"/><text x="17" y="39" text-anchor="middle" font-size="16" font-weight="800" font-family="serif" fill="currentColor">Ẹ</text><text x="47" y="39" text-anchor="middle" font-size="16" font-weight="800" font-family="serif" fill="currentColor">Ọ</text><path d="M14 14q18-10 36 0M46 10l4 4-5 3M14 52q18 10 36 0M18 56l-4-4 5-3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
 speed:`<circle cx="32" cy="36" r="20" fill="var(--tint)" stroke="currentColor" stroke-width="3"/><path d="M32 36V22M26 8h12M32 8v8" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M35 26l-8 12h7l-3 10 11-15h-8z" fill="var(--gold)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`,
 say:`<rect x="23" y="6" width="18" height="30" rx="9" fill="var(--gold)" stroke="currentColor" stroke-width="3"/><path d="M14 30a18 18 0 0 0 36 0M32 48v10M22 58h20" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
 echo:`<rect x="8" y="22" width="14" height="22" rx="7" fill="var(--gold)" stroke="currentColor" stroke-width="3"/><path d="M30 24q6 8 0 16M38 18q11 14 0 28M46 12q16 20 0 40" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
 recall:`<circle cx="32" cy="26" r="18" fill="var(--tint)" stroke="currentColor" stroke-width="3"/><path d="M26 22a6 6 0 1 1 9 5c-2 1-3 2-3 5" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="32" cy="38" r="2" fill="currentColor"/><rect x="26" y="48" width="12" height="10" rx="5" fill="var(--gold)" stroke="currentColor" stroke-width="3"/>`,
 trophy:`<path d="M20 8h24v18a12 12 0 0 1-24 0z" fill="var(--gold)" stroke="currentColor" stroke-width="3"/><path d="M20 14H10c0 10 4 14 10 14M44 14h10c0 10-4 14-10 14" fill="none" stroke="currentColor" stroke-width="3"/><path d="M32 38v10M22 56h20M26 48h12" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`};
const gicon=(id,sz)=>`<svg viewBox="0 0 64 64" width="${sz||56}" height="${sz||56}" aria-hidden="true">${GI[id]}</svg>`;

/* ---------- tower ---------- */
const TOWER_LV=[['Foundation',0],['Hut',5],['Compound',15],['Watchtower',30],['Palace',60],['Citadel',100]];
const towerLevel=n=>{let k=0;TOWER_LV.forEach((l,i)=>{if(n>=l[1])k=i});return TOWER_LV[k][0]};
/* Draws up to 30 stacked blocks; `extra` shows this round's new pieces in gold. */
function towerSvg(n,extra,h){
  const total=n+(extra||0),show=Math.min(total,30),cols=['var(--indigo)','var(--tint)','var(--hero)'],bh=Math.max(5,Math.min(12,220/Math.max(show,1)));
  let out='';for(let i=0;i<show;i++){const isNew=i>=show-Math.min(extra||0,show),w=84-Math.min(i,24)*1.6,y=236-(i+1)*bh;
    out+=`<rect x="${100-w/2}" y="${y}" width="${w}" height="${bh-1.5}" rx="2" fill="${isNew?'var(--gold)':cols[i%3]}" stroke="var(--fg)" stroke-width="1" opacity="${isNew?1:.95}"/>`}
  if(total>0)out+=`<path d="M100 ${236-show*bh-12}l8 10h-16z" fill="var(--gold)" stroke="var(--fg)" stroke-width="1"/>`;
  return `<svg viewBox="0 0 200 250" height="${h||160}" role="img" aria-label="Tower with ${total} pieces"><line x1="20" x2="180" y1="238" y2="238" stroke="var(--line)" stroke-width="3" stroke-linecap="round"/>${out}</svg>`;
}

/* ---------- simulated rivals ---------- */
/* Everyone except you on the leaderboard is made up by the app. Scores change each week, and are the same for everyone viewing that week. */
const RIVAL_NAMES=['Ade','Tola','Kemi','Dapo','Funmi','Seyi','Bola','Yemisi','Taiwo','Kehinde','Shola','Lere','Ayo','Dami','Olamide','Temi','Bisi','Wale','Niyi','Sade','Femi','Tunde','Lola','Gbenga'];
const RIVAL_TAGS=['Runs','Fox','Zoom','Flash','Wave','Spark','99','Boss','Star','Ace','07','Tiger','Pro','Moon','Drum','Jolly'];
const LB_RANGE={runner:[300,4200],tone:[300,1150],match:[250,880],scramble:[250,1200],speed:[80,520],say:[200,1000],echo:[150,650],recall:[200,1000],tower:[3,110]};
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const weekNo=()=>Math.floor((Date.now()-new Date(2024,0,1))/(7*864e5));
function rivals(lb){
  const rnd=mulberry(weekNo()*977+[...lb].reduce((a,c)=>a+c.charCodeAt(0),0)*131),[lo,hi]=LB_RANGE[lb],used=new Set(),out=[];
  while(out.length<24){const nm=RIVAL_NAMES[Math.floor(rnd()*RIVAL_NAMES.length)]+(rnd()<.5?'_':'')+RIVAL_TAGS[Math.floor(rnd()*RIVAL_TAGS.length)];
    if(used.has(nm))continue;used.add(nm);
    out.push({name:nm,score:Math.round(lo+(hi-lo)*Math.pow(rnd(),1.7)),bot:true})}
  return out;
}
const myScore=lb=>lb==='tower'?P.tower:P.best[lb]||0;
const myName=()=>(P.name||'').trim()||'You';
function board(lb){
  const me={name:myName(),score:myScore(lb),me:true};
  const all=[...rivals(lb),...(me.score>0?[me]:[])].sort((a,b)=>b.score-a.score);
  return{all,rank:me.score>0?all.indexOf(all.find(x=>x.me))+1:0};
}
function boardRows(lb,limit){
  const {all,rank}=board(lb),top=all.slice(0,limit||10);
  let rows=top.map((r,i)=>[i+1,r]);
  if(rank>(limit||10))rows=rows.concat([[0,null],[rank,all[rank-1]]]);
  return `<ol class="lb">${rows.map(([n,r])=>r?`<li class="${r.me?'me':''}"><span class="rk">${n}</span><span class="nm">${esc(r.name)}${r.bot?'<i class="sim">sim</i>':' <i class="you">you</i>'}</span><b>${r.score.toLocaleString()}</b></li>`:'<li class="gap" aria-hidden="true">…</li>').join('')}</ol>`;
}

/* ---------- hub ---------- */
function games(){
  const lvl=towerLevel(P.tower);
  return `<div class="sec" style="padding-top:max(14px,env(safe-area-inset-top,0px))"><h2>Game Hub</h2><span class="meta">${P.coins} cowries · ${P.tower} tower pieces</span></div>
  <div class="panel towerpanel"><div class="tw">${towerSvg(P.tower,0,150)}</div>
    <div><div class="eyebrow muted">Your tower</div><h3 style="margin:6px 0">${esc(lvl)}</h3>
    <p style="margin:0" class="muted">Right answers in Tone Tower and every 15 cowries in Cowrie Run add a piece. Pieces are yours to keep.</p>
    <div class="row" style="justify-content:flex-start"><button class="btn alt" data-act="tab" data-v="leaders">${ic('trophy')}&nbsp;Leaderboards</button></div></div></div>
  <div class="games">${GAMES.map(g=>{const b=P.best[g.lb];return `<button class="gcard" data-act="tab" data-v="${g.id}"><span class="gic">${gicon(g.id,56)}</span><span class="gtx"><b>${esc(g.t)}</b><span class="yoname">${esc(g.yo)}</span><span class="meta">${esc(g.d)}</span><span class="gbest">${b?'Best '+b.toLocaleString():'Not played yet'}</span></span></button>`}).join('')}</div>
  <p class="fine">Game scores and your tower are saved in this browser only. The other players on the leaderboards are simulated by the app to keep things lively, and are marked “sim”.</p>`;
}
function leaders(){
  const lb=S.lb||'runner',{rank,all}=board(lb);
  return `<div class="sec"><h2>Leaderboards</h2><span class="meta">Resets weekly for the sim players</span></div>
  <div class="chips tabs" role="tablist" aria-label="Leaderboard">${LB.map(x=>`<button class="chip${lb===x[0]?' on':''}" role="tab" aria-selected="${lb===x[0]}" data-act="lbtab" data-id="${x[0]}">${esc(x[1])}</button>`).join('')}</div>
  <div class="panel" style="padding:8px 16px"><div class="meta" style="padding:8px 0">${rank?`You are #${rank} of ${all.length}.`:'Play to get on the board.'} Your name comes from your Profile.</div>${boardRows(lb,10)}</div>
  <p class="fine">Everyone marked “sim” is made up by the app. Real shared leaderboards would need a server.</p>`;
}

/* ---------- shared results screen ----------
   A game finishes by calling finishGame(). It saves the best score, hands out rewards and switches the view to its "over" phase. */
function finishGame(g,o){
  const lb=g.lb,prev=P.best[lb]||0,isBest=o.score>prev;
  if(isBest)P.best[lb]=o.score;
  P.plays[lb]=(P.plays[lb]||0)+1;
  if(o.pieces)P.tower+=o.pieces;if(o.coins)P.coins+=o.coins;
  addXP(o.xp||0);
  S.g=Object.assign({phase:'over',game:g.id},o,{isBest,rank:board(lb).rank,total:board(lb).all.length});
  sfx(isBest?'win':'ok');render();
}
function gameOver(){
  const r=S.g,g=GAMES.find(x=>x.id===r.game);
  return `<div class="panel cen"><div class="eyebrow muted">${esc(g.t)}</div>
    <div class="big" style="font-family:var(--f-ui);font-weight:800;margin:8px 0">${r.score.toLocaleString()}</div>
    ${r.isBest?'<div class="chip on" style="display:inline-block">New personal best</div>':`<div class="meta">Personal best ${(P.best[g.lb]||0).toLocaleString()}</div>`}
    <p class="muted" style="margin:12px 0 0">${(r.lines||[]).map(esc).join('<br>')}</p>
    <div class="stats" style="justify-content:center;margin-top:16px"><span><b>#${r.rank}</b>of ${r.total}</span><span><b>+${r.xp||0}</b>XP</span>${r.pieces?`<span><b>+${r.pieces}</b>tower</span>`:''}${r.coins?`<span><b>+${r.coins}</b>cowries</span>`:''}</div>
    ${r.pieces?`<div style="margin-top:8px">${towerSvg(P.tower-r.pieces,r.pieces,130)}</div>`:''}
    <div class="row"><button class="btn" data-act="gplay" data-id="${g.id}">Play again</button><button class="btn alt" data-act="lbgo" data-id="${g.lb}">Leaderboard</button><button class="btn alt" data-act="tab" data-v="games">Game Hub</button></div>
    <p class="fine">Rank is against simulated players.</p></div>`;
}
const overPhase=id=>S.g&&S.g.game===id&&S.g.phase==='over';

/* ---------- add a new game with ONE call ----------
   registerGame({id,title,yo,desc,icon,range,view,start})
     id     short lowercase letters, used as the page address (#id) and leaderboard key
     icon   inner SVG markup for a 64x64 icon (optional)   range  [low,high] typical score, for the simulated rivals
     view   function returning the game's HTML              start  function that begins a round (sets S.g, calls render())
   See templates/game-template.js for a complete example. */
function registerGame(g){
  GAMES.push({id:g.id,t:g.title,yo:g.yo||'',d:g.desc,lb:g.id});
  LB.splice(LB.length-1,0,[g.id,g.title]);          // before "Tower height"
  LB_RANGE[g.id]=g.range||[100,1000];
  GI[g.id]=g.icon||GI.match;
  VIEWS[g.id]=g.view;ACT['start'+g.id]=g.start;REG.push(g.id);
}
ACT.lbtab=d=>{S.lb=d.id;render()};
ACT.lbgo=d=>{S.lb=d.id;go('leaders')};
ACT.gplay=d=>{S.g=null;(ACT['start'+d.id]||(()=>{}))();};
VIEWS.games=games;VIEWS.leaders=leaders;
