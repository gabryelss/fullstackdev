let boolTrue = true;
let boolFalse = false;
console.log(boolTrue);
console.log(boolFalse);

let temp = 70;
/*let isFreezing = temp === 31; // EQUALS
isFreezing = temp !== 0; // NOT EQUAL
isFreezing = temp < 0;
isFreezing = temp > 30;
isFreezing = temp >= 30;
isFreezing = temp <= 31;
//console.log("Is freezing? " + isFreezing);
*/
if ( temp <= 0 ){
    console.log("Wow, chilling.")
} else if( temp > 60 ){
    console.log("YOU WILL COOK THERE!")
} else {
    console.log("Kinda cool.")
}

// Challenge Area
// < 7 = child - discount
// > 65 = elder - discount
let age = 10;
/*isChild = age <= 7;
isSenior = age >= 65;
console.log("Age? " + age);
console.log("Is child? " + isChild);
console.log("Is senior? " + isSenior);*/
if( age <= 7 ){
    console.log("Ieyyy! Little kid!")
} else if ( age >= 65 ) {
    console.log("SENIOR!!!")
} else {
    console.log("No kid, no elder, just a regular!")
}