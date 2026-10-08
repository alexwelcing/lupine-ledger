import test from 'node:test';
import assert from 'node:assert/strict';
import { blankView, readView, sanitizeView, VIEW_KEY } from '../src/workspaceState.js';

test('missing, corrupt, and unavailable browser storage recover to an editable default', () => {
  for (const storage of [null, {getItem:()=>'{broken'}, {getItem:()=>{throw Error('denied');}}, {getItem:()=>null}]) {
    assert.deepEqual(readView(storage, ['paper']),blankView());
  }
});
test('restores only presentation state for known articles and components', () => {
  const saved={mode:'connections',pieces:{title:{hidden:true,x:30,y:40},'card:paper':{hidden:true},'reader:deleted':{x:2},credentials:{hidden:true}},readers:['paper','deleted','paper']};
  const state=readView({getItem:key=>{assert.equal(key,VIEW_KEY);return JSON.stringify(saved);}},['paper']);
  assert.deepEqual(state,{mode:'connections',pieces:{title:{hidden:true,x:30,y:40},'card:paper':{hidden:true,x:0,y:0}},readers:['paper']});
  assert.deepEqual(saved.readers,['paper','deleted','paper']);
});
test('rejects invalid positions and bounded recovery does not trust arbitrary local state', () => {
  const next=sanitizeView({mode:'evil',pieces:{title:{x:Infinity,y:NaN,hidden:'false'},field:{x:1e9,y:-1e9},media:null,footer:'bad'}},[]);
  assert.equal(next.mode,'grid');assert.deepEqual(next.pieces.title,{x:0,y:0,hidden:false});assert.deepEqual(next.pieces.field,{x:2000,y:-2000,hidden:false});assert.equal(next.pieces.media,undefined);
});
test('caps restored documents while preserving their most recent unique order', () => {
  const ids=Array.from({length:20},(_,i)=>`paper-${i}`);
  assert.deepEqual(sanitizeView({readers:ids},ids).readers,ids.slice(8));
  assert.deepEqual(sanitizeView({readers:'paper-1'},ids).readers,[]);
});
