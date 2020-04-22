let name = 'Jen'
console.log(name)

name = null
console.log(name)
if( name === null ){
    console.log('The variable is null!')
} else {
    console.log(name)
}

let undefin
console.log(undefin)
if( undefin === undefined ){
    console.log('The variable is undefined!')
} else {
    console.log(undefin)
}

function square(num) {
    console.log(num)
}

square(name)
square(undefin)

let result = square()
console.log(result)

let age = 27
console.log(age)
age = undefined
console.log(age)
age = null
console.log(age)