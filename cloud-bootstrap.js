(async function(){
function escCloud(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[m]))}
function opCloud(x){return ({addition:"➕ Addition",subtraction:"➖ Subtraction",multiplication:"✖️ Multiplication",division:"➗ Division",mixed:"🔢 Mixed"})[x]||x||"Worksheet"}
function approvedStatus(s){return ["approved","reviewed","complete"].includes(String(s.status||s||"").toLowerCase())||!!s.reviewed_at}
function last3Days(rows){const cutoff=new Date();cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-2);return rows.filter(x=>x.submitted_at&&new Date(x.submitted_at)>=cutoff&&!['voided'].includes(String(x.status||'').toLowerCase()));}
function renderCloudWorksheetStatus(uid,rows){
  const box=document.getElementById("worksheetStatus");if(!box)return;
  const list=last3Days(Array.isArray(rows)?rows:[]);
  const pending=list.filter(x=>!approvedStatus(x)&&["pending","under_review"].includes(String(x.status||"").toLowerCase()));
  const reviewed=list.filter(approvedStatus);
  let html='<div class="cloudStatusGrid"><div class="cloudStatusCard"><b>⏳ Under Review</b><span>'+pending.length+'</span></div><div class="cloudStatusCard"><b>✓ Approved</b><span>'+reviewed.length+'</span></div></div><div class="cloudWorksheetList">';
  if(!list.length)html+='<div class="muted">No submitted worksheets in the last 3 days.</div>';
  pending.forEach(x=>{const d=x.submitted_at?new Date(x.submitted_at).toLocaleString():"";html+='<div class="cloudWorksheetRow"><div><b>'+opCloud(x.operation)+'</b><div class="muted">⏳ Under Parent Review • '+d+' • '+(x.total||0)+' questions</div></div><span class="cloudPill pendingPill">Waiting for parent review</span></div>';});
  reviewed.forEach((x,idx)=>{const d=x.submitted_at?new Date(x.submitted_at).toLocaleDateString():"";const a=x.submission||{},answers=Array.isArray(a.answers)?a.answers:[],wrong=answers.filter(q=>q.status==="wrong"),id="reviewed_"+idx+"_"+String(x.id).replace(/[^a-zA-Z0-9_-]/g,"");html+='<div class="cloudWorksheetRow reviewedRow"><div class="cloudWorksheetHead"><div><b>'+opCloud(x.operation)+'</b><div class="muted">✓ Approved • '+d+' • '+(x.total||answers.length||0)+' questions • '+wrong.length+' mistakes</div></div><button class="btn secondary" data-show-review="'+id+'">View Review</button></div><div id="'+id+'" class="cloudMistakes hidden">';if(!wrong.length)html+='<div class="cloudGood">🎉 Perfect! No mistakes in this worksheet.</div>';else{html+='<div class="cloudMistakeTitle">✗ Mistakes Only</div>';wrong.forEach(q=>{const correct=q.correctAnswer??q.expected??q.solution??q.ans;const yours=q.ocr??q.answer??q.userAnswer??"not recognized";html+='<div class="mistakeRow"><b>#'+(q.i+1)+'</b><span>'+escCloud(q.problem||q.question||"")+'</span><span>Your answer: <b class="badText">'+escCloud(yours)+'</b></span><span>Correct: <b>'+escCloud(correct)+'</b></span></div>';});}html+='</div></div>';});
  html+='</div>';box.innerHTML=html;box.querySelectorAll("[data-show-review]").forEach(b=>b.onclick=()=>{const e=document.getElementById(b.dataset.showReview);if(!e)return;e.classList.toggle("hidden");b.textContent=e.classList.contains("hidden")?"View Review":"Hide Review";});
}
async function loadCloudWorksheetStatus(uid){const box=document.getElementById("worksheetStatus");if(box)box.innerHTML='<div class="muted">Loading submitted worksheets…</div>';try{const rows=await KMT.worksheets(uid);renderCloudWorksheetStatus(uid,rows);}catch(e){console.error("Worksheet status",e);if(box)box.innerHTML='<div class="muted">Unable to load submitted worksheet history.</div>';}}
try{
  if(sessionStorage.getItem("poorviAuthMode")!=="supabase"){location.replace("login.html");return;}
  const u=await KMT.me();if(!u||u.role==="admin"){await KMT.logout();sessionStorage.clear();location.replace("login.html");return;}
  currentUser={id:u.id,name:u.name,role:u.role,active:true};sessionStorage.setItem("poorviCurrentUser",u.id);sessionStorage.setItem("poorviDisplayName",u.name);sessionStorage.setItem("poorviRole",u.role);
  const w=document.getElementById("welcomeTitle");if(w)w.textContent="Welcome to "+u.name;applyRole();
  const submittedRows=await KMT.worksheets(u.id);const rows=KMT.progressFromRows(submittedRows,u.id);const h=(rows||[]).map(x=>({id:x.worksheet_id,date:x.date,n:x.correct,wrong:x.wrong,notAnswered:x.not_answered,total:x.total,a:x.accuracy,et:x.elapsed,reviewed:x.reviewed,operation:x.operation,range:x.range,userId:x.user_id,userName:x.user_name}));saveHist(h,u.id);renderWeek();renderMonthly();renderYearly();renderCloudWorksheetStatus(u.id,submittedRows);
}catch(e){console.error("Cloud bootstrap:",e);const msg=document.getElementById("msg");if(msg)msg.textContent="Cloud session error. Please login again.";}
document.getElementById("refreshWorksheetStatus")?.addEventListener("click",()=>{const uid=sessionStorage.getItem("poorviCurrentUser");if(uid)loadCloudWorksheetStatus(uid);});
})();
