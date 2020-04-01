// array, object

var f = function() {
	console.log(1+1);
	console.log(1+2);
}
var a = [f]; // 원소로
a[0]();

var o = {
	func:f
}
o.func();