import {env} from 'cloudflare:workers';
import {validateDecision,type Decision} from './model';
export function database(){if(!env.DB)throw new Error('unavailable');return env.DB;}
export async function listDecisions(owner:string){const r=await database().prepare('SELECT id,title,payload,created,updated FROM decisions WHERE owner=? ORDER BY updated DESC LIMIT 100').bind(owner).all<{id:string;title:string;payload:string;created:string;updated:string}>();return r.results.map(({payload,...v})=>({...v,decision:JSON.parse(payload) as Decision}));}
export async function saveDecision(owner:string,input:unknown,id?:string){const decision=validateDecision(input),key=id??crypto.randomUUID();if(typeof key!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(key))throw new Error('invalid');const now=new Date().toISOString();const db=database();
 // A conditional INSERT bounds account storage; conflicts update only the owning account.
 const r=await db.prepare(`INSERT INTO decisions(id,owner,title,payload,created,updated) SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM decisions WHERE owner=?)<100 OR EXISTS(SELECT 1 FROM decisions WHERE id=? AND owner=?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,payload=excluded.payload,updated=excluded.updated WHERE decisions.owner=excluded.owner`).bind(key,owner,decision.title,JSON.stringify(decision),now,now,owner,key,owner).run();
 if(!r.meta.changes)throw new Error('limit');return {id:key,decision,updated:now};}
export async function deleteDecision(owner:string,id:string){await database().prepare('DELETE FROM decisions WHERE id=? AND owner=?').bind(id,owner).run();}
export async function lastConnection(owner:string){return database().prepare('SELECT last_call FROM connections WHERE owner=?').bind(owner).first<{last_call:string}>();}
export async function markConnection(owner:string){await database().prepare('INSERT INTO connections(owner,last_call) VALUES(?,?) ON CONFLICT(owner) DO UPDATE SET last_call=excluded.last_call').bind(owner,new Date().toISOString()).run();}
