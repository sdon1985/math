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
  function registrationLimitMessage(kind){
    const next=new Date(Date.now()+60*60*1000);
    const when=next.toLocaleString([], {year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    const label=kind==='parent'?'student or parent':'student';
    return 'Registration email limit reached. A maximum of 2 new '+label+' registration emails can be sent during the current Supabase limit window. Please try again after '+when+' (your local time).';
  }
  function friendlyRegistrationError(e,kind){
    const raw=String(e?.message||e||'');
    if(/429|over_email_send_rate_limit|email send rate limit|rate limit exceeded/i.test(raw))return Error(registrationLimitMessage(kind));
    if(/already registered|already exists/i.test(raw))return Error(kind==='parent'?'This parent email is already registered. Use Parent Login.':'This email is already registered. Use Student Login, or register with a different email.');
    return e instanceof Error?e:Error(raw||'Registration failed. Please try again.');
  }
  async function studentLoginStatus(email){
    const v=String(email||'').trim().toLowerCase();
    if(!v)return 'not_found';
    try{
      const r=await rpc('student_login_status',{p_email:v});
      const value=Array.isArray(r)?(r[0]?.status||r[0]):(r?.status||r);
      return String(value||'not_found').toLowerCase();
    }catch(e){
      return 'unknown';
    }
  }
  async function login(appId,pin){
    load();
    let email;
    try{ email=await rpc('get_auth_email',{p_app_user_id:appId}); }
    catch(e){ throw Error('Student account is not registered. Please create a Student Account first.'); }
    if(!email)throw Error('Student account is not registered. Please create a Student Account first.');
    return finishLogin(email,pin,appId);
  }
  function authPassword(pin){return 'KMT!' + String(pin) + '!2026';}
  function friendlyAuthError(e){
    const raw=String(e?.message||e||'');
    if(/email not confirmed/i.test(raw))return 'Please confirm your email address before logging in.';
    if(/invalid login credentials|invalid_credentials|invalid credentials/i.test(raw))return 'Student account is not registered, or the PIN is incorrect. Please verify your email and 4-digit PIN.';
    return 'Student login could not be completed. Please verify your email and 4-digit PIN.';
  }
  async function finishLogin(email,pin,expectedId){
    let d,firstError;
    try{
      // Existing production users use the legacy 4-digit password.
      d=await auth('token?grant_type=password',{email:String(email),password:String(pin)});
    }catch(e){
      firstError=e;
      try{
        // New registered students use a Supabase-compliant password while the
        // UI still lets them remember only their 4-digit PIN.
        d=await auth('token?grant_type=password',{email:String(email),password:authPassword(pin)});
      }catch(secondError){
        const status=await studentLoginStatus(email);
        if(status==='not_found')throw Error('Student account is not registered. Please create a Student Account first.');
        if(status==='auth_only')throw Error('Student registration is incomplete. Please complete the email confirmation and try again.');
        throw Error(friendlyAuthError(secondError||firstError));
      }
    }
    S.access=d.access_token;S.refresh=d.refresh_token;S.user=d.user;save();
    let map=await api('/rest/v1/auth_users?select=app_user_id&auth_user_id=eq.'+encodeURIComponent(d.user.id));

    // Repair any confirmed student whose application mapping/profile was not
    // created during signup or email confirmation. Student login is already
    // an explicit student-only path, so we can safely derive the stable app ID
    // from the confirmed Auth email. This also works when the confirmation link
    // was opened on a different browser/device and localStorage is unavailable.
    const repairedId=stableStudentId(d.user.email||email);
    if(!map[0]){
      try{
        await rpc('register_student',{
          p_auth_user_id:d.user.id,
          p_app_user_id:repairedId,
          p_display_name:d.user.user_metadata?.display_name||d.user.user_metadata?.name||'Student',
          p_pin:String(pin)
        });
        map=await api('/rest/v1/auth_users?select=app_user_id&auth_user_id=eq.'+encodeURIComponent(d.user.id));
      }catch(repairError){
        console.error('Student mapping repair failed:',repairError);
        await logout();
        throw Error('Your email is confirmed, but the Student profile could not be synchronized. Please run the Production 3.9.2 database migration, then try Student Login again.');
      }
    }

    if(!map[0]||(expectedId&&map[0].app_user_id!==expectedId)){
      await logout();throw Error('Student account mapping could not be verified. Please try Student Login again.');
    }
    let p=await api('/rest/v1/kids_users?select=id,display_name,role&id=eq.'+encodeURIComponent(map[0].app_user_id));
    if(!p[0]){
      try{
        await rpc('register_student',{
          p_auth_user_id:d.user.id,
          p_app_user_id:map[0].app_user_id,
          p_display_name:d.user.user_metadata?.display_name||d.user.user_metadata?.name||'Student',
          p_pin:String(pin)
        });
        p=await api('/rest/v1/kids_users?select=id,display_name,role&id=eq.'+encodeURIComponent(map[0].app_user_id));
      }catch(profileError){
        console.error('Student profile repair failed:',profileError);
      }
    }
    if(!p[0])throw Error('Your email is confirmed, but the Student profile is not available. Please try again after the Production 3.9.2 database migration is installed.');
    S.user={authId:d.user.id,id:p[0].id,name:p[0].display_name,role:p[0].role,email:String(email)};save();if(S.user.role==='user')await syncStudentPin(pin);return S.user;
  }
  async function loginWithEmail(email,pin){return finishLogin(email.trim().toLowerCase(),pin,null)}
  async function syncStudentPin(pin){
    if(!S.user?.id||S.user.role!=="user"||!/^\d{4}$/.test(String(pin)))return false;
    let lastError=null;
    for(let attempt=1;attempt<=2;attempt++){
      try{
        const ok=await rpc('set_student_pin_hash',{p_app_user_id:S.user.id,p_pin:String(pin)});
        if(ok===true||ok?.[0]===true||ok?.result===true)return true;
        lastError=new Error('PIN synchronization did not return success.');
      }catch(e){
        lastError=e;
        await new Promise(r=>setTimeout(r,300));
      }
    }
    console.warn('PIN sync failed:',lastError);
    return false;
  }

  function parentPassword(password){return String(password||'');}
  async function parentLogin(email,password){
    email=String(email||'').trim().toLowerCase(); password=parentPassword(password);
    if(!email||password.length<6)throw Error('Enter parent email and password.');
    let d;
    try{ d=await auth('token?grant_type=password',{email,password}); }
    catch(e){
      const raw=String(e?.message||e||'');
      if(/email not confirmed/i.test(raw))throw Error('Please confirm your parent email address before logging in.');
      if(/invalid login credentials|invalid_credentials|invalid credentials/i.test(raw))throw Error('Parent account is not registered, or the password is incorrect.');
      throw Error('Parent login could not be completed. Please verify your email and password.');
    }
    S.access=d.access_token;S.refresh=d.refresh_token;S.user=d.user;save();
    let p=await api('/rest/v1/parent_users?select=auth_user_id,display_name,email&auth_user_id=eq.'+encodeURIComponent(d.user.id));
    // Recovery path: if the parent confirmed email before the parent SQL migration
    // was installed, create the profile now from Auth metadata.
    if(!p[0]){
      const displayName=d.user.user_metadata?.display_name||d.user.user_metadata?.name||'Parent';
      await rpc('register_parent',{p_auth_user_id:d.user.id,p_display_name:displayName,p_email:d.user.email||email});
      p=await api('/rest/v1/parent_users?select=auth_user_id,display_name,email&auth_user_id=eq.'+encodeURIComponent(d.user.id));
    }
    if(!p[0]){await logout();throw Error('Parent profile could not be created. Run the Production 3.9.1 parent SQL migration in Supabase.');}
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
    catch(e){throw friendlyRegistrationError(e,'parent');}
    // Some Supabase/Auth configurations send the confirmation email but do not
    // return the Auth user object to the browser. Treat that response as a
    // pending confirmation instead of showing a false registration failure.
    if(!d?.user?.id){
      return {name:displayName,role:'parent',email,confirmed:false,pending:true};
    }
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
      if(!again[0])throw Error('Parent profile is not available. Run the Production 3.9.1 database migration.');
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
  async function parentReviewWorksheet(id,answers,meta){
    await ensureParentSession();
    return rpc('parent_review_worksheet',{
      p_worksheet_id:String(id),
      p_answers:Array.isArray(answers)?answers:[],
      p_user_id:String(meta?.userId||''),
      p_user_name:String(meta?.userName||''),
      p_date:String(meta?.date||new Date().toISOString().slice(0,10)),
      p_elapsed:Number(meta?.elapsed||0),
      p_operation:String(meta?.operation||'Worksheet'),
      p_range:String(meta?.range||'')
    });
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
      throw friendlyRegistrationError(e,'student');
    }

    // With email confirmation enabled, Supabase returns a user and no session.
    // With an existing account, Supabase may intentionally return an obfuscated
    // user object. Never create an application mapping from that object.
    const authId=d?.user?.id;
    if(!authId || !d?.user){
      // Some Supabase/Auth configurations can send the confirmation email but
      // omit the user object from the signup response. Do not report a false
      // failure; the confirmation link will create/synchronize the Student
      // application profile in finishEmailConfirmation().
      return {name:displayName,role:'student',email,confirmed:false,pending:true};
    }
    if(!d.user.identities || d.user.identities.length===0){
      // Supabase may intentionally obfuscate an already-used email. Distinguish
      // a real existing account from a pending unconfirmed registration.
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
      throw Error('This email may already be registered. Use Student Login, or register with a different email address.');
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

    // Always synchronize the confirmed Auth account into the application.
    // Do not depend on localStorage: confirmation can happen on another
    // browser/device where the original registration state is unavailable.
    const pending=JSON.parse(localStorage.getItem('kmtPendingRegistration')||'null');
    const email=String(me.email||pending?.email||'').trim().toLowerCase();
    if(!email)throw Error('Email confirmed, but the student email could not be determined.');
    const appId=pending?.appId || stableStudentId(email);
    const displayName=pending?.displayName||me.user_metadata?.display_name||me.user_metadata?.name||'Student';

    try{
      await rpc('register_student',{
        p_auth_user_id:me.id,
        p_app_user_id:appId,
        p_display_name:displayName
      });
    }catch(e){
      console.error('Registration mapping:',e);
      throw Error('Email confirmed, but the Student profile could not be created. Please run the Production 3.9.2 database migration, then open the confirmation link again.');
    }

    const map=await api('/rest/v1/auth_users?select=app_user_id&auth_user_id=eq.'+encodeURIComponent(me.id));
    if(!map[0])throw Error('Email confirmed, but the Student account mapping was not created. Please run the Production 3.9.2 database migration.');
    const profile=await api('/rest/v1/kids_users?select=id,display_name,role&id=eq.'+encodeURIComponent(map[0].app_user_id));
    if(!profile[0])throw Error('Email confirmed, but the Student profile was not found. Please try again.');

    S.user={authId:me.id,id:profile[0].id,name:profile[0].display_name,role:profile[0].role,email};save();
    localStorage.removeItem('kmtPendingRegistration');
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
  window.KMT={studentLoginStatus,finishEmailConfirmation,finishParentEmailConfirmation,load,login,loginWithEmail,registerStudent,registerParent,parentLogin,enrollStudent,parentStudents,parentProgress,parentWorksheets,parentReviewWorksheet,adminProgress,adminParentOverview,adminParentSubscribe,adminParentUnsubscribe,adminDeleteParent,deleteStudentAccount,logout,me,submit,pending,reviewed,progress,progressFromRows,worksheets,allWorksheets,voidWorksheet,syncStudentPin,api};
})();
