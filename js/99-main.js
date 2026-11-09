/* ===== 99-main.js  Navigation, hash routing, render loop, event wiring. Loads last. ===== */

const TABS=[['home','Home'],['courses','Courses'],['chat','Chat'],['call','Call'],['games','Games'],['audio','Audio']];
/* Pages with their own address (#name). Lesson screens are not addressable and count as part of Courses. */
const PAGES=['home','courses','chat','call','games','audio','write','words','review','tones','alpha','culture','profile','leaders','match','tower','runner','scramble','speed','say','echo','recall'];
/* Which tab lights up for pages that are not tabs themselves */
const PARENT={learn:'courses',quiz:'courses',results:'courses',course:'courses',leaders:'games',match:'games',tower:'games',runner:'games',scramble:'games',speed:'games',say:'games',echo:'games',recall:'games'};
/* Pages that show a back link: view -> [where it goes, label] */
const BACK={review:['home','All features'],tones:['home','All features'],alpha:['home','All features'],culture:['home','All features'],words:['home','All features'],write:['home','All features'],profile:['home','All features'],
  course:['courses','All courses'],leaders:['games','Game hub'],match:['games','Game hub'],tower:['games','Game hub'],runner:['games','Game hub'],scramble:['games','Game hub'],speed:['games','Game hub'],say:['games','Game hub'],echo:['games','Game hub'],recall:['games','Game hub']};
REG.forEach(id=>{PAGES.push(id);PARENT[id]='games';BACK[id]=['games','Game hub']});   // games added with registerGame()
const ALIAS={alphabet:'alpha',lessons:'courses',listen:'audio'};
const hashOf=v=>v==='alpha'?'alphabet':v;
const fromHash=()=>{const h=(location.hash||'').replace('#','');const v=ALIAS[h]||h;return PAGES.includes(v)?v:'home'};
const pageOf=v=>PAGES.includes(v)?v:(PARENT[v]||'home');
const tabOf=v=>{let x=v;for(let i=0;i<4&&!TABS.some(t=>t[0]===x);i++)x=PARENT[x]||'home';return x};

let curView=null;
function render(){
  const v=VIEWS[S.view]?S.view:'home';
  if(curView!==v){STOPS.forEach(f=>{try{f()}catch(e){}});curView=v}
  const b=BACK[v];
  $('#main').innerHTML=(b?`<button class="back" data-act="tab" data-v="${b[0]}">← ${b[1]}</button>`:'')+VIEWS[v]();
  if(AFTER[v])AFTER[v]();
  const tab=tabOf(v);
  $('#nav').innerHTML=TABS.map(t=>`<button data-act="tab" data-v="${t[0]}" ${t[0]===tab?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[t[0]]}</svg>${t[1]}</button>`).join('');
}
function go(v){
  S.view=v;
  if(PAGES.includes(v)){try{if(location.hash!=='#'+hashOf(v))location.hash=hashOf(v)}catch(e){}}
  render();window.scrollTo(0,0);
}
window.addEventListener('hashchange',()=>{const v=fromHash();if(v!==pageOf(S.view)){S.view=v;if(GAMES.some(g=>g.id===v))S.g=null;render();window.scrollTo(0,0)}});

/* Opening a page from a tab, card or back link */
ACT.tab=d=>{
  const v=d.v;
  if(v==='review')S.rv=null;
  if(GAMES.some(g=>g.id===v))S.g=null;
  if(v==='courses')S.cid=null;
  go(v);
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled){const h=ACT[b.dataset.act];if(h)h(b.dataset)}});

/* Start */
S.view=fromHash();
render();
loadClips();
