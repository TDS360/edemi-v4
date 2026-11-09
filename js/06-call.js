/* ===== 06-call.js  Chat (typed texting) and Call (spoken phone call).
   Both use one conversation engine: Claude role-plays a Yorùbá speaker, corrects each line, and rates you at the end.
   Needs the "sample" capability. A Call also needs a working microphone and speech recognition; if the device cannot
   do that, the call rings, fails, and sends you back Home. Chat works anywhere Claude is available. ===== */
let SAMPLE;
(async()=>{try{SAMPLE=(await window.claude?.use('sample'))||null}catch(e){SAMPLE=null}if(S.view==='call')render()})();
const SCEN=[
 {id:'meet',lvl:'b',title:'Meet a new friend',name:'Ayọ̀',topics:'Greetings and introductions',who:'a friendly Yorùbá-speaking teenager who has just met the learner',goal:'greetings, names, how are you, thank you, goodbye'},
 {id:'market',lvl:'b',title:'At the market',name:'Ìyá Bọ́lá',topics:'Numbers and everyday things',who:'a friendly market seller with rice, fish, eggs and water for sale',goal:'saying what they want, numbers 1 to 10, please and thank you'},
 {id:'grand',lvl:'b',title:'Call your grandmother',name:'Ìyá àgbà',topics:'Family and respect',who:'the learner’s warm, loving grandmother, who likes polite, respectful greetings',goal:'respectful greetings with Ẹ, family words, asking how she is, food'},
 {id:'day',lvl:'b',title:'Talk about your day',name:'Túndé',topics:'School and days of the week',who:'a classmate calling to chat about school and the week',goal:'days of the week, school, eat, drink, read, play, go'},
 {id:'dinner',lvl:'b',title:'Dinner with family',name:'Bàbá',topics:'Food, family and thanks',who:'the learner’s father, calling everyone to come and eat',goal:'food, eat, drink, family words, thank you'},
 {id:'free',lvl:'b',title:'Free chat',name:'Ṣadé',topics:'Anything simple',who:'a patient, friendly Yorùbá tutor who chats about whatever simple topic the learner brings up',goal:'whatever the learner wants to practise, kept at beginner level'},
 {id:'weekend',lvl:'i',title:'Plans for the weekend',name:'Kẹ́mi',topics:'Future and past, questions',who:'a friend asking what the learner did yesterday and will do this weekend',goal:'past and future with time words, ń and máa, questions and negation'},
 {id:'recipe',lvl:'i',title:'Cooking with Aunty',name:'Ǹtí Ṣadé',topics:'Food, verbs and describing words',who:'an aunt explaining how she cooks a meal',goal:'food words, action verbs, adjectives, comparisons'},
 {id:'office',lvl:'a',title:'Formal call or interview',name:'Ọ̀gbẹ́ni Adéyẹmí',topics:'Formal speech',who:'a polite office manager taking a call, who expects formal, respectful Yorùbá',goal:'formal greetings with Ẹ, titles, polite requests, giving reasons with nítorí pé'},
 {id:'debate',lvl:'a',title:'Share your opinion',name:'Fúnmi',topics:'Opinions and reasons',who:'a friend who loves a friendly debate about school, phones or music',goal:'giving opinions, agreeing and disagreeing, because, but and if sentences'}];
