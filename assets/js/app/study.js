/* לימוד — כרטיסיות היפוך + תצוגת סיכום */
/* ================= לימוד ================= */
let studySub='LAW', studyMode='cards';
let deck=null;

function subjColor(id){return (SUBJ.find(s=>s.id===id)||{}).c||'#B4326D';}

function renderStudy(){
  const c=subjColor(studySub);
  document.getElementById('study-nav').innerHTML=
    `<div class="subj-pick">`+
    SUBJ.map(s=>`<button class="${s.id===studySub?'on':''}" style="--sc:${s.c}" onclick="pickSubj('${s.id}')">${s.name.split(',')[0].replace(' ו','<br>ו')}</button>`).join('')+
    `</div>
     <div class="btn-row" style="margin:0 0 14px">
       <button class="btn ${studyMode==='cards'?'':'alt'}" style="padding:7px 15px;font-size:13px;${studyMode==='cards'?'background:'+c:''}" onclick="studyMode='cards';renderStudy()">כרטיסיות</button>
       <button class="btn ${studyMode==='list'?'':'alt'}" style="padding:7px 15px;font-size:13px;${studyMode==='list'?'background:'+c:''}" onclick="studyMode='list';renderStudy()">סיכום</button>
     </div>`;
  if(studyMode==='list') renderSummary();
  else buildDeck();
}

function pickSubj(id){studySub=id;deck=null;renderStudy();}

function renderSummary(){
  document.getElementById('study-body').innerHTML=
    STUDY[studySub].map(sec=>`<div class="card"><div class="topic"><h3 style="color:${subjColor(studySub)}">${sec.t}</h3><ul>${sec.i.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`).join('')+
    `<div class="btn-row"><button class="btn" style="background:${subjColor(studySub)}" onclick="startDrill('${studySub}')">תרגול בנושא זה</button></div>`;
}

/* ---- חפיסת כרטיסיות ---- */
function buildDeck(){
  const pool=CARDS.filter(c=>c.s===studySub);
  deck={q:pool.slice(),i:0,total:pool.length,done:0,again:[],flip:false,round:1};
  drawCard();
}

function drawCard(){
  const el=document.getElementById('study-body');
  const c=subjColor(studySub);
  if(!deck.q.length){
    if(deck.again.length){
      deck.q=shuffle(deck.again);deck.again=[];deck.round++;
      el.innerHTML=`<div class="card" style="text-align:center;padding:30px 20px">
        <h3 style="color:${c};margin-bottom:8px">סבב ${deck.round}</h3>
        <p class="tiny" style="margin:0 0 16px">${deck.q.length} כרטיסיות שסימנת "עוד פעם" חוזרות עכשיו.</p>
        <button class="btn" style="background:${c}" onclick="drawCard()">המשך</button></div>`;
      return;
    }
    el.innerHTML=`<div class="card" style="text-align:center;padding:34px 20px">
      <div class="eyebrow">החפיסה הושלמה</div>
      <h3 style="color:${c};margin:6px 0 10px">${deck.total} כרטיסיות, ${deck.round} ${deck.round===1?'סבב':'סבבים'}</h3>
      <p class="tiny" style="margin:0 0 18px">עברת על כל הנושא. עכשיו זה הזמן לבדוק אם זה באמת נכנס.</p>
      <div class="btn-row" style="justify-content:center">
        <button class="btn" style="background:${c}" onclick="startDrill('${studySub}')">תרגול בנושא</button>
        <button class="btn alt" onclick="buildDeck()">שוב מההתחלה</button>
      </div></div>`;
    return;
  }
  const card=deck.q[0];
  const pct=deck.total?Math.round(deck.done/deck.total*100):0;
  el.innerHTML=`
    <div class="deckbar" style="--sc:${c}">
      <span>${card.t}</span>
      <span class="prog"><i style="width:${pct}%"></i></span>
      <span class="mono">${deck.done}/${deck.total}</span>
    </div>
    <div class="deck">
      <button class="fcard" id="fc" style="--sc:${c}" onclick="flipCard()" aria-label="הקש להיפוך הכרטיסייה">
        <div class="fc-in">
          <div class="fc-f">
            <div class="fc-top">${card.t}</div>
            <div class="fc-mid"><div class="fc-term">${card.f}</div></div>
            <div class="fc-hint">הקש להיפוך</div>
          </div>
          <div class="fc-f fc-b">
            <div class="fc-top">${card.f.replace(/<br>[\s\S]*/,'').replace(/<[^>]+>/g,'')}</div>
            <div class="fc-mid"><div class="fc-def">${card.b}</div></div>
            <div class="fc-hint">&nbsp;</div>
          </div>
        </div>
      </button>
    </div>
    <div id="fc-actions"></div>`;
  window.scrollTo(0,0);
}

function flipCard(){
  const el=document.getElementById('fc');
  if(!el)return;
  deck.flip=!deck.flip;
  el.classList.toggle('flip',deck.flip);
  const c=subjColor(studySub);
  document.getElementById('fc-actions').innerHTML = deck.flip
    ? `<div class="fc-nav" style="--sc:${c}">
         <button class="fc-again" onclick="markCard(false)">עוד פעם</button>
         <button class="fc-got" onclick="markCard(true)">ידעתי</button>
       </div>`
    : '';
}

function markCard(known){
  const card=deck.q.shift();
  if(known)deck.done++;
  else deck.again.push(card);
  deck.flip=false;
  drawCard();
}
