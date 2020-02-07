const ansi = require('ansi');
const colors = require('colors/safe');

const cursor = ansi(process.stdout);

//just to check ansi cursor goto() method
function writeDelimeters(row) {
    for (let i = 1; i < 80; i++) {
        cursor.goto(i, +row).write('*');
    }
    cursor.write('\n');
}

//using ansi cursor
function writeHeaders(text) {
    cursor
        .white()
        .bg.green()
        .write(text)
        .reset()
        .bg.reset()
        .write('\n');
}

//using colors
function writeIteration(type, text) {
    let dt = new Date();
    if (type == 'done') {
        console.log(`${colors.brightCyan(dt)}:\t${colors.green.bold(type)} ${colors.white(text)}`);        
    } else if (type == 'warning') {
        console.log(`${colors.brightCyan(dt)}:\t${colors.red.bold(type)} ${colors.inverse(text)}`);    }
    //console.log('');
}

writeHeaders('Start processing');
writeDelimeters(2);
writeIteration('done', 'opeartion was successfully completed');
writeIteration('warning', 'error while downloading file');
writeDelimeters(5);
writeHeaders('Stop processing');