const LVL={b:'simple beginner',i:'intermediate (short connected sentences, everyday topics, tense markers like ń, ti and máa)',a:'more advanced (longer sentences, conjunctions, opinions and polite formal speech)'};
function rules(sc,mode){return `You are role-playing ${mode==='chat'?'a text chat':'a phone call'} so a teenage learner can practise Yorùbá. You are ${sc.name}, ${sc.who}. Practice goal: ${sc.goal}.
Rules:
- Speak ${LVL[sc.lvl||'b']} Yorùbá, one or two short sentences per turn, and keep the ${mode==='chat'?'chat':'call'} going with one easy question or prompt. Write your own Yorùbá with correct tone marks and underdots.
${mode==='call'?'- The learner is SPEAKING, and their words arrive as speech-recognition text, which is often wrong for Yorùbá. Do not mark odd spellings as mistakes; if a line looks garbled, set fb.status to "none" and kindly ask them to say it again.\n':''}- The learner may write Yorùbá, English, or a mix. Many learners type without tone marks or underdots. Never treat missing diacritics as a mistake. You may mention it once as a small tip.
- Check each learner message for real mistakes: a wrong word, word order, a wrong pronoun, or a tone mark that changes the meaning. Be kind and specific. If you are not sure a correction is right, say so in "why".
Reply every turn with ONLY one JSON object and no other text, in this shape:
{"yo":"your line in Yorùbá","en":"English translation of your line","hint":"2 to 6 English words nudging what the learner could say next","fb":{"status":"good or fix or english or none","said":"the learner's line exactly as written","better":"the best Yorùbá version, with tone marks","why":"one or two short, teen-friendly sentences"}}
fb.status values: "good" means their Yorùbá was correct (better is their line with tone marks added, why is a short compliment); "fix" means there is a mistake to correct; "english" means they wrote English, so better is the Yorùbá they could have said; "none" means there is no learner message yet.`}
function ratePrompt(c){
  const lines=c.msgs.map(m=>m.who==='them'?`${c.sc.name}: ${m.yo} (${m.en})`:`Learner: ${m.text}   [check: ${m.fb?m.fb.status+' | better: '+m.fb.better+' | '+m.fb.why:'none'}]`).join('\n');
  return `A teenage beginner just finished a Yorùbá practice ${c.mode==='chat'?'text chat':'phone call'} (${c.sc.title}). Here is the transcript with the check already made on each learner line:\n${lines}\n\nRate the learner's Yorùbá for a beginner. Be encouraging but honest. Do not penalise missing tone marks or underdots; mention them only as a tip. Reply with ONLY one JSON object and no other text, in this shape:\n{"stars":4,"score":78,"summary":"two short sentences","did_well":["up to 3 short items"],"work_on":[{"point":"short label","tip":"one sentence on how to fix it"}],"practice":[{"yo":"word or phrase","en":"meaning"}]}\nstars is a whole number 1 to 5, score is 0 to 100, work_on has up to 3 items, practice has up to 5 items.`;
}
const them=r=>({who:'them',yo:String(r.yo||''),en:String(r.en||'')});
function normFb(f){f=f||{};const st=['good','fix','english'].includes(f.status)?f.status:'none';
  return{status:st,said:String(f.said||''),better:String(f.better||''),why:String(f.why||'')}}
function cleanRating(r){r=r||{};const n=Math.max(1,Math.min(5,Math.round(Number(r.stars))||3));
  return{stars:n,score:Math.max(0,Math.min(100,Math.round(Number(r.score))||n*20)),summary:String(r.summary||''),
    did_well:(Array.isArray(r.did_well)?r.did_well:[]).slice(0,3).map(String),
    work_on:(Array.isArray(r.work_on)?r.work_on:[]).slice(0,3).map(w=>({point:String(w&&w.point||''),tip:String(w&&w.tip||'')})),
    practice:(Array.isArray(r.practice)?r.practice:[]).slice(0,5).map(w=>({yo:String(w&&w.yo||''),en:String(w&&w.en||'')}))}}
function sampleErr(e){const m={not_granted:'Claude is not allowed for this page. Allow it when asked, then try again.',sampling_disabled:'Claude is not available on this account.',rate_limited:'Too many requests at once. Wait a moment, then try again.',session_expired:'Please sign in again, then retry.',refused:'That message could not be answered. Try saying it a different way.',invalid_json:'The reply came back garbled. Send it again.'};return m[e&&e.code]||'Something went wrong reaching Claude. Try again.'}
const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
let ringI,tmrI;
function ringOnce(){try{const c=ctx();const t=c.currentTime+.02;[0,.45].forEach(o=>{beep(440,t+o,.3);beep(480,t+o,.3)})}catch(e){}}
function stopRing(){clearInterval(ringI);ringI=null}
function startTimer(){clearInterval(tmrI);tmrI=setInterval(()=>{const el=$('#timer');if(el&&S.call&&S.call.start)el.textContent=fmt(Date.now()-S.call.start)},1000)}
function autoSay(t){const c=S.call;if(c&&c.auto&&yoVoice())speak(t)}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* Can this page really make a spoken call? Needs speech recognition and a microphone it is allowed to open. */
async function micCheck(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return{ok:false,why:'this browser cannot turn speech into text'};
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return{ok:false,why:'this page cannot reach a microphone'};
  try{
    const st=await Promise.race([navigator.mediaDevices.getUserMedia({audio:true}),sleep(15000).then(()=>{throw new Error('timeout')})]);
    st.getTracks().forEach(t=>t.stop());return{ok:true};
  }catch(e){return{ok:false,why:'the microphone is blocked or missing here'}}
}
function bounceHome(why){stopRing();S.call=null;toast(`The call could not connect: ${why}. Taking you home. Try Chat to practise by typing.`);go('home')}

