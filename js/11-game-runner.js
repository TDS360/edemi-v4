/* ===== 11-game-runner.js  Game 3: Cowrie Run, a three-lane endless runner on a canvas.
   Controls: arrow keys or A/D (lanes), Up/W/Space (jump), Down/S (slide), swipe on touch, or the on-screen buttons.
   The loop draws everything itself, so the page is not re-rendered while you play. ===== */

const RUN={raf:0,last:0,st:null,cv:null,cx:null,col:{}};
const RW=360,RH=540,HOR=130,PL_P=.88,COWRIES_PER_PIECE=15;
const laneX=(lane,p)=>RW/2+(lane-1)*(26+104*p);
const groundY=p=>HOR+(RH-30-HOR)*p;
const scaleOf=p=>.12+.88*p;

function runStop(){cancelAnimationFrame(RUN.raf);RUN.raf=0;RUN.st=null}
STOPS.push(runStop);
ACT.startrunner=()=>{
  runStop();
  S.g={phase:'play',game:'runner'};
  RUN.st={lane:1,lx:1,h:0,vy:0,slide:0,spd:1,dist:0,coins:0,obs:[],spawn:.6,off:0,t:0,dead:false,hitT:0};
  render();
};
function runnerStart(){ /* called after the canvas exists */
  RUN.cv=$('#rcv');if(!RUN.cv||!RUN.st)return;
  const dpr=Math.min(2,window.devicePixelRatio||1);RUN.cv.width=RW*dpr;RUN.cv.height=RH*dpr;RUN.cx=RUN.cv.getContext('2d');RUN.cx.setTransform(dpr,0,0,dpr,0,0);
  const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim()||'#888';
  RUN.col={hero:v('--hero'),bg:v('--bg'),gold:v('--gold'),indigo:v('--indigo'),fg:v('--fg'),surface:v('--surface'),tint:v('--tint'),bad:v('--bad'),line:v('--line')};
  RUN.last=performance.now();cancelAnimationFrame(RUN.raf);RUN.raf=requestAnimationFrame(runFrame);
}
AFTER.runner=()=>{if(S.g&&S.g.phase==='play'&&S.g.game==='runner')runnerStart();else{const c=$('#rcv');if(c&&RUN.cv!==c){RUN.cv=c}}};

/* --- input --- */
function rLeft(){const s=RUN.st;if(s&&!s.dead&&s.lane>0){s.lane--;sfx('tick')}}
function rRight(){const s=RUN.st;if(s&&!s.dead&&s.lane<2){s.lane++;sfx('tick')}}
function rJump(){const s=RUN.st;if(s&&!s.dead&&s.h<=.02&&s.slide<=0){s.vy=3.3;sfx('jump')}}
function rSlide(){const s=RUN.st;if(s&&!s.dead){s.slide=.6;if(s.h>0)s.vy=-4}}
ACT.rleft=rLeft;ACT.rright=rRight;ACT.rjump=rJump;ACT.rslide=rSlide;
document.addEventListener('keydown',e=>{
  if(!RUN.st||S.view!=='runner'||(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)))return;
  const k=e.key,m={ArrowLeft:rLeft,a:rLeft,A:rLeft,ArrowRight:rRight,d:rRight,D:rRight,ArrowUp:rJump,w:rJump,W:rJump,' ':rJump,ArrowDown:rSlide,s:rSlide,S:rSlide}[k];
  if(m){e.preventDefault();m()}
});
let swipe=null;
document.addEventListener('touchstart',e=>{if(e.target.id==='rcv'&&e.touches[0])swipe={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
document.addEventListener('touchend',e=>{
  if(!swipe||!e.changedTouches[0])return;const dx=e.changedTouches[0].clientX-swipe.x,dy=e.changedTouches[0].clientY-swipe.y;swipe=null;
  if(Math.abs(dx)<24&&Math.abs(dy)<24)return;
  if(Math.abs(dx)>Math.abs(dy))dx<0?rLeft():rRight();else dy<0?rJump():rSlide();
},{passive:true});

/* --- simulation --- */
function runSpawn(s){
  /* Each row has 1-2 obstacles; at least one lane is always free of full blocks. */
  const lanes=shuf([0,1,2]),n=Math.random()<.35?2:1,types=['low','low','high','block'];
  const safe=lanes[2];
  for(let i=0;i<n;i++){
    let t=types[Math.floor(Math.random()*types.length)];
    if(n===2&&t!=='block')t=Math.random()<.5?'low':'high';
    s.obs.push({lane:lanes[i],p:0,type:t,hit:false});
  }
  if(Math.random()<.8){const l=n===2?safe:lanes[Math.floor(Math.random()*3)];
    for(let k=0;k<4;k++)s.obs.push({lane:l,p:-k*.07,type:'coin',got:false})}
}
function runUpdate(dt){
  const s=RUN.st;s.t+=dt;
  s.spd=Math.min(2,1+s.t*.025);
  s.lx+=(s.lane-s.lx)*Math.min(1,dt*14);
  if(s.h>0||s.vy>0){s.vy-=9*dt;s.h=Math.max(0,s.h+s.vy*dt);if(s.h===0&&s.vy<0)s.vy=0}
  if(s.slide>0)s.slide-=dt;
  s.dist+=dt*s.spd*14;s.off=(s.off+dt*s.spd*.9)%1;
  s.spawn-=dt;if(s.spawn<=0){runSpawn(s);s.spawn=Math.max(.5,1.25-s.spd*.38)+Math.random()*.25}
  for(const o of s.obs){
    if(o.p<0){o.p+=dt*.3;continue}
    o.p+=(.28+o.p*.9)*s.spd*dt;
    if(o.type==='coin'){
      if(!o.got&&o.p>.8&&o.p<1&&Math.abs(o.lane-s.lx)<.55&&(s.h<.9)){o.got=true;s.coins++;sfx('coin')}
    }else if(!o.hit&&o.p>.76&&o.p<1&&Math.abs(o.lane-s.lx)<.5){
      const clear=o.type==='low'?s.h>.22:o.type==='high'?s.slide>0:false;
      if(!clear){o.hit=true;s.dead=true;s.hitT=0;sfx('hit')}
    }
  }
  s.obs=s.obs.filter(o=>o.p<1.15&&!(o.type==='coin'&&o.got));
}
const rScore=s=>Math.floor(s.dist)+s.coins*10;

/* --- drawing --- */
function runDraw(){
  const s=RUN.st,c=RUN.cx,k=RUN.col;
  /* sky */
  const gr=c.createLinearGradient(0,0,0,HOR);gr.addColorStop(0,k.hero);gr.addColorStop(1,k.indigo);c.fillStyle=gr;c.fillRect(0,0,RW,HOR+2);
  c.fillStyle=k.gold;c.beginPath();c.arc(270,70,24,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<6;i++){const bx=i*64-((s.dist*.3)%64),bh=26+((i*37)%30);c.fillRect(bx,HOR-bh,44,bh)}
  /* ground and road */
  c.fillStyle=k.bg;c.fillRect(0,HOR,RW,RH-HOR);
  c.fillStyle=k.hero;c.beginPath();c.moveTo(laneX(0,0)-26,HOR);c.lineTo(laneX(2,0)+26,HOR);c.lineTo(laneX(2,1)+70,RH);c.lineTo(laneX(0,1)-70,RH);c.closePath();c.fill();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;
  for(const e of[.5,1.5]){c.beginPath();c.moveTo(RW/2+(e-1)*26,HOR);c.lineTo(RW/2+(e-1)*130+0,RH);c.stroke()}
  c.strokeStyle='rgba(255,255,255,.18)';
  for(let i=0;i<10;i++){const p=((i/10+s.off/10*1)%1),y=groundY(p);c.lineWidth=1+p*2;c.beginPath();c.moveTo(laneX(0,p)-(26+104*p)/1.4,y);c.lineTo(laneX(2,p)+(26+104*p)/1.4,y);c.stroke()}
  /* things, far to near */
  const list=s.obs.filter(o=>o.p>=0).sort((a,b)=>a.p-b.p);
  for(const o of list){
    if(o.p>PL_P&&!s.drawnPlayer){drawPlayer(s,c,k);s.drawnPlayer=true}
    drawThing(o,c,k)}
  if(!s.drawnPlayer)drawPlayer(s,c,k);s.drawnPlayer=false;
  /* hud */
  c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,0,RW,34);
  c.fillStyle='#fff';c.font='700 16px sans-serif';c.textBaseline='middle';c.textAlign='left';c.fillText('Score '+rScore(s),10,17);
  c.textAlign='right';c.fillText('Cowries '+s.coins,RW-10,17);
  c.fillStyle='rgba(255,255,255,.3)';c.fillRect(RW/2-40,26,80,4);c.fillStyle=k.gold;c.fillRect(RW/2-40,26,80*((s.coins%COWRIES_PER_PIECE)/COWRIES_PER_PIECE),4);
}
function drawThing(o,c,k){
  const x=laneX(o.lane,o.p),y=groundY(o.p),sc=scaleOf(o.p);
  if(o.type==='coin'){
    c.fillStyle=k.gold;c.strokeStyle='#7a5a00';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y-26*sc,10*sc,13*sc,0,0,7);c.fill();c.stroke();
    c.beginPath();c.moveTo(x,y-36*sc);c.lineTo(x,y-16*sc);c.stroke();return}
  const w=78*sc;
  if(o.type==='low'){c.fillStyle='#8a5a2b';c.fillRect(x-w/2,y-26*sc,w,12*sc);c.fillStyle='#5b3a1a';c.fillRect(x-w/2,y-14*sc,6*sc,14*sc);c.fillRect(x+w/2-6*sc,y-14*sc,6*sc,14*sc)}
  else if(o.type==='high'){c.fillStyle='#5b3a1a';c.fillRect(x-w/2,y-84*sc,6*sc,84*sc);c.fillRect(x+w/2-6*sc,y-84*sc,6*sc,84*sc);c.fillStyle=k.bad;c.fillRect(x-w/2,y-84*sc,w,20*sc);c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<4;i++)c.fillRect(x-w/2+(i*2+.5)*w/8,y-84*sc,w/8,20*sc)}
  else{c.fillStyle=k.bad;c.fillRect(x-w/2,y-70*sc,w,70*sc);c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2*sc+.5;c.strokeRect(x-w/2+5*sc,y-65*sc,w-10*sc,60*sc);c.beginPath();c.moveTo(x-w/2+5*sc,y-65*sc);c.lineTo(x+w/2-5*sc,y-5*sc);c.stroke()}
}
function drawPlayer(s,c,k){
  const p=PL_P,x=laneX(s.lx,p),gy=groundY(p),sc=scaleOf(p),lift=s.h*80*sc,sl=s.slide>0;
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x,gy,22*sc*(1-s.h*.25),6*sc,0,0,7);c.fill();
  const flash=s.dead&&Math.floor(s.hitT*12)%2===0;
  const bodyH=(sl?24:46)*sc,top=gy-lift-bodyH-14*sc,run=Math.sin(s.t*16)*(s.h>0?0:1);
  c.fillStyle=flash?'#fff':k.gold;c.beginPath();c.arc(x,top,10*sc,0,7);c.fill();
  c.fillStyle=flash?'#fff':k.indigo;c.fillRect(x-11*sc,top+9*sc,22*sc,bodyH-14*sc);
  c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<3;i++)c.fillRect(x-9*sc,top+13*sc+i*8*sc*(sl?.5:1),18*sc,2*sc);
  c.strokeStyle=k.fg;c.lineWidth=5*sc;c.lineCap='round';
  c.beginPath();c.moveTo(x-5*sc,gy-lift-14*sc);c.lineTo(x-5*sc-run*8*sc,gy-lift);c.moveTo(x+5*sc,gy-lift-14*sc);c.lineTo(x+5*sc+run*8*sc,gy-lift);c.stroke();
}
function runFrame(now){
  const s=RUN.st;if(!s||S.view!=='runner'||!S.g||S.g.phase!=='play')return;
  const dt=Math.min(.05,(now-RUN.last)/1000);RUN.last=now;
  if(!s.dead)runUpdate(dt);else s.hitT+=dt;
  runDraw();
  if(s.dead&&s.hitT>.9){
    const score=rScore(s),pieces=Math.floor(s.coins/COWRIES_PER_PIECE),coins=s.coins,dist=Math.floor(s.dist);
    runStop();
    finishGame(GAMES[2],{score,coins,pieces,xp:Math.min(40,5+Math.floor(score/120)),lines:[`You ran ${dist} m and collected ${coins} cowries.`,pieces?`${COWRIES_PER_PIECE} cowries = 1 tower piece. You earned ${pieces}.`:`Collect ${COWRIES_PER_PIECE} cowries in one run to earn a tower piece.`]});
    return;
  }
  RUN.raf=requestAnimationFrame(runFrame);
}

function runnerView(){
  if(overPhase('runner'))return gameOver();
  const g=S.g;
  if(!g||g.game!=='runner')return intro(GAMES[2],'Run down the market road. Switch lanes to dodge crates, jump over low hurdles and slide under high bars. Grab cowries: every 15 in one run adds a piece to your tower. The game speeds up the longer you last.<br><span class="meta">Keys: ← → switch lanes, ↑ or Space jump, ↓ slide. On a phone: swipe, or use the buttons.</span>','Start running');
  return `<div class="runwrap"><canvas id="rcv" width="${RW}" height="${RH}" aria-label="Cowrie Run game. Use arrow keys or swipe."></canvas>
    <div class="pad"><button data-act="rleft" aria-label="Move left">◀</button><button data-act="rjump" aria-label="Jump">▲ Jump</button><button data-act="rslide" aria-label="Slide">▼ Slide</button><button data-act="rright" aria-label="Move right">▶</button></div></div>`;
}
VIEWS.runner=runnerView;
