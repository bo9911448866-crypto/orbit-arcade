import {mkdir} from 'node:fs/promises';import {spawnSync} from 'node:child_process';import {existsSync} from 'node:fs';import {commit} from '../server/catalog';
await mkdir('vendor',{recursive:true});
if(existsSync('vendor/monkeygg2'))throw Error('vendor/monkeygg2 already exists; move it before downloading again.');
function git(args:string[]){const result=spawnSync('git',args,{stdio:'inherit'});if(result.status!==0)throw Error('git failed');}
git(['init','vendor/monkeygg2']);git(['-C','vendor/monkeygg2','remote','add','origin','https://gitlab.com/barryjensen-dev/monkeygg2.git']);git(['-C','vendor/monkeygg2','fetch','--depth','1','origin',commit]);git(['-C','vendor/monkeygg2','checkout','--detach','FETCH_HEAD']);console.log('All repository assets are available locally at the pinned revision.');
