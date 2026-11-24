export async function onRequest({request,env,params}){
 if(!env.CMS_MEDIA)return new Response('Not found',{status:404});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const key=params.path.join('/');if(!/^[\w-]+\.(jpg|png|webp|mp4|webm)$/.test(key))return new Response('Not found',{status:404});
 const obj=await env.CMS_MEDIA.get(key,{range:request.headers});if(!obj)return new Response('Not found',{status:404});
 const headers=new Headers({'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'});obj.writeHttpMetadata(headers);headers.set('ETag',obj.httpEtag);
 let status=200;if(obj.range){const offset=obj.range.suffix!==undefined?Math.max(0,obj.size-obj.range.suffix):(obj.range.offset||0),length=Math.min(obj.range.length??obj.range.suffix??(obj.size-offset),obj.size-offset);headers.set('Content-Range',`bytes ${offset}-${offset+length-1}/${obj.size}`);headers.set('Content-Length',String(length));status=206;}else headers.set('Content-Length',String(obj.size));
 return new Response(request.method==='HEAD'?null:obj.body,{status,headers});
}
