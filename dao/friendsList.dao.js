'use strict';
const FriendsListUser = require('../models').FriendsListUser;
let mongoose = require('mongoose');


class FriendsListUserDao {

    /**
     * @param FriendsListUser {FriendsListUser}
     * @returns {Promise<FriendsListUser>}
     */
    static async saveFriendsListUser(FriendsListUser) {
        await FriendsListUser.save();
    }

    /**
     * @returns {Promise<User[]>}
     */
    static async find(json){
        return FriendsListUser.find(json).exec();
    }

    /**
     * @returns {Promise<FriendsListUser[]>}
     */
    static async getAllFriendsListUsers() {
        return FriendsListUser.find().populate('products');
    }
    /**
     * @returns {Promise<FriendsListUser[]>}
     */
    static async getAllFriendsListUsersForUserId(userId) {
        return FriendsListUser.find({$and:[{"creator":{$eq:userId}}]})
            .populate('users');
    }

    /**
     * @returns {Promise<FriendsListUser[]>}
     */
    static async findOne(json){
        return FriendsListUser.findOne(json).exec();
    }
    /**
     * @param id {string}
     * @returns {Promise<FriendsListUser|undefined>}
     */
    static async findById(id) {
        if(mongoose.Types.ObjectId.isValid(id)) return FriendsListUser.findOne({_id: id});
        else undefined;
    }

    /**
     * @param id {string}
     * @returns {Promise<Boolean>}
     */
    static async deleteById(id) {
        FriendsListUser.deleteOne({_id: id}, (err) => {
            if (err) return false;
        });
        return true;
    }



    /**
     *
     * @param id {string}
     * @param updates {json}
     * @returns {Promise<void>}
     */
    static async updateById(id, updates) {
        return FriendsListUser.findOneAndUpdate({_id: id}, updates,{
            new: true //To return model after update
        });
    }
}

module.exports = FriendsListUserDao;
