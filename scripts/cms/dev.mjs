// Local development only. Binds to loopback and uses disposable .cache data.
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFile,mkdir,stat,writeFile,rm} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {handleCMS} from '../../server/cms/api.mjs';
import {renderArticle} from '../../assets/cms/blocks.mjs';
import {listing} from '../../server/cms/public.mjs';
const root=resolve('.'),base=resolve('.cache/cms');await mkdir(base+'/uploads',{recursive:true});
const sqlite=new DatabaseSync(base+'/dev.db');sqlite.exec(await readFile('server/cms/schema.sql','utf8'));sqlite.exec(await readFile('server/cms/seed.sql','utf8'));
function prepare(sql,args=[]){return {bind:(...a)=>prepare(sql,a),first:async()=>sqlite.prepare(sql).get(...args)||null,all:async()=>({results:sqlite.prepare(sql).all(...args)}),run:async()=>sqlite.prepare(sql).run(...args)};}
const db={prepare,async batch(items){sqlite.exec('BEGIN');try{const result=[];for(const item of items)result.push(await item.run());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
const secrets=Object.fromEntries((await readFile('.dev.vars.cms','utf8')).trim().split('\n').map(l=>{const i=l.indexOf('=');return [l.slice(0,i),JSON.parse(l.slice(i+1))];}));
const env={...secrets,CMS_DB:db,CMS_MEDIA:{put:async(k,v)=>writeFile(base+'/uploads/'+k,v),delete:async k=>rm(base+'/uploads/'+k,{force:true})}};
const mime={'.html':'text/html; charset=utf-8','.php':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2'};
createServer(async(req,res)=>{try{const origin='http://127.0.0.1:4174',url=new URL(req.url,origin);let response;
if(url.pathname.startsWith('/api/cms/')){const request=new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:req,duplex:'half'})});response=await handleCMS(request,env);}
else if(url.pathname.startsWith('/blog/')||url.pathname.startsWith('/media/')||url.pathname.startsWith('/ru/blog/')){const row=sqlite.prepare('SELECT * FROM cms_posts WHERE path=?').get(url.pathname),isList=['/blog/','/media/'].includes(url.pathname)||/^\/media\/(dahab|vietnam|russia)\/$/.test(url.pathname);let html;if(isList)html=listing(sqlite.prepare('SELECT * FROM cms_posts').all(),url.pathname.includes('/blog/')?'blog':'media',url);else if(row?.published)html=renderArticle(JSON.parse(row.published));response=html?new Response('<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/cms/public.css"><main>'+html+'</main></html>',{headers:{'Content-Type':'text/html; charset=utf-8'}}):new Response('Not found',{status:404});}
else{let file;if(url.pathname.startsWith('/uploads/'))file=resolve(base,'.'+url.pathname);else{file=resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+'/')&&file!==root)throw Error('Bad path');if(!['/admin/','/assets/'].some(p=>url.pathname.startsWith(p)))throw Error('Not served by local CMS development');if((await stat(file)).isDirectory())file+='/index.html';}response=new Response(await readFile(file),{headers:{'Content-Type':mime[extname(file)]||'application/octet-stream'}});}
res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(404);res.end('Not found');}}).listen(4174,'127.0.0.1',()=>console.log('CMS local development: http://127.0.0.1:4174/admin/'));
