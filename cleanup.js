const fs = require('fs');
const path = require('path');
const tempDirectory = './public/gen'; 
const waitTime = 3600000; // 1 hour in milliseconds is 3600000
const maxAge = 3600000; // 1 hour in milliseconds is 3600000

function cleanup() {
    setInterval(() => {
        fs.readdir(tempDirectory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.stat(path.join(tempDirectory, file), (err, stat) => {
                    if (err) throw err;

                    const now = new Date().getTime();
                    const endTime = new Date(stat.ctime).getTime() + maxAge; 

                    if (now > endTime) {
                        console.log(`Deleting ${path.join(tempDirectory, file)}`);
                        fs.unlink(path.join(tempDirectory, file), err => {
                            if (err) throw err;
                        });
                    }
                });
            }
        });
    }, waitTime); // run the cleanup process every hour
}

module.exports = cleanup;
