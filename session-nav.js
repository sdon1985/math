
(function(){
function el(id){return document.getElementById(id)}
function hideByIds(ids){
ids.forEach(id=>{const x=el(id);if(x)x.classList.add("hidden")});
}
function showById(id){const x=el(id);if(x)x.classList.remove("hidden")}
function setActive(id){
document.querySelectorAll("#userNav button").forEach(b=>b.classList.remove("active"));
const b=el(id);if(b)b.classList.add("active");
}

function endActiveTestForUserSwitch(){
// Any active worksheet belongs to the currently selected user.
// Switching users must terminate that session so the worksheet/timer
// cannot continue under the next user.
try{
if(typeof testStarted!=="undefined" && testStarted){
testStarted=false;
}
}catch(e){}
try{
if(typeof timerInterval!=="undefined" && timerInterval){
clearInterval(timerInterval);
timerInterval=null;
}
}catch(e){}
try{
if(typeof stopTimer==="function")stopTimer();
}catch(e){}
try{
if(typeof currentTest!=="undefined")currentTest=null;
}catch(e){}
try{
if(typeof activeTest!=="undefined")activeTest=null;
}catch(e){}
try{
if(typeof worksheetStarted!=="undefined")worksheetStarted=false;
}catch(e){}
// Clear any persisted active-session markers used by the app.
[
"poorviActiveTest","poorviActiveSession",
"poorviCurrentTest","poorviTestInProgress"
].forEach(k=>localStorage.removeItem(k));
sessionStorage.removeItem("poorviActiveTest");
sessionStorage.removeItem("poorviActiveSession");

// Reset common test UI so the next user starts clean.
["timer","timerDisplay","questionTimer"].forEach(id=>{
const x=$(id); if(x)x.textContent="";
});
["startBtn","submitBtn"].forEach(id=>{
const x=$(id); if(x)x.disabled=false;
});
}

function hardEndCurrentUserTest(){

// User switching intentionally ends the current user's active session.
clearActiveSession(currentUser?.id||"guest");
// Stop every timer pattern used by previous versions.
["timerInterval","countdownInterval","interval","testTimer","questionTimerInterval"].forEach(n=>{
try{
if(window[n]){clearInterval(window[n]);clearTimeout(window[n]);window[n]=null;}
}catch(e){}
});

// Call known cleanup functions if they exist.
["stopTimer","endTest","resetTest","cancelTest","clearTest","finishTest"].forEach(fn=>{
try{
if(typeof window[fn]==="function") window[fn]();
}catch(e){}
});

// Explicitly reset common active-test variables.
[
"testStarted","testRunning","isTestRunning","worksheetStarted",
"testActive","timerRunning","inTest","hasActiveTest"
].forEach(n=>{
try{ if(n in window) window[n]=false; }catch(e){}
});

[
"currentTest","activeTest","currentWorksheet","activeWorksheet",
"currentQuestions","questions","answers","currentAnswers"
].forEach(n=>{
try{ if(n in window) window[n]=null; }catch(e){}
});

// Remove persisted active-session state. Do NOT touch submitted history.
[
"poorviActiveTest","poorviActiveSession","poorviCurrentTest",
"poorviTestInProgress","poorviTestSession","poorviWorksheet",
"poorviCurrentWorksheet"
].forEach(k=>{
try{localStorage.removeItem(k)}catch(e){}
try{sessionStorage.removeItem(k)}catch(e){}
});

// Hide/clear active worksheet areas where present.
["testArea","testContainer","worksheet","questionArea","activeTest"].forEach(id=>{
const x=document.getElementById(id);
if(x && id!=="activeTest") x.classList.add("hidden");
});

// Re-enable the normal Start Test state.
["startBtn","newBtn"].forEach(id=>{
const x=document.getElementById(id);
if(x){x.disabled=false;x.classList.remove("hidden");}
});
}

function setupUserNav(){
el("navPractice").onclick=()=>showPractice();
el("navResults").onclick=()=>showResults();
el("navProgress").onclick=()=>showProgress();
el("navEnglish").onclick=()=>showEnglish();
showPractice();
}
function showPractice(){
setActive("navPractice");
// Keep the existing worksheet controls visible; hide tracker/results cards.
const ids=["progressTracker","result","parentReview","adminPastTests","englishPanel"];
hideByIds(ids);
}
function showResults(){
setActive("navResults");
// Results card in the existing v25.4 User Clean - User Switch Fixed page.
const result=el("result");
if(result){result.classList.remove("hidden");result.scrollIntoView({behavior:"smooth"});}
else alert("Results will appear after a test is submitted.");
}
function showProgress(){
setActive("navProgress");
// Existing tracker section.
const tracker=el("progressTracker");
if(tracker){tracker.classList.remove("hidden");tracker.scrollIntoView({behavior:"smooth"});}
}

function showEnglish(){
  setActive("navEnglish");
  const ids=["parentPanel","progressTracker","result","parentReview","adminPastTests","pencilTools","ocrStatus","worksheetStatusCard"];
  hideByIds(ids);
  const p=el("englishPanel");
  if(p){
    p.classList.remove("hidden");
    if(window.KMT_SHOW_ENGLISH)window.KMT_SHOW_ENGLISH();
    p.scrollIntoView({behavior:"smooth"});
  }
}
document.addEventListener("DOMContentLoaded",function(){
const c=$("count");
if(c)c.addEventListener("change",function(){if(!started)syncTimerOptions();});
syncTimerOptions($("mins").value);
});
window.addEventListener("load",()=>{setupUserNav();setTimeout(()=>restoreActiveSession(),0);});
window.addEventListener("pagehide",()=>{if(started&&!done)persistActiveSession();});
window.addEventListener("beforeunload",()=>{if(started&&!done)persistActiveSession();});
})();
window.addEventListener("storage",function(e){
if(e.key==="poorviMathHistoryByUser" || e.key==="poorviVoidedSubmissions"){
refreshProgressAfterAdminSave();
}
});
window.addEventListener("focus",refreshProgressAfterAdminSave);
document.addEventListener("visibilitychange",function(){
if(!document.hidden)refreshProgressAfterAdminSave();
});


