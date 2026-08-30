/* תרגול, סימולציית מבחן וחולשות */
/* ================= תרגול ומבחן ================= */

/* מבנה סימולציית המבחן — מיושר לדיווח ממי שניגש לבחינה בפועל:
   כ-36 שאלות, מול מחשב, ציון עובר 70. חלק מהשאלות במבחן האמיתי
   שוות 2 נקודות; כאן כל השאלות שוות ערך, ולכן האחוז הוא קירוב. */
const EXAM = {
  n:36,
  pass:70,
  per:{LAW:13, CALC:6, OPS:5, TECH:6, MET:3, ENG:3}
};

let sess=null;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function prep(q){
  const idx=q.o.map((_,i)=>i);
  const sh=shuffle(idx);
  return {...q, _o:sh.map(i=>q.o[i]), _a:sh.indexOf(q.a)};
}

function renderDrillMenu(){
  document.getElementById('drill-body').innerHTML=
    `<h2 class="eyebrow" tabindex="-1">תרגול</h2>
     <div class="card"><h3>בחר נושא</h3>
     <p class="tiny" style="margin:0 0 12px">כל השאלות בנושא, בסדר אקראי, עם הסבר מלא אחרי כל תשובה.</p>
     ${SUBJ.map(s=>`<button class="strip" onclick="startDrill('${s.id}')"><div class="top"><span class="nm">${s.name}</span><span class="pc">${Q.filter(q=>q.s===s.id).length}</span></div></button>`).join('')}
     </div>
     <div class="card"><h3>סימולציית מבחן</h3>
     <p class="tiny" style="margin:0 0 12px">${EXAM.n} שאלות מכל הנושאים, בלי הסברים תוך כדי. ציון מוצג בסוף, סף מעבר ${EXAM.pass}.</p>
     <button class="btn mag" onclick="startExam()">התחל סימולציה</button></div>
     ${examFormatCard()}`;
}

/* מה ידוע על המבחן עצמו — לא פרסום רשמי, אלא דיווח ממי שניגש */
function examFormatCard(){
  return `<div class="card"><h3>מה מחכה לך במבחן</h3>
    <p class="tiny" style="margin:0 0 10px">לפי דיווח ממי שניגש לבחינה. <b>לא פרסום רשמי של רת"א</b> — הפרטים עשויים להשתנות.</p>
    <div class="brk">
      <div class="brk-row"><span>אופן העריכה</span><span>מול מחשב</span></div>
      <div class="brk-row"><span>קבלת הציון</span><span>מיידית</span></div>
      <div class="brk-row"><span>ציון עובר</span><span>${EXAM.pass}</span></div>
      <div class="brk-row"><span>מספר שאלות</span><span>כ-${EXAM.n}</span></div>
      <div class="brk-row"><span>ניקוד</span><span>חלקן 2 נק׳</span></div>
    </div>
    <div class="notice mag" style="margin-bottom:0"><b>"בחר בתשובה הנכונה ביותר"</b> — בחלק לא קטן מהשאלות זה הניסוח, ואז יותר ממסיח אחד נכון כשלעצמו. אל תבחר בתשובה הראשונה שנראית נכונה: קרא את כל הארבע, ובחר את זו שהיא <b>השלמה ביותר</b> או <b>המדויקת ביותר</b> — זו שמכילה את האחרות, או זו שאינה משמיטה רכיב מההגדרה.</div>
  </div>`;
}

function startDrill(id){
  const pool=Q.filter(q=>q.s===id);
  sess={mode:'drill',sub:id,qs:shuffle(pool).map(prep),i:0,c:0,ans:[]};
  go('drill');drawQ();
}
function startExam(){
  const per=EXAM.per;
  let qs=[];
  SUBJ.forEach(s=>{qs=qs.concat(shuffle(Q.filter(q=>q.s===s.id)).slice(0,per[s.id]));});
  sess={mode:'exam',qs:shuffle(qs).map(prep),i:0,c:0,ans:[]};
  go('drill');drawQ();
}
function startWeakDrill(){
  const pool=Q.filter((q,i)=>S.wrong.includes(i));
  if(!pool.length)return;
  sess={mode:'weak',qs:shuffle(pool).map(prep),i:0,c:0,ans:[]};
  go('drill');drawQ();
}

