const Characteristic = require('../models').Characteristic;
const mongoose = require('mongoose');

class CharacteristicDao {

    /**
     * Save a new characteristic
     * @param charac
     * @returns {Promise<*>}
     */
    static async saveCharac(charac){
        const charac1 = new Characteristic(charac);
        const ret = await charac1.save();

        return ret;
    }

    /**
     * Get all characteristics
     * @returns {Promise<*>}
     */
    static async getAll(){
        const allCharateristics = await Characteristic.find().populate('restaurants users', '-__v -_id -characteristics');

        return allCharateristics;
    }

    /**
     * Get the characteristic if exist
     * @param id
     * @returns {Promise<undefined|*>}
     */
    static async getById(id){
        if(mongoose.Types.ObjectId.isValid(id)){
            const charac = await Characteristic.findOne({_id: id}).populate('restaurants users', '-__v -_id -characteristics');
            return charac;
        }
        else {
            return undefined;
        };
    }

    /**
     * Get characteristic by name
     * @param name
     * @returns {Promise<undefined|*>}
     */
    static async getByName(name){
        const charac = await Characteristic.findOne({name: name}).populate('restaurants users', '-__v -_id -characteristics');

        if(charac) {
            return charac;
        } else {
            return undefined;
        }
    }

    /**
     * Push a restaurant into an characteristic
     * @param idCharac
     * @param idRestaurant
     * @returns {Promise<void>}
     */
    static async pushRestaurantInCharac(idCharac, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idCharac) && mongoose.Types.ObjectId.isValid(idRestaurant)){
            const charac = await this.getById(idCharac);
            charac.restaurants.push(idRestaurant);
            const ret = await charac.save();
            return ret;
        } else {
            return undefined;
        }
    }

    /**
     * Remove a restaurant in the characteristic
     * @param idCharac
     * @param idRestaurant
     * @returns {Promise<undefined|*>}
     */
    static async popRestaurantInCharac(idCharac, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idCharac) && mongoose.Types.ObjectId.isValid(idRestaurant)){
            const charac = await this.getById(idCharac);
            charac.restaurants.remove(idRestaurant);
            let ret = await charac.save();
            return ret;
        } else {
            return undefined;
        }
    }

    /**
     * Push a user into an characteristic
     * @param idCharac
     * @param idUser
     * @returns {Promise<void>}
     */
    static async pushUserInCharac(idCharac, idUser){
        if(mongoose.Types.ObjectId.isValid(idCharac) && mongoose.Types.ObjectId.isValid(idUser)){
            const charac = await this.getById(idCharac);
            charac.users.push(idUser);
            const ret = await charac.save();
            return ret;
        } else {
            return undefined;
        }
    }

    /**
     * Remove a user in the characteristic
     * @param idCharac
     * @param idUser
     * @returns {Promise<undefined|*>}
     */
    static async popUserInCharacteristic(idCharac, idUser){
        if(mongoose.Types.ObjectId.isValid(idCharac) && mongoose.Types.ObjectId.isValid(idUser)){
            const charac = await this.getById(idCharac);
            charac.users.remove(idUser);
            let ret = await charac.save();
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
            return Characteristic.findOneAndUpdate({_id: id}, updates,{
                new: true //To return model after update
            }).populate('restaurants users', '-__v -_id -characteristic');
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

        await Characteristic.deleteOne({_id: id}, (err) => {
            if (err) ret =  false;
            ret = true;
        });
        return ret;
    }

}

module.exports = CharacteristicDao;
