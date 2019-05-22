// log颜色
const chalk = require("chalk");

const logfn = msg => {
    if (msg) {
        console.log(msg);
    }
};
logfn.redlog = msg => {
    console.log(chalk.red(msg));
};
logfn.yellowlog = msg => {
    console.log(chalk.yellow(msg));
};
logfn.bluelog = msg => {
    console.log(chalk.blue(msg));
};
logfn.greenlog = msg => {
    console.log(chalk.green(msg));
};
logfn.errorlog = msg => {
    // bgRed.
    console.log(chalk.red.bold("error:") + chalk.red.underline(msg));
};

module.exports = logfn;