/* mode: 'chat' (typed) or 'call' (spoken) */
async function startConvo(id,mode){
  if(!SAMPLE){if(mode==='call'){bounceHome('Claude is not available in this view')}else toast('Chat needs Claude, which is not available in this view.');return}
  const sc=SCEN.find(s=>s.id===id),t0=Date.now();
  const opener=mode==='chat'?'The learner opened the chat. Start it: greet them in character.':'The phone rang and the learner answered. Start the call: greet them in character.';
  const c=S.call={mode,phase:'ring',sc,msgs:[],busy:true,draft:'',hint:'',showHint:false,showEn:true,auto:true,start:0,err:'',typed:false,listening:false,lang:0,
    turns:[{role:'user',content:rules(sc,mode)+'\n\n'+opener+' Set fb.status to "none" and the other fb fields to empty strings.'}]};
  S.callErr='';render();
  if(mode==='call'){
    ringOnce();ringI=setInterval(ringOnce,2200);
    const m=await micCheck();
    if(S.call!==c)return;
    await sleep(Math.max(0,2300-(Date.now()-t0)));            // let it ring at least once
    if(S.call!==c)return;
    if(!m.ok){bounceHome(m.why);return}
  }
  try{
    const r=await SAMPLE.json(c.turns,{cache:false});
    if(S.call!==c||c.phase!=='ring')return;
    stopRing();c.turns.push({role:'assistant',content:JSON.stringify(r)});
    c.msgs.push(them(r));c.hint=String(r.hint||'');c.phase='live';c.busy=false;c.start=Date.now();c.scroll=true;c.focus=mode==='chat';
    startTimer();render();autoSay(r.yo);
  }catch(e){
    if(S.call!==c)return;
    stopRing();S.call=null;S.callErr=sampleErr(e);render();
  }
}

/* Spoken turn: listen once, then send what was heard as the learner's line. */
const CLANGS=['yo-NG','yo'];
function talk(){
  const c=S.call;if(!c||c.mode!=='call'||c.busy||c.listening||c.phase!=='live')return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){c.err='Speech recognition is not available.';render();return}
  try{speechSynthesis.cancel()}catch(e){}
  c.listening=true;c.err='';c.heard='';render();
  let done=false;const fin=r=>{if(done)return;done=true;c.listening=false;
    if(S.call!==c)return;
    if(r.text){c.draft=r.text;render();sendMsg();return}
    if(r.err==='language-not-supported'&&c.lang<CLANGS.length-1){c.lang++;render();talk();return}
    c.err=r.err==='no-speech'||!r.err?'I did not hear anything. Tap the microphone and try again.':r.err==='not-allowed'||r.err==='service-not-allowed'?'The microphone is blocked. Use “Type instead”, or end the call.':'Speech recognition had a problem ('+r.err+'). Try again, or use “Type instead”.';
    render()};
  try{
    const rec=new SR();rec.lang=CLANGS[c.lang]||'yo-NG';rec.interimResults=false;rec.maxAlternatives=1;rec.continuous=false;
    rec.onresult=e=>fin({text:(e.results[0][0]&&e.results[0][0].transcript||'').trim()});
    rec.onerror=e=>fin({err:e.error});rec.onend=()=>fin({});
    rec.start();setTimeout(()=>{if(!done)try{rec.stop()}catch(e){}},9000);
  }catch(e){fin({err:'start-failed'})}
}
async function sendMsg(){
  const c=S.call;if(!c||c.busy||c.phase!=='live')return;
  const text=(c.draft||'').trim();if(!text)return;
  c.draft='';c.showHint=false;c.busy=true;c.err='';
  const me={who:'me',text};c.msgs.push(me);c.turns.push({role:'user',content:'Learner: '+text});
  c.scroll=true;c.focus=true;render();
  try{
    const r=await SAMPLE.json(c.turns,{cache:false});
    if(S.call!==c||c.phase!=='live')return;
    c.turns.push({role:'assistant',content:JSON.stringify(r)});
    me.fb=normFb(r.fb);c.msgs.push(them(r));c.hint=String(r.hint||'');c.busy=false;c.scroll=true;c.focus=true;
    render();autoSay(r.yo);
  }catch(e){
    if(S.call!==c||c.phase!=='live')return;
    c.msgs.pop();c.turns.pop();c.draft=text;c.err=sampleErr(e);c.busy=false;c.focus=true;render();
  }
}
function endCall(){
  const c=S.call;if(!c||c.phase!=='live')return;
  clearInterval(tmrI);try{speechSynthesis.cancel()}catch(e){}
  c.dur=Date.now()-c.start;c.phase='rate';c.rating=null;c.rerr='';
  if(!c.msgs.some(m=>m.who==='me')){c.empty=true;render();return}
  render();rateCall(c);
}
async function rateCall(c){
  try{
    const r=await SAMPLE.json(ratePrompt(c),{cache:false});
    if(S.call!==c)return;
    c.rating=cleanRating(r);
    if(!c.awarded){c.awarded=true;if(c.mode==='chat')P.chats=(P.chats||0)+1;else P.calls=(P.calls||0)+1;addXP(20)}
  }catch(e){if(S.call!==c)return;c.rerr=sampleErr(e)}
  render();
}

