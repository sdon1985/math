"use strict";

/* Kids Math Test — English / Spalding, integrated worksheet workflow. */
(function(){
  const $=id=>document.getElementById(id);
  if(!$('englishPanel')) return;

  const RULES=[
    [1,"Q is followed by U","The letter q is always followed by u.","queen, quick, quiet"],
    [2,"C before E, I, or Y","The letter c before e, i, or y says /s/, but followed by any other letter says /k/.","cent, city, cycle • cat, cot, cut"],
    [3,"G before E, I, or Y","The letter g before e, i, or y MAY say /j/, but followed by any other letter it says /g/. The letters e and i following g do not always make the g say /j/.","page, giant, gym • gate, go, gust • get, girl, give"],
    [4,"Vowels at the end of a syllable","Read and underline a, e, o, and u at the end of a syllable when they say their first sounds.",""],
    [5,"I and Y at the end of a syllable","Read and underline i and y at the end of a syllable only when they say /ī/.",""],
    [6,"Y at the end of an English word","Write y, not i, at the end of an English word.","happy, candy, funny"],
    [9,"1-1-1 rule","When you have a word with one syllable, with one vowel followed by one consonant (hop), double the consonant before adding a vowel suffix.","hop → hopping"],
    [10,"2-1-1 rule","When you have a word with two syllables in which the second syllable is accented and ends in one vowel followed by one consonant (begin), double the consonant before adding a vowel suffix.","begin → beginning"],
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

  const TEST_WORDS=[
    {r:1,p:"Spell the word that follows Rule 1: /kwee-n/",a:"queen",why:"q is followed by u."},
    {r:2,p:"Spell the word: a city",a:"city",why:"c before y can say /s/."},
    {r:3,p:"Spell the word: a place where a person may live — /jym/",a:"gym",why:"g before y may say /j/."},
    {r:6,p:"Spell the word: cheerful — /happee/",a:"happy",why:"Use y, not i, at the end of an English word."},
    {r:9,p:"Spell hop + ing",a:"hopping",why:"The 1-1-1 rule doubles the final consonant."},
    {r:10,p:"Spell begin + ing",a:"beginning",why:"The 2-1-1 rule doubles the consonant in the accented second syllable."},
    {r:11,p:"Spell make + ing",a:"making",why:"Drop final silent e before a vowel suffix."},
    {r:12,p:"Spell the word meaning to get or obtain",a:"receive",why:"Write ei after c."},
    {r:17,p:"Spell the word: to fail to hear — /miss/",a:"miss",why:"s is often doubled after a single vowel at the end of a one-syllable word."},
    {r:18,p:"Spell the word: a day of the week — /day/",a:"day",why:"ay says /ā/ at the end of a word."},
    {r:20,p:"Spell the plural of box",a:"boxes",why:"s never follows x."},
    {r:24,p:"Spell baby + es",a:"babies",why:"Change y to i before the ending, unless the ending is -ing."},
    {r:26,p:"Spell the name of the day after Sunday",a:"Monday",why:"Days and other proper nouns are capitalized."},
    {r:28,p:"Spell the past tense of jump",a:"jumped",why:"Here -ed says /t/."},
    {r:29,p:"Spell the word: /lit-ul/",a:"little",why:"Words are usually divided between double consonants."}
  ];

  const PHONOGRAMS=[
    [1,"a","ă, ā, ah","at • ape • all"],[2,"c","k, s","cat • cent"],[3,"d","d","dog"],[4,"f","f","fish"],[5,"g","g, j","go • gem"],[6,"o","ŏ, ō, oo","odd • open • moon"],[7,"s","s, z","sun • is"],[8,"qu","kw","quack"],[9,"b","b","bat"],[10,"e","ĕ, ē","egg • eagle"],[11,"h","h","hat"],[12,"i","ĭ, ī","it • ice"],[13,"j","j","jam"],[14,"k","k","kite"],[15,"l","l","leg"],[16,"m","m","man"],[17,"n","n","net"],[18,"p","p","pig"],[19,"r","r","red"],[20,"t","t","top"],[21,"u","ŭ, ū, oo","up • use • rule"],[22,"v","v","van"],[23,"w","w","win"],[24,"x","ks","box"],[25,"y","y, ĭ, ī","yes • gym • my"],[26,"z","z","zoo"],
    [27,"sh","sh","ship • fish"],[28,"ee","ē","see • green"],[29,"th","th, th","thin • this"],[30,"ow","ow, ō","cow • snow"],[31,"ou","ow, ō, oo, ŭ","out • soul • soup • country"],[32,"oo","oo, ŭ","moon • book"],[33,"ch","ch, k, sh","chip • school • machine"],[34,"ar","ar","car"],[35,"ay","ā — used at the end of a word","day • play"],[36,"ai","ā — not used at the end of a word","rain • train"],[37,"oy","oy — used at the end of a word","boy • enjoy"],[38,"oi","oi — not used at the end of a word","coin • point"],[39,"er","er — as in her","her • fern"],[40,"ir","er — as in first","first • bird"],[41,"ur","er — as in nurse","nurse • turn"],[42,"wor","er — as in works","work • world"],[43,"ear","er — as in early","early • learn"],[44,"ng","ng","sing • ring"],[45,"ea","ē, ĕ, ā","eat • head • great"],[46,"aw","aw — used at the end","saw • draw"],[47,"au","au — not used at the end","haul • August"],[48,"or","or","for • storm"],[49,"ck","k — after a single vowel","back • duck"],[50,"wh","wh","when • what"],[51,"ed","ĕd, d, t","handed • lived • jumped"],[52,"ew","oo, ū — used at the end","few • new"],[53,"ui","oo, ū — not used at the end","fruit • suit"],[54,"oa","ō","boat • road"],
    [55,"gu","g","guess • guide"],[56,"ph","f","phone • graph"],[57,"ough","ō, oo, ŭf, ŏf, aw, ow","though • through • enough • cough • bought • bough"],[58,"oe","ō","toe • goes"],[59,"ey","ā, ē, ĭ","they • key • valley"],[60,"igh","ī","night • light"],[61,"kn","n — beginning only","knee • know"],[62,"gn","n — beginning and end","gnaw • sign"],[63,"wr","r — two-letter phonogram","write • wrong"],[64,"ie","ē, ī, ĭ","field • pie • friend"],[65,"dge","j — after a single vowel","badge • bridge"],[66,"ei","ē, ā, ĭ","ceiling • vein • foreign"],[67,"eigh","ā","eight • weigh"],[68,"ti","sh — in syllables after the first","nation"],[69,"si","sh, zh","session • vision"],[70,"ci","sh","special • social"]
  ];
  const PHONOGRAM_PRESETS=[[1,26,"1–26 (School Week 1)"],[27,54,"27–54 (School Week 2)"],[55,70,"55–70"],[1,70,"All 70"]];
  const PHONOGRAM_WORDS={1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[],13:[],14:[],15:[],16:[],17:[],18:[],19:[],20:[],21:[],22:[],23:[],24:[],25:[],26:[],27:[],28:[],29:[],30:[],31:[],32:[],33:[],34:[],35:[],36:[],37:[],38:[],39:[],40:[],41:[],42:[],43:[],44:[],45:[],46:[],47:[],48:[],49:[],50:[],51:[],52:[],53:[],54:[],55:[],56:[],57:[],58:[],59:[],60:[],61:[],62:[],63:[],64:[],65:[],66:[],67:[],68:[],69:[],70:[]};
  const PG_WORDS=[
['cat','map','bag','hat','can','jam','rabbit','plant','stamp','black'],
['queen','quick','quiet','quit','quiz','squid','quest','quack','square','squeeze'],
['ship','shop','shell','fish','brush','shout','shine','finish','dish','wish'],
['rain','train','mail','tail','paint','chain','brain','plain','wait','sail'],
['boy','toy','joy','enjoy','royal','annoy','destroy','loyal','employ','oyster'],
['coin','join','oil','point','voice','choice','boil','noise','soil','toilet'],
['night','light','right','bright','high','sight','fight','tight','might','flight'],
['write','wrong','wrap','wrist','wreck','wrote','writer','wrench','wring','wrapped'],
['special','social','official','precious','delicious','magician','musician','ancient','racial','facial'],
['nation','station','motion','patient','action','attention','question','partial','mention','vacation']
];
  // Use the existing phonogram examples as the authoritative base and add curated variety for the high-use patterns above.
  PHONOGRAMS.forEach(p=>{PHONOGRAM_WORDS[p[0]]=p[3].split(/\s*[•,]\s*/).filter(Boolean);});
  [[1,PG_WORDS[0]],[8,PG_WORDS[1]],[27,PG_WORDS[2]],[36,PG_WORDS[3]],[37,PG_WORDS[4]],[38,PG_WORDS[5]],[60,PG_WORDS[6]],[63,PG_WORDS[7]],[68,PG_WORDS[9]],[70,PG_WORDS[8]]].forEach(([id,w])=>PHONOGRAM_WORDS[id]=w);
  const pgSession={mode:'',items:[],index:0};
  const pgShuffle=a=>{const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;};
  const pgStart=(mode,count)=>{pgSession.mode=mode;pgSession.index=0;const ids=pgShuffle(PHONOGRAMS.map(p=>p[0]));pgSession.items=pgShuffle(ids.flatMap(id=>pgShuffle(PHONOGRAM_WORDS[id]||[]).slice(0,3).map(word=>({id,word})))).slice(0,count);};
  const pgCurrent=()=>pgSession.items[pgSession.index];

  const STORE='kmtEnglishSpaldingProgress';
  const ACTIVE='kmtEnglishActiveSession';
  let state=JSON.parse(localStorage.getItem(STORE)||'null')||{practice:0,correct:0,tests:0,testCorrect:0,review:[],ruleSeen:{},phonogramsLearned:{}};
  let engCategory='spelling',practiceIndex=0,dictIndex=0,testSet=[],testIndex=0,testStarted=false,testDone=false,testScore=0,testBegin=0,testLeft=240,testTimer=null,testMode='pencil',testSubmission=null,pencilTool='write';
  const activeKey=()=>ACTIVE+'_'+engCategory;

  function save(){localStorage.setItem(STORE,JSON.stringify(state));}
  function pct(a,b){return b?Math.round(a*100/b):0;}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function ruleBy(n){return RULES.find(x=>x[0]===n);}
  function setMode(id){
    ['englishLearn','englishPractice','englishDictation','englishTest','englishProgress'].forEach(x=>$(x)?.classList.toggle('hidden',x!==id));
    document.querySelectorAll('.english-tabs .btn').forEach(x=>{x.classList.remove('primary');x.classList.add('secondary');});
    const map={englishLearn:'engLearnBtn',englishPractice:'engPracticeBtn',englishDictation:'engDictationBtn',englishTest:'engTestBtn',englishProgress:'engProgressBtn'};
    const b=$(map[id]);if(b){b.classList.remove('secondary');b.classList.add('primary');}
    if(id==='englishPractice')renderPractice();
    if(id==='englishDictation')renderDictation();
    if(id==='englishTest')renderTestStart();
    if(id==='englishProgress')renderProgress();
  }
  let phonRangeStart=1,phonRangeEnd=26,phonIndex=0,phonTool='write';
  function selectedPhonograms(){return PHONOGRAMS.filter(p=>p[0]>=phonRangeStart&&p[0]<=phonRangeEnd);}
  function phonogramSpeak(p){
    try{
      if(!('speechSynthesis' in window))return;
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(p[1]+'. Sounds: '+p[2]+'.');
      u.rate=.72;speechSynthesis.speak(u);
    }catch(e){}
  }
  function renderPhonogramTrainer(){
    const list=selectedPhonograms();
    if(phonIndex>=list.length)phonIndex=0;
    const p=list[phonIndex];
    const learned=!!state.phonogramsLearned[p[0]];
    const grid=list.map((x,i)=>'<button type="button" class="phon-card '+(i===phonIndex?'selected ':'')+(state.phonogramsLearned[x[0]]?'learned':'')+'" data-phon-index="'+i+'"><span class="phon-num">'+x[0]+'</span><strong>'+esc(x[1])+'</strong><small>'+esc(x[2])+'</small></button>').join('');
    $('phonogramRangeSummary').textContent='Showing phonograms '+phonRangeStart+'–'+phonRangeEnd+' ('+list.length+' phonograms)';
    $('phonogramGrid').innerHTML=grid;
    $('phonogramCurrent').innerHTML='<div class="phon-big">'+esc(p[1])+'</div><div class="phon-sounds"><b>Sounds:</b> '+esc(p[2])+'</div><div class="phon-examples"><b>Examples:</b> '+esc(p[3])+'</div><div class="phon-actions"><button type="button" class="btn primary" id="phonHear">🔊 Hear Sounds</button><button type="button" class="btn secondary" id="phonPrev">← Previous</button><button type="button" class="btn secondary" id="phonNext">Next →</button><button type="button" class="btn '+(learned?'primary':'secondary')+'" id="phonLearned">'+(learned?'✓ Learned':'Mark Learned')+'</button></div><div class="phon-write"><div class="muted">✏️ Write the phonogram</div><canvas id="phonPad" width="620" height="150"></canvas><div class="phon-tools"><button type="button" class="btn primary" id="phonWrite">🖊️ Write</button><button type="button" class="btn secondary" id="phonErase">🧽 Erase</button><span id="phonMode" class="muted">Write mode</span></div></div>';
    $('phonHear').onclick=()=>phonogramSpeak(p);
    $('phonPrev').onclick=()=>{phonIndex=(phonIndex-1+list.length)%list.length;renderPhonogramTrainer();};
    $('phonNext').onclick=()=>{phonIndex=(phonIndex+1)%list.length;renderPhonogramTrainer();};
    $('phonLearned').onclick=()=>{if(state.phonogramsLearned[p[0]])delete state.phonogramsLearned[p[0]];else state.phonogramsLearned[p[0]]=Date.now();save();renderPhonogramTrainer();};
    $('phonogramGrid').querySelectorAll('[data-phon-index]').forEach(b=>b.onclick=()=>{phonIndex=Number(b.dataset.phonIndex)||0;renderPhonogramTrainer();});
    setupPhonPad();
  }
  function setupPhonPad(){
    const c=$('phonPad');if(!c)return;const x=c.getContext('2d'),scale=devicePixelRatio||1;x.setTransform(scale,0,0,scale,0,0);x.lineWidth=3;x.lineCap='round';let drawing=false;
    const point=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width/scale,y:(e.clientY-r.top)*c.height/r.height/scale}};
    c.onpointerdown=e=>{if(phonTool==='erase')return;e.preventDefault();c.setPointerCapture(e.pointerId);drawing=true;const q=point(e);x.beginPath();x.moveTo(q.x,q.y);};
    c.onpointermove=e=>{if(!drawing)return;e.preventDefault();const q=point(e);x.lineTo(q.x,q.y);x.stroke();};
    c.onpointerup=()=>drawing=false;c.onpointercancel=()=>drawing=false;
    c.addEventListener('pointerdown',e=>{if(phonTool==='erase'){e.preventDefault();e.stopPropagation();x.clearRect(0,0,c.width,c.height);setPhonTool('write');}},true);
    $('phonWrite').onclick=()=>setPhonTool('write');$('phonErase').onclick=()=>setPhonTool('erase');
  }
  function setPhonTool(m){phonTool=m;if($('phonWrite'))$('phonWrite').className=m==='write'?'btn primary':'btn secondary';if($('phonErase'))$('phonErase').className=m==='erase'?'btn':'btn secondary';if($('phonMode'))$('phonMode').textContent=m==='erase'?'Erase mode — tap writing to clear':'Write mode';}
  function setPhonRange(a,b){phonRangeStart=Math.max(1,Math.min(70,a));phonRangeEnd=Math.max(phonRangeStart,Math.min(70,b));phonIndex=0;document.querySelectorAll('.phon-range-btn').forEach(x=>x.classList.remove('primary'));const match=document.querySelector('[data-range="'+phonRangeStart+'-'+phonRangeEnd+'"]');if(match)match.classList.add('primary');renderPhonogramTrainer();}
  function renderLearn(){
    if(engCategory==='phonograms'){
      $('englishLearn').innerHTML='<div class="eng-card"><h3>🔤 Phonogram Learning</h3><p class="muted">Learn the 70 Spalding phonograms independently from spelling rules.</p><div class="phon-range"><b>Choose a range:</b><div class="phon-range-buttons">'+PHONOGRAM_PRESETS.map(x=>'<button type="button" class="btn '+(x[0]===1&&x[1]===26?'primary':'secondary')+' phon-range-btn" data-range="'+x[0]+'-'+x[1]+'">'+esc(x[2])+'</button>').join('')+'<label class="phon-custom">Custom <input id="phonStart" type="number" min="1" max="70" value="1"><span>to</span><input id="phonEnd" type="number" min="1" max="70" value="70"><button type="button" class="btn secondary" id="phonApply">Apply</button></label></div></div><div id="phonogramRangeSummary" class="phon-summary"></div><div id="phonogramCurrent"></div><div id="phonogramGrid" class="phon-grid"></div></div>';
      document.querySelectorAll('.phon-range-btn').forEach(b=>b.onclick=()=>{const [a,z]=b.dataset.range.split('-').map(Number);setPhonRange(a,z);});
      $('phonApply').onclick=()=>setPhonRange(Number($('phonStart').value)||1,Number($('phonEnd').value)||70);
      renderPhonogramTrainer(); return;
    }
    $('englishLearn').innerHTML='<div class="eng-card" style="margin-top:12px"><b>Spalding Spelling Rules</b><div class="muted" style="margin-top:5px">Training sequence: Hear → Say → Identify → Write → Check → Repeat</div><div class="english-rule-grid" style="margin-top:12px">'+RULES.map(r=>'<article class="english-rule"><div class="ruleNum">SPELLING RULE '+r[0]+'</div><h3>'+esc(r[1])+'</h3><div>'+esc(r[2])+'</div>'+(r[3]?'<div class="english-example"><b>Examples:</b> '+esc(r[3])+'</div>':'')+'</article>').join('')+'</div></div>';
    document.querySelectorAll('.phon-range-btn').forEach(b=>b.onclick=()=>{const [a,z]=b.dataset.range.split('-').map(Number);setPhonRange(a,z);});
    $('phonApply').onclick=()=>setPhonRange(Number($('phonStart').value)||1,Number($('phonEnd').value)||70);
    renderPhonogramTrainer();
  }
  function renderPractice(){
    if(engCategory==='phonograms'){
      if(pgSession.mode!=='practice'||!pgSession.items.length||practiceIndex===0||practiceIndex>=pgSession.items.length){pgStart('practice',12);practiceIndex=0;}
      const item=pgCurrent(),p=PHONOGRAMS[item.id-1], bank=PHONOGRAM_WORDS[item.id]||[];
      const choices=pgShuffle([item.word,...pgShuffle(Object.values(PHONOGRAM_WORDS).flat().filter(w=>w!==item.word)).slice(0,4)]);
      $('englishPractice').innerHTML='<div class="eng-card"><div class="ruleNum">PHONOGRAM PRACTICE — '+(practiceIndex+1)+' OF '+pgSession.items.length+'</div><div class="eng-q">🔊 Listen to the sound, then choose a word that contains the phonogram.</div><button class="btn primary" id="pgHearPractice">🔊 Hear Sound</button><div class="phon-practice-sound"><b>Phonogram:</b> '+esc(p[1])+' &nbsp; <b>Sound:</b> '+esc(p[2])+'</div><div id="engChoices">'+choices.map(x=>'<button class="eng-choice" data-word="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div><div class="phon-example-bank"><b>Example bank:</b> '+bank.map(esc).join(' • ')+'</div><div id="engFeedback"></div><button class="btn primary" id="engNextPractice">Next →</button></div>';
      $('pgHearPractice').onclick=()=>speak('Phonogram '+p[1]+'. Sound: '+p[2]+'.');
      $('engChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{const good=bank.includes(b.dataset.word);$('engChoices').querySelectorAll('button').forEach(x=>x.disabled=true);state.practice++;if(good){state.correct++;b.classList.add('correct');}else{b.classList.add('wrong');state.review.push({phonogram:item.id,answer:item.word,at:Date.now()});}save();$('engFeedback').innerHTML='<div class="eng-feedback">'+(good?'✅ Correct!':'❌ Choose a word that contains this phonogram.')+'</div>';});
      $('engNextPractice').onclick=()=>{practiceIndex++;pgSession.index++;if(pgSession.index>=pgSession.items.length){pgStart('practice',12);practiceIndex=0;}renderPractice();};
      return;
    }
    const q=[
      {r:1,q:'Which spelling is correct?',c:['qeen','queen','kwen'],a:'queen',why:'Rule 1: q is always followed by u.'},
      {r:2,q:'Which word uses c to say /s/?',c:['cat','city','cup'],a:'city',why:'Rule 2: c before e, i, or y says /s/.'},
      {r:3,q:'Which word has g saying /j/?',c:['gate','gym','gust'],a:'gym',why:'Rule 3: g before e, i, or y MAY say /j/.'},
      {r:6,q:'Choose the correct spelling.',c:['happi','happy','happe'],a:'happy',why:'Rule 6: write y, not i, at the end of an English word.'},
      {r:9,q:'What is the correct spelling?',c:['hoping','hopping','hoppinng'],a:'hopping',why:'Rule 9: double the consonant before -ing.'},
      {r:10,q:'Choose the correct spelling.',c:['begining','beginning','beggining'],a:'beginning',why:'Rule 10: begin follows the 2-1-1 pattern.'},
      {r:11,q:"Make 'make' + 'ing'.",c:['makeing','making','makking'],a:'making',why:'Rule 11: drop final silent e.'},
      {r:12,q:'Which spelling is correct?',c:['receive','recieve','receeve'],a:'receive',why:'Rule 12: write ei after c.'},
      {r:13,q:'Which word uses sh at the beginning?',c:['ship','sip','chip'],a:'ship',why:'Rule 13: sh can be used at the beginning.'},
      {r:17,q:'Which spelling is correct?',c:['mis','miss','mizz'],a:'miss',why:'Rule 17: s is often doubled.'},
      {r:18,q:'Which word ends with ay saying /ā/?',c:['day','die','dee'],a:'day',why:'Rule 18: ay says /ā/ at the end.'},
      {r:20,q:'Which spelling follows Rule 20?',c:['boxs','boxes','boxses'],a:'boxes',why:'Rule 20: s never follows x.'},
      {r:24,q:'What is the correct spelling of baby + es?',c:['babyes','babies','babys'],a:'babies',why:'Rule 24: change y to i before the ending, unless -ing.'},
      {r:26,q:'Which is correctly capitalized?',c:['monday','Monday','MONDAY'],a:'Monday',why:'Rule 26: proper nouns are capitalized.'},
      {r:28,q:'Which word has -ed saying /t/?',c:['jumped','lived','handed'],a:'jumped',why:'Rule 28: after an unvoiced consonant sound, -ed says /t/.'},
      {r:29,q:'Which spelling follows the double-consonant rule?',c:['litle','little','littel'],a:'little',why:'Rule 29: words are usually divided between double consonants.'}
    ][practiceIndex%16];
    $('englishPractice').innerHTML='<div class="eng-card"><div class="ruleNum" style="color:var(--brand);font-weight:900">SPALDING RULE '+q.r+'</div><div class="eng-q">'+esc(q.q)+'</div><div id="engChoices">'+q.c.map((x,i)=>'<button class="eng-choice" data-i="'+i+'">'+esc(x)+'</button>').join('')+'</div><div id="engFeedback"></div></div>';
    $('engChoices').querySelectorAll('button').forEach((b,i)=>b.onclick=()=>answerPractice(b,q,i));
  }
  function answerPractice(btn,q,i){
    $('engChoices').querySelectorAll('button').forEach(b=>b.disabled=true);state.practice++;state.ruleSeen[q.r]=(state.ruleSeen[q.r]||0)+1;
    const good=q.c[i]===q.a;if(good){state.correct++;btn.classList.add('correct');}else{btn.classList.add('wrong');state.review.push({rule:q.r,answer:q.a,at:Date.now()});}
    save();$('engFeedback').innerHTML='<div class="eng-feedback">'+(good?'✅ <b>Correct!</b>':'❌ <b>Try again.</b>')+'<br>'+(good?'':'Correct answer: <b>'+esc(q.a)+'</b><br>')+esc(q.why)+'</div><button class="btn primary" id="engNextPractice">Next →</button>';$('engNextPractice').onclick=()=>{practiceIndex++;renderPractice();};
  }
  function renderDictation(){
    const isPh=engCategory==='phonograms';
    if(isPh){
      if(pgSession.mode!=='dictation'||!pgSession.items.length||dictIndex===0||dictIndex>=pgSession.items.length){pgStart('dictation',12);dictIndex=0;}
      const item=pgCurrent(),p=PHONOGRAMS[item.id-1];
      $('englishDictation').innerHTML='<div class="eng-card"><div class="ruleNum">PHONOGRAM DICTATION — '+(dictIndex+1)+' OF '+pgSession.items.length+'</div><div class="eng-q">🎧 <b>Teacher says the phonogram sound.</b> Write a whole word that contains that sound.</div><button class="btn primary" id="speakDictation">🔊 Hear Teacher Sound</button><div class="phon-teacher-note">Target sound: <b>'+esc(p[2])+'</b><br><span class="muted">Think of a word. Then write the whole word with your Apple Pencil.</span></div><div class="pencil-label">✏️ Pencil Writing — Whole Word</div><div class="eng-writing-wrap"><canvas id="dictPad" class="eng-pad" width="700" height="210"></canvas><div class="eng-pencil-tools"><button class="btn primary" id="dictWriteBtn">🖊️ Write</button><button class="btn secondary" id="dictEraseBtn">🧽 Erase</button><span id="dictModeText" class="muted">Write mode — Apple Pencil</span></div></div><div id="dictFeedback"></div><button class="btn primary" id="dictCheck">✓ Check Writing</button> <button class="btn secondary" id="dictNext">Next Word →</button></div>';
      $('speakDictation').onclick=()=>speak('Listen. Phonogram '+p[1]+'. Sound: '+p[2]+'. Now write a whole word containing that sound.');setupDictationPad();
      $('dictCheck').onclick=()=>{const filled=!canvasBlank($('dictPad'));state.practice++;if(filled)state.correct++;else state.review.push({phonogram:item.id,answer:item.word,at:Date.now()});save();$('dictFeedback').innerHTML='<div class="eng-feedback">'+(filled?'✅ Writing recorded for Parent/Admin review.':'⚠️ Please write the whole word first.')+'<br><b>Expected example:</b> '+esc(item.word)+'</div>';};
      $('dictNext').onclick=()=>{dictIndex++;pgSession.index++;if(pgSession.index>=pgSession.items.length){pgStart('dictation',12);dictIndex=0;}renderDictation();};return;
    }
    const item=TEST_WORDS[dictIndex%TEST_WORDS.length];
    $('englishDictation').innerHTML='<div class="eng-card"><div class="ruleNum">SPALDING RULE '+item.r+'</div><div class="eng-q">🔊 Listen, then spell the word.</div><button class="btn primary" id="speakDictation">🔊 Hear Word</button><div class="pencil-label">✏️ Pencil Writing</div><div class="eng-writing-wrap"><canvas id="dictPad" class="eng-pad" width="700" height="210"></canvas><div class="eng-pencil-tools"><button class="btn primary" id="dictWriteBtn">🖊️ Write</button><button class="btn secondary" id="dictEraseBtn">🧽 Erase</button><span id="dictModeText" class="muted">Write mode — Apple Pencil</span></div></div><input id="dictInput" class="eng-input" autocapitalize="none" autocomplete="off" spellcheck="false" placeholder="Or type the spelling here"><div id="dictFeedback"></div><button class="btn primary" id="dictCheck">Check</button> <button class="btn secondary" id="dictNext">Next</button></div>';
    $('speakDictation').onclick=()=>speak(item.a);setupDictationPad();
    $('dictCheck').onclick=()=>{const v=$('dictInput').value.trim(),filled=v.length||!canvasBlank($('dictPad')),good=v.toLowerCase()===item.a.toLowerCase();if(filled)state.practice++;if(good)state.correct++;else if(filled)state.review.push({rule:item.r,answer:item.a,at:Date.now()});save();$('dictFeedback').innerHTML='<div class="eng-feedback">'+(good?'✅ Correct!':filled?'❌ Correct spelling: <b>'+esc(item.a)+'</b>':'⚠️ Write or type an answer first.')+'<br>'+esc(item.why)+'</div>';};$('dictNext').onclick=()=>{dictIndex++;renderDictation();};
  }
  function setupDictationPad(){
    const c=$('dictPad'),x=c.getContext('2d'),scale=devicePixelRatio||1;x.setTransform(scale,0,0,scale,0,0);x.lineWidth=3;x.lineCap='round';let drawing=false,tool='write';
    const point=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width/scale,y:(e.clientY-r.top)*c.height/r.height/scale}};
    c.onpointerdown=e=>{if(tool==='erase'){e.preventDefault();x.clearRect(0,0,c.width,c.height);tool='write';setDictTool('write');return;}e.preventDefault();c.setPointerCapture(e.pointerId);drawing=true;const p=point(e);x.beginPath();x.moveTo(p.x,p.y);};
    c.onpointermove=e=>{if(!drawing)return;e.preventDefault();const p=point(e);x.lineTo(p.x,p.y);x.stroke();};c.onpointerup=()=>drawing=false;c.onpointercancel=()=>drawing=false;
    $('dictWriteBtn').onclick=()=>{tool='write';setDictTool('write')};$('dictEraseBtn').onclick=()=>{tool='erase';setDictTool('erase')};
  }
  function setDictTool(m){const w=$('dictWriteBtn'),e=$('dictEraseBtn');if(w)w.className=m==='write'?'btn primary':'btn secondary';if(e)e.className=m==='erase'?'btn':'btn secondary';if($('dictModeText'))$('dictModeText').textContent=m==='erase'?'Erase mode — tap writing to clear it':'Write mode — Apple Pencil';}

  function speak(text){try{if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.78;speechSynthesis.speak(u);}}catch(e){}}

  function renderTestStart(){
    const active=testStarted&&!testDone;
    if(engCategory==='phonograms'){ renderPhonogramTestStart(); return; }
    if(active){renderTestQuestion();return;}
    $('englishTest').innerHTML='<div class="eng-card"><h3>📝 Spalding Test</h3><p>Submit the completed test for <b>Parent/Admin Review</b>. The reviewer determines Correct, Wrong, or Not Answered.</p><div class="eng-test-controls"><label>Answer Method <select id="engAnswerMode"><option value="pencil">✏️ Apple Pencil</option><option value="keyboard">⌨️ Keyboard</option></select></label><label>Timer <select id="engMinutes"><option value="4">4 minutes</option><option value="5">5 minutes</option></select></label></div><button class="btn primary" id="startEnglishTest">▶ Start Test</button>'+(hasSubmittedReview()?'<button class="btn secondary" id="englishParentReviewBtn">👨‍👩‍👧 Parent Review</button>':'')+'</div>';
    $('startEnglishTest').onclick=startEnglishTest;
    if($('englishParentReviewBtn'))$('englishParentReviewBtn').onclick=()=>openParentReview();
  }
  function renderPhonogramTestStart(){
    const active=testStarted&&!testDone;if(active){renderTestQuestion();return;}
    $('englishTest').innerHTML='<div class="eng-card"><h3>🔤 Phonogram Test</h3><p>Test only phonograms 1–70. This is completely separate from the Spelling Test.</p><div class="eng-test-controls"><label>Answer Method <select id="engAnswerMode"><option value="pencil">✏️ Apple Pencil</option><option value="keyboard">⌨️ Keyboard</option></select></label><label>Timer <select id="engMinutes"><option value="4">4 minutes</option><option value="5">5 minutes</option></select></label></div><button class="btn primary" id="startEnglishTest">▶ Start Phonogram Test</button></div>';
    $('startEnglishTest').onclick=startEnglishTest;
  }
  function pgMakeItemsForTest(){pgStart('test',10);return pgSession.items.map(item=>{const p=PHONOGRAMS[item.id-1];return {r:item.id,p:'Teacher says the sound '+p[2]+'. Write a whole word containing that sound.',a:item.word,why:'Phonogram '+p[1]+' — '+p[2],phonogram:p[1],phonogramId:item.id};});}
  function startEnglishTest(){
    if(testStarted)return;testMode=$('engAnswerMode').value;testSet=(engCategory==='phonograms'?pgMakeItemsForTest():[...TEST_WORDS].sort(()=>Math.random()-.5).slice(0,10));testIndex=0;testScore=0;testDone=false;testStarted=true;testBegin=Date.now();testLeft=(+$('engMinutes').value||4)*60;testSubmission=null;renderTestQuestion();persistActive();startEnglishTimer();
  }
  function startEnglishTimer(){clearInterval(testTimer);testTimer=setInterval(()=>{testLeft=Math.max(0,Math.ceil(((testBegin+(+$('engMinutes')?.value||4)*60000)-Date.now())/1000));updateEnglishTimer();persistActive();if(testLeft<=0){clearInterval(testTimer);testTimer=null;submitEnglishTest(true);}},250);}
  function updateEnglishTimer(){const x=$('engTestTimer');if(x){x.textContent=Math.floor(testLeft/60)+':'+String(testLeft%60).padStart(2,'0');x.classList.toggle('warn',testLeft<=30);}}
  function renderTestQuestion(){
    if(testIndex>=testSet.length){submitEnglishTest(false);return;}
    const q=testSet[testIndex];
    $('englishTest').innerHTML='<div class="eng-card"><div class="eng-test-top"><b>Question '+(testIndex+1)+' of '+testSet.length+'</b><span id="engTestTimer" class="timer">'+Math.floor(testLeft/60)+':'+String(testLeft%60).padStart(2,'0')+'</span></div><div class="ruleNum">'+(engCategory==='phonograms'?'PHONOGRAM '+q.r:'SPALDING RULE '+q.r)+'</div><div class="eng-q">'+esc(q.p)+'</div>'+(engCategory==='phonograms'?'<button class="btn primary" id="engHearPhonTest">🔊 Hear Teacher Sound</button><div class="phon-teacher-note">Write a whole word containing the sound. The answer is not shown until review.</div>':'')+(testMode==='pencil'?'<div class="eng-writing-wrap"><canvas id="engPad" class="eng-pad" width="700" height="210"></canvas><div class="eng-pencil-tools"><button class="btn primary" id="engWriteBtn">🖊️ Write</button><button class="btn secondary" id="engEraseBtn">🧽 Erase</button><span id="engModeText" class="muted">Write mode — Apple Pencil</span></div></div>':'<input id="engAnswerInput" class="eng-answer-input" autocapitalize="none" autocomplete="off" spellcheck="false" placeholder="Type your answer">')+'<div class="eng-test-actions"><button class="btn secondary" id="engNextBtn">'+(testIndex===testSet.length-1?'Finish':'Next →')+'</button><button class="btn primary" id="engSubmitBtn">✓ Submit Test</button></div></div>';
    if(testMode==='pencil')setupEnglishPad();else $('engAnswerInput').addEventListener('input',persistActive);
    if(engCategory==='phonograms' && $('engHearPhonTest')) $('engHearPhonTest').onclick=()=>speak('Listen. Phonogram '+q.phonogram+'. Sound: '+q.why.split(' — ')[1]+'. Now write a whole word containing that sound.');
    $('engNextBtn').onclick=()=>{captureEnglishAnswer();testIndex++;renderTestQuestion();persistActive();};
    $('engSubmitBtn').onclick=()=>{if(confirm('Submit the English test now?'))submitEnglishTest(false);};
    updateEnglishTimer();
  }
  function setupEnglishPad(){
    const c=$('engPad'),x=c.getContext('2d'),scale=devicePixelRatio||1;x.setTransform(scale,0,0,scale,0,0);x.lineWidth=3;x.lineCap='round';let drawing=false;
    const point=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width/scale,y:(e.clientY-r.top)*c.height/r.height/scale}};
    c.onpointerdown=e=>{if(pencilTool==='erase'||!testStarted)return;e.preventDefault();c.setPointerCapture(e.pointerId);drawing=true;const p=point(e);x.beginPath();x.moveTo(p.x,p.y);};
    c.onpointermove=e=>{if(!drawing)return;e.preventDefault();const p=point(e);x.lineTo(p.x,p.y);x.stroke();};
    c.onpointerup=()=>{drawing=false;persistActive();};c.onpointercancel=()=>drawing=false;
    c.addEventListener('pointerdown',e=>{if(testStarted&&pencilTool==='erase'){e.preventDefault();e.stopPropagation();x.clearRect(0,0,c.width,c.height);setEnglishTool('write');persistActive();}},true);
    $('engWriteBtn').onclick=()=>setEnglishTool('write');$('engEraseBtn').onclick=()=>setEnglishTool('erase');
  }
  function setEnglishTool(m){pencilTool=m;if($('engWriteBtn'))$('engWriteBtn').className=m==='write'?'btn primary':'btn secondary';if($('engEraseBtn'))$('engEraseBtn').className=m==='erase'?'btn':'btn secondary';if($('engModeText'))$('engModeText').textContent=m==='erase'?'Erase mode — tap the answer to clear it':'Write mode — Apple Pencil';}
  function canvasBlank(c){if(!c)return true;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>20&&(d[i]<245||d[i+1]<245||d[i+2]<245))n++;return n<30;}
  function captureEnglishAnswer(){
    if(!testSubmission)testSubmission={id:'eng_'+Date.now(),answers:[],userId:currentUser?.id||'',userName:currentUser?.name||'',subject:'english',operation:engCategory==='phonograms'?'English - Phonograms':'English - Spalding',range:engCategory==='phonograms'?'Phonograms 1–70':'Rules 1–6, 9–29',total:testSet.length,elapsed:Math.max(0,Math.round((Date.now()-testBegin)/1000)),created:Date.now()};
    const q=testSet[testIndex],old=testSubmission.answers.find(a=>a.i===testIndex);
    let item=old||{i:testIndex,rule:q.r,problem:q.p,ans:q.a,ocr:'',filled:false,status:'not_answered',image:''};
    if(testMode==='pencil'){const c=$('engPad');if(c){item.filled=!canvasBlank(c);item.image=item.filled?c.toDataURL('image/png'):'';}}
    else{const v=$('engAnswerInput')?.value.trim()||'';item.filled=!!v;item.ocr=v;}
    item.status=item.filled?'pending':'not_answered';
    if(!old)testSubmission.answers.push(item);return item;
  }
  function persistActive(){
    if(!testStarted||testDone||!currentUser)return;
    captureEnglishAnswer();
    const payload={version:1,userId:currentUser.id,userName:currentUser.name,startedAt:testBegin,expiresAt:testBegin+testLeft*1000,mode:testMode,testSet,testIndex,testSubmission,savedAt:Date.now()};
    try{localStorage.setItem(activeKey(),JSON.stringify(payload));}catch(e){}
  }
  function restoreActive(){
    if(!currentUser)return;let raw=null;try{raw=localStorage.getItem(activeKey())}catch(e){}if(!raw)return;let s;try{s=JSON.parse(raw)}catch(e){localStorage.removeItem(activeKey());return;}if(s.userId!==currentUser.id||!Array.isArray(s.testSet)||!s.testSet.length)return;
    if(Number(s.expiresAt)<=Date.now()){localStorage.removeItem(activeKey());return;}
    testMode=s.mode||'pencil';testSet=s.testSet;testIndex=Number(s.testIndex||0);testSubmission=s.testSubmission||null;testStarted=true;testDone=false;testBegin=Number(s.startedAt||Date.now());testLeft=Math.max(0,Math.ceil((Number(s.expiresAt)-Date.now())/1000));renderTestQuestion();startEnglishTimer();
  }
  async function submitEnglishTest(auto){
    if(testDone)return;captureEnglishAnswer();testDone=true;testStarted=false;clearInterval(testTimer);testTimer=null;localStorage.removeItem(activeKey());
    for(let i=0;i<testSet.length;i++){if(!testSubmission.answers.find(a=>a.i===i)){const q=testSet[i];testSubmission.answers.push({i,rule:q.r,problem:q.p,ans:q.a,ocr:'',filled:false,status:'not_answered',image:''});}}
    testSubmission.total=testSet.length;testSubmission.elapsed=Math.max(0,Math.round((Date.now()-testBegin)/1000));testSubmission.autoSubmitted=!!auto;testSubmission.submitted_at=new Date().toISOString();
    try{await KMT.submit(testSubmission);testSubmission.cloudSaved=true;}catch(e){console.error('English cloud submit',e);alert('English test could not be submitted to the cloud. Please sign in again and retry.');}
    renderTestResult();
  }
  function renderTestResult(){
    const total=testSubmission?.total||testSet.length;const filled=(testSubmission?.answers||[]).filter(a=>a.filled).length;
    $('englishTest').innerHTML='<div class="eng-card"><h3>✓ '+(engCategory==='phonograms'?'Phonogram':'Spelling')+' Test Submitted</h3><div class="eng-stat-grid"><div class="eng-stat"><b>'+filled+'/'+total+'</b>Answered</div><div class="eng-stat"><b>Pending</b>Review</div><div class="eng-stat"><b>'+Math.round((testSubmission?.elapsed||0)/60)+':'+String((testSubmission?.elapsed||0)%60).padStart(2,'0')+'</b>Time</div><div class="eng-stat"><b>—</b>Score</div></div><p class="eng-feedback">Your test is waiting for <b>Parent/Admin Review</b>. After review, your progress will update.</p><button class="btn primary" id="englishRetest">Take Another Test</button><button class="btn secondary" id="englishReviewBtn">👨‍👩‍👧 Parent Portal Review</button></div>';
    $('englishRetest').onclick=()=>{testSubmission=null;renderTestStart();};$('englishReviewBtn').onclick=()=>openParentReview();
  }
  function hasSubmittedReview(){return !!testSubmission||false;}
  function openParentReview(){
    location.href='parent.html?review=english';
  }
  function showEnglishReview(){ openParentReview(); }
  async function renderProgress(){
    const a=state.practice,c=state.correct;const review=state.review.slice(-20).reverse();
    let cloudHtml='<div class="muted">Loading cloud-reviewed English tests…</div>';
    try{
      const rows=await KMT.worksheets();
      const mine=(rows||[]).filter(r=>String(r.operation||'').toLowerCase().includes('english'));
      const approved=mine.filter(r=>['approved','reviewed','complete'].includes(String(r.status||'').toLowerCase()));
      const pending=mine.filter(r=>['pending','under_review'].includes(String(r.status||'').toLowerCase()));
      cloudHtml=(pending.length?'<div class="eng-feedback">⏳ '+pending.length+' English test'+(pending.length===1?'':'s')+' waiting for Parent/Admin Review.</div>':'')+(approved.length?'<h4>Cloud-reviewed tests</h4>'+approved.slice(0,10).map(r=>{const sub=r.submission||{},ans=Array.isArray(sub.answers)?sub.answers:[];const cc=ans.filter(x=>x.status==='correct').length,ww=ans.filter(x=>x.status==='wrong').length,nn=ans.filter(x=>x.status==='not_answered').length;return '<div class="eng-review-line"><b>'+esc(new Date(r.submitted_at).toLocaleDateString())+'</b> — '+cc+'/'+ans.length+' correct ('+pct(cc,ans.length)+'%) • ✗ '+ww+' • — '+nn+'</div>';}).join(''):'<div class="muted">No cloud-reviewed English tests yet.</div>');
    }catch(e){cloudHtml='<div class="muted">Cloud progress unavailable right now.</div>';}
    $('englishProgress').innerHTML='<div class="eng-card"><h3>📊 '+(engCategory==='phonograms'?'Phonogram':'Spelling')+' Progress</h3><div class="eng-stat-grid"><div class="eng-stat"><b>'+a+'</b>Practice Attempts</div><div class="eng-stat"><b>'+pct(c,a)+'%</b>Practice Accuracy</div><div class="eng-stat"><b>'+state.tests+'</b>Tests</div><div class="eng-stat"><b>'+pct(state.testCorrect,state.tests*10)+'%</b>Practice Test Accuracy</div></div><div style="margin-top:14px">'+cloudHtml+'</div><h4>Rules needing review</h4>'+(review.length?review.map(x=>'<div class="eng-review-line"><b>Rule '+x.rule+'</b> — '+esc(x.answer)+'</div>').join(''):'<div class="muted">No local review items yet.</div>')+'</div>';
  }
  function setEnglishCategory(cat){
    if(testStarted && engCategory!==cat){if(!confirm('Switching categories will end the active test. Continue?'))return;clearInterval(testTimer);testStarted=false;testDone=true;localStorage.removeItem(activeKey());}
    engCategory=cat;
    $('engSpellingBtn').className=cat==='spelling'?'btn primary':'btn secondary';
    $('engPhonogramsBtn').className=cat==='phonograms'?'btn primary':'btn secondary';
    $('englishCategoryLabel').textContent=cat==='spelling'?'Spelling: Rules • Practice • Dictation • Test • Progress':'Phonograms: Learn • Practice • Dictation • Test • Progress';
    renderLearn();renderPractice();renderDictation();renderTestStart();renderProgress();
  }
  function wire(){
    $('engSpellingBtn').onclick=()=>setEnglishCategory('spelling');$('engPhonogramsBtn').onclick=()=>setEnglishCategory('phonograms');
    $('engLearnBtn').onclick=()=>setMode('englishLearn');$('engPracticeBtn').onclick=()=>setMode('englishPractice');$('engDictationBtn').onclick=()=>setMode('englishDictation');$('engTestBtn').onclick=()=>setMode('englishTest');$('engProgressBtn').onclick=()=>setMode('englishProgress');
    renderLearn();
    window.KMT_SHOW_ENGLISH=()=>{setMode('englishLearn');$('englishPanel').classList.remove('hidden');};
    window.KMT_HIDE_ENGLISH=()=>{$('englishPanel').classList.add('hidden');};
    window.KMT_END_ENGLISH_TEST=()=>{if(testStarted){clearInterval(testTimer);testStarted=false;testDone=true;localStorage.removeItem(activeKey());}};
    setTimeout(restoreActive,0);
  }
  wire();
  window.addEventListener('pagehide',()=>persistActive());window.addEventListener('beforeunload',()=>persistActive());
})();

/* ===== Production 3.6.0 — Phonogram Sound → Symbol ===== */
(function(){
  const K=window.KMT||(window.KMT={});
  const sounds=[
    ["a","short a"],["c","/k/ or /s/"],["d","/d/"],["f","/f/"],["g","/g/ or /j/"],
    ["o","short o"],["s","/s/ or /z/"],["qu","/kw/"],["b","/b/"],["e","short e"],
    ["h","/h/"],["i","short i"],["j","/j/"],["k","/k/"],["l","/l/"],["m","/m/"],
    ["n","/n/"],["p","/p/"],["r","/r/"],["t","/t/"],["u","short u"],["v","/v/"],
    ["w","/w/"],["x","/ks/"],["y","/y/"],["z","/z/"],["sh","/sh/"],["ee","/ē/"],
    ["th","/th/"],["ow","/ow/ or /ō/"],["ou","/ou/"],["oo","/oo/"],["ch","/ch/"],
    ["ar","/ar/"],["ay","/ā/"],["ai","/ā/"],["oy","/oy/"],["oi","/oi/"],["er","/er/"],
    ["ir","/er/"],["ur","/er/"],["wor","/wər/"],["ear","/ear/"],["ng","/ng/"],["ea","/ē/"],
    ["aw","/aw/"],["au","/aw/"],["or","/or/"],["ck","/k/"],["wh","/wh/"],["ed","/ed/"],
    ["ew","/ū/"],["ui","/oo/ or /ū/"],["oa","/ō/"],["gu","/g/"],["ph","/f/"],
    ["ough","varies by word"],["oe","/ō/"],["ey","/ē/ or /ā/"],["igh","/ī/"],
    ["kn","/n/"],["gn","/n/"],["wr","/r/"],["ie","/ī/ or /ē/"],["dge","/j/"],
    ["ei","/ē/ or /ā/"],["eigh","/ā/"],["ti","/sh/"],["si","/zh/ or /sh/"],["ci","/sh/"]
  ];
  const state={items:[],index:0,answers:[]};
  function shuffle(a){a=a.slice();for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function start(start=1,end=70,count=10){
    state.items=shuffle(sounds.slice(start-1,end)).slice(0,count).map(x=>({symbol:x[0],sound:x[1]}));
    state.index=0;state.answers=[];return state;
  }
  function current(){return state.items[state.index]||null}
  function hear(){
    const x=current();if(!x||!("speechSynthesis" in window))return;
    speechSynthesis.cancel();
    let text=x.sound.replace(/\//g,"");
    if(x.sound==="short a") text="short a vowel sound";
    if(x.sound==="short e") text="short e vowel sound";
    if(x.sound==="short i") text="short i vowel sound";
    if(x.sound==="short o") text="short o vowel sound";
    if(x.sound==="short u") text="short u vowel sound";
    const u=new SpeechSynthesisUtterance(text);u.rate=.55;speechSynthesis.speak(u);
  }
  function record(written,image){
    const x=current();if(!x)return null;
    const answer=String(written||"").trim().toLowerCase().replace(/\s+/g,"");
    const r={expected:x.symbol,written:answer,image:image||null,ocrMatch:answer?answer===x.symbol:null,status:"pending_review"};
    state.answers.push(r);return r;
  }
  function next(){if(state.index<state.items.length-1){state.index++;return current()}return null}
  KMT.PhonogramSoundToSymbol={start,current,hear,record,next,state,
    instructions:"Hear only the sound. Write the phonogram symbol with Apple Pencil. Submit the handwriting for review."};
})();
