var number = [1, 400, 12, 34, 5];
var i = 0;
var sum = 0;
while(i < number.length) {
	sum += number[i];
	i = i + 1;
}
console.log(`array sum : ${sum}`);