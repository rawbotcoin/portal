const exec = require('child_process').exec;

function execute(command_line_) {
    return new Promise((resolve, reject) => {
        exec(command_line_,
            (error, stdout, stderr) => {
                console.log(`${stdout}`);
                console.log(`${stderr}`);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                    return reject(error);
                } else {
                    return resolve("Successfully executed: " + command_line_);
                }
            });
    });
}

setInterval(() => {
    execute("pm2 restart app");
}, 6 * 60 * 60 * 1000);