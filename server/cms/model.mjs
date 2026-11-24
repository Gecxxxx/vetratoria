import {types,safeURL} from '../../assets/cms/blocks.mjs';
export class Problem extends Error {constructor(status,message){super(message);this.status=status;}}
export const fail=(status,message)=>{throw new Problem(status,message)};
const str=(v,max=20000)=>{if(typeof v!=='string'||v.length>max)fail(400,'Некорректный текст');return v;};
export function validatePost(p,publishing=false){
 if(!p||!['blog','media'].includes(p.kind)||!['all','dahab','vietnam','russia'].includes(p.country))fail(400,'Выберите тип и направление');
 if(!['ru','en'].includes(p.lang)||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||(Number.isNaN(Date.parse(p.date))||new Date(p.date).toISOString().slice(0,10)!==p.date))fail(400,'Проверьте язык и дату');
 str(p.title,180);str(p.description,500);str(p.slug,160);
 if(!/^[a-z0-9][a-z0-9-]*$/.test(p.slug))fail(400,'Адрес: латинские буквы, цифры и дефисы');
 if(!Array.isArray(p.sports)||p.sports.some(x=>!['windsurf','wingfoil','kite','surf','wsk'].includes(x)))fail(400,'Некорректный спорт');
 for(const k of ['cover','coverAlt','seoTitle','seoDescription','translationId'])if(p[k]!=null)str(p[k],k==='seoDescription'?500:500);
 if(p.cover&&!safeURL(p.cover,true))fail(400,'Обложка должна быть из медиатеки');
 if(!Array.isArray(p.blocks)||p.blocks.length>100)fail(400,'Не более 100 блоков');
 for(const b of p.blocks){
  if(!b||!Object.hasOwn(types,b.type))fail(400,'Неизвестный блок');
  for(const key of ['text','url','alt','caption','poster'])if(b[key]!=null)str(b[key]);
  if(b.url&&!safeURL(b.url,['image','split'].includes(b.type)))fail(400,'Некорректная ссылка');
  if(b.poster&&!safeURL(b.poster,true))fail(400,'Некорректная обложка видео');
  if(['pair','gallery'].includes(b.type)){if(!Array.isArray(b.images)||b.images.length>100)fail(400,'Не более 100 фотографий в блоке');for(const i of b.images){str(i.alt||'',500);str(i.caption||'',1000);if(!safeURL(i.url,true))fail(400,'Некорректная фотография');}}
  if(b.type==='faq'){if(!Array.isArray(b.items)||b.items.length>50)fail(400,'Не более 50 вопросов');for(const i of b.items){str(i.question,500);str(i.answer);}}
  if(publishing&&!b.hidden){if(b.type==='video'&&!(/^\/uploads\/[a-f0-9-]+\.(mp4|webm)$/.test(b.url||'')||/^https:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]{11}(?:&[^ ]*)?|youtu\.be\/[\w-]{11}(?:\?[^ ]*)?)$/.test(b.url||'')))fail(400,'Добавьте загруженное видео или ссылку YouTube');if(b.type==='pair'&&b.images.length!==2)fail(400,'В этом блоке нужны две фотографии');if(b.type==='faq'&&(!b.items.length||b.items.some(i=>!i.question.trim()||!i.answer.trim())))fail(400,'Заполните вопросы и ответы');if(['image','split','video','button'].includes(b.type)&&!b.url)fail(400,'Добавьте файл или ссылку в блок');if(['text','split','quote','button'].includes(b.type)&&!b.text?.trim())fail(400,'Заполните текст блока');if(['pair','gallery'].includes(b.type)&&!b.images.length)fail(400,'Добавьте фотографии');}
 }
 if(publishing&&(!p.title.trim()||!p.description.trim()||!p.cover||!p.blocks.some(b=>!b.hidden)))fail(400,'Нужны заголовок, описание, обложка и содержимое');
 if(publishing&&p.date>new Date().toISOString().slice(0,10))fail(400,'Отложенная публикация пока не поддерживается');
 return p;
}
export const pathFor=p=>p.kind==='blog'?`/blog/${p.slug}/`:`/media/${p.country}/${p.slug}/`;
export function assetURLs(p){const out=[p.cover];for(const b of p.blocks||[]){out.push(b.url,b.poster);for(const i of b.images||[])out.push(i.url);}return out.filter(Boolean);}
