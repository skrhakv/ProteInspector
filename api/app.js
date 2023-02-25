//index.js
const testAddon = require('./build/Release/query-executor.node')
console.log('addon', testAddon)
module.exports = testAddon
const classInstance = new testAddon.QueryExecutorNapi();
console.log('Testing class function call : ');
var a = "select * from proteins where afterpdbcode=\"1btw\"";
console.log(classInstance.ParseAndExecute(a, 0));