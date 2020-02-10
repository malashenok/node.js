const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Guess, or press <Ctrl-C> for exit: '
});

function getValue() {
    return Math.round(Math.random());
}

rl.prompt();

rl.on('line', (line) => {

    let num = getValue();
    switch (+line.trim()) {
        case num:
            console.log('Great!You won!');
            break;
        default:
            console.log(`Sorry, correct answer is '${num}'`);
            break;
    }
    rl.prompt();
}).on('close', () => {
    console.log('Thanks!');
    process.exit(0);
});