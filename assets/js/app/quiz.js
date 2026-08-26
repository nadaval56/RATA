/* תרגול, סימולציית מבחן וחולשות */
/* ================= תרגול ומבחן ================= */
let sess=null;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function prep(q){
  const idx=q.o.map((_,i)=>i);
  const sh=shuffle(idx);
  return {...q, _o:sh.map(i=>q.o[i]), _a:sh.indexOf(q.a)};
}

function renderDrillMenu(){
  document.getElementById('drill-body').innerHTML=
    `<div class="eyebrow">תרגול</div>
     <div class="card"><h3>בחר נושא</h3>
     <p class="tiny" style="margin:0 0 12px">כל השאלות בנושא, בסדר אקראי, עם הסבר מלא אחרי כל תשובה.</p>
     ${SUBJ.map(s=>`<button class="strip" onclick="startDrill('${s.id}')"><div class="top"><span class="nm">${s.name}</span><span class="pc">${Q.filter(q=>q.s===s.id).length}</span></div></button>`).join('')}
     </div>
     <div class="card"><h3>סימולציית מבחן</h3>
     <p class="tiny" style="margin:0 0 12px">30 שאלות מכל הנושאים, בלי הסברים תוך כדי. ציון מוצג בסוף.</p>
     <button class="btn mag" onclick="startExam()">התחל סימולציה</button></div>`;
}

function startDrill(id){
  const pool=Q.filter(q=>q.s===id);
  sess={mode:'drill',sub:id,qs:shuffle(pool).map(prep),i:0,c:0,ans:[]};
  go('drill');drawQ();
}
function startExam(){
  const per={LAW:11,CALC:6,OPS:5,TECH:4,MET:2,ENG:2};
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
   `<div class="qmeta"><span>${modeLbl}</span><span class="mono">${sess.i+1} / ${sess.qs.length}</span></div>
    <div class="card">
      <span class="qtag" style="font-size:.6875rem">${q.t}</span>
      <div class="qtext" style="margin-top:10px">${q.q}</div>
      <div id="opts">${q._o.map((o,i)=>`<button class="opt" onclick="pick(${i})"><span class="lt">${L[i]}</span>${o}</button>`).join('')}</div>
      <div id="fb"></div>
    </div>`;
  window.scrollTo(0,0);
}

function pick(i){
  const q=sess.qs[sess.i];
  const ok=i===q._a;
  if(ok)sess.c++;
  sess.ans.push({q:Q.indexOf(Q.find(x=>x.q===q.q)),ok});
  const btns=document.querySelectorAll('#opts .opt');
  btns.forEach((b,j)=>{
    b.disabled=true;
    if(j===q._a)b.classList.add('correct');
    else if(j===i)b.classList.add('wrong');
  });
  let fb='';
  if(sess.mode!=='exam'){
    fb=`<div class="expl ${ok?'':'bad'}"><span class="hd">${ok?'נכון':'לא נכון'}</span>${q.e}
      ${q.flag?`<div class="notice mag" style="margin:10px 0 0"><b>שים לב:</b> ${q.flag}</div>`:''}
      <div class="src">מקור: ${q.src}${q.ref?` · ${q.ref}`:''}</div></div>`;
  }
  const last=sess.i===sess.qs.length-1;
  fb+=`<div class="btn-row"><button class="btn" onclick="next()">${last?'סיום':'הבא'}</button></div>`;
  document.getElementById('fb').innerHTML=fb;
  if(sess.mode!=='exam')document.getElementById('fb').scrollIntoView({behavior:'smooth',block:'nearest'});
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

  const pass=pct>=80;
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
   `<div class="card">
      <div class="score ${pass?'pass':'fail'}"><div class="big mono">${pct}%</div><div class="lbl">${c} מתוך ${n}</div></div>
      ${brk}
      <div class="notice">סף 80% הוא יעד עבודה שקבעתי כאן, לא ציון העובר הרשמי. את ציון העובר בפועל בדוק מול רת"א.</div>
      <div class="btn-row">
        ${S.wrong.length?`<button class="btn mag" onclick="startWeakDrill()">חזרה על ${S.wrong.length} החולשות</button>`:''}
        <button class="btn alt" onclick="go('home')">חזרה למצב</button>
      </div>
    </div>`;
  window.scrollTo(0,0);
  render();
}

/* ================= חולשות ================= */
function renderWeak(){
  const el=document.getElementById('weak-body');
  if(!S.wrong.length){
    el.innerHTML=`<div class="empty"><div class="eyebrow">חולשות</div><p>אין שאלות פתוחות. כל שאלה שתטעה בה תיכנס לכאן ותצא רק כשתענה עליה נכון.</p></div>`;
    return;
  }
  const byS={};
  S.wrong.forEach(i=>{const s=Q[i].s;(byS[s]=byS[s]||[]).push(i);});
  el.innerHTML=`<div class="eyebrow">חולשות · ${S.wrong.length} שאלות</div>
    <div class="card"><p class="tiny" style="margin:0 0 12px">שאלות שטעית בהן. הן נשארות כאן עד שתענה עליהן נכון.</p>
    ${SUBJ.filter(s=>byS[s.id]).map(s=>`<div class="brk-row"><span>${s.name}</span><span>${byS[s.id].length}</span></div>`).join('')}
    <div class="btn-row"><button class="btn mag" onclick="startWeakDrill()">תרגל אותן</button></div></div>`;
}
