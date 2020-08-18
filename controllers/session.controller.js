let SessionModel = require('../models').Session;
const CoreController = require('./core.controller');

class SessionController extends CoreController {

    static async create(user, token){
        const session = new SessionModel({
            token: token,
            user: user
        });
        await session.save();
        return session;
    }
}
SessionController.prototype.modelName = 'Session';
module.exports = SessionController;