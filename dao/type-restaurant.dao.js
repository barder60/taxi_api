const TypeRestaurant = require('../models').TypeRestaurant;
const mongoose = require('mongoose');

class TypeRestaurantDao {

    /**
     * Save a new type
     * @param restaurant
     * @returns {Promise<*>}
     */
    static async saveTypeRestaurant(type){
        const type1 = new TypeRestaurant(type);
        const ret = await type1.save();

        return ret;
    }

    /**
     * Get all types
     * @returns {Promise<*>}
     */
    static async getAll(){
        const allTypes = await TypeRestaurant.find().populate('restaurants', '-__v -types');

        return allTypes;
    }

    /**
     * Get the type if exist
     * @param id
     * @returns {Promise<undefined|*>}
     */
    static async getById(id){
        if(mongoose.Types.ObjectId.isValid(id)){
            const type = await TypeRestaurant.findOne({_id: id}).populate('restaurants', '-__v -_id -types');
            return type;
        }
        else {
            return undefined;
        };
    }

    /**
     * Get type by name
     * @param name
     * @returns {Promise<undefined|*>}
     */
    static async getByName(name){
        const type = await TypeRestaurant.findOne({name: name}).populate('restaurants', '-__v -_id -types');

        if(type) {
            return type;
        } else {
            return undefined;
        }
    }

    /**
     * Push a restaurant into a type
     * @param idType
     * @param idRestaurant
     * @returns {Promise<void>}
     */
    static async pushRestaurantInType(idType, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idType) && mongoose.Types.ObjectId.isValid(idRestaurant)){
            const type = await this.getById(idType);
            type.restaurants.push(idRestaurant);
            const ret = await type.save();
            return ret;
        } else {
            return undefined;
        }
    }

    /**
     * Remove a restaurant in the type
     * @param idType
     * @param idRestaurant
     * @returns {Promise<undefined|*>}
     */
    static async popRestaurantInType(idType, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idType) && mongoose.Types.ObjectId.isValid(idRestaurant)){
            const type = await this.getById(idType);
            type.restaurants.remove(idRestaurant);
            let ret = await type.save();
            return ret;
        } else {
            return undefined;
        }
    }

    /**
     * Update the document by his id
     * @param id
     * @param updates
     * @returns {Promise<undefined|*>}
     */
    static async modifyById(id, updates){
        if(mongoose.Types.ObjectId.isValid(id)){
            return TypeRestaurant.findOneAndUpdate({_id: id}, updates,{
                new: true //To return model after update
            }).populate('restaurants', '-__v -_id -types');
        } else {
            return undefined;
        }
    }

    /**
     * Delete by id
     * @param id
     * @returns {Promise<boolean>}
     */
    static async deleteById(id){
        let ret = false;

        await TypeRestaurant.deleteOne({_id: id}, (err) => {
            if (err) ret =  false;
            ret = true;
        });
        return ret;
    }

}

module.exports = TypeRestaurantDao;
