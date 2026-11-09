/* ===== game-template.js  A complete, working example of adding a game to Èdè Mi. =====
   HOW TO ADD A GAME
   1. Copy this file to js/15-your-game.js and rename things (search for "quick5").
   2. In index.html add a script tag for js/15-your-game.js, just above the line for 99-main.js
      (the comment in index.html shows exactly where).
   3. Rebuild the single file (optional):  python3 build.py
   That is all. The game appears in the Game Hub, gets a leaderboard, and can earn XP and tower pieces.

   WHAT YOU CAN USE (all global):
     poolFor(filterFn,min)   words from lessons the learner finished (falls back to all words)
     mcQ(item,'yo2en'|'en2yo',pool)  a multiple-choice question {prompt,answer,options,item}
     shuf(array)  esc(text)  toast(msg)  sfx('ok'|'bad'|'coin'|'win'|'tick')  speak(yorubaText)
     intro(gameObject,text,buttonLabel)  the standard start card
     finishGame(gameObject,{score,xp,pieces,coins,lines})   saves the best score, gives rewards, shows the result screen
     S.g   this game's state (null when idle). Keep timers in variables and clear them with STOPS.push(fn).
   Buttons use data-act="name"; define ACT.name=function(dataset){...}. Call render() after changing S.g. */

(function(){
  const ID='quick5';
  let game;                                            // filled in by registerGame below

  function start(){
    const pool=poolFor(i=>!unit(i.unit).build&&i.yo.length<=18&&i.en.length<=30,12);
    const qs=shuf(pool).slice(0,5).map(it=>mcQ(it,Math.random()<.5?'yo2en':'en2yo',pool));
    S.g={phase:'play',game:ID,qs,qi:0,score:0,right:0,pick:null};
    render();
  }
  ACT.q5pick=d=>{
    const g=S.g;if(!g||g.pick!==null)return;
    g.pick=d.v;const ok=d.v===g.qs[g.qi].answer;
    if(ok){g.right++;g.score+=100}
    sfx(ok?'ok':'bad');render();
  };
  ACT.q5next=()=>{
    const g=S.g;g.qi++;g.pick=null;
    if(g.qi>=g.qs.length)finishGame(game,{score:g.score,xp:5+g.right*3,pieces:g.right>=4?1:0,lines:[`${g.right} of ${g.qs.length} right.`]});
    else render();
  };

  function view(){
    if(overPhase(ID))return gameOver();                // the standard result screen
    const g=S.g;
    if(!g||g.game!==ID)return intro(game,'Five quick questions. 100 points each. Get 4 or more for a tower piece.','Start');
    const q=g.qs[g.qi],yo=q.dir==='yo2en';
    return `<div class="gbar"><span>Question <b>${g.qi+1}</b>/${g.qs.length}</span><span>Score <b>${g.score}</b></span></div>
    <div class="panel"><div class="prompt${yo?' yo':''}">${esc(q.prompt)}</div>
    <div class="opts">${q.options.map(o=>{let cl='opt'+(yo?'':' yo');if(g.pick!==null){if(o===q.answer)cl+=' right';else if(o===g.pick)cl+=' wrong'}
      return `<button class="${cl}" data-act="q5pick" data-v="${esc(o)}" ${g.pick!==null?'disabled':''}>${esc(o)}</button>`}).join('')}</div>
    ${g.pick!==null?`<div class="row"><button class="btn" data-act="q5next">${g.qi+1>=g.qs.length?'Finish':'Next'}</button></div>`:''}</div>`;
  }

  registerGame({id:ID,title:'Quick Five',yo:'Marun yára',desc:'Template example: five fast questions.',range:[200,500],view,start,
    icon:'<circle cx="32" cy="32" r="22" fill="var(--tint)" stroke="currentColor" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28" font-weight="800" fill="currentColor">5</text>'});
  game=GAMES[GAMES.length-1];
})();
