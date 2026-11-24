// Run locally. Writes secrets only to a gitignored file, never to stdout.
import {passwordHash} from '../../server/cms/auth.mjs';
import {writeFile} from 'node:fs/promises';
const password=process.env.CMS_INITIAL_PASSWORD;
if(!password)throw Error('Set CMS_INITIAL_PASSWORD in your local shell. Do not commit it.');
await writeFile('.dev.vars.cms',`CMS_ADMIN_USERNAME="админ"\nCMS_ADMIN_PASSWORD_HASH="${await passwordHash(password)}"\nCMS_AUTH_SECRET="${crypto.randomUUID()+crypto.randomUUID()}"\n`,{mode:0o600,flag:'wx'});
console.log('Created .dev.vars.cms (ignored by Git). Store its values as encrypted Cloudflare secrets.');
