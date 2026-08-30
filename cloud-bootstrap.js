(async function(){
try{
  if(sessionStorage.getItem("poorviAuthMode")!=="supabase"){location.replace("login.html");return;}
  const u=await KMT.me();
  if(!u || u.role==="admin"){await KMT.logout();sessionStorage.clear();location.replace("login.html");return;}
  currentUser={id:u.id,name:u.name,role:u.role,active:true};
  sessionStorage.setItem("poorviCurrentUser",u.id);
  sessionStorage.setItem("poorviDisplayName",u.name);
  sessionStorage.setItem("poorviRole",u.role);
  const w=document.getElementById("welcomeTitle");if(w)w.textContent="Welcome to "+u.name;
  applyRole();
  const rows=await KMT.progress(u.id);
  const h=(rows||[]).map(x=>({id:x.worksheet_id,date:x.date,n:x.correct,wrong:x.wrong,notAnswered:x.not_answered,total:x.total,a:x.accuracy,et:x.elapsed,reviewed:x.reviewed,operation:x.operation,range:x.range,userId:x.user_id,userName:x.user_name}));
  saveHist(h,u.id);
  renderWeek();renderMonthly();renderYearly();
}catch(e){
 console.error("Cloud bootstrap:",e);
 const msg=document.getElementById("msg"); if(msg)msg.textContent="Cloud session error. Please login again.";
}
})();