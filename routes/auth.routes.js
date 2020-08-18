const bodyParser = require('body-parser');
const UserController = require('../controllers').UserController;
const AuthMiddleware = require('../middlewares').AuthMiddleware;

module.exports = function(app) {

    app.post('/auth/subscribe', bodyParser.json(), UserController.subscribe);

    app.post('/auth/login', bodyParser.json(), UserController.login);

    app.delete('/auth/logout/:token', AuthMiddleware.isConnected, UserController.logout);

    app.put('/auth/user/:userId', AuthMiddleware.isConnected, bodyParser.json() , UserController.updateUser);

    app.delete('/auth/user/:userId', AuthMiddleware.isAdmin, UserController.deleteUser);

};
