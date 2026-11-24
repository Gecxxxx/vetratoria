import {Problem,fail,validatePost,pathFor,assetURLs} from './model.mjs';
import {sha,passwordHash,verifyPassword,userFor,cookie} from './auth.mjs';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function bytes(request,limit){const reader=request.body?.getReader();if(!reader)return new Uint8Array();let size=0,parts=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();fail(413,'Файл или документ слишком большой');}parts.push(value);}const out=new Uint8Array(size);let pos=0;for(const p of parts){out.set(p,pos);pos+=p.length;}return out;}
async function body(request){try{return JSON.parse(new TextDecoder().decode(await bytes(request,1024*1024)));}catch(e){if(e instanceof Problem)throw e;fail(400,'Некорректный документ');}}
const admin=u=>{if(u.role!=='admin')fail(403,'Публиковать и управлять доступом может администратор');};
function shape(row){return {...JSON.parse(row.draft),id:row.id,path:row.path,revision:row.revision,state:row.state,updatedAt:row.updated_at,hasPublished:!!row.published,changed:!!row.published&&row.draft!==row.published};}
export async function handleCMS(request,env){try{
 const db=env.CMS_DB;const url=new URL(request.url), route=url.pathname.replace(/^\/api\/cms\/?/,'').split('/').filter(Boolean),method=request.method;
 if(!db)fail(503,'Серверное хранилище ещё не подключено. Сохранение и публикация пока недоступны.');
 if(!['GET','HEAD'].includes(method)&&request.headers.get('Origin')!==url.origin)fail(403,'Запрос с другого сайта запрещён');
 if(route[0]==='login'&&method==='POST'){
  const {username,password}=await body(request);if(typeof username!=='string'||typeof password!=='string'||username.length>100||password.length>256)fail(400,'Проверьте логин и пароль');
  if(!env.CMS_AUTH_SECRET)fail(503,'Вход ещё не настроен');
  const now=Date.now(), key=await sha(env.CMS_AUTH_SECRET+':'+(request.headers.get('CF-Connecting-IP')||'unknown'));
  const attempt=await db.prepare('INSERT INTO cms_attempts(key,count,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END, reset_at=CASE WHEN reset_at<? THEN excluded.reset_at ELSE reset_at END RETURNING count').bind(key,now+900000,now,now).first();
  if(attempt.count>8)fail(429,'Слишком много попыток. Повторите через 15 минут.');
  if(env.CMS_ADMIN_PASSWORD_HASH)await db.prepare('INSERT OR IGNORE INTO cms_users VALUES (?,?,?,?,?)').bind('owner',env.CMS_ADMIN_USERNAME||'админ',env.CMS_ADMIN_PASSWORD_HASH,'admin',new Date().toISOString()).run();
  const u=await db.prepare('SELECT * FROM cms_users WHERE username=?').bind(username).first();
  if(!await verifyPassword(password,u?.password_hash||'dummy:0000000000000000000000000000000000000000000000000000000000000000'))fail(401,'Неверный логин или пароль');
  const token=crypto.randomUUID()+crypto.randomUUID();await db.batch([db.prepare('DELETE FROM cms_sessions WHERE expires<?').bind(now),db.prepare('DELETE FROM cms_attempts WHERE reset_at<?').bind(now),db.prepare('INSERT INTO cms_sessions VALUES (?,?,?)').bind(await sha(token),u.id,now+43200000)]);
  return json({user:{username:u.username,role:u.role}},200,{'Set-Cookie':cookie(token)});
 }
 const user=await userFor(request,db);
 if(route[0]==='session'&&method==='GET')return json({user,uploads:!!env.CMS_MEDIA});
 if(route[0]==='logout'&&method==='POST'){const token=request.headers.get('Cookie')?.match(/__Host-vetratoria_cms=([^;]+)/)?.[1];await db.prepare('DELETE FROM cms_sessions WHERE token_hash=?').bind(await sha(token||'')).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
 if(route[0]==='password'&&method==='POST'){const b=await body(request);if(typeof b.password!=='string'||b.password.length<8||b.password.length>256)fail(400,'Новый пароль — от 8 до 256 символов');const row=await db.prepare('SELECT password_hash FROM cms_users WHERE id=?').bind(user.id).first();if(typeof b.current!=='string'||!await verifyPassword(b.current,row.password_hash))fail(400,'Текущий пароль неверен');await db.batch([db.prepare('UPDATE cms_users SET password_hash=? WHERE id=?').bind(await passwordHash(b.password),user.id),db.prepare('DELETE FROM cms_sessions WHERE user_id=?').bind(user.id)]);return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
 if(route[0]==='users'){
  admin(user);
  if(method==='GET')return json({items:(await db.prepare('SELECT id,username,role FROM cms_users').all()).results});
  if(method==='POST'){const b=await body(request);if(typeof b.username!=='string'||!b.username.trim()||b.username.length>100||typeof b.password!=='string'||b.password.length<8||b.password.length>256||!['admin','editor'].includes(b.role))fail(400,'Проверьте логин, роль и пароль (минимум 8 символов)');await db.prepare('INSERT INTO cms_users VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),b.username.trim(),await passwordHash(b.password),b.role,new Date().toISOString()).run();return json({ok:true});}
  if(method==='DELETE'&&route[1]){if(route[1]===user.id||route[1]==='owner')fail(400,'Нельзя удалить владельца или свой аккаунт');await db.batch([db.prepare('DELETE FROM cms_sessions WHERE user_id=?').bind(route[1]),db.prepare('DELETE FROM cms_users WHERE id=?').bind(route[1])]);return json({ok:true});}
 }
 if(route[0]==='posts'){
  if(!route[1]&&method==='GET'){const rows=await db.prepare('SELECT id,path,title,kind,country,sports,state,revision,updated_at,CASE WHEN published IS NOT NULL AND published!=draft THEN 1 ELSE 0 END AS changed FROM cms_posts ORDER BY updated_at DESC LIMIT 1000').all();return json({items:rows.results});}
  if(!route[1]&&method==='POST'){const p=validatePost(await body(request));const id=crypto.randomUUID();await db.prepare('INSERT INTO cms_posts(id,path,kind,title,country,sports,draft,updated_at,updated_by) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,pathFor(p),p.kind,p.title,p.country,JSON.stringify(p.sports),JSON.stringify(p),new Date().toISOString(),user.username).run();return json({id,revision:1,path:pathFor(p)},201);}
  const row=await db.prepare('SELECT * FROM cms_posts WHERE id=?').bind(route[1]||'').first();if(!row)fail(404,'Публикация не найдена');
  if(route[2]==='versions'&&method==='GET'){const rows=await db.prepare('SELECT revision,created_at,author FROM cms_versions WHERE post_id=? ORDER BY revision DESC LIMIT 100').bind(row.id).all();return json({items:rows.results});}
  if(route[2]==='version'&&method==='GET'){const v=await db.prepare('SELECT draft FROM cms_versions WHERE post_id=? AND revision=?').bind(row.id,Number(url.searchParams.get('revision'))).first();if(!v)fail(404,'Версия не найдена');return json(JSON.parse(v.draft));}
  if(method==='GET')return json(shape(row));
  if(method==='PUT'&&!route[2]){
   const b=await body(request),p=validatePost(b.document);if(b.revision!==row.revision)fail(409,'Материал изменён в другом окне. Ваш текст сохранён в редакторе; откройте свежую версию отдельно.');
   if(p.kind!==row.kind)fail(400,'Тип публикации нельзя менять');
   const path=row.state!=='draft'||row.imported?row.path:pathFor(p);if((row.state!=='draft'||row.imported)&&p.slug!==JSON.parse(row.draft).slug)fail(400,'Адрес опубликованного материала менять нельзя');
   const updated=await db.prepare('UPDATE cms_posts SET path=?,title=?,country=?,sports=?,draft=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=? AND revision=? RETURNING revision').bind(path,p.title,p.country,JSON.stringify(p.sports),JSON.stringify(p),new Date().toISOString(),user.username,row.id,b.revision).first();if(!updated)fail(409,'Конфликт версий. Не закрывайте редактор.');return json({...updated,path});
  }
  if(method==='POST'&&['publish','unpublish'].includes(route[2])){
   admin(user);const b=await body(request);if(b.revision!==row.revision)fail(409,'Перед публикацией загрузите актуальную версию');
   const p=JSON.parse(row.draft);if(route[2]==='publish'){
    validatePost(p,true);
    for(const a of new Set(assetURLs(p).filter(u=>u.startsWith('/uploads/'))))if(!await db.prepare('SELECT id FROM cms_assets WHERE url=?').bind(a).first())fail(400,'Одна из загрузок не завершена');
   }
   const r=await db.prepare('UPDATE cms_posts SET published=?,state=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=? AND revision=? RETURNING revision').bind(route[2]==='publish'?row.draft:null,route[2]==='publish'?'published':'unpublished',new Date().toISOString(),user.username,row.id,b.revision).first();if(!r)fail(409,'Конфликт версий');return json({...r,path:row.path});
  }
 }
 if(route[0]==='assets'){
  if(method==='GET')return json({items:(await db.prepare('SELECT * FROM cms_assets ORDER BY created_at DESC LIMIT 2000').all()).results});
  if(method==='POST'){
   if(!env.CMS_MEDIA)fail(503,'Хранилище файлов ещё не подключено');
   const type=request.headers.get('Content-Type')?.split(';')[0],allowed={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'};
   if(!allowed[type])fail(400,'Поддерживаются JPG, PNG, WebP, MP4 и WebM');
   const data=await bytes(request,type.startsWith('video')?25*1024*1024:12*1024*1024);
   const h=[...data.slice(0,12)].map(x=>x.toString(16).padStart(2,'0')).join('');
   if(!({'image/jpeg':h.startsWith('ffd8ff'),'image/png':h.startsWith('89504e470d0a1a0a'),'image/webp':h.startsWith('52494646')&&h.slice(16)==='57454250','video/mp4':h.slice(8,16)==='66747970','video/webm':h.startsWith('1a45dfa3')})[type])fail(400,'Содержимое файла не соответствует формату');
   const id=crypto.randomUUID(),key=id+'.'+allowed[type],path='/uploads/'+key,name=(url.searchParams.get('name')||key).slice(0,200),country=url.searchParams.get('country')||'all',sport=url.searchParams.get('sport')||'';
   await env.CMS_MEDIA.put(key,data,{httpMetadata:{contentType:type}});
   try{await db.prepare('INSERT INTO cms_assets VALUES (?,?,?,?,?,?,?,?,?)').bind(id,path,name,type,data.length,country,sport,'',new Date().toISOString()).run();}catch(e){await env.CMS_MEDIA.delete(key);throw e;}
   return json({id,url:path,name,type,alt:''},201);
  }
  if(method==='PUT'&&route[1]){const b=await body(request);if(typeof b.alt!=='string'||b.alt.length>500)fail(400,'Описание до 500 символов');await db.prepare('UPDATE cms_assets SET alt=? WHERE id=?').bind(b.alt,route[1]).run();return json({ok:true});}
  if(method==='DELETE'&&route[1]){
   admin(user);const a=await db.prepare('SELECT * FROM cms_assets WHERE id=?').bind(route[1]).first();if(!a)fail(404,'Файл не найден');
   const refs=(await db.prepare('SELECT id,title FROM cms_posts WHERE instr(draft,?)>0 OR instr(COALESCE(published,\'\'),?)>0').bind(a.url,a.url).all()).results;
   const history=await db.prepare('SELECT post_id FROM cms_versions WHERE instr(draft,?)>0 LIMIT 1').bind(a.url).first();if(refs.length||history) return json({error:'Файл используется в публикации или её истории',references:refs},409);
   if(a.url.startsWith('/uploads/')){if(!env.CMS_MEDIA)fail(503,'Хранилище недоступно');await env.CMS_MEDIA.delete(a.url.slice(9));}
   await db.prepare('DELETE FROM cms_assets WHERE id=?').bind(a.id).run();return json({ok:true});
  }
 }
 fail(404,'Маршрут не найден');
}catch(e){if(e instanceof Problem)return json({error:e.message},e.status);if(/UNIQUE constraint/.test(e.message))return json({error:'Этот адрес или логин уже занят'},409);console.error('CMS request failed',e.name);return json({error:'Не удалось выполнить запрос. Проверьте подключение базы и повторите.'},503);}}
