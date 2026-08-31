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
    S.user={authId:d.user.id,id:p[0].id,name:p[0].display_name,role:p[0].role,email:String(email)};save();return S.user;
  }
  async function loginWithEmail(email,pin){return finishLogin(email.trim().toLowerCase(),pin,null)}
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

    const appId=base+'_'+authId.replace(/-/g,'').slice(0,8);
    try{
      await rpc('register_student',{p_auth_user_id:authId,p_app_user_id:appId,p_display_name:displayName});
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
      const appId=pending.appId || ((pending.base||'student')+'_'+me.id.replace(/-/g,'').slice(0,8));
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
    const rows=await worksheets(uid);
    return progressFromRows(rows,uid);
  }

  async function worksheets(uid){return api('/rest/v1/worksheets?select=*&user_id=eq.'+encodeURIComponent(uid)+'&order=submitted_at.desc')}
  async function allWorksheets(){return api('/rest/v1/worksheets?select=*&order=submitted_at.desc')}
  window.KMT={finishEmailConfirmation,load,login,loginWithEmail,registerStudent,logout,me,submit,pending,reviewed,progress,progressFromRows,worksheets,allWorksheets,voidWorksheet,api};
})();
