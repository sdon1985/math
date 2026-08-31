/* Kids Math Test — Cloud core v1.0.1 */
(function(){
  const C=window.KIDS_MATH_CONFIG;
  const S={access:null,refresh:null,user:null};
  const key='kmtSupabaseSession';
  function cfg(){if(!C||!C.supabaseUrl||!C.supabaseAnonKey)throw Error('Cloud configuration is missing.');return C}
  function load(){try{const x=JSON.parse(sessionStorage.getItem(key)||'null');if(x){S.access=x.access;S.refresh=x.refresh;S.user=x.user}}catch(e){}}
  function save(){sessionStorage.setItem(key,JSON.stringify({access:S.access,refresh:S.refresh,user:S.user}))}
  async function auth(path,body){const c=cfg();const r=await fetch(c.supabaseUrl+'/auth/v1/'+path,{method:'POST',headers:{apikey:c.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify(body)});const t=await r.text();if(!r.ok)throw Error(t||('Auth HTTP '+r.status));return JSON.parse(t)}
  async function refresh(){if(!S.refresh)return false;try{const d=await auth('token?grant_type=refresh_token',{refresh_token:S.refresh});S.access=d.access_token;S.refresh=d.refresh_token||S.refresh;S.user=d.user;save();return true}catch(e){return false}}
  async function api(path,opt={}){const c=cfg();load();let h=Object.assign({apikey:c.supabaseAnonKey,Authorization:'Bearer '+(S.access||c.supabaseAnonKey),'Content-Type':'application/json'},opt.headers||{});let r=await fetch(c.supabaseUrl+path,Object.assign({},opt,{headers:h}));if(r.status===401&&await refresh()){h.Authorization='Bearer '+S.access;r=await fetch(c.supabaseUrl+path,Object.assign({},opt,{headers:h}))}const t=await r.text();if(!r.ok)throw Error(t||('API HTTP '+r.status));return t?JSON.parse(t):null}
  async function rpc(name,body){return api('/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(body)})}
  async function login(appId,pin){
    load();
    const email=await rpc('get_auth_email',{p_app_user_id:appId});
    if(!email)throw Error('This user is not linked to a Supabase Auth account.');
    return finishLogin(email,pin,appId);
  }
  function authPassword(pin){return 'KMT!' + String(pin) + '!2026';}
  async function finishLogin(email,pin,expectedId){
    let d;
    try{
      // Existing production users use the legacy 4-digit password.
      d=await auth('token?grant_type=password',{email:String(email),password:String(pin)});
    }catch(firstError){
      // New registered students use a Supabase-compliant password while the
      // UI still lets them remember only their 4-digit PIN.
      d=await auth('token?grant_type=password',{email:String(email),password:authPassword(pin)});
    }
    S.access=d.access_token;S.refresh=d.refresh_token;S.user=d.user;save();
    const map=await api('/rest/v1/auth_users?select=app_user_id&auth_user_id=eq.'+encodeURIComponent(d.user.id));
    if(!map[0]||(expectedId&&map[0].app_user_id!==expectedId)){
      await logout();throw Error('Security check failed: Auth account is not mapped correctly.');
    }
    const p=await api('/rest/v1/kids_users?select=id,display_name,role&id=eq.'+encodeURIComponent(map[0].app_user_id));
    if(!p[0])throw Error('Kids Math Test user profile was not found.');
    S.user={authId:d.user.id,id:p[0].id,name:p[0].display_name,role:p[0].role,email:String(email)};save();if(S.user.role==='user')await syncStudentPin(pin);return S.user;
  }
  async function loginWithEmail(email,pin){return finishLogin(email.trim().toLowerCase(),pin,null)}
  async function syncStudentPin(pin){
    if(!S.user?.id||S.user.role!=="user"||!/^\d{4}$/.test(String(pin)))return;
    try{await rpc('set_student_pin_hash',{p_app_user_id:S.user.id,p_pin:String(pin)});}catch(e){console.warn('PIN sync:',e);}
  }

  function parentPassword(password){return String(password||'');}
  async function parentLogin(email,password){
    email=String(email||'').trim().toLowerCase(); password=parentPassword(password);
    if(!email||password.length<6)throw Error('Enter parent email and password.');
    const d=await auth('token?grant_type=password',{email,password});
    S.access=d.access_token;S.refresh=d.refresh_token;S.user=d.user;save();
    let p=await api('/rest/v1/parent_users?select=auth_user_id,display_name,email&auth_user_id=eq.'+encodeURIComponent(d.user.id));
    // Recovery path: if the parent confirmed email before the parent SQL migration
    // was installed, create the profile now from Auth metadata.
    if(!p[0]){
      const displayName=d.user.user_metadata?.display_name||d.user.user_metadata?.name||'Parent';
      await rpc('register_parent',{p_auth_user_id:d.user.id,p_display_name:displayName,p_email:d.user.email||email});
      p=await api('/rest/v1/parent_users?select=auth_user_id,display_name,email&auth_user_id=eq.'+encodeURIComponent(d.user.id));
    }
    if(!p[0]){await logout();throw Error('Parent profile could not be created. Run the Production 3.2.0 parent SQL migration in Supabase.');}
    S.user={authId:d.user.id,id:d.user.id,name:p[0].display_name,role:'parent',email:p[0].email||email};save();return S.user;
  }

  async function registerParent(displayName,email,password){
    displayName=String(displayName||'').trim();email=String(email||'').trim().toLowerCase();password=String(password||'');
    if(displayName.length<2)throw Error('Enter the parent name.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid parent email address.');
    if(password.length<6)throw Error('Parent password must be at least 6 characters.');
    const pendingKey='kmtPendingParentRegistration';
    const redirect=(C.baseUrl||location.origin+'/math/').replace(/\/?$/,'/')+'login.html';
    localStorage.setItem(pendingKey,JSON.stringify({displayName,email,createdAt:Date.now()}));
    let d;
    try{d=await auth('signup?redirect_to='+encodeURIComponent(redirect),{email,password,data:{display_name:displayName,role:'parent'}})}
    catch(e){const msg=String(e?.message||e);if(/already registered|already exists/i.test(msg))throw Error('This parent email is already registered. Use Parent Login.');throw e;}
    if(!d?.user?.id)throw Error('Supabase signup did not return an Auth user. Check Supabase Auth email/password settings and try again.');
    if(d.access_token){
      await rpc('register_parent',{p_auth_user_id:d.user.id,p_display_name:displayName,p_email:email});
      const u={authId:d.user.id,id:d.user.id,name:displayName,role:'parent',email};S.access=d.access_token;S.refresh=d.refresh_token||null;S.user=u;save();localStorage.removeItem(pendingKey);return {user:u,confirmed:true};
    }
    return {id:d.user.id,name:displayName,role:'parent',email,confirmed:false};
  }

  async function finishParentEmailConfirmation(){
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const access=hash.get('access_token'),refreshToken=hash.get('refresh_token');
    if(!access)return null;
    S.access=access;S.refresh=refreshToken;save();
    const me=await authUser();
    if(!me?.id)throw Error('Email confirmation returned no Auth user.');
    const pending=JSON.parse(localStorage.getItem('kmtPendingParentRegistration')||'null');
    const name=pending?.displayName||me.user_metadata?.display_name||'Parent';
    await rpc('register_parent',{p_auth_user_id:me.id,p_display_name:name,p_email:me.email||pending?.email});
    S.user={authId:me.id,id:me.id,name,role:'parent',email:me.email||pending?.email};save();
    localStorage.removeItem('kmtPendingParentRegistration');
    history.replaceState({},document.title,location.pathname+location.search);
    return S.user;
  }

  async function currentAuthUser(){
    load();
    if(!S.access)throw Error('Please log in again.');
    const c=cfg();
    const r=await fetch(c.supabaseUrl+'/auth/v1/user',{headers:{apikey:c.supabaseAnonKey,Authorization:'Bearer '+S.access}});
    const t=await r.text();
    if(r.status===401 && await refresh()){
      const rr=await fetch(c.supabaseUrl+'/auth/v1/user',{headers:{apikey:c.supabaseAnonKey,Authorization:'Bearer '+S.access}});
      const tt=await rr.text();
      if(!rr.ok)throw Error(tt||'Session expired. Please log in again.');
      S.user=JSON.parse(tt);save();return S.user;
    }
    if(!r.ok)throw Error(t||'Session expired. Please log in again.');
    S.user=JSON.parse(t);save();return S.user;
  }

  async function ensureParentSession(){
    const au=await currentAuthUser();
    const p=await api('/rest/v1/parent_users?select=auth_user_id,display_name,email&auth_user_id=eq.'+encodeURIComponent(au.id));
    if(!p[0]){
      const name=au.user_metadata?.display_name||au.user_metadata?.name||'Parent';
      await rpc('register_parent',{p_auth_user_id:au.id,p_display_name:name,p_email:au.email||''});
      const again=await api('/rest/v1/parent_users?select=auth_user_id,display_name,email&auth_user_id=eq.'+encodeURIComponent(au.id));
      if(!again[0])throw Error('Parent profile is not available. Run the Production 3.2.0/3.2.0 database migration.');
      S.user={authId:au.id,id:au.id,name:again[0].display_name,role:'parent',email:again[0].email};save();
      return S.user;
    }
    S.user={authId:au.id,id:au.id,name:p[0].display_name,role:'parent',email:p[0].email};save();
    return S.user;
  }

  async function enrollStudent(studentId,email,pin){
    await ensureParentSession();
    studentId=String(studentId||'').trim();email=String(email||'').trim().toLowerCase();pin=String(pin||'');
    if(!studentId||!email||!/^\d{4}$/.test(pin))throw Error('Enter student User ID, email ID and 4-digit PIN.');
    return rpc('parent_enroll_student',{p_student_id:studentId,p_student_email:email,p_pin:pin});
  }

  async function parentStudents(){
    await ensureParentSession();
    return rpc('parent_students',{});
  }

  async function parentProgress(studentId){
    await ensureParentSession();
    return rpc('parent_progress',{p_student_id:String(studentId)});
  }

  async function parentWorksheets(studentId){
    await ensureParentSession();
    return rpc('parent_worksheets',{p_student_id:String(studentId)});
  }

  async function adminProgress(){
    if(S.user?.role!=="admin")throw Error('Admin access required.');
    return rpc('admin_progress_all',{});
  }

  async function adminParentOverview(){
    if(S.user?.role!=="admin")throw Error('Admin access required.');
    return rpc('admin_parent_overview',{});
  }

  async function adminParentSubscribe(parentAuthUserId,studentId){
    if(S.user?.role!=="admin")throw Error('Admin access required.');
    return rpc('admin_parent_subscribe',{p_parent_auth_user_id:String(parentAuthUserId),p_student_id:String(studentId)});
  }

  async function adminParentUnsubscribe(parentAuthUserId,studentId){
    if(S.user?.role!=="admin")throw Error('Admin access required.');
    return rpc('admin_parent_unsubscribe',{p_parent_auth_user_id:String(parentAuthUserId),p_student_id:String(studentId)});
  }

  async function adminDeleteParent(parentAuthUserId){
    if(S.user?.role!=="admin")throw Error('Admin access required.');
    return rpc('admin_delete_parent',{p_parent_auth_user_id:String(parentAuthUserId)});
  }

  function stableStudentId(email){
    // Stable application ID derived from email. This allows a deleted student
    // to re-register with the same email and recover the same app user ID.
    const s=String(email||'').trim().toLowerCase();
    let h1=0x811c9dc5,h2=0x9e3779b9;
    for(let i=0;i<s.length;i++){
      const c=s.charCodeAt(i);
      h1=Math.imul(h1^c,16777619)>>>0;
      h2=Math.imul(h2^(c+(i&255)),2246822519)>>>0;
    }
    return 'student_'+h1.toString(16).padStart(8,'0')+h2.toString(16).padStart(8,'0');
  }

  async function deleteStudentAccount(appUserId){
    if(!appUserId)throw Error('Select a student account to delete.');
    return rpc('admin_delete_student',{p_app_user_id:String(appUserId)});
  }

  async function registerStudent(displayName,email,pin){
    displayName=String(displayName||'').trim();
    email=String(email||'').trim().toLowerCase();
    if(displayName.length<2)throw Error('Enter the student name.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid email address.');
    if(!/^\d{4}$/.test(pin))throw Error('Student PIN must be 4 digits.');

    const base=displayName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,24)||'student';
    const pendingKey='kmtPendingRegistration';
    const redirect=(C.baseUrl||location.origin+'/math/').replace(/\/?$/,'/')+'login.html';
    const internalPassword=authPassword(pin);

    // Keep only non-secret registration state. Never store the PIN.
    localStorage.setItem(pendingKey,JSON.stringify({displayName,email,base,createdAt:Date.now()}));

    let d;
    try{
      // `redirect_to` is the REST equivalent of Supabase JS
      // options.emailRedirectTo.
      d=await auth('signup?redirect_to='+encodeURIComponent(redirect),{
        email,
        password:internalPassword,
        data:{display_name:displayName,role:'student'}
      });
    }catch(e){
      const msg=String(e?.message||e);
      if(/already registered|already exists|user.*exist/i.test(msg)){
        throw Error('This email is already registered. Use Student Login, or register with a different email.');
      }
      throw e;
    }

    // With email confirmation enabled, Supabase returns a user and no session.
    // With an existing account, Supabase may intentionally return an obfuscated
    // user object. Never create an application mapping from that object.
    const authId=d?.user?.id;
    if(!authId || !d.user.identities || d.user.identities.length===0){
      // The email may have been used in a previous attempt. Try the real
      // password login to distinguish a usable existing account from an
      // unconfirmed account without exposing auth internals.
      try{
        const existing=await auth('token?grant_type=password',{email,password:internalPassword});
        if(existing?.user?.id){
          throw Error('This email is already registered. Use Student Login instead.');
        }
      }catch(e){
        if(/already registered\. Use Student Login/i.test(String(e?.message||'')))throw e;
        if(/email not confirmed/i.test(String(e?.message||''))){
          try{
            await auth('resend',{type:'signup',email,options:{emailRedirectTo:redirect}});
            throw Error('This email already has a pending registration. A new confirmation email was sent.');
          }catch(resendErr){
            if(/pending registration|already registered/i.test(String(resendErr?.message||'')))throw resendErr;
            throw Error('This email has a pending registration. Check your email for the confirmation link.');
          }
        }
      }
      throw Error('Supabase did not create a new Auth user. Check that "Allow new users to sign up" is enabled, then try a new email address.');
    }

    const appId=stableStudentId(email);
    try{
      await rpc('register_student',{p_auth_user_id:authId,p_app_user_id:appId,p_display_name:displayName,p_pin:pin});
    }catch(e){
      throw Error('Auth account was created, but the student profile could not be created. Check the register_student database function. '+String(e?.message||e));
    }

    localStorage.setItem(pendingKey,JSON.stringify({displayName,email,appId,authId,createdAt:Date.now()}));

    if(d.access_token){
      S.access=d.access_token;S.refresh=d.refresh_token||null;S.user=d.user;save();
      const p=await api('/rest/v1/kids_users?select=id,display_name,role&id=eq.'+encodeURIComponent(appId));
      if(p[0]){
        S.user={authId,id:appId,name:p[0].display_name,role:p[0].role,email};save();
        localStorage.removeItem(pendingKey);
        return {user:S.user,confirmed:true};
      }
    }

    return {id:appId,name:displayName,role:'student',authId,email,confirmed:false};
  }

  async function finishEmailConfirmation(){
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const access=hash.get('access_token');
    const refreshToken=hash.get('refresh_token');
    if(!access)return null;

    S.access=access;S.refresh=refreshToken;save();
    const me=await authUser();
    if(!me?.id)throw Error('Email confirmation returned no Auth user.');

    const pending=JSON.parse(localStorage.getItem('kmtPendingRegistration')||'null');
    if(pending?.displayName){
      const appId=pending.appId || stableStudentId(me.email||pending.email);
      try{
        await rpc('register_student',{p_auth_user_id:me.id,p_app_user_id:appId,p_display_name:pending.displayName});
        localStorage.setItem('kmtPendingRegistration',JSON.stringify({...pending,appId,authId:me.id}));
      }catch(e){
        // Ignore duplicate/idempotent mapping errors and verify below.
        console.warn('Registration mapping:',e);
      }
    }

    const map=await api('/rest/v1/auth_users?select=app_user_id&auth_user_id=eq.'+encodeURIComponent(me.id));
    if(!map[0])throw Error('Email confirmed, but the student account mapping was not created. Run the registration SQL once.');
    const p=await api('/rest/v1/kids_users?select=id,display_name,role&id=eq.'+encodeURIComponent(map[0].app_user_id));
    if(!p[0])throw Error('Email confirmed, but the student profile was not found.');

    S.user={authId:me.id,id:p[0].id,name:p[0].display_name,role:p[0].role,email:me.email};save();
    localStorage.removeItem(pendingKey);
    history.replaceState({},document.title,location.pathname+location.search);
    return S.user;
  }

  async function authUser(){
    const c=cfg();load();
    const r=await fetch(c.supabaseUrl+'/auth/v1/user',{headers:{apikey:c.supabaseAnonKey,Authorization:'Bearer '+S.access}});
    const text=await r.text();
    if(!r.ok)throw Error(text||('Auth user HTTP '+r.status));
    return JSON.parse(text);
  }

  async function logout(){load();try{if(S.access)await fetch(cfg().supabaseUrl+'/auth/v1/logout',{method:'POST',headers:{apikey:cfg().supabaseAnonKey,Authorization:'Bearer '+S.access}})}catch(e){}S.access=S.refresh=S.user=null;sessionStorage.removeItem(key)}
  async function me(){load();if(!S.access)return null;try{const p=await api('/rest/v1/kids_users?select=id,display_name,role&id=eq.'+encodeURIComponent(S.user?.id||''));return p[0]?{authId:S.user.authId,id:p[0].id,name:p[0].display_name,role:p[0].role}:null}catch(e){return null}}
  async function submit(s){const u=await me();if(!u)throw Error('Cloud session expired. Please login again.');const row={id:s.id,user_id:u.id,user_name:u.name,submitted_at:s.submitted_at||new Date().toISOString(),operation:s.operation,range:s.range,total:s.total,elapsed:s.elapsed,status:'pending',submission:s};await api('/rest/v1/worksheets',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});return true}
  async function pending(){const rows=await allWorksheets();return rows.filter(r=>['pending','under_review'].includes(String(r.status||'').toLowerCase()))}
  async function voidWorksheet(id,reason){
    await api('/rest/v1/worksheets?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:'voided',void_reason:reason||'Voided by parent',voided_at:new Date().toISOString(),voided_by:S.user?.authId||null})});
    try{await api('/rest/v1/progress?worksheet_id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{Prefer:'return=minimal'}})}catch(e){console.warn('progress cleanup after void',e)}
    return true;
  }
  async function reviewed(id,answers,meta){
    const correct=answers.filter(a=>a.status==='correct').length,
          wrong=answers.filter(a=>a.status==='wrong').length,
          na=answers.filter(a=>a.status==='not_answered').length,
          total=answers.length;
    const reviewMeta=Object.assign({},meta,{answers});

    // Save the review and VERIFY that Supabase actually changed the worksheet.
    const saved=await api('/rest/v1/worksheets?id=eq.'+encodeURIComponent(id),{
      method:'PATCH',
      headers:{Prefer:'return=representation'},
      body:JSON.stringify({
        status:'approved',
        reviewed_at:new Date().toISOString(),
        reviewed_by:S.user?.authId||null,
        review_version:2,
        submission:reviewMeta
      })
    });

    if(!Array.isArray(saved)||!saved[0]||
       !['approved','reviewed','complete'].includes(String(saved[0].status||'').toLowerCase())){
      throw Error('Review was not saved as Approved in the cloud database.');
    }

    // Replace this worksheet's progress row so edits never accumulate duplicates.
    await api('/rest/v1/progress?worksheet_id=eq.'+encodeURIComponent(id),{
      method:'DELETE',
      headers:{Prefer:'return=minimal'}
    });

    const progressRow=await api('/rest/v1/progress',{
      method:'POST',
      headers:{Prefer:'return=representation'},
      body:JSON.stringify({
        worksheet_id:id,
        user_id:meta.userId,
        user_name:meta.userName,
        date:meta.date,
        correct,
        wrong,
        not_answered:na,
        total,
        accuracy:total?Math.round(correct*100/total):0,
        elapsed:meta.elapsed||0,
        reviewed:true,
        operation:meta.operation,
        range:meta.range
      })
    });

    if(!Array.isArray(progressRow)||!progressRow[0]){
      throw Error('Worksheet was approved, but its progress record was not saved.');
    }

    return true;
  }
  // Progress is derived from approved worksheets. The caller can pass rows
  // already fetched, avoiding a second Supabase query and keeping Student/Admin
  // progress synchronized with My Submitted Worksheets.
  function progressFromRows(rows,uid){
    const list=(Array.isArray(rows)?rows:[]).filter(r=>{
      if(uid && String(r.user_id)!==String(uid))return false;
      const s=String(r.status||'').toLowerCase();
      return s!=='voided' && (['approved','reviewed','complete'].includes(s)||!!r.reviewed_at);
    });
    return list.map(r=>{
      const sub=(r.submission&&typeof r.submission==='object')?r.submission:{};
      const answers=Array.isArray(sub.answers)?sub.answers:[];
      const correct=answers.filter(a=>a.status==='correct').length;
      const wrong=answers.filter(a=>a.status==='wrong').length;
      const na=answers.filter(a=>a.status==='not_answered').length;
      const total=Number(r.total||answers.length||0);
      return {
        id:r.id,
        worksheet_id:r.id,
        user_id:r.user_id,
        user_name:r.user_name,
        date:(r.submitted_at||'').slice(0,10),
        correct,
        wrong,
        not_answered:na,
        total,
        accuracy:total?Math.round(correct*100/total):0,
        elapsed:Number(r.elapsed||0),
        reviewed:true,
        operation:r.operation,
        range:r.range
      };
    }).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  }

  async function progress(uid){
    const meUser=await me();
    if(!meUser)throw Error('Cloud session expired. Please login again.');
    if(uid && String(uid)!==String(meUser.id))throw Error('Student progress access denied.');
    return rpc('my_progress',{});
  }

  async function worksheets(uid){return api('/rest/v1/worksheets?select=*&user_id=eq.'+encodeURIComponent(uid)+'&order=submitted_at.desc')}
  async function allWorksheets(){return api('/rest/v1/worksheets?select=*&order=submitted_at.desc')}
  window.KMT={finishEmailConfirmation,finishParentEmailConfirmation,load,login,loginWithEmail,registerStudent,registerParent,parentLogin,enrollStudent,parentStudents,parentProgress,parentWorksheets,adminProgress,adminParentOverview,adminParentSubscribe,adminParentUnsubscribe,adminDeleteParent,deleteStudentAccount,logout,me,submit,pending,reviewed,progress,progressFromRows,worksheets,allWorksheets,voidWorksheet,api};
})();
