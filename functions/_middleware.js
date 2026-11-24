import {publicCMS} from '../server/cms/public.mjs';
export const onRequest=async context=>{
 const path=new URL(context.request.url).pathname;
 if(path.startsWith('/admin')){const response=await context.next();const h=new Headers(response.headers);h.set('Cache-Control','no-store');h.set('X-Robots-Tag','noindex, nofollow');h.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; frame-src https://www.youtube-nocookie.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");return new Response(response.body,{status:response.status,headers:h});}
 if(path.startsWith('/api/')||path.startsWith('/uploads/'))return context.next();
 return publicCMS(context);
};
