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
  async function login(appId,pin){load();const email=await rpc('get_auth_email',{p_app_user_id:appId});if(!email)throw Error('This user is not linked to a Supabase Auth account.');const d=await auth('token?grant_type=password',{email:String(email),password:String(pin)});S.access=d.access_token;S.refresh=d.refresh_token;S.user=d.user;save();const map=await api('/rest/v1/auth_users?select=app_user_id&auth_user_id=eq.'+encodeURIComponent(d.user.id));if(!map[0]||map[0].app_user_id!==appId){await logout();throw Error('Security check failed: Auth account is mapped to a different user.')}const p=await api('/rest/v1/kids_users?select=id,display_name,role&id=eq.'+encodeURIComponent(appId));if(!p[0])throw Error('Kids Math Test user profile was not found.');S.user={authId:d.user.id,id:p[0].id,name:p[0].display_name,role:p[0].role,email:String(email)};save();return S.user}
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
  // Progress is authoritative only for approved/reviewed worksheets.
  async function progress(uid){return api('/rest/v1/progress?select=*&user_id=eq.'+encodeURIComponent(uid)+'&reviewed=eq.true&order=date.desc,id.desc')}
  async function worksheets(uid){return api('/rest/v1/worksheets?select=*&user_id=eq.'+encodeURIComponent(uid)+'&order=submitted_at.desc')}
  async function allWorksheets(){return api('/rest/v1/worksheets?select=*&order=submitted_at.desc')}
  window.KMT={load,login,logout,me,submit,pending,reviewed,progress,worksheets,allWorksheets,voidWorksheet,api};
})();
