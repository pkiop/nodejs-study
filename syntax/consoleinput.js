var args = process.argv;
console.log('A');
console.log('B');
a = args[2];
if(a==='1') {
	console.log('C1');
}
else if(a === '0'){
	console.log('C2');
}
else {
	console.log('C3');
}
console.log('D');