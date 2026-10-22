import {writeFile} from 'node:fs/promises';
const root='https://gitlab.com/api/v4/projects/barryjensen-dev%2Fmonkeygg2/repository';
const response=await fetch(root+'/commits/main');if(!response.ok)throw Error('Commit fetch failed: '+response.status);
const commit=await response.json();
const config=await fetch(root+'/files/config.jsonc/raw?ref='+commit.id);if(!config.ok)throw Error('Catalog fetch failed: '+config.status);
await writeFile('data/upstream-config.jsonc',await config.text());await writeFile('data/upstream-commit.json',JSON.stringify(commit,null,2));console.log('Catalog pinned to '+commit.id);
