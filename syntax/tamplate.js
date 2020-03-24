var name = 'k8805'
var letter = 'Dear ' + name + '\n\
\
Lorem ipsum' + name;
console.log(letter)

var letter = `Dear ${name}

Lorem ipsum

${name}
`;

console.log(letter)