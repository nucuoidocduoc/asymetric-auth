const Router = require('koa-router');
const AuthController = require('../controllers/AuthController');
const router = new Router();

module.exports = router.post('/get-sinature', AuthController.authorizeByCredentials)
    .post('/verify-sinature', AuthController.getPublicKey);
