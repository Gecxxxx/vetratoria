export const types = {text:'Текст',image:'Фотография',split:'Фото и текст',pair:'Две фотографии',gallery:'Галерея',video:'Видео',quote:'Цитата',faq:'Вопросы и ответы',button:'Кнопка'};
export const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value, media=false) {
 const s=String(value||'');
 if (/^\/(?!\/)[a-zA-Z0-9_./%?=&+#-]*$/.test(s) && !s.includes('..')) return s;
 try {const u=new URL(s);if(u.protocol==='https:'&&!u.username&&!u.password&&!media)return u.href;}catch{}
 return '';
}
export function rich(text='') {
 const inline=t=>esc(t).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>`<a href="${esc(safeURL(url.replace(/&amp;/g,'&')))}" rel="noopener noreferrer">${label}</a>`);
 return text.split(/\n\s*\n/).map(part=>{
  if(/^###? /.test(part)){const level=part.startsWith('### ')?3:2;return `<h${level}>${inline(part.replace(/^###? /,''))}</h${level}>`;}
  if(part.split('\n').every(l=>/^[-*] /.test(l)))return `<ul>${part.split('\n').map(l=>`<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
  return `<p>${inline(part).replace(/\n/g,'<br>')}</p>`;
 }).join('');
}
const photo=(url,alt='',caption='',position=50)=>`<figure><a href="${esc(safeURL(url,true))}" target="_blank" rel="noopener"><img src="${esc(safeURL(url,true))}" alt="${esc(alt)}" style="object-position:${Number(position)||50}% 50%" loading="lazy"></a>${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`;
export function renderBlocks(blocks=[]) {return blocks.filter(b=>!b.hidden).map(b=>{
 const variant=['left','right','wide','equal','large','grid','slider'].includes(b.variant)?b.variant:'';
 let html='';
 switch(b.type){
 case 'text':html=rich(b.text);break;
 case 'image':html=photo(b.url,b.alt,b.caption,b.position);break;
 case 'split':html=photo(b.url,b.alt,b.caption,b.position)+`<div>${rich(b.text)}</div>`;break;
 case 'pair':case 'gallery':html=(b.images||[]).map(i=>photo(i.url,i.alt,i.caption,i.position)).join('');break;
 case 'video': {const src=safeURL(b.url,true); if(src)html=`<video controls preload="metadata" playsinline ${b.poster?`poster="${esc(safeURL(b.poster,true))}"`:''}><source src="${esc(src)}"></video>`;else {try{let u=new URL(b.url);let id=u.hostname==='youtu.be'?u.pathname.slice(1):(['youtube.com','www.youtube.com'].includes(u.hostname)?u.searchParams.get('v'):null);if(/^[\w-]{11}$/.test(id||''))html=`<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(b.caption||'Видео')}" loading="lazy" allowfullscreen></iframe>`;}catch{}}if(b.caption)html+=`<p>${esc(b.caption)}</p>`;break;}
 case 'quote':html=`<blockquote>${rich(b.text)}${b.caption?`<cite>${esc(b.caption)}</cite>`:''}</blockquote>`;break;
 case 'faq':html=(b.items||[]).map(i=>`<details><summary>${esc(i.question)}</summary>${rich(i.answer)}</details>`).join('');break;
 case 'button':html=`<a class="cms-button" href="${esc(safeURL(b.url))}">${esc(b.text)}</a>`;break;
 }
 return `<section class="cms-block cms-${esc(b.type)} ${variant}">${html}</section>`;
}).join('');}
export function renderArticle(p){return `<article class="cms-article"><header><p class="cms-eyebrow">${esc(({dahab:'Дахаб',vietnam:'Вьетнам',russia:'Должанка',all:'Ветратория'})[p.country])} · ${esc(p.date)}</p><h1>${esc(p.title)}</h1><p class="cms-lead">${esc(p.description)}</p>${p.cover?photo(p.cover,p.coverAlt||p.title,'',p.coverPosition):''}</header>${renderBlocks(p.blocks)}</article>`;}
