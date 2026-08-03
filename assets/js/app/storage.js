/* ================= אחסון =================
   מימוש localStorage לפריסה על GitHub Pages / פתיחה מקומית (file://).
   שומר על מפתח זהה ('altimeter:v1') ועל מבנה {best, wrong, seen},
   כדי שקובצי JSON שיוצאו מהאפליקציה יישארו תואמים לייבוא.
   השיטות נשארו async כדי לא לגעת בקוראים (load/save/finish/resetAll/importData)
   — כל await מכוון לפונקציה async, עקבי לאורך כל השרשרת. */
const MEM = {};
const KEY_PREFIX = 'altimeter:';

const store = {
  async get(k){
    try {
      const raw = localStorage.getItem(KEY_PREFIX + k);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return MEM[k] !== undefined ? MEM[k] : null;
    }
  },
  async set(k, v){
    MEM[k] = v;
    try {
      localStorage.setItem(KEY_PREFIX + k, JSON.stringify(v));
    } catch(e) {
      // מצב פרטי או חריגת מכסה — נשאר בזיכרון בלבד
    }
  }
};

let S = {best:{}, wrong:[], seen:0};

async function load(){
  const d = await store.get('altimeter:v1');
  if(d && typeof d==='object') S = Object.assign(S,d);
  render();
}
async function save(){ await store.set('altimeter:v1',S); }

/* ================= נתונים ================= */
function exportData(){
  const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download='altimeter-progress.json';a.click();URL.revokeObjectURL(u);
}
function importData(ev){
  const f=ev.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=async()=>{
    try{const d=JSON.parse(r.result);S=Object.assign({best:{},wrong:[],seen:0},d);await save();render();go('home');}
    catch(e){alert('הקובץ אינו תקין. ודא שזה קובץ שיוצא מהאפליקציה הזו.');}
  };
  r.readAsText(f);
}
async function resetAll(){
  if(!confirm('לאפס את כל ההתקדמות? הפעולה אינה הפיכה.'))return;
  S={best:{},wrong:[],seen:0};await save();render();
}
