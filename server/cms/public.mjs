import {renderArticle,esc} from '../../assets/cms/blocks.mjs';
export const countries={all:'Все направления',dahab:'Дахаб',vietnam:'Вьетнам',russia:'Должанка'};
const sports={windsurf:'Виндсёрфинг',wingfoil:'Вингфойл',kite:'Кайт',surf:'Сёрфинг',wsk:'Детский виндсёрфинг'};
export function listing(rows,kind,url){
 const country=url.searchParams.get('country')||url.pathname.match(/^\/(dahab|vietnam|russia)\/blog/)?.[1]||url.pathname.match(/^\/media\/(dahab|vietnam|russia)\/$/)?.[1]||'all';
 const sport=url.searchParams.get('sport')||'',q=(url.searchParams.get('q')||'').toLowerCase();
 const items=rows.filter(r=>r.kind===kind&&r.published).map(r=>({...JSON.parse(r.published),path:r.path})).filter(p=>(country==='all'||p.country===country)&&(!sport||p.sports.includes(sport))&&(!q||(p.title+' '+p.description).toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date));
 return `<div class="cms-listing"><p class="cms-eyebrow">Ветратория</p><h1>${kind==='blog'?'Блог':'Фото и видео'}</h1><form class="cms-filters"><label>Направление<select name="country">${Object.entries(countries).map(([k,v])=>`<option value="${k}" ${country===k?'selected':''}>${v}</option>`).join('')}</select></label><label>Спорт<select name="sport"><option value="">Все виды спорта</option>${Object.entries(sports).map(([k,v])=>`<option value="${k}" ${sport===k?'selected':''}>${v}</option>`).join('')}</select></label><label>Поиск<input name="q" value="${esc(url.searchParams.get('q')||'')}" placeholder="Название или тема"></label><button class="cms-button">Показать</button></form><div class="cms-cards">${items.map(p=>`<a class="cms-card" href="${esc(p.path)}"><img src="${esc(p.cover)}" alt="${esc(p.coverAlt||p.title)}" loading="lazy"><small>${esc(countries[p.country])} · ${esc(p.date)}</small><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p></a>`).join('')||'<p>Публикаций по этим фильтрам пока нет.</p>'}</div></div>`;
}
export async function publicCMS(context){
 const {request,env}=context,url=new URL(request.url),path=url.pathname;
 if(!env.CMS_DB||!['GET','HEAD'].includes(request.method))return context.next();
 if(path==='/sitemap.xml')return sitemap(context);
 const isListing=/^\/(blog|media)\/$/.test(path)||/^\/(dahab|vietnam|russia)\/blog\/$/.test(path)||/^\/media\/(dahab|vietnam|russia)\/$/.test(path);
 let row,rows;
 try{
  if(isListing){rows=(await env.CMS_DB.prepare('SELECT path,kind,published FROM cms_posts WHERE state=\'published\'').all()).results;if(!rows.length&&!await env.CMS_DB.prepare('SELECT id FROM cms_posts LIMIT 1').first())return context.next();}
  else row=await env.CMS_DB.prepare('SELECT * FROM cms_posts WHERE path=?').bind(path).first();
 }catch{return new Response('Временно недоступно. Попробуйте позже.',{status:503,headers:{'Cache-Control':'no-store'}});}
 if(!isListing&&!row)return context.next();
 if(row&&!row.published){if(row.state==='unpublished')return new Response('Материал снят с публикации',{status:404,headers:{'Cache-Control':'no-store'}});return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});}
 const p=row?JSON.parse(row.published):null,kind=path.includes('/blog')?'blog':'media',title=p?.seoTitle||p?.title||(kind==='blog'?'Блог Ветратории':'Фото и видео Ветратории'),description=p?.seoDescription||p?.description||'Истории, фотографии и видео со станций Ветратории';
 const html=p?renderArticle(p):listing(rows,kind,url);
 const structured=p?JSON.stringify({'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,description:p.description,datePublished:p.date,image:new URL(p.cover,url).href,mainEntityOfPage:url.origin+path}).replaceAll('<','\\u003c'):'';
 // Use the site's existing header, navigation and footer, even for newly created URLs.
 const shell=await env.ASSETS.fetch(new Request(new URL('/blog/',url),{method:'GET'}));
 if(!shell.ok)return context.next();
 const transformed=new HTMLRewriter()
 .on('main', {element(e){e.setInnerContent(html,{html:true});}})
 .on('title',{element(e){e.setInnerContent(title);}})
 .on('meta[name="description"],meta[property="og:description"]',{element(e){e.setAttribute('content',description);}})
 .on('meta[property="og:title"]',{element(e){e.setAttribute('content',title);}})
 .on('meta[property="og:image"]',{element(e){if(p?.cover)e.setAttribute('content',new URL(p.cover,url).href);}})
 .on('link[rel="canonical"],meta[property="og:url"]',{element(e){e.setAttribute(e.tagName==='link'?'href':'content',url.origin+path);}})
 .on('script[type="application/ld+json"]',{element(e){e.remove();}})
 .on('head',{element(e){e.append('<link rel="stylesheet" href="/assets/cms/public.css">'+(structured?'<script type="application/ld+json">'+structured+'</script>':''),{html:true});}})
 .transform(shell);
 const headers=new Headers(transformed.headers);headers.delete('Content-Length');headers.delete('ETag');headers.set('Cache-Control','no-store');if(url.hostname.endsWith('.pages.dev'))headers.set('X-Robots-Tag','noindex');
 return new Response(request.method==='HEAD'?null:transformed.body,{status:200,headers});
}

export async function sitemap(context){
 const response=await context.env.ASSETS.fetch(context.request);
 if(!response.ok)return response;
 let rows;try{rows=(await context.env.CMS_DB.prepare('SELECT path,published,updated_at FROM cms_posts').all()).results;}catch{return response;}
 let xml=await response.text();
 for(const row of rows){xml=xml.replace(/<url>[\s\S]*?<\/url>/g,entry=>{const loc=entry.match(/<loc>(.*?)<\/loc>/)?.[1];try{return new URL(loc).pathname===row.path?'':entry;}catch{return entry;}});}
 const origin=xml.match(/<loc>(https?:\/\/[^/]+)/)?.[1]||new URL(context.request.url).origin;
 const additions=rows.filter(r=>r.published).map(r=>`<url><loc>${esc(origin+r.path)}</loc><lastmod>${esc(r.updated_at.slice(0,10))}</lastmod></url>`).join('\n');
 xml=xml.replace('</urlset>',additions+'\n</urlset>');
 return new Response(context.request.method==='HEAD'?null:xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store'}});
}
