/* ===== 05-tones.js  Tone parser, Tone Lab page and Alphabet page ===== */

/* Reads the tone of each syllable from the marks: grave = Low (L), acute = High (H), no mark = Mid (M).
   Counts vowels and marked syllabic nasals (ń, ǹ). A repeated unmarked vowel (long vowel) copies the tone before it. */
function toneOf(word){
  const ch=[...String(word).normalize('NFD')],out=[],V='aeiou';let prevV=null;
  for(let i=0;i<ch.length;i++){
    const b=ch[i].toLowerCase();
    if(!V.includes(b)&&b!=='n'&&b!=='m'){prevV=null;continue}
    let j=i+1,mk='';while(j<ch.length&&/[̀-ͯ]/.test(ch[j])){mk+=ch[j];j++}
    const marked=/[̀́]/.test(mk),tone=mk.includes('̀')?'L':mk.includes('́')?'H':'M';
    if(b==='n'||b==='m'){
      const nx=(ch[j]||'').toLowerCase();
      if(marked&&!(nx&&V.includes(nx)))out.push(tone);
      prevV=null;i=j-1;continue;
    }
    if(prevV===b&&!marked&&out.length)out.push(out[out.length-1]);else out.push(tone);
    prevV=b;i=j-1;
  }
  return out.join('');
}
const toneNames=p=>[...p].map(k=>TONES[k].nm).join(', ');

function contour(t){
  const n=t.length,w=40*n+20;
  const pts=[...t].map((k,i)=>[30+i*40,TONES[k].y]);
  return `<svg viewBox="0 0 ${w} 90" role="img" aria-label="Pitch pattern ${toneNames(t)}">
    ${[18,45,72].map(y=>`<line x1="6" x2="${w-6}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`).join('')}
    <polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="var(--indigo)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="var(--gold)" stroke="var(--indigo)" stroke-width="2"/>`).join('')}</svg>`;
}

function tones(){
  const T=S.tt;
  return `<div class="sec"><h2>Tone Lab</h2></div>
  <div class="panel"><p style="margin:0">Yorùbá has three tones. They change the meaning of a word, so “ọkọ” can mean husband, vehicle or hoe depending on pitch. Tap each to hear it. Teachers often link them to the notes <b>do, re, mi</b>.</p>
    <div class="tone3" style="margin-top:14px">${['L','M','H'].map(k=>`<button class="tbtn" data-act="tone" data-k="${k}"><span class="m">${TONES[k].mark}</span><span class="nm">${TONES[k].nm}</span><span class="s">${TONES[k].solf} · ${k==='M'?'no mark':k==='L'?'grave ` mark':'acute ´ mark'}</span></button>`).join('')}</div></div>
  <div class="sec"><h2>Same letters, new meaning</h2></div>
  <div class="pairs">${PAIRS.map(p=>`<button class="pair" data-act="word" data-t="${p.t}" aria-label="Play ${esc(p.w)}">
    <span class="w">${esc(p.w)}</span>${contour(p.t)}<span class="muted">${esc(p.en)}</span><span class="eyebrow" style="color:var(--indigo)">Play pitch</span></button>`).join('')}</div>
  <div class="sec"><h2>Ear test</h2><span class="meta">${T.score} of ${T.n} right</span></div>
  <div class="panel"><p style="margin:0 0 12px">${T.tone?'Which tone was it?':'Press play, then pick the tone you heard.'}</p>
    <div class="row" style="margin:0 0 14px;justify-content:flex-start"><button class="btn alt" data-act="ear">${T.tone?'Play again':'Play a tone'}</button></div>
    <div class="tone3">${['L','M','H'].map(k=>{let st='';if(T.shown){if(k===T.tone)st='border-color:var(--good);background:var(--good-bg)';else if(k===T.pick)st='border-color:var(--bad);background:var(--bad-bg)'}
      return `<button class="tbtn" style="${st}" data-act="guess" data-k="${k}" ${!T.tone||T.shown?'disabled':''}><span class="m">${TONES[k].mark}</span><span class="nm">${TONES[k].nm}</span></button>`}).join('')}</div>
    ${T.shown?`<div class="row"><button class="btn" data-act="earnext">Next tone</button></div>`:''}</div>
  <div class="panel cult"><h3>Want a game?</h3><p>Tone Tower plays a pitch pattern and you pick the word that matches. Every right answer adds a piece to your tower.</p><div class="row" style="justify-content:flex-start"><button class="btn" data-act="tab" data-v="tower">Play Tone Tower</button></div></div>
  <p class="fine">These are synthesized beeps that show pitch height, not a speaker’s voice. Real speech also glides between tones.</p>`;
}

function alpha(){
  const sel=ALPHA.find(a=>a[0]===S.al)||ALPHA[0];
  return `<div class="sec"><h2>Alphabet</h2><span class="meta">25 letters</span></div>
  <div class="panel"><div class="detail"><div class="L">${esc(sel[0])}</div><div>${esc(sel[1])}</div>
    ${sel[2]?`<div class="tools"><span class="chip"><span class="yo">${esc(sel[2])}</span> · ${esc(sel[3])}</span>${spkBtn(sel[2])}</div>`:''}</div></div>
  <div class="letters" style="margin-top:14px">${ALPHA.map(a=>`<button class="let${SPECIAL.includes(a[0])?' sp':''}" data-act="letter" data-l="${esc(a[0])}" aria-pressed="${a[0]===sel[0]}">${esc(a[0])}</button>`).join('')}</div>
  <p class="fine">Gold letters are the ones English does not have: ẹ, ọ, ṣ, gb and p (said as kp). Mixing up ẹ and e, or ọ and o, changes the word.</p>`;
}

ACT.tone=d=>playSeq([d.k]);
ACT.word=d=>playSeq([...d.t]);
ACT.ear=()=>{const T=S.tt;if(!T.tone||T.shown){T.tone='LMH'[Math.floor(Math.random()*3)];T.pick=null;T.shown=false}playSeq([T.tone]);render()};
ACT.guess=d=>{const T=S.tt;T.pick=d.k;T.shown=true;T.n++;if(d.k===T.tone)T.score++;render()};
ACT.earnext=()=>{const T=S.tt;T.tone='LMH'[Math.floor(Math.random()*3)];T.pick=null;T.shown=false;playSeq([T.tone]);render()};
ACT.letter=d=>{S.al=d.l;render()};
VIEWS.tones=tones;VIEWS.alpha=alpha;
