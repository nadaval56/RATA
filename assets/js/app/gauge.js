/* מד גובה — gaugeSVG, subjPct, overallPct, render */
/* ================= מד גובה ================= */
function gaugeSVG(pct){
  const cx=66,cy=66,r=55;
  let ticks='';
  for(let i=0;i<=20;i++){
    const ang=(-210+i*(240/20))*Math.PI/180;
    const maj=i%5===0, len=maj?9:5;
    const x1=cx+Math.cos(ang)*(r-2), y1=cy+Math.sin(ang)*(r-2);
    const x2=cx+Math.cos(ang)*(r-2-len), y2=cy+Math.sin(ang)*(r-2-len);
    ticks+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${maj?'#14202B':'#7C8792'}" stroke-width="${maj?1.6:1}" stroke-linecap="round"/>`;
  }
  const a=(-210+(pct/100)*240)*Math.PI/180;
  const nx=cx+Math.cos(a)*(r-15), ny=cy+Math.sin(a)*(r-15);
  const bx=cx-Math.cos(a)*11, by=cy-Math.sin(a)*11;
  const arcEnd=(-210+(pct/100)*240)*Math.PI/180;
  const sx=cx+Math.cos(-210*Math.PI/180)*(r+4), sy=cy+Math.sin(-210*Math.PI/180)*(r+4);
  const ex=cx+Math.cos(arcEnd)*(r+4), ey=cy+Math.sin(arcEnd)*(r+4);
  const large=(pct/100)*240>180?1:0;
  const arc = pct>0.5 ? `<path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r+4} ${r+4} 0 ${large} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${pct>=80?'#2C6B4E':pct>=50?'#22608F':'#B4326D'}" stroke-width="3" fill="none" stroke-linecap="round"/>` : '';
  return `<svg viewBox="0 0 132 132" role="img" aria-label="כשירות ${Math.round(pct)} אחוז">
    <circle cx="${cx}" cy="${cy}" r="${r+9}" fill="#F8F8F4" stroke="#14202B" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r+4}" fill="none" stroke="#D6DAD1" stroke-width="1"/>
    ${arc}${ticks}
    <line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#B4326D" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="4" fill="#14202B"/>
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
  g.innerHTML=gaugeSVG(p)+`<div class="rdg"><b>${Math.round(p)}</b><span>READY %</span></div>`;
  const note=document.getElementById('gauge-note');
  if(!S.seen) note.textContent='עדיין לא התחלת. המחוג עולה לפי אחוז השאלות שענית עליהן נכון בניסיון האחרון בכל נושא.';
  else if(p>=85) note.textContent='אתה במצב טוב. עבור על החולשות שנותרו ותרוץ עוד סימולציה אחת לפני התור.';
  else if(p>=60) note.textContent='בסיס יציב, אבל יש נושאים שעדיין לא סגורים. תסתכל איזה פס הכי נמוך ותתחיל שם.';
  else note.textContent='עוד מוקדם. תעבור על הלימוד בנושא החלש ביותר ואז תחזור לתרגול.';

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
