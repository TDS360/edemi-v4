/* ===== 03-core.js  Shared plumbing: registries, saved progress, helpers, sound, XP, badges, device speech.
   Every other file plugs into the registries below:
     VIEWS[name] = function returning HTML     ACT[name] = click handler   AFTER[name] = runs after the view renders
     STOPS.push(fn)  = cleanup when the user leaves a view (timers, animation loops)
   ===== */
const VIEWS={},ACT={},AFTER={},STOPS=[],REG=[];   // REG: ids of games added with registerGame()

/* ---------- saved progress (this browser only) ---------- */
const KEY='ede-mi-v1';
const DEF=()=>({xp:0,streak:0,maxStreak:0,last:'',done:{},calls:0,chats:0,writes:0,audioDone:0,coins:0,tower:0,
  best:{},plays:{},badges:[],name:'',goal:30,today:{d:'',xp:0},sound:true});
let P=DEF();
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object')P=Object.assign(P,s)}catch(e){}
['done','best','plays'].forEach(k=>{if(!P[k]||typeof P[k]!=='object')P[k]={}});
if(!Array.isArray(P.badges))P.badges=[];
if(!P.today||typeof P.today!=='object')P.today={d:'',xp:0};
function save(){try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}}
const dayKey=d=>d.toLocaleDateString('en-CA');
function liveStreak(){const t=new Date(),y=new Date();y.setDate(t.getDate()-1);return(P.last===dayKey(t)||P.last===dayKey(y))?P.streak:0}
function bump(){const t=new Date(),y=new Date();y.setDate(t.getDate()-1);
  if(P.last===dayKey(t))return;P.streak=(P.last===dayKey(y))?P.streak+1:1;P.last=dayKey(t);P.maxStreak=Math.max(P.maxStreak||0,P.streak)}
const todayXP=()=>P.today.d===dayKey(new Date())?P.today.xp:0;
/* Every XP award goes through here: counts the daily goal, keeps the streak, unlocks badges. */
function addXP(n){n=Math.max(0,Math.round(n)||0);P.xp+=n;const k=dayKey(new Date());if(P.today.d!==k)P.today={d:k,xp:0};P.today.xp+=n;bump();checkBadges();save()}
const level=()=>Math.floor(Math.sqrt(P.xp/40))+1;
const levelFrac=()=>{const L=level(),a=40*(L-1)*(L-1),b=40*L*L;return(P.xp-a)/(b-a)};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const unit=id=>UNITS.find(u=>u.id===id);
const wnorm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const uniqBy=(a,f)=>{const s=new Set();return a.filter(x=>{const k=f(x);if(s.has(k))return false;s.add(k);return true})};
/* items from lessons the learner has finished (or everything, if none yet) */
/* words the games draw from: your finished lessons (or everything at first), minus lessons that describe letters, places or tones */
const GAME_SKIP=['t1','t2','dial','folk','owe'];
const gameOk=()=>ALL.filter(i=>!GAME_SKIP.includes(i.unit)&&!/[“”]/.test(i.en)&&i.en.length<=36);
const learnedItems=()=>{const ok=gameOk(),l=ok.filter(i=>P.done[i.unit]!==undefined);return l.length>=8?l:ok};
/* Words matching filter f, from finished lessons if there are at least `min` of them, otherwise from every lesson. */
function poolFor(f,min){const l=uniqBy(learnedItems().filter(f),i=>i.yo);return l.length>=min?l:uniqBy(gameOk().filter(f),i=>i.yo)}
/* Global UI state. Not saved. */
let S={view:'home',tier:'all',tt:{n:0,score:0,tone:null,pick:null,shown:false},g:null};

/* ---------- sound: WebAudio beeps, no files needed ---------- */
let ac;
function ctx(){ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();return ac}
function beep(f,t0,d,vol){const c=ctx(),o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=f;const v=vol||.28;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.03);g.gain.linearRampToValueAtTime(0,t0+d);
  o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+d+.05)}
function playSeq(s,gap){try{const c=ctx();let t=c.currentTime+.05;for(const k of s){beep(TONES[k].hz,t,(gap||.5)-.08);t+=gap||.5}}catch(e){}}
/* Short sound effects for games. The Profile page has a switch (P.sound). */
const SFX={ok:[[660,0,.09],[880,.09,.12]],bad:[[220,0,.14],[165,.13,.2]],coin:[[988,0,.06],[1319,.06,.09]],
  win:[[523,0,.1],[659,.1,.1],[784,.2,.1],[1047,.3,.22]],jump:[[440,0,.07],[587,.06,.08]],hit:[[150,0,.12],[110,.1,.22]],tick:[[520,0,.04]],flip:[[420,0,.05]]};
function sfx(k){if(!P.sound)return;try{const t=ctx().currentTime+.01;(SFX[k]||[]).forEach(a=>beep(a[0],t+a[1],a[2],.2))}catch(e){}}

/* ---------- toast ---------- */
let toastT;
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},5000)}

