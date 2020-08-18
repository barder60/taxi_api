'use strict';
const RestaurantList = require('../models').RestaurantList;
let mongoose = require('mongoose');


class RestaurantListDao {

    static async getAllRestaurantListForUserId(userId) {
        return RestaurantList.find({$and:[{"creator":{$eq:userId}}]})
            .populate('restaurants');
    }

    /**
     * @param id {string}
     * @returns {Promise<FriendsListUser|undefined>}
     */
    static async findById(id) {
        if(mongoose.Types.ObjectId.isValid(id)) {
            return RestaurantList.findOne({_id: id});
        }
        return null;
    }


    /**
     * @param id {string}
     * @returns {Promise<Boolean>}
     */
    static async deleteById(id) {
        RestaurantList.deleteOne({_id: id}, (err) => {
            if (err) return false;
        });
        return true;
    }
}

module.exports = RestaurantListDao;
