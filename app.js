

const pool = require('./pgdb');

pool.connect(function(err){

    if (err) {
        console.log(err);
    }
    else {
        console.log('OK');
    }
});

let counter = 0;