/* ---------- device speech (needs a Yorùbá voice installed, which many devices lack) ---------- */
let VOICES=[];
function loadVoices(){try{VOICES=window.speechSynthesis?speechSynthesis.getVoices():[]}catch(e){VOICES=[]}}
loadVoices();
try{speechSynthesis.addEventListener('voiceschanged',()=>{loadVoices();if(S.view==='call')render()})}catch(e){}
const yoVoice=()=>VOICES.find(v=>/^yo([-_]|$)/i.test(v.lang));
const _punct=s=>String(s||'').replace(/[.,!?;:“”"()]/g,'').replace(/\s+/g,' ').trim();
const _exact=s=>_punct(s).normalize('NFC').toLowerCase();
const _loose=s=>' '+wnorm(_punct(s))+' ';
function findClip(t){
  if(typeof AUD==='undefined'||!AUD.clips.length)return null;
  const pool=AUD.clips.filter(c=>c.text&&c.text.trim()),term=_exact(t),loose=_loose(t);
  let c=pool.find(x=>_exact(x.text)===term);                                   // whole sentence, same tone marks
  if(!c)c=pool.filter(x=>(' '+_exact(x.text)+' ').includes(' '+term+' '))      // contains the phrase, same tone marks
          .sort((a,b)=>a.text.length-b.text.length)[0];
  if(!c)c=pool.filter(x=>_loose(x.text).includes(loose))                       // contains it, ignoring tone marks
          .sort((a,b)=>a.text.length-b.text.length)[0];
  return c||null;
}
function speak(t){
  const c=findClip(t);
  if(c){playClip(c.id,.9);if(_exact(c.text)!==_exact(t))toast('Playing a recording that contains it: '+c.text);return true}
  const v=yoVoice();
  if(!v){toast('No recording or Yorùbá voice for this one yet.');return false}
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.voice=v;u.lang=v.lang;u.rate=.8;speechSynthesis.speak(u);return true}catch(e){return false}
}
const SPK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const spkBtn=t=>`<button class="spk" data-act="speak" data-t="${esc(t)}" aria-label="Listen to ${esc(t)}">${SPK}</button>`;
ACT.speak=d=>speak(d.t);

/* ---------- badges ---------- */
const unitsDone=()=>Object.keys(P.done).length;
const coursesDone=()=>COURSES.filter(c=>{const p=courseProg(c);return p.done>=p.total}).length;
const BADGES=[
 {id:'first',t:'First step',d:'Finish a lesson',ok:()=>unitsDone()>=1},
 {id:'ten',t:'Ten lessons',d:'Finish 10 lessons',ok:()=>unitsDone()>=10},
 {id:'perfect',t:'Perfect run',d:'Score 100% on a lesson quiz',ok:()=>Object.values(P.done).some(v=>v>=100)},
 {id:'course',t:'Course complete',d:'Finish every lesson in a course',ok:()=>coursesDone()>=1},
 {id:'s3',t:'3-day streak',d:'Learn 3 days in a row',ok:()=>(P.maxStreak||0)>=3},
 {id:'s7',t:'7-day streak',d:'Learn 7 days in a row',ok:()=>(P.maxStreak||0)>=7},
 {id:'call',t:'Phone friend',d:'Finish a practice call or chat',ok:()=>P.calls>=1||(P.chats||0)>=1},
 {id:'t10',t:'Tower builder',d:'Bank 10 tower pieces',ok:()=>P.tower>=10},
 {id:'t50',t:'Tower master',d:'Bank 50 tower pieces',ok:()=>P.tower>=50},
 {id:'run',t:'Fast feet',d:'Score 1,500 in the runner',ok:()=>(P.best.runner||0)>=1500},
 {id:'voice',t:'Out loud',d:'Finish a voice game',ok:()=>['say','echo','recall'].some(k=>(P.plays[k]||0)>=1)},
 {id:'xp',t:'500 XP',d:'Earn 500 XP',ok:()=>P.xp>=500},
 {id:'ear',t:'Good ear',d:'Finish a listening round',ok:()=>P.audioDone>=1}];
function checkBadges(){
  for(const b of BADGES){let ok=false;try{ok=b.ok()}catch(e){}
    if(ok&&!P.badges.includes(b.id)){P.badges.push(b.id);toast('Badge unlocked: '+b.t);sfx('win')}}
}

/* ---------- icons (24px line icons) ---------- */
const ICON={
 home:'<path d="M4 12l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
 review:'<rect x="4" y="6" width="14" height="12" rx="2"/><path d="M8 3h12v12"/>',
 tones:'<path d="M3 12h3l3-7 4 14 3-7h5"/>',
 alpha:'<path d="M5 19l5-14 5 14"/><path d="M7 14h6"/><path d="M19 8v11"/>',
 call:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
 courses:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/>',
 audio:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
 words:'<path d="M5 6h14M5 12h14M5 18h9"/>',
 culture:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18c-3-3-3-15 0-18z"/>',
 games:'<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4"/><circle cx="15.5" cy="12" r=".6"/><circle cx="17.5" cy="14" r=".6"/>',
 write:'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 20h8M10 17h4"/>'};
const ic=n=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
