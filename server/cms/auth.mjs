import {fail} from './model.mjs';
export const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function passwordHash(password,salt=crypto.randomUUID()){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 return salt+':'+Array.from(new Uint8Array(bits)).map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function verifyPassword(password,hash){if(!hash)return false;const expected=await passwordHash(password,hash.split(':')[0]);let diff=expected.length^hash.length;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^hash.charCodeAt(i);return diff===0;}
export async function userFor(request,db){const token=request.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-vetratoria_cms=([^;]+)/)?.[1];if(!token)fail(401,'Войдите в админку');const u=await db.prepare('SELECT u.id,u.username,u.role FROM cms_users u JOIN cms_sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>?').bind(await sha(token),Date.now()).first();if(!u)fail(401,'Сессия истекла. Войдите снова');return u;}
export const cookie=(token,age=43200)=>`__Host-vetratoria_cms=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
