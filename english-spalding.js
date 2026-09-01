"use strict";

/*
 * Kids Math Test — English / Spalding
 * Added in Production 3.4.0.
 * Source: user's supplied Spelling Rules sheets.
 * Rule numbering intentionally skips 7 and 8 because they were not present
 * on the supplied pages.
 */
(function(){
  const $ = id => document.getElementById(id);
  if (!$("englishPanel")) return;

  const RULES = [
    [1,"Q is followed by U","The letter q is always followed by u.","queen, quick, quiet"],
    [2,"C before E, I, or Y","The letter c before e, i, or y says /s/, but followed by any other letter says /k/.","cent, city, cycle • cat, cot, cut"],
    [3,"G before E, I, or Y","The letter g before e, i, or y MAY say /j/, but followed by any other letter it says /g/. The letters e and i following g do not always make the g say /j/.","page, giant, gym • gate, go, gust • get, girl, give"],
    [4,"Vowels at the end of a syllable","Read and underline a, e, o, and u at the end of a syllable when they say their first sounds.",""],
    [5,"I and Y at the end of a syllable","Read and underline i and y at the end of a syllable only when they say /ī/.",""],
    [6,"Y at the end of an English word","Write y, not i, at the end of an English word.","happy, candy, funny"],
    [9,"1-1-1 rule","When you have a word with one syllable, with one vowel followed by one consonant (hop), double the consonant (hopping) before adding a suffix that begins with a vowel.","hop → hopping"],
    [10,"2-1-1 rule","When you have a word with two syllables in which the second syllable is accented and ends in one vowel followed by one consonant (begin), double the consonant (beginning) before adding the suffix that begins with a vowel.","begin → beginning"],
    [11,"Final silent e","When a word ends in final silent e, write the word without the e before adding a suffix that begins with a vowel.","make → making • hope → hoping"],
    [12,"IE / EI","Write ie except after c; however if we say /ā/, use ei, unless it’s an exception. See Rule Page 5 for the list of exceptions.","piece • receive • eight"],
    [13,"SH","Write sh to say /sh/ at the beginning or end of words, and at the end of syllables.","ship • fish • finish"],
    [14,"TI, SI, CI","Write ti, si, and ci to say /sh/ in syllables after the first one.","nation • session • special"],
    [15,"SI after S","Write si to say /sh/ if the preceding syllable or base word ends in s.","session"],
    [16,"SI may also say /zh/","The phonogram si may also say /zh/.","vision • television"],
    [17,"Double L, F, S","We often double the l, f, and s following a single vowel at the end of a one-syllable word. This sometimes applies to two-syllable words like recess.","will • off • miss • recess"],
    [18,"AY at the end","Write ay to say /ā/ at the end of a word.","day • play • stay"],
    [19,"I and O before two consonants","Vowels i and o may say /ī/ and /ō/ if followed by two consonants.","find • old"],
    [20,"S never follows X","The letter s never follows the letter x.","box • boxes"],
    [21,"ALL","All, written alone, has two l’s, but when written with another syllable, only one l is written.","all • also • almost"],
    [22,"TILL and FULL","Till and full, written alone, have two l’s, but when written with another syllable, only one l is written.","till • until • full • useful"],
    [23,"DGE","Write dge to say /j/ after a single vowel that says its first sound.","badge • edge • bridge"],
    [24,"Y → I","When adding an ending to a word that ends with a consonant and y, use i instead of y unless the ending is ing.","baby → babies • try → tried"],
    [25,"CH can say /k/","Write ch to say /k/ after a single vowel saying its first sound.","school • echo • stomach"],
    [26,"Proper nouns","Words that are proper nouns—the names or titles of people, places, books, days, or months—are capitalized.","Poorvi • Monday • Arizona"],
    [27,"Z at the beginning","Write z to say /z/ at the beginning of words.","zoo • zero • zipper"],
    [28,"Past tense ending -ED","The phonogram ed has three sounds. If the base word ends in the sound d or t, adding ed makes another syllable that says ed. If the base word ends in a voiced consonant sound, the ed ending says d. If the base word ends in an unvoiced consonant sound, the ending says t.","handed • lived • jumped"],
    [29,"Double-consonant division","Words are usually divided between double consonants. Read double consonants in both syllables for spelling; read only the consonant in the accented syllable for reading.","little"]
  ];

  const QUESTIONS = [
    {r:1,q:"Which spelling is correct?",c:["qeen","queen","kwen"],a:"queen",why:"Rule 1: q is always followed by u."},
    {r:2,q:"Which word uses c to say /s/?",c:["cat","city","cup"],a:"city",why:"Rule 2: c before e, i, or y says /s/."},
    {r:3,q:"Which word has g saying /j/?",c:["gate","gym","gust"],a:"gym",why:"Rule 3: g before e, i, or y MAY say /j/."},
    {r:6,q:"Choose the correct spelling.",c:["happi","happy","happe"],a:"happy",why:"Rule 6: write y, not i, at the end of an English word."},
    {r:9,q:"What is the correct spelling?",c:["hoping","hopping","hoppinng"],a:"hopping",why:"Rule 9: hop follows the 1-1-1 pattern, so double the consonant before -ing."},
    {r:10,q:"Choose the correct spelling.",c:["begining","beginning","beggining"],a:"beginning",why:"Rule 10: begin follows the 2-1-1 pattern."},
    {r:11,q:"Make 'make' + 'ing'.",c:["makeing","making","makking"],a:"making",why:"Rule 11: drop final silent e before a vowel suffix."},
    {r:12,q:"Which spelling is correct?",c:["receive","recieve","receeve"],a:"receive",why:"Rule 12: write ei after c."},
    {r:13,q:"Which word uses sh at the beginning?",c:["ship","sip","chip"],a:"ship",why:"Rule 13: sh can be used at the beginning of a word."},
    {r:17,q:"Which spelling is correct?",c:["mis","miss","mizz"],a:"miss",why:"Rule 17: s is often doubled after a single vowel at the end of a one-syllable word."},
    {r:18,q:"Which word ends with ay saying /ā/?",c:["day","die","dee"],a:"day",why:"Rule 18: ay says /ā/ at the end of a word."},
    {r:20,q:"Which spelling follows Rule 20?",c:["boxs","boxes","boxses"],a:"boxes",why:"Rule 20: s never follows x."},
    {r:24,q:"What is the correct spelling of baby + es?",c:["babyes","babies","babys"],a:"babies",why:"Rule 24: change y to i before the ending, unless the ending is -ing."},
    {r:26,q:"Which is correctly capitalized?",c:["monday","Monday","MONDAY"],a:"Monday",why:"Rule 26: days, months, names, places, books and other proper nouns are capitalized."},
    {r:28,q:"Which word has -ed saying /t/?",c:["jumped","lived","handed"],a:"jumped",why:"Rule 28: after an unvoiced consonant sound, -ed says /t/."},
    {r:29,q:"Which spelling follows the double-consonant rule?",c:["litle","little","littel"],a:"little",why:"Rule 29: words are usually divided between double consonants."}
  ];

  const STORE="kmtEnglishSpaldingProgress";
  let state=JSON.parse(localStorage.getItem(STORE)||'null')||{practice:0,correct:0,tests:0,testCorrect:0,review:[],ruleSeen:{}};
  let practiceIndex=0,testSet=[],testIndex=0,testScore=0,dictIndex=0;

  function save(){localStorage.setItem(STORE,JSON.stringify(state));}
  function pct(a,b){return b?Math.round(a*100/b):0;}
  function ruleBy(n){return RULES.find(x=>x[0]===n);}
  function setMode(id){
    ["englishLearn","englishPractice","englishDictation","englishTest","englishProgress"].forEach(x=>$(x)?.classList.toggle("hidden",x!==id));
    document.querySelectorAll(".english-tabs .btn").forEach(x=>x.classList.remove("primary"));
    document.querySelectorAll(".english-tabs .btn").forEach(x=>x.classList.add("secondary"));
    const map={englishLearn:"engLearnBtn",englishPractice:"engPracticeBtn",englishDictation:"engDictationBtn",englishTest:"engTestBtn",englishProgress:"engProgressBtn"};
    const b=$(map[id]);if(b){b.classList.remove("secondary");b.classList.add("primary");}
    if(id==="englishPractice")renderPractice();
    if(id==="englishDictation")renderDictation();
    if(id==="englishTest")renderTestStart();
    if(id==="englishProgress")renderProgress();
  }

  function renderLearn(){
    $("englishLearn").innerHTML=`
      <div class="eng-card">
        <b>Training sequence:</b> Hear → Say → Identify → Write → Check → Repeat
      </div>
      <div class="english-rule-grid" style="margin-top:12px">
        ${RULES.map(r=>`<article class="english-rule">
          <div class="ruleNum">SPELLING RULE ${r[0]}</div>
          <h3>${r[1]}</h3>
          <div>${r[2]}</div>
          ${r[3]?`<div class="english-example"><b>Examples:</b> ${r[3]}</div>`:""}
        </article>`).join("")}
      </div>`;
  }

  function renderPractice(){
    const q=QUESTIONS[practiceIndex%QUESTIONS.length];
    $("englishPractice").innerHTML=`
      <div class="eng-card">
        <div class="ruleNum" style="color:var(--brand);font-weight:900">SPALDING RULE ${q.r}</div>
        <div class="eng-q">${q.q}</div>
        <div id="engChoices">${q.c.map((x,i)=>`<button class="eng-choice" data-i="${i}">${x}</button>`).join("")}</div>
        <div id="engFeedback"></div>
      </div>`;
    $("engChoices").querySelectorAll("button").forEach((b,i)=>b.onclick=()=>answerPractice(b,q,i));
  }

  function answerPractice(btn,q,i){
    $("engChoices").querySelectorAll("button").forEach(b=>b.disabled=true);
    state.practice++; state.ruleSeen[q.r]=(state.ruleSeen[q.r]||0)+1;
    if(q.c[i]===q.a){state.correct++;btn.classList.add("correct");}
    else {btn.classList.add("wrong");state.review.push({rule:q.r,answer:q.a,at:Date.now()});}
    save();
    const good=q.c[i]===q.a;
    $("engFeedback").innerHTML=`<div class="eng-feedback">${good?"✅ <b>Correct!</b>":"❌ <b>Try again.</b>"}<br>${good?"":"Correct answer: <b>"+q.a+"</b><br>"}${q.why}</div><button class="btn primary" id="engNextPractice">Next →</button>`;
    $("engNextPractice").onclick=()=>{practiceIndex=(practiceIndex+1)%QUESTIONS.length;renderPractice();};
  }

  const DICT=[["queen",1],["city",2],["gym",3],["happy",6],["hopping",9],["beginning",10],["making",11],["receive",12],["ship",13],["session",14],["miss",17],["day",18],["boxes",20],["babies",24],["Monday",26],["jumped",28],["little",29]];
  function speak(word){try{const u=new SpeechSynthesisUtterance(word);u.rate=.78;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}
  function renderDictation(){
    const [word,rule]=DICT[dictIndex%DICT.length];
    $("englishDictation").innerHTML=`
      <div class="eng-card">
        <div class="ruleNum" style="color:var(--brand);font-weight:900">DICTATION • RULE ${rule}</div>
        <p>Listen carefully. Do not look at the word.</p>
        <button class="btn primary" id="hearWord">🔊 Hear Word</button>
        <div style="margin-top:14px"><input id="dictInput" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type the spelling here"></div>
        <button class="btn primary" id="checkDict">Check</button>
        <div id="dictFeedback"></div>
      </div>`;
    $("hearWord").onclick=()=>speak(word);
    $("checkDict").onclick=()=>{
      const got=$("dictInput").value.trim();
      state.practice++; state.ruleSeen[rule]=(state.ruleSeen[rule]||0)+1;
      if(got.toLowerCase()===word.toLowerCase()){state.correct++;$("dictFeedback").innerHTML=`<div class="eng-feedback">✅ Correct! <b>${word}</b></div>`;}
      else {state.review.push({rule,answer:word,at:Date.now()});$("dictFeedback").innerHTML=`<div class="eng-feedback">❌ Correct spelling: <b>${word}</b><br>Rule ${rule}. Listen and try again.</div>`;}
      save();
      $("checkDict").textContent="Next Word →";
      $("checkDict").onclick=()=>{dictIndex=(dictIndex+1)%DICT.length;renderDictation();};
    };
  }

  function renderTestStart(){
    if(testSet.length && testIndex<testSet.length){renderTestQuestion();return;}
    $("englishTest").innerHTML=`
      <div class="eng-card">
        <h3 style="margin-top:0">📝 Spalding Rules Test</h3>
        <p>10 randomized questions covering the supplied spelling rules.</p>
        <button class="btn primary" id="startEnglishTest">Start Test</button>
      </div>`;
    $("startEnglishTest").onclick=()=>{
      testSet=[...QUESTIONS].sort(()=>Math.random()-.5).slice(0,10);
      testIndex=0;testScore=0;renderTestQuestion();
    };
  }
  function renderTestQuestion(){
    const q=testSet[testIndex];
    $("englishTest").innerHTML=`
      <div class="eng-card">
        <div class="ruleNum" style="color:var(--brand);font-weight:900">QUESTION ${testIndex+1} OF ${testSet.length} • RULE ${q.r}</div>
        <div class="eng-q">${q.q}</div>
        <div id="testChoices">${q.c.map((x,i)=>`<button class="eng-choice" data-i="${i}">${x}</button>`).join("")}</div>
      </div>`;
    $("testChoices").querySelectorAll("button").forEach((b,i)=>b.onclick=()=>answerTest(b,q,i));
  }
  function answerTest(btn,q,i){
    $("testChoices").querySelectorAll("button").forEach(b=>b.disabled=true);
    if(q.c[i]===q.a){testScore++;btn.classList.add("correct");}else{btn.classList.add("wrong");state.review.push({rule:q.r,answer:q.a,at:Date.now()});}
    testIndex++;
    if(testIndex<testSet.length)setTimeout(renderTestQuestion,350);
    else{
      state.tests++;state.testCorrect+=testScore;save();
      $("englishTest").innerHTML=`<div class="eng-card"><h3>🎉 Test Complete</h3><div class="eng-q">${testScore}/${testSet.length}</div><p>Accuracy: <b>${pct(testScore,testSet.length)}%</b></p><button class="btn primary" id="againEnglishTest">Take Again</button></div>`;
      $("againEnglishTest").onclick=()=>{testSet=[];renderTestStart();};
    }
  }

  function renderProgress(){
    const accuracy=pct(state.correct,state.practice);
    const testAccuracy=pct(state.testCorrect,state.tests*10);
    const review=state.review.slice(-20).reverse();
    $("englishProgress").innerHTML=`
      <div class="eng-stat-grid">
        <div class="eng-stat"><b>${state.practice}</b>Practice Attempts</div>
        <div class="eng-stat"><b>${accuracy}%</b>Practice Accuracy</div>
        <div class="eng-stat"><b>${state.tests}</b>Tests</div>
        <div class="eng-stat"><b>${testAccuracy}%</b>Test Accuracy</div>
      </div>
      <div class="eng-card" style="margin-top:12px">
        <h3 style="margin-top:0">🔁 Needs Review</h3>
        ${review.length?review.map(x=>`<div style="padding:8px 0;border-top:1px solid var(--line)"><b>Rule ${x.rule}</b> — ${x.answer}</div>`).join(""):"<div class='muted'>Nothing needs review yet. Great job!</div>"}
      </div>
      <div class="eng-card" style="margin-top:12px">
        <h3 style="margin-top:0">📘 Rules Practiced</h3>
        <div>${RULES.map(r=>`<span style="display:inline-block;margin:4px;padding:6px 9px;border-radius:999px;background:${state.ruleSeen[r[0]]?"#e9f8ef":"#f1f5f9"}">${r[0]}: ${state.ruleSeen[r[0]]||0}</span>`).join("")}</div>
      </div>`;
  }

  $("engLearnBtn").onclick=()=>setMode("englishLearn");
  $("engPracticeBtn").onclick=()=>setMode("englishPractice");
  $("engDictationBtn").onclick=()=>setMode("englishDictation");
  $("engTestBtn").onclick=()=>setMode("englishTest");
  $("engProgressBtn").onclick=()=>setMode("englishProgress");

  renderLearn();
  window.KMT_SHOW_ENGLISH=function(){setMode("englishLearn");$("englishPanel").classList.remove("hidden");$("englishPanel").scrollIntoView({behavior:"smooth"});};
  window.KMT_HIDE_ENGLISH=function(){$("englishPanel").classList.add("hidden");};
})();
