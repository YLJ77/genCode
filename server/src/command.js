const chalk = require('chalk');
const yargs = require('yargs');
// console.log(chalk.red(process.argv));
// console.warn(process.argv)
// console.warn(yargs.argv)

// Customize yargs version
yargs.version('1.1.0')
// Create add command
yargs.command({
    command: 'add',
    describe: 'Add a new note',
    builder: {
        title: {
            describe: 'not title',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function (args) {
        console.log(`title: ${args.title}`)
    }
});

yargs.parse();