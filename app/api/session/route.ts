import {getChatGPTUser} from '../../chatgpt-auth';
import {lastConnection} from '@/lib/store';
export async function GET(){const u=await getChatGPTUser();if(!u)return Response.json({user:null,lastCall:null},{headers:{'Cache-Control':'no-store'}});try{const c=await lastConnection(u.userId);return Response.json({user:{name:u.displayName},lastCall:c?.last_call??null},{headers:{'Cache-Control':'private, no-store'}})}catch{return Response.json({user:{name:u.displayName},lastCall:null,storageAvailable:false},{headers:{'Cache-Control':'private, no-store'}})}}
