/* לימוד — כרטיסיות היפוך + תצוגת סיכום */
/* ================= לימוד ================= */
let studySub='LAW', studyMode='cards';
let deck=null;

function subjColor(id){return (SUBJ.find(s=>s.id===id)||{}).c||'#B4326D';}

/* כל ששת הנושאים מכוסים בכרטיסיות ובסיכום. הבדיקות נשארות כרשת ביטחון:
   נושא שיתווסף בעתיד בלי חומר לימוד יופנה לתרגול במקום להציג מסך ריק. */
function hasCardsFor(id){return typeof CARDS!=='undefined' && CARDS.some(c=>c.s===id);}
function hasSummaryFor(id){return typeof STUDY!=='undefined' && !!STUDY[id];}

function renderStudy(){
  const c=subjColor(studySub);
  const picker=`<div class="subj-pick">`+
    SUBJ.map(s=>`<button class="${s.id===studySub?'on':''}" style="--sc:${s.c}" onclick="pickSubj('${s.id}')">${s.name}</button>`).join('')+
    `</div>`;
  const nav=document.getElementById('study-nav');
  const cards=hasCardsFor(studySub), summary=hasSummaryFor(studySub);

  // נושא ללא חומר לימוד (נוסף בגרסה 2.0) — מפנים לתרגול.
  if(!cards && !summary){
    nav.innerHTML=picker;
    document.getElementById('study-body').innerHTML=
      `<div class="notice mag"><b>אין עדיין חומר לימוד לנושא זה.</b> הנושא נוסף בגרסה 2.0 של השאלות, וכרטיסיות הלימוד והסיכום עדיין בהכנה. בינתיים אפשר לתרגל את הנושא במאגר השאלות.</div>
       <div class="btn-row"><button class="btn" style="background:${c}" onclick="startDrill('${studySub}')">תרגול בנושא זה</button></div>`;
    return;
  }

  // ודא שמצב התצוגה הנבחר אכן קיים לנושא הזה.
  if(studyMode==='list' && !summary) studyMode='cards';
  if(studyMode==='cards' && !cards) studyMode='list';

  nav.innerHTML=picker+
    `<div class="btn-row" style="margin:0 0 12px">
       ${cards?`<button class="btn ${studyMode==='cards'?'':'alt'}" style="padding:7px 15px;font-size:13px;${studyMode==='cards'?'background:'+c:''}" onclick="studyMode='cards';renderStudy()">כרטיסיות</button>`:''}
       ${summary?`<button class="btn ${studyMode==='list'?'':'alt'}" style="padding:7px 15px;font-size:13px;${studyMode==='list'?'background:'+c:''}" onclick="studyMode='list';renderStudy()">סיכום</button>`:''}
     </div>`;

  if(studyMode==='list') renderSummary();
  else buildDeck();
}

function pickSubj(id){studySub=id;deck=null;renderStudy();}

/* נושאים שיש להם דף עיון סטטי משלהם (נוצר על ידי tools/pages/render.js).
   הדף הוא הגרסה הקריאה והשיתופית של אותו סיכום — אפשר לשלוח ולהדפיס. */
const DOC_PAGE={LAW:'aviation-law/',CALC:'altitude-separation/',OPS:'safety-emergency/',TECH:'technical-loading/',MET:'meteorology/',ENG:'aviation-english/'};

function renderSummary(){
  if(!hasSummaryFor(studySub)){renderStudy();return;}
  const doc=DOC_PAGE[studySub];
  document.getElementById('study-body').innerHTML=
    STUDY[studySub].map(sec=>`<div class="card"><div class="topic"><h3 style="color:${subjColor(studySub)}">${sec.t}</h3><ul>${sec.i.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`).join('')+
    (doc?`<p class="doc-link"><a href="${doc}">פתח כדף מלא לקריאה ולשיתוף ›</a></p>`:'')+
    `<div class="btn-row"><button class="btn" style="background:${subjColor(studySub)}" onclick="startDrill('${studySub}')">תרגול בנושא זה</button></div>`;
}

/* ---- חפיסת כרטיסיות ----
   pos = מצביע דפדוף לכרטיסייה הנוכחית בתוך deck.q. אפשר לדפדף הקודם/הבא
   בלי לסמן; סימון "ידעתי"/"עוד פעם" פועל על הכרטיסייה שבמצביע. */
function buildDeck(){
  const pool=CARDS.filter(c=>c.s===studySub);
  deck={q:pool.slice(),pos:0,total:pool.length,done:0,again:[],flip:false,round:1};
  drawCard();
}

function drawCard(){
  const el=document.getElementById('study-body');
  const c=subjColor(studySub);
  if(!deck.q.length){
    if(deck.again.length){
      deck.q=shuffle(deck.again);deck.again=[];deck.pos=0;deck.round++;
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
  if(deck.pos>=deck.q.length)deck.pos=deck.q.length-1;
  if(deck.pos<0)deck.pos=0;
  const card=deck.q[deck.pos];
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
            <div class="fc-ref">${card.ref?'מקור: '+card.ref:'&nbsp;'}</div>
          </div>
        </div>
      </button>
    </div>
    <div class="fc-browse">
      <button class="fc-page" onclick="browseCard(-1)" ${deck.pos===0?'disabled':''} aria-label="הכרטיסייה הקודמת">‹ הקודם</button>
      <span class="fc-count mono">${deck.pos+1} / ${deck.q.length}</span>
      <button class="fc-page" onclick="browseCard(1)" ${deck.pos===deck.q.length-1?'disabled':''} aria-label="הכרטיסייה הבאה">הבא ›</button>
    </div>
    <div id="fc-actions"></div>`;
  window.scrollTo(0,0);
}

/* דפדוף בלי סימון — מזיז את המצביע ומחזיר את הכרטיסייה לצד הקדמי. */
function browseCard(d){
  if(!deck||!deck.q.length)return;
  deck.pos=Math.min(deck.q.length-1,Math.max(0,deck.pos+d));
  deck.flip=false;
  drawCard();
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
  const card=deck.q.splice(deck.pos,1)[0];
  if(!card){deck.flip=false;drawCard();return;}
  if(known)deck.done++;
  else deck.again.push(card);
  deck.flip=false;
  if(deck.pos>=deck.q.length)deck.pos=Math.max(0,deck.q.length-1);
  drawCard();
}
