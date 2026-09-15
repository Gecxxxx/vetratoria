import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { handleContact } from '../../server/contact.mjs';
const payload = () => ({ name: 'Test rider', contact: 'test@example.org', country: 'vietnam', sport: 'Сёрфинг', intent: 'Записаться', direction: 'Вьетнам · Муйне', message: 'Isolated test', source: '/vietnam/surf/', pageUrl: 'https://test.example/vietnam/surf/', requestId: crypto.randomUUID(), startedAt: Date.now()-5000, website: '', attribution: {utm_source: 'test'} });
function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../../server/contact-schema.sql', import.meta.url), 'utf8'));
  const db = { prepare(sql) { return { bind(...args) { return { first: async () => sqlite.prepare(sql).get(...args), run: async () => sqlite.prepare(sql).run(...args) }; }, first: async () => sqlite.prepare(sql).get() }; } };
  const env = { CONTACT_DB: db, TELEGRAM_BOT_TOKEN: 'test-only', CONTACT_CHAT_VIETNAM: 'test-only', CONTACT_HASH_SECRET: 'isolated-test' };
  const request = (data, headers = {}) => new Request('https://test.example/api/contact', { method:'POST', headers: { 'Content-Type':'application/json', Origin:'https://test.example', 'CF-Connecting-IP':'192.0.2.1', ...headers }, body: JSON.stringify(data) });
  return { sqlite, env, request };
}
test('reject invalid input, honeypot, premature submit, origin and oversized body without delivery', async () => {
  const {env,request} = fixture(); let calls=0; const send = async () => {calls++;};
  for (const change of [{name:''},{contact:'bad'},{country:'elsewhere'},{sport:'invented'},{website:'bot'},{startedAt:Date.now()},{message:'x'.repeat(1201)}]) assert.equal((await handleContact(request({...payload(),...change}),env,send)).status,400);
  assert.equal((await handleContact(request(payload(),{Origin:'https://evil.example'}),env,send)).status,403);
  assert.equal((await handleContact(request({...payload(),message:'x'.repeat(17000)}),env,send)).status,413);
  assert.equal(calls,0);
});
test('missing secrets or schema fail closed and health is honest', async () => {
  const {request,env}=fixture();
  assert.equal((await handleContact(request(payload()),{})).status,503);
  const response=await handleContact(new Request('https://test.example/api/contact?country=vietnam'),{});
  assert.deepEqual(await response.json(),{available:false});
  assert.deepEqual(await (await handleContact(new Request('https://test.example/api/contact?country=vietnam'),env)).json(),{available:true});
});
test('accept only acknowledged Telegram delivery; idempotency survives repeat and concurrent requests', async () => {
  const {env,request,sqlite}=fixture(); let sends=0;
  const send=async (_,options)=>{sends++; assert.equal(JSON.parse(options.body).chat_id,'test-only'); return Response.json({ok:true});};
  const data=payload();
  const responses=await Promise.all([handleContact(request(data),env,send),handleContact(request(data),env,send)]);
  assert.ok(responses.some(x=>x.status===200)); assert.equal(sends,1);
  assert.equal((await (await handleContact(request(data),env,send)).json()).accepted,true);
  assert.equal((await handleContact(request({...data,requestId:crypto.randomUUID()}),env,send)).status,409);
  assert.equal((await handleContact(request({...data,message:'changed'}),env,send)).status,409);
  assert.equal(sends,1);
  assert.ok(!JSON.stringify(sqlite.prepare('SELECT * FROM contact_requests').all()).includes('test@example.org'));
});
test('delivery error allows retry; network uncertainty cannot double-send; rate limit works', async () => {
  const {env,request}=fixture(); const data=payload();
  assert.equal((await handleContact(request(data),env,async()=>Response.json({ok:false}))).status,502);
  assert.equal((await handleContact(request(data),env,async()=>Response.json({ok:true}))).status,200);
  const uncertain=payload(); uncertain.message='uncertain';
  assert.equal((await handleContact(request(uncertain),env,async()=>{throw Error('timeout');})).status,502);
  let sends=0; const send=async()=>{sends++;return Response.json({ok:true});};
  assert.equal((await handleContact(request(uncertain),env,send)).status,409); assert.equal(sends,0);
  for(let i=0;i<2;i++) await handleContact(request({...payload(),message:`unique ${i}`}),env,send);
  assert.equal((await handleContact(request({...payload(),message:'limited'}),env,send)).status,429);
});
test('client: success requires acknowledgement; errors preserve values; double submit sends once; analytics excludes personal data', async () => {
  const code=readFileSync(new URL('../../assets/js/app.js',import.meta.url),'utf8');
  const section=code.slice(code.indexOf('  const countryOption ='),code.indexOf('  const contactDialog ='));
  const handlers={}; const note={textContent:''}; const button={disabled:false}; const values=payload();
  const form={dataset:{endpoint:'/api/contact',direction:'Вьетнам'},elements:Object.fromEntries(Object.entries(values).filter(([,v])=>typeof v==='string').map(([k,v])=>[k,{value:v}])),hasAttribute:()=>true,querySelector:(selector)=>selector==='[data-form-note]'?note:selector==="[type='submit']"?button:null,reportValidity:()=>true,setAttribute(){},removeAttribute(){},addEventListener:(name,cb)=>handlers[name]=cb};
  const events=[]; let sends=0, resolveFetch;
  const location={origin:'https://test.example',pathname:'/vietnam/surf/',href:'https://test.example/vietnam/surf/',search:''};
  const doc={querySelectorAll:()=>[form],dispatchEvent:e=>events.push(e)};
  const env={document:doc,window:{location},location,FormData:class{constructor(form){this.form=form;}get(key){return this.form.elements[key]?.value;}},CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail;}},crypto,URL,URLSearchParams,AbortSignal,sessionStorage:{getItem:()=>null,setItem(){}},fetch:async()=>{sends++;return new Promise(r=>resolveFetch=r);}};
  runInNewContext(section,env); form.dataset.startedAt=Date.now()-5000;
  const event={preventDefault(){}};
  const first=handlers.submit(event);await handlers.submit(event);assert.equal(sends,1);assert.equal(button.disabled,true);
  resolveFetch(Response.json({ok:true}));await first;assert.equal(form.elements.name.value,'Test rider');assert.match(note.textContent,/Не удалось/);
  const second=handlers.submit(event);resolveFetch(Response.json({ok:true,accepted:true,requestId:form._contactRequestId}));await second;
  assert.equal(form.elements.name.value,'');assert.match(note.textContent,/Заявка принята/);assert.equal(button.disabled,false);
  assert.deepEqual(events.map(e=>e.type),['vetratoria:contact-attempt','vetratoria:contact-error','vetratoria:contact-attempt','vetratoria:contact-success']);
  assert.ok(!JSON.stringify(events).includes('test@example.org'));assert.ok(!JSON.stringify(events).includes('Test rider'));
});
