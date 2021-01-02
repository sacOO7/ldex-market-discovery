const { expose } = require("threads/worker");

expose(async function hashPassword(password, id) {
        function sleep(ms) {
            return new Promise(resolve => {
                setTimeout(resolve, ms);
            });
        }
        console.log("Processing passwords for " + id);
        await sleep(5000);
        return password + id;
    }
)
