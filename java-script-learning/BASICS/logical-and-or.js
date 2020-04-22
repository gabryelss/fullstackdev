let temp = 59

// Logical AND Operator
if( temp >= 60 && temp <= 90 ){
    console.log("It is pretty nice out.")

// Logical OR Operator
} else if( temp < 0 || temp >= 120 ){
    console.log("Do not go outside!")
} else {
    console.log("Eh, do what you want.")
}

// Challenge
let isGuest1Vegan = false
let isGuest2Vegan = false

if( isGuest1Vegan && isGuest2Vegan ){
    // Are both vegan? Only offer vegan dishes.
    console.log("Are both vegan? Only offer vegan dishes.")
} else if( isGuest1Vegan || isGuest2Vegan ){
    // At least one vegan? Make sure to offer up some vegan options.
    console.log("At least one vegan? Make sure to offer up some vegan options.")
} else {
    // Else, offer up anything on the menu
    console.log("Else, offer up anything on the menu")
}