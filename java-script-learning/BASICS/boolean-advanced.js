let isAccountLocked = false
let userRole = 'user'

if( isAccountLocked ){
    console.log("The account is locked.")
} else if( userRole === 'admin' ){
    console.log("Welcome Admin!")
} else {
    console.log("Welcome!")
}

// Challenge
let temp = 0

if( temp <= 32 ){
    // It is freezing outside.
    console.log("It is freezing outside.")
} else if( temp >= 110 ) {
    // It's hot outside.
    console.log("It's hot outside.")
} else {
    // Go for it, it is pretty nice!
    console.log("Go for it, it is pretty nice!")
}