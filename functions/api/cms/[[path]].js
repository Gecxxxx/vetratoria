import {handleCMS} from '../../../server/cms/api.mjs';
export const onRequest=({request,env})=>handleCMS(request,env);
