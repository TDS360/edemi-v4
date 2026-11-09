/* ===== 07-words.js  Phrasebook (searchable, filter by course) and Culture page ===== */
const HANDY=[
 ['Ebi ń pa mí','I am hungry',''],['Òùngbẹ ń gbẹ mí','I am thirsty',''],['Oorun ń gbé mi','I am sleepy',''],['Inú mi dùn','I am happy','Literally “my inside is sweet.”'],
 ['Mo gbọ́','I understand / I hear',''],['Mi ò gbọ́','I do not understand',''],['Mi ò mọ̀','I do not know',''],['Jọ̀wọ́, tún un sọ','Please say it again',''],
 ['Ó dára','It is good / okay',''],['Ṣé o gbọ́ Yorùbá?','Do you understand Yorùbá?',''],['Mo fẹ́ràn èdè Yorùbá','I like the Yorùbá language','']
].map(a=>({yo:a[0],en:a[1],note:a[2],unit:'handy'}));

function wordList(){
  const W=S.ws,pool=uniqBy([...ALL,...HANDY],i=>i.yo+'|'+i.en).filter(i=>{
    if(W.cat==='all')return true;if(W.cat==='handy')return i.unit==='handy';
    const u=unit(i.unit);return u&&u.course===+W.cat});
  const q=wnorm(W.q.trim()),out=q?pool.filter(i=>wnorm(i.yo).includes(q)||wnorm(i.en).includes(q)):pool;
  return out.length?out.slice(0,200).map(i=>`<div class="wrow"><div style="min-width:0"><div class="yo wy">${esc(i.yo)}</div><div class="muted">${esc(i.en)}</div></div>${spkBtn(i.yo)}</div>`).join('')+(out.length>200?'<p class="fine">Showing the first 200. Type to narrow it down.</p>':'')
    :'<p class="muted">No match. Try another spelling or an English word.</p>';
}
function words(){
  const W=S.ws||(S.ws={q:'',cat:'all'});
  const total=uniqBy([...ALL,...HANDY],i=>i.yo+'|'+i.en).length;
  return `<div class="sec" style="padding-top:max(14px,env(safe-area-inset-top,0px))"><h2>Phrasebook</h2><span class="meta">${total} entries</span></div>
  <input id="wsq" class="search" type="search" autocomplete="off" value="${esc(W.q)}" placeholder="Search Yorùbá or English" aria-label="Search the phrasebook">
  <label class="meta" for="wscat" style="display:block;margin:12px 0 6px">Filter by course</label>
  <select id="wscat" class="search">${[['all','All courses'],...COURSES.filter(c=>c.units.length).map(c=>[String(c.id),`${c.id}. ${c.title}`]),['handy','Handy phrases']].map(c=>`<option value="${c[0]}"${W.cat===c[0]?' selected':''}>${esc(c[1])}</option>`).join('')}</select>
  <div id="wsl" class="panel" style="padding:4px 16px;margin-top:14px">${wordList()}</div>
  <p class="fine">You can search without tone marks: typing “ebi” finds “ẹbí.” Spelling and tone marks differ a little between sources and regions.</p>`;
}
document.addEventListener('input',e=>{if(e.target.id==='wsq'&&S.ws){S.ws.q=e.target.value;const l=$('#wsl');if(l)l.innerHTML=wordList()}});
document.addEventListener('change',e=>{if(e.target.id==='wscat'&&S.ws){S.ws.cat=e.target.value;const l=$('#wsl');if(l)l.innerHTML=wordList()}});

function culture(){
  return `<div class="sec"><h2>Culture</h2></div>
  <div class="cult">
  <div class="panel"><h3>Where Yorùbá is spoken</h3><p>Over 40 million people speak Yorùbá, mainly in southwestern Nigeria, and also in Benin, Togo and communities around the world.</p></div>
  <div class="panel"><h3>Respect starts with the greeting</h3><p>Greetings matter a lot. Younger people greet elders first, and the respectful “Ẹ” at the start of phrases like <span class="yo">Ẹ káàárọ̀</span> is used with elders and with groups. Traditionally, girls kneel and boys lie down briefly when greeting an elder, though customs differ between families and places.</p></div>
  <div class="panel"><h3>Ọmọlúàbí</h3><p>A person of good character is called an <span class="yo">ọmọlúàbí</span>. Being kind, honest and respectful is seen as the heart of a person, and it shows up in many Yorùbá sayings.</p></div>
  <div class="panel"><h3>Names carry meaning</h3><p>Many Yorùbá names are short sentences. <span class="yo">Ayọ̀</span> means joy, and <span class="yo">Túndé</span> means “has come again.” In Chat and Call, you meet people with both names.</p></div>
  <div class="panel"><h3>Two proverbs</h3>
    <div class="prov">Ìwà lẹ̀wà ọmọ ènìyàn</div><p class="muted" style="margin-top:0">Character is the beauty of a person.</p>
    <div class="prov" style="margin-top:14px">Bí ọmọdé bá mọ ọwọ́ wẹ̀, yóò bá àgbà jẹun</div><p class="muted" style="margin-top:0">If a child knows how to wash their hands, they will eat with elders.</p>
    <p class="fine">Proverbs are written a little differently from place to place. Ask a Yorùbá speaker how they say them.</p></div>
  <div class="panel"><h3>How it is written</h3><p>Yorùbá was once written in Arabic script. A Latin-based alphabet with tone marks and dotted letters was standardized in the early 1900s. Tone marks matter because they change a word’s meaning, which is why the Tone Lab exists.</p></div>
  </div>
  <p class="fine">Sources: <a href="https://preply.com/en/blog/yoruba-alphabet-comprehensive-guide" target="_blank" rel="noopener">Preply: Yoruba alphabet guide</a>, <a href="https://www.yorubalibrary.com/forum/articles/2025/02/introduction_to_yoruba_numbers.html" target="_blank" rel="noopener">Yoruba Library</a>. Cultural customs vary, so treat these as starting points.</p>`;
}
VIEWS.words=words;VIEWS.culture=culture;
