'use strict';
const Session = require('../models').Session;
const UserDao = require('./user.dao');

class SessionDao {

    /**
     * @param session {Session}
     * @returns {Promise<Session>}
     */
    static async saveSession(session) {
        await session.save();
    }

    /**
     * @returns {Promise<Session[]>}
     */
    static async getAllSessions() {
        return Session.find().populate('user');
    }

    /**
     * @returns {Promise<Product[]>}
     */
    static async find(json){
        return Session.find(json).exec();
    }

    /**
     * @param id {string}
     * @returns {Promise<Session|undefined>}
     */
    static async findById(id) {
        return Session.findOne({_id: id}).populate('user');
    }

    /**
     * @param id {string}
     * @returns {Promise<Boolean>}
     */
    static async deleteById(id) {
        Session.deleteOne({_id: id}, (err) => {
            if (err) return false;
        });
        return true;
    }

    /**
     *
     * @param idToken
     * @returns {boolean}
     */
    static async tokenIsValid(idToken){
        let SessionExist = await SessionDao.find({$and:[{token: idToken},{deletedAt:{$exists: false}}]});
        if(Array.isArray(SessionExist) && SessionExist.length) return true;
        else return false;
    }

    /**
     *
     * @param idToken
     * @returns {Promise<boolean|*>}
     * @constructor
     */
    static async UserIsAdmin(idToken) {
        let SessionUser = await Session.findOne({token: idToken}).exec();
        if (SessionUser.user) {

            let TrueFalse = await UserDao.isAdmin(SessionUser.user);
            return TrueFalse;
        }
        return false;
    }

    /**
     *
     * @param tok
     * @returns {Promise<*>}
     */
    static async deleteByToken(tok) {
        const isTokenExist = await Session.findOne({token: tok});

        if (isTokenExist) {
            return Session.findOneAndUpdate({token: tok}, {
                deletedAt: Date.now()
            }, {
                new: true //To return model after update
            });

        } else {
            return undefined;
        }
    }

    static async getUserIDByToken(token){
        const session = await Session.findOne({token: token}).exec();
        return session ? session.user : null
    }

    /**
     *
     * @param id {string}
     * @param updates {json}
     * @returns {Promise<void>}
     */
    static async updateById(id, updates) {
        return Session.findOneAndUpdate({_id: id}, updates,{
            new: true //To return model after update
        });
    }
}

module.exports = SessionDao;
