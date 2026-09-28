/* ================= מד גובה =================
   הצבעים של המחוג מגיעים מ-style.css דרך המחלקות g-*, ולכן הוא מתחלף
   יחד עם המצב הכהה ומצבי הנגישות, בלי צבע קשיח ב-SVG. */
function gaugeSVG(pct){
  const cx=66,cy=66,r=55;
  let ticks='';
  for(let i=0;i<=20;i++){
    const ang=(-210+i*(240/20))*Math.PI/180;
    const maj=i%5===0, len=maj?9:5;
    const x1=cx+Math.cos(ang)*(r-2), y1=cy+Math.sin(ang)*(r-2);
    const x2=cx+Math.cos(ang)*(r-2-len), y2=cy+Math.sin(ang)*(r-2-len);
    ticks+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${maj?'g-maj':'g-min'}" stroke-width="${maj?1.6:1}" stroke-linecap="round"/>`;
  }
  const a=(-210+(pct/100)*240)*Math.PI/180;
  const nx=cx+Math.cos(a)*(r-15), ny=cy+Math.sin(a)*(r-15);
  const bx=cx-Math.cos(a)*11, by=cy-Math.sin(a)*11;
  const arcEnd=(-210+(pct/100)*240)*Math.PI/180;
  const sx=cx+Math.cos(-210*Math.PI/180)*(r+4), sy=cy+Math.sin(-210*Math.PI/180)*(r+4);
  const ex=cx+Math.cos(arcEnd)*(r+4), ey=cy+Math.sin(arcEnd)*(r+4);
  const large=(pct/100)*240>180?1:0;
  const arc = pct>0.5 ? `<path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r+4} ${r+4} 0 ${large} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" class="g-arc ${pct>=EXAM.pass+15?'hi':pct>=EXAM.pass?'mid':'lo'}" stroke-width="3" fill="none" stroke-linecap="round"/>` : '';
  /* סימן סף המעבר — כמו "באג" על מד גובה */
  const pa=(-210+(EXAM.pass/100)*240)*Math.PI/180;
  const p1x=cx+Math.cos(pa)*(r+7), p1y=cy+Math.sin(pa)*(r+7);
  const p2x=cx+Math.cos(pa)*(r-13), p2y=cy+Math.sin(pa)*(r-13);
  const bug=`<line x1="${p1x.toFixed(1)}" y1="${p1y.toFixed(1)}" x2="${p2x.toFixed(1)}" y2="${p2y.toFixed(1)}" class="g-bug" stroke-width="1.6" stroke-dasharray="2.5 2"/>`;
  return `<svg viewBox="0 0 132 132" role="img" aria-label="כשירות ${Math.round(pct)} אחוז, סף מעבר ${EXAM.pass}">
    <circle cx="${cx}" cy="${cy}" r="${r+9}" class="g-face" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r+4}" fill="none" class="g-ring" stroke-width="1"/>
    ${arc}${ticks}${bug}
    <line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" class="g-needle" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="4" class="g-hub"/>
  </svg>`;
}

function subjPct(id){
  const b=S.best[id];
  return b&&b.n?Math.round(b.c/b.n*100):0;
}
function overallPct(){
  const v=SUBJ.map(s=>subjPct(s.id));
  return v.reduce((a,b)=>a+b,0)/v.length;
}

function render(){
  const p=overallPct();
  const g=document.getElementById('gauge');
  g.innerHTML=gaugeSVG(p)+`<div class="rdg"><b>${Math.round(p)}</b><span>% מוכנות</span></div>`;
  const note=document.getElementById('gauge-note');
  if(!S.seen) note.textContent='עדיין לא התחלת. המחוג עולה לפי אחוז התשובות הנכונות בניסיון האחרון בכל נושא. הקו המקווקו מסמן את סף המעבר, '+EXAM.pass+'.';
  else if(p>=EXAM.pass+15) note.textContent='אתה מעל סף המעבר עם מרווח טוב. עבור על החולשות שנשארו ועשה עוד סימולציה אחת לפני המבחן.';
  else if(p>=EXAM.pass) note.textContent='עברת את הקו המקווקו, אבל בלי מרווח. במבחן חלק מהשאלות שוות 2 נקודות, וטעות באחת מהן עולה כמו שתי טעויות.';
  else if(p>=60) note.textContent='מתחת לסף המעבר. התחל מהנושא שהפס שלו הכי נמוך.';
  else note.textContent='עוד מוקדם. עבור על חומר הלימוד בנושא החלש ביותר, ואז חזור לתרגול.';

  document.getElementById('subjects').innerHTML=SUBJ.map(s=>{
    const pc=subjPct(s.id), b=S.best[s.id];
    return `<button class="strip" onclick="startDrill('${s.id}')">
      <div class="top"><span class="nm">${s.name}</span><span class="pc">${b?pc+'%':'—'}</span></div>
      <div class="bar"><i style="width:${pc}%"></i></div>
      <div class="sub">${b?b.c+'/'+b.n+' · '+s.note:s.note}</div>
    </button>`;
  }).join('');

  const wb=document.getElementById('weak-badge');
  if(S.wrong.length){wb.style.display='flex';wb.textContent=S.wrong.length;}
  else wb.style.display='none';
}
