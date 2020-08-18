'use strict';
const User = require('../models').User;
const mongoose = require('mongoose');

class UserDao {

    /**
     * @param user {User}
     * @param userId
     * @param isAccount
     * @returns {Promise<User>}
     */
    static async updateUser(user, userId, isAccount) {
        const userToUpdate = await this.findById(userId)
        if(userToUpdate){
            if(!isAccount){
                userToUpdate.characteristics = user.characteristics;
                userToUpdate.allergens = user.allergens;
            }
            if(user.hasCompletedSituation){
                userToUpdate.hasCompletedSituation = user.hasCompletedSituation;
            }
            if( user.lastName !== userToUpdate.lastName){
                userToUpdate.lastName = user.lastName
            }
            if( user.firstName !== userToUpdate.firstName){
                userToUpdate.firstName = user.firstName
            }
            if( user.town !== userToUpdate.town){
                userToUpdate.town = user.town
            }
            if( user.address !== userToUpdate.address){
                userToUpdate.address = user.address
            }
            if( user.postalCode !== userToUpdate.postalCode){
                userToUpdate.postalCode = user.postalCode
            }
            if( user.phone !== userToUpdate.phone){
                userToUpdate.phone = user.phone
            }
            if( user.email !== userToUpdate.email){
                userToUpdate.email = user.email
            }
            return await userToUpdate.save();
        }else{
            user.save();
        }
        return null;
    }

    /**
     * @returns {Promise<User[]>}
     */
    static async getAllUsers() {
        return User.find().populate('sessions');
    }

    /**
     * @returns {Promise<User[]>}
     */
    static async find(json){
        return User.find(json).exec();
    }

    /**
     * @returns {Promise<User[]>}
     */
    static async findOne(json){
        return User.findOne(json).exec();
    }

    /**
     * @param id {string}
     * @returns {Promise<User|undefined>}
     */
    static async findById(id) {
        if(mongoose.Types.ObjectId.isValid(id)){
            return User.findOne({_id: id}).populate('sessions allergens characteristics', '-__v -restaurants -users');
        }
        else {
            return undefined;
        };

    }/**
     * @param id {string}
     * @returns {Promise<User|undefined>}
     */
    static async findSmallById(id) {
        if(mongoose.Types.ObjectId.isValid(id)){
            return User.findOne({_id: id}).populate('',
                '-__v -restaurants -users -sessions -allergens ' +
                '-characteristics - address -phone -town - email -postalCode ' +
                '-cgu -hasCompletedSituation -type');
        }
        else {
            return undefined;
        };

    }
    /**
     * @param email {string}
     * @returns {Promise<User|undefined>}
     */
    static async findByEmail(email) {
            return User.findOne({email: email});
    }
    /**
     * @returns {Promise<User|undefined>}
     * @param firstName
     */
    static async searchUserByFirstName(firstName) {
        const regex = new RegExp(["^", firstName, "$"].join(""), "i");
        return User.find({firstName: regex}).populate('', '-__v -restaurants -users');
    }
    /**
     * @returns {Promise<User|undefined>}
     * @param lastName
     */
    static async searchUserByLastName(lastName) {
        const regex = new RegExp(["^", lastName, "$"].join(""), "i");
        return User.find({lastName: regex}).populate('', '-__v -restaurants -users');
    }
    /**
     * @returns {Promise<User|undefined>}
     * @param firstName
     * @param lastName
     */
    static async searchUserByFirstNameAndLastName(firstName, lastName) {
        const regexFirstName = new RegExp(["^", firstName, "$"].join(""), "i");
        const regexLastName = new RegExp(["^", lastName, "$"].join(""), "i");
        return User.find({lastName: regexLastName, firstName: regexFirstName}).populate('', '-__v -restaurants -users');
    }

    /**
     * @param id {string}
     * @returns {Promise<Boolean>}
     */
    static async deleteById(id) {
        User.deleteOne({_id: id}, (err) => {
            if (err) return false;
        });
        return true;
    }

    /**
     *
     * @param id
     * @returns {boolean}
     */
    static async isAdmin(id){
        let UserExist = await UserDao.find({$and:[{type:{$eq:"admin"}},{_id: id}]});
        return !!(Array.isArray(UserExist) && UserExist.length);
    }

    /**
     *
     * @param id {string}
     * @param updates {json}
     * @returns {Promise<void>}
     */
    static async updateById(id, updates) {
        return User.findOneAndUpdate({_id: id}, updates,{
            new: true //To return model after update
        });
    }

}

module.exports = UserDao;