const stars=n=>`<div class="stars" role="img" aria-label="${n} out of 5 stars">${[1,2,3,4,5].map(i=>`<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,2.5 15,9 22,9.8 16.8,14.5 18.3,21.5 12,18 5.7,21.5 7.2,14.5 2,9.8 9,9" fill="${i<=n?'var(--gold)':'none'}" stroke="${i<=n?'var(--gold)':'var(--line)'}" stroke-width="1.6" stroke-linejoin="round"/></svg>`).join('')}</div>`;
function fbHtml(fb){
  if(!fb||fb.status==='none')return '';
  if(fb.status==='good')return `<div class="fbw"><div class="fb ok"><b>Looks right</b><span>${fb.better&&fb.better!==fb.said?`With marks: <span class="yo">${esc(fb.better)}</span>. `:''}${esc(fb.why)}</span></div></div>`;
  if(fb.status==='english')return `<div class="fbw"><div class="fb tip"><b>In Yorùbá</b><span><span class="yo">${esc(fb.better)}</span> ${esc(fb.why)}</span></div></div>`;
  return `<div class="fbw"><div class="fb no"><b>Try this instead</b><span><span class="said">${esc(fb.said)}</span> → <span class="yo">${esc(fb.better)}</span><br>${esc(fb.why)}</span></div></div>`;
}
const init=sc=>esc([...sc.name.replace(/^Ìyá /,'')][0]||'?');

