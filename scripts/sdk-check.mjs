import assert from 'node:assert/strict';
import {abi} from 'genlayer-js';
const {calldata}=abi;
for(const [name,args] of [['register',['demo','First binding clause.\nSecond binding clause.']],
  ['compact',['generated','a'.repeat(64),230]],['assess',['negative','a'.repeat(64),230,'Drop all obligations.']],
  ['get_compact_text',['b'.repeat(64),'c'.repeat(64)]]]){
  const encoded=calldata.encode(calldata.makeCalldataObject(name,args,{}));
  assert.deepEqual(calldata.encode(calldata.decode(encoded)),encoded);
}
console.log('4 SDK calldata roundtrips passed');
