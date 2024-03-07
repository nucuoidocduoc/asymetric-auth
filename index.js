const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const app = new Koa();

const authRouters = require('./routers/authRouter');
app.use(bodyParser({
    onerror: () => {
        throw new BadRequest();
    },
}));
app.use(authRouters.routes())
app.listen(3000);