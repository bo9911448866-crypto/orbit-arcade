import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {parse} from 'jsonc-parser';
export type Game={id:string;name:string;path:string;categories:string[];aliases:string[];cover?:string};
const covers=JSON.parse(readFileSync(resolve('data/covers.json'),'utf8')) as Record<string,string>;
const config=parse(readFileSync(resolve('data/upstream-config.jsonc'),'utf8'));
const extras=JSON.parse(readFileSync(resolve('data/extra-games.json'),'utf8')) as Omit<Game,'id'>[];
export const games:Game[]=[...Object.entries(config.games).map(([name,value])=>({name,...value as Omit<Game,'id'|'name'>})),...extras.filter(g=>!Object.values(config.games).some((c:any)=>c.path===g.path))].map((g,i)=>({...g,id:String(i),cover:covers[g.path]}));
export const commit=JSON.parse(readFileSync(resolve('data/upstream-commit.json'),'utf8')).id as string;
export function assetPath(raw:string){
 let path:string;try{path=decodeURIComponent(raw);}catch{return null;}
 if(path.includes('\\')||path.split('/').some(s=>s==='..')||path.includes('\0'))return null;
 path=path.replace(/^\/+/, '');
 if(!/^(games|imgs|fonts|js|css)\//.test(path))return null;
 if(path.endsWith('/'))path+='index.html';
 else if(!/\.[a-zA-Z0-9]{1,8}$/.test(path))path+='/index.html';
 return path;
}
