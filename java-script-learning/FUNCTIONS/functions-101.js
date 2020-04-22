let greetUser = function (name) {
    console.log("Welcome " + name + "!")
}

greetUser('Georgie')

// Works!
/*let squareNumber = function (number) {
    console.log(number)
}
*/

function squareNumber (number) {
    let result = number * number
    console.log(result)
    return result
}


output = squareNumber(3)
output = squareNumber(10)

function convertToCelsius(fahr) {
    let celsius = (fahr - 32) * 5/9
    return celsius
}

// 0
console.log( convertToCelsius(32) )
// 20
console.log( convertToCelsius(68) )