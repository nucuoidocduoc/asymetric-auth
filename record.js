const fs = require('fs');
const resolve = require('path').resolve;
const record = (router, filename) => {
    const routeTable = fs.createWriteStream(resolve(__dirname, filename));
    routeTable.write(`Update Date: ${new Date().toString()}\n\n`);
    for (let len = router.stack.length, i = 0; i < len; i += 1) {
        const route = router.stack[i];
        routeTable.write(`URL:${route.path}\t${route.methods.join('|')}\n`);
    }
    routeTable.end();
};
module.exports = record;