function drawQ(){
  const q=sess.qs[sess.i];
  const L=['א','ב','ג','ד'];
  const modeLbl=sess.mode==='exam'?'סימולציית מבחן':sess.mode==='weak'?'חזרה על חולשות':'תרגול';
  document.getElementById('drill-body').innerHTML=
   `<h2 class="sr-only" id="q-head" tabindex="-1">${modeLbl} — שאלה ${sess.i+1} מתוך ${sess.qs.length}</h2>
    <div class="qmeta"><span>${modeLbl}</span><span class="mono">${sess.i+1} / ${sess.qs.length}</span></div>
    <div class="card">
      <span class="qtag" style="font-size:.6875rem">${q.t}</span>
      <div class="qtext" style="margin-top:10px">${q.best?'<span class="qbest">בחר בתשובה הנכונה ביותר:</span> ':''}${q.q}</div>
      <div id="opts">${q._o.map((o,i)=>`<button class="opt" onclick="pick(${i})"><span class="lt">${L[i]}</span>${o}</button>`).join('')}</div>
      <div id="fb" role="status" aria-live="polite"></div>
    </div>`;
  window.scrollTo(0,0);
  /* מעבירים את המיקוד לכותרת השאלה: קורא מסך מכריז על השאלה החדשה,
     וניווט המקלדת מתחיל מראש הכרטיס ולא מהמקום שבו היה הכפתור הקודם. */
  document.getElementById('q-head').focus();
}

function pick(i){
  const q=sess.qs[sess.i];
  const ok=i===q._a;
  if(ok)sess.c++;
  sess.ans.push({q:Q.indexOf(Q.find(x=>x.q===q.q)),ok});
  const btns=document.querySelectorAll('#opts .opt');
  btns.forEach((b,j)=>{
    b.disabled=true;
    /* הצבע והסמל הם לעין; לקורא מסך מוסיפים את אותו מידע כטקסט. */
    if(j===q._a){
      b.classList.add('correct');
      b.insertAdjacentHTML('beforeend','<span class="sr-only"> — זו התשובה הנכונה</span>');
    } else if(j===i){
      b.classList.add('wrong');
      b.insertAdjacentHTML('beforeend','<span class="sr-only"> — התשובה שבחרת, שגויה</span>');
    }
  });
  let fb='';
  if(sess.mode!=='exam'){
    fb=`<div class="expl ${ok?'':'bad'}" tabindex="-1"><span class="hd">${ok?'נכון':'לא נכון'}</span>${q.e}
      ${q.flag?`<div class="notice mag" style="margin:10px 0 0"><b>שים לב:</b> ${q.flag}</div>`:''}
      <div class="src">מקור: ${q.src}${q.ref?` · ${q.ref}`:''}</div></div>`;
  }
  const last=sess.i===sess.qs.length-1;
  fb+=`<div class="btn-row"><button class="btn" onclick="next()">${last?'סיום':'הבא'}</button></div>`;
  const box=document.getElementById('fb');
  box.innerHTML=fb;
  if(sess.mode!=='exam')box.scrollIntoView({behavior:'smooth',block:'nearest'});
  /* המסיחים הפכו ל-disabled ואיבדו את המיקוד. בלי ההעברה הזו המיקוד
     נופל ל-body וניווט המקלדת מתחיל שוב מראש הדף. בתרגול עוברים אל
     ההסבר (שנקרא במלואו), ובמבחן — ישר אל כפתור ההמשך. */
  const target=box.querySelector('.expl')||box.querySelector('button');
  if(target)target.focus();
}

function next(){
  if(sess.i<sess.qs.length-1){sess.i++;drawQ();}
  else finish();
}