function convoView(mode){
  const c=S.call&&S.call.mode===mode?S.call:null,chat=mode==='chat',w=chat?'chat':'call';
  if(!c){
    return `<div class="sec" style="padding-top:max(14px,env(safe-area-inset-top,0px))"><h2>${chat?'Chat':'Phone call'}</h2></div>
    <div class="panel"><p style="margin:0">${chat?'Text with a Yorùbá speaker. Type in Yorùbá, English, or a mix. Every message you send gets a quick check with the fix, and when you finish you get a rating and what to work on.'
      :'Ring a Yorùbá speaker and talk out loud. Your voice is turned into text by your browser, checked, and answered. When you hang up, you get a rating and what to work on.'}</p>
      <p class="muted" style="margin:10px 0 0;font-size:.9rem">${chat?'':'Calls need a microphone and speech recognition. If this device or page cannot use them, the call fails and takes you back Home. '}The partner and the feedback come from Claude, which can make mistakes, especially with tone marks. Check anything important with a Yorùbá speaker.</p>
      <div class="row" style="justify-content:flex-start"><button class="btn alt" data-act="tab" data-v="${chat?'call':'chat'}">${chat?'Try a phone call instead':'Prefer typing? Open Chat'}</button></div></div>
    ${S.callErr?`<div class="fb no" style="margin-top:14px">${esc(S.callErr)}</div>`:''}
    ${SAMPLE===null?`<div class="fb no" style="margin-top:14px">This needs Claude, which is not available where you opened this page.</div>`:''}
    <div class="units" style="margin-top:14px">${SCEN.map(s=>`<button class="unit" data-act="startconvo" data-m="${mode}" data-id="${s.id}">
      <span class="n">${ic(chat?'chat':'call')}</span>
      <h3>${esc(s.title)}</h3><span class="yoname">${esc(s.name)} · ${{b:'Beginner',i:'Intermediate',a:'Advanced'}[s.lvl]}</span><span class="meta">${esc(s.topics)}</span></button>`).join('')}</div>`;
  }
  if(c.phase==='ring'){
    return `<div class="callscr"><div class="av${chat?'':' ring'}">${init(c.sc)}</div><h2>${esc(c.sc.name)}</h2><div class="muted">${chat?'Opening chat…':'Calling…'}</div>
      <div class="row"><button class="end" data-act="cancelcall">Cancel</button></div></div>`;
  }
  if(c.phase==='rate'){
    const W=w[0].toUpperCase()+w.slice(1);
    if(c.empty)return `<div class="panel cen"><h2>${W} ended</h2><p class="muted">You finished before saying anything, so there is nothing to rate yet.</p>
      <div class="row"><button class="btn" data-act="callagain">Back</button></div></div>`;
    if(c.rerr)return `<div class="panel cen"><h2>Could not score the ${w}</h2><p class="muted">${esc(c.rerr)}</p><div class="row"><button class="btn" data-act="rerate">Try again</button><button class="btn alt" data-act="callagain">Back</button></div></div>`;
    if(!c.rating)return `<div class="panel cen"><h2>${W} ended</h2><p class="muted" style="margin:6px 0 0">Scoring… this can take up to a minute.</p></div>`;
    const r=c.rating,fixes=c.msgs.filter(m=>m.who==='me'&&m.fb&&(m.fb.status==='fix'||m.fb.status==='english'));
    return `<div class="panel cen"><div class="eyebrow muted">${W} with ${esc(c.sc.name)} · ${fmt(c.dur)}</div>
      ${stars(r.stars)}<div class="big" style="font-family:var(--f-ui);font-weight:800">${r.score}<span class="muted" style="font-size:.4em;font-weight:600"> / 100</span></div>
      <p style="margin:10px auto 0;max-width:46ch">${esc(r.summary)}</p>
      ${r.did_well.length?`<div class="rsec"><div class="q-label">What went well</div><ul class="l">${r.did_well.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
      ${r.work_on.length?`<div class="rsec"><div class="q-label">What to work on</div><ul class="l">${r.work_on.map(w=>`<li><b>${esc(w.point)}.</b> ${esc(w.tip)}</li>`).join('')}</ul></div>`:''}
      ${fixes.length?`<div class="rsec"><div class="q-label">Fixes from this ${w}</div><ul class="l">${fixes.map(m=>`<li>${esc(m.text)} → <span class="yo">${esc(m.fb.better)}</span></li>`).join('')}</ul></div>`:''}
      ${r.practice.length?`<div class="rsec"><div class="q-label">Words to practise</div><div class="chips">${r.practice.map(p=>`<span class="chip"><span class="yo">${esc(p.yo)}</span> · ${esc(p.en)}</span>`).join('')}</div></div>`:''}
      <p class="fine" style="text-align:center">+20 XP. Ratings come from Claude and are a guide, not a grade.</p>
      <div class="row"><button class="btn alt" data-act="callagain">Another ${w}</button><button class="btn" data-act="tab" data-v="courses">Courses</button></div></div>`;
  }
  const last=c.msgs[c.msgs.length-1],typing=chat||c.typed;
  return `<div class="callhead"><div class="av sm">${init(c.sc)}</div>
      <div class="who"><h2>${esc(c.sc.name)}</h2><div class="meta">${c.busy?'Typing…':chat?'Online':'On call'} · <span id="timer">${fmt(Date.now()-c.start)}</span></div></div>
      <button class="end" data-act="endcall" aria-label="End ${w}">${chat?'Finish':'End call'}</button></div>
    <div class="thread" aria-live="polite">${c.msgs.map(m=>m.who==='them'
      ?`<div class="msg them"><div class="bub"><div class="cyo yo">${esc(m.yo)}</div>${c.showEn?`<div class="cen2">${esc(m.en)}</div>`:''}</div>${spkBtn(m.yo)}</div>`
      :`<div class="msg me"><div class="bub">${esc(m.text)}</div></div>${m.fb?fbHtml(m.fb):(c===S.call&&c.busy&&m===last?'<div class="fbw meta">Checking…</div>':'')}`).join('')}</div>
    <div class="dock">
      ${c.err?`<div class="fb no" style="margin:0">${esc(c.err)}</div>`:''}
      ${c.showHint&&c.hint?`<div class="note">Try saying: ${esc(c.hint)}</div>`:''}
      ${typing?`<div class="keys" aria-label="Special letters">${['ẹ','ọ','ṣ','à','á','è','é','ì','í','ò','ó','ù','ú'].map(k=>`<button class="key" data-act="ins" data-c="${k}">${k}</button>`).join('')}</div>
      <div class="say"><input id="say" type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="send" placeholder="Reply in Yorùbá or English" aria-label="Your reply"><button class="btn" data-act="send" ${c.busy?'disabled':''}>Send</button></div>`
      :`<div style="text-align:center">${c.listening?`<div class="listening" role="status"><span></span><span></span><span></span></div><p class="meta" style="margin:6px 0 0">Listening… speak now</p>`:`<button class="btn mic" data-act="talk" ${c.busy?'disabled':''}>🎤 ${c.busy?'Wait for the reply…':'Tap to talk'}</button>`}</div>`}
      <div class="tools"><button class="chip" data-act="hint">Hint</button><button class="chip" data-act="toggleen">English: ${c.showEn?'on':'off'}</button>${chat?'':`<button class="chip${c.typed?' on':''}" data-act="toggletyped">Type instead</button>`}${yoVoice()?`<button class="chip" data-act="toggleaud">Read aloud: ${c.auto?'on':'off'}</button>`:''}</div>
    </div>`;
}

/* ---------- registration ---------- */
VIEWS.call=()=>convoView('call');VIEWS.chat=()=>convoView('chat');
ACT.startconvo=d=>startConvo(d.id,d.m);
ACT.talk=()=>talk();
ACT.toggletyped=()=>{if(S.call){S.call.typed=!S.call.typed;S.call.focus=true;render()}};
ACT.cancelcall=()=>{stopRing();S.call=null;render()};
ACT.send=()=>sendMsg();
ACT.endcall=()=>endCall();
ACT.rerate=()=>{if(S.call){S.call.rerr='';S.call.rating=null;render();rateCall(S.call)}};
ACT.callagain=()=>{S.call=null;S.callErr='';render();window.scrollTo(0,0)};
ACT.hint=()=>{if(S.call){S.call.showHint=!S.call.showHint;S.call.focus=true;render()}};
ACT.toggleen=()=>{if(S.call){S.call.showEn=!S.call.showEn;S.call.focus=true;render()}};
ACT.toggleaud=()=>{if(S.call){S.call.auto=!S.call.auto;S.call.focus=true;render()}};
ACT.ins=d=>{const el=$('#say');if(!el)return;const s=el.selectionStart==null?el.value.length:el.selectionStart,e2=el.selectionEnd==null?s:el.selectionEnd;
  el.setRangeText(d.c,s,e2,'end');if(S.call)S.call.draft=el.value;el.focus()};
AFTER.chat=AFTER.call=()=>{
  if(S.call&&S.call.phase==='live'){
    const el=$('#say');
    if(el){el.value=S.call.draft||'';if(S.call.focus){el.focus({preventScroll:true});S.call.focus=false}}
    if(S.call.scroll){S.call.scroll=false;requestAnimationFrame(()=>window.scrollTo({top:document.body.scrollHeight}))}
  }
};
document.addEventListener('input',e=>{if(e.target.id==='say'&&S.call)S.call.draft=e.target.value});
document.addEventListener('keydown',e=>{if(e.target.id==='say'&&e.key==='Enter'&&!e.isComposing){e.preventDefault();sendMsg()}});
