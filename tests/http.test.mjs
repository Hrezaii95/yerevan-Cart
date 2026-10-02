import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readBody,sameOrigin} from '../lib/http.ts';
test('cross-origin mutations are rejected',()=>{assert.equal(sameOrigin(new Request('https://cart.example/api',{headers:{origin:'https://evil.example'}})),false);assert.equal(sameOrigin(new Request('https://cart.example/api',{headers:{origin:'https://cart.example'}})),true);assert.equal(sameOrigin(new Request('https://cart.example/api')),false)});
test('body size enforced without content-length',async()=>{const request=new Request('https://cart.example/api',{method:'POST',body:'x'.repeat(100001)});await assert.rejects(readBody(request),/tooLarge/)});
test('malformed JSON rejected and valid input preserved',async()=>{await assert.rejects(readBody(new Request('https://cart.example',{method:'POST',body:'{' })),/invalid/);assert.deepEqual(await readBody(new Request('https://cart.example',{method:'POST',body:'{"a":1}'})),{a:1})});