async function finish(){
  const n=sess.qs.length,c=sess.c,pct=Math.round(c/n*100);
  S.seen=(S.seen||0)+n;
  sess.ans.forEach(a=>{
    if(a.q<0)return;
    const at=S.wrong.indexOf(a.q);
    if(!a.ok && at<0)S.wrong.push(a.q);
    if(a.ok && at>=0)S.wrong.splice(at,1);
  });
  if(sess.mode==='drill'){
    const b=S.best[sess.sub];
    if(!b || c/n >= b.c/b.n) S.best[sess.sub]={c,n};
  }
  if(sess.mode==='exam'){
    SUBJ.forEach(s=>{
      const sub=sess.ans.filter(a=>a.q>=0&&Q[a.q].s===s.id);
      if(!sub.length)return;
      const sc=sub.filter(a=>a.ok).length;
      const b=S.best[s.id];
      if(!b || sc/sub.length >= b.c/b.n) S.best[s.id]={c:sc,n:sub.length};
    });
  }
  await save();

  const pass=pct>=EXAM.pass;
  let brk='';
  if(sess.mode==='exam'){
    brk='<div class="brk">'+SUBJ.map(s=>{
      const sub=sess.ans.filter(a=>a.q>=0&&Q[a.q].s===s.id);
      if(!sub.length)return '';
      const sc=sub.filter(a=>a.ok).length;
      return `<div class="brk-row"><span>${s.name}</span><span>${sc}/${sub.length}</span></div>`;
    }).join('')+'</div>';
  }
  document.getElementById('drill-body').innerHTML=
   `<h2 class="sr-only" id="res-head" tabindex="-1">התוצאה: ${pct} אחוז, ${c} מתוך ${n}. ${pass?'מעל סף המעבר':'מתחת לסף המעבר'}.</h2>
    <div class="card">
      <div class="score ${pass?'pass':'fail'}"><div class="big mono" aria-hidden="true">${pct}%</div><div class="lbl" aria-hidden="true">${c} מתוך ${n}</div></div>
      ${brk}
      <div class="notice">${sess.mode==='exam'
        ? `סף המעבר כאן הוא <b>${EXAM.pass}</b>, לפי דיווח ממי שניגש לבחינה — לא פרסום רשמי. שים לב: במבחן האמיתי חלק מהשאלות שוות <b>2 נקודות</b>, ולכן הציון שם משוקלל והאחוז כאן הוא קירוב בלבד. אל תתייחס ל-${EXAM.pass}—${EXAM.pass+5} כאל מקום בטוח.`
        : `סף המעבר במבחן הוא <b>${EXAM.pass}</b>, לפי דיווח ממי שניגש — לא פרסום רשמי. בתרגול נושא בודד כדאי לכוון גבוה יותר.`}</div>
      <div class="btn-row">
        ${S.wrong.length?`<button class="btn mag" onclick="startWeakDrill()">חזרה על ${S.wrong.length} החולשות</button>`:''}
        <button class="btn alt" onclick="go('home')">חזרה למצב</button>
      </div>
    </div>`;
  window.scrollTo(0,0);
  document.getElementById('res-head').focus();
  render();
}

/* ================= חולשות ================= */
function renderWeak(){
  const el=document.getElementById('weak-body');
  if(!S.wrong.length){
    el.innerHTML=`<div class="empty"><h2 class="eyebrow" tabindex="-1">חולשות</h2><p>אין שאלות פתוחות. כל שאלה שתטעה בה תיכנס לכאן ותצא רק כשתענה עליה נכון.</p></div>`;
    return;
  }
  const byS={};
  S.wrong.forEach(i=>{const s=Q[i].s;(byS[s]=byS[s]||[]).push(i);});
  el.innerHTML=`<h2 class="eyebrow" tabindex="-1">חולשות · ${S.wrong.length} שאלות</h2>
    <div class="card"><p class="tiny" style="margin:0 0 12px">שאלות שטעית בהן. הן נשארות כאן עד שתענה עליהן נכון.</p>
    ${SUBJ.filter(s=>byS[s.id]).map(s=>`<div class="brk-row"><span>${s.name}</span><span>${byS[s.id].length}</span></div>`).join('')}
    <div class="btn-row"><button class="btn mag" onclick="startWeakDrill()">תרגל אותן</button></div></div>`;
}
