import {test} from 'node:test';import assert from 'node:assert/strict';
import {resolveProxyAddress} from '../src/proxy';
test('addresses and deep game links retain their path, query, and fragment',()=>{
 assert.equal(resolveProxyAddress('poki.com/en/g/subway-surfers?test=1#play'),'https://poki.com/en/g/subway-surfers?test=1#play');
 assert.equal(resolveProxyAddress(' https://poki.com/en/g/drive-mad '),'https://poki.com/en/g/drive-mad');
 assert.equal(resolveProxyAddress('localhost:3000/test'),'https://localhost:3000/test');
});
test('plain text uses DuckDuckGo rather than being treated as a hostname',()=>{
 for(const q of ['car games','poki games','geometry dash','hello & goodbye','poki'])assert.equal(resolveProxyAddress(q),'https://html.duckduckgo.com/html/?q='+encodeURIComponent(q));
});
test('empty input and executable schemes cannot launch',()=>{for(const q of ['','  ','javascript:alert(1)','data:text/html,abc','file:///etc/passwd','ftp://example.com'])assert.throws(()=>resolveProxyAddress(q));});
