const Restaurant = require('../models').Restaurant;
const mongoose = require('mongoose');

class RestaurantDao {

    /**
     * Save a restaurant
     * @param restaurant
     * @returns {Promise<*>}
     */
    static async saveRestaurant(restaurant){
        const newRestaurant = new Restaurant(restaurant)
        return await newRestaurant.save();
    }

    /**
     * Get all restaurants
     * @returns {Promise<*>}
     */
    static async getAll(){
        return await Restaurant.find().populate('types allergens characteristics', '-_id -__v -restaurants -users');
    }

    /**
     * Get by elements
     * @param json
     * @returns {Promise<*>}
     */
    static async getByElement(json){
        return await Restaurant.find(json).populate('types allergens characteristics', '-_id -__v -restaurants -users');
    }

    /**
     * Get the restaurant if exist
     * @param id
     * @returns {Promise<undefined|*>}
     */
    static async getById(id){
        if(mongoose.Types.ObjectId.isValid(id)){
            return await Restaurant.findOne({_id: id}).populate('types allergens characteristics', '-_id -__v -restaurants -users');
        }
        else {
            return undefined;
        }
    }

    /**
     * Update restaurant status
     * @param id
     * @returns {Promise<undefined|*>}
     */
    static async updateStatusById(id){
        if (mongoose.Types.ObjectId.isValid(id)){
            return Restaurant.update({_id: id}, {
                status: "validated"
            });
        } else {
            return undefined;
        }
    }

    static async getByCityAndCharacteristicsAndAllergensAndTypes(city, characteristics, allergens, types){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex, characteristics: characteristics, allergens: allergens, types:types})
            .populate('types ', '-__v -users');
    }
    static async getByCityAndCharacteristicsAndAllergens(city, characteristics, allergens){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex, characteristics: characteristics, allergens: allergens})
            .populate('types ', '-__v -users');
    }
    static async getByCityAndCharacteristicsAndTypes(city, characteristics, types){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex, characteristics: characteristics, types:types})
            .populate('types ', '-__v -users');
    }
    static async getByCityAndAllergensAndTypes(city, allergens, types){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex, allergens: allergens, types:types})
            .populate('types ', '-__v -users');
    }
    static async getByCharacteristicsAndAllergensAndTypes(characteristics, allergens, types){
        return await Restaurant.find({characteristics: characteristics, allergens: allergens, types:types})
            .populate('types ', '-__v -users');
    }
    static async getByCityAndCharacteristics(city, characteristics){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex, characteristics: characteristics})
            .populate('types ', '-__v -users');
    }
    static async getByCityAndAllergens(city, allergens){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex, allergens: allergens})
            .populate('types ', '-__v -users');
    }
    static async getByCityAndTypes(city, types){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex, types: types})
            .populate('types ', '-__v -users');
    }
    static async getByCharacteristicsAndTypes(characteristics, types){
        return await Restaurant.find({characteristics: characteristics, types: types})
            .populate('types ', '-__v -users');
    }
    static async getByCharacteristicsAndAllergens(characteristics, allergens){
        return await Restaurant.find({characteristics: characteristics, allergens: allergens})
            .populate('types ', '-__v -users');
    }
    static async getByAllergensAndTypes(allergens, types){
        return await Restaurant.find({allergens: allergens, types: types})
            .populate('types ', '-__v -users');
    }
    static async getByCity(city){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex})
            .populate('types ', '-__v -users');
    }
    static async getByCharacteristics(characteristics){
        return await Restaurant.find({characteristics: characteristics})
            .populate('types ', '-__v -users');
    }
    static async getByAllergens(allergens){
        return await Restaurant.find({allergens: allergens})
            .populate('types ', '-__v -users');
    }
    static async getByTypes(types){
        return await Restaurant.find({types: types})
            .populate('types ', '-__v -users');
    }


    /**
     * search restaurant
     */
    static async searchByName(name){
        const regex = new RegExp(["^", name, "$"].join(""), "i");
        return await Restaurant.find({name: regex}).populate('types ', '-__v -users');
    }
    static async searchByCity(city){
        const regex = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({city: regex}).populate('types ', '-__v -users');
    }
    static async searchByPostalCode(postalCode){
        const regex = new RegExp(["^", postalCode, "$"].join(""), "i");
        return await Restaurant.find({postalCode: regex}).populate('types ', '-__v -users');
    }
    static async searchByCityAndPostalCode(city, postalCode){
        const regexCity = new RegExp(["^", city, "$"].join(""), "i");
        const regexPostalCode = new RegExp(["^", postalCode, "$"].join(""), "i");
        return await Restaurant.find({city: regexCity, postalCode: regexPostalCode}).populate('types ', '-__v -users');
    }
    static async searchByNameAndPostalCode(name, postalCode){
        return await Restaurant.find({name: name, postalCode: postalCode}).populate('types ', '-__v -users');
    }
    static async searchByNameAndCity(name, city){
        const regexName = new RegExp(["^", name, "$"].join(""), "i");
        const regexCity = new RegExp(["^", city, "$"].join(""), "i");
        return await Restaurant.find({name: regexName, city: regexCity}).populate('types ', '-__v -users');
    }
    static async searchByNameAndCityAndPostalCode(name, city, postalCode){
        const regexName = new RegExp(["^", name, "$"].join(""), "i");
        const regexCity = new RegExp(["^", city, "$"].join(""), "i");
        const regexPostalCode = new RegExp(["^", postalCode, "$"].join(""), "i");
        return await Restaurant.find({name: regexName, city: regexCity, postalCode: regexPostalCode}).populate('types ', '-__v -users');
    }

    /**
     * Push a type into a restaurant
     * @param idType
     * @param idRestaurant
     * @returns {Promise<void>}
     */
    static async pushTypeInRestaurant(idType, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idRestaurant) && mongoose.Types.ObjectId.isValid(idType)){
            const rest = await this.getById(idRestaurant);
            rest.types.push(idType);
            return await rest.save();
        } else {
            return undefined;
        }
    }

    /**
     * Push an allergen into a restaurant
     * @param idAllergen
     * @param idRestaurant
     * @returns {Promise<void>}
     */
    static async pushAllergenInRestaurant(idAllergen, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idRestaurant) && mongoose.Types.ObjectId.isValid(idAllergen)){
            const rest = await this.getById(idRestaurant);
            rest.allergens.push(idAllergen);
            return await rest.save();
        } else {
            return undefined;
        }
    }

    /**
     * Push a characteristic into a restaurant
     * @param idCharac
     * @param idRestaurant
     * @returns {Promise<void>}
     */
    static async pushCharacInRestaurant(idCharac, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idRestaurant) && mongoose.Types.ObjectId.isValid(idCharac)){
            const rest = await this.getById(idRestaurant);
            rest.characteristics.push(idCharac);
            return await rest.save();
        } else {
            return undefined;
        }
    }


    /**
     * Remove type in restaurant
     * @param idType
     * @param idRestaurant
     * @returns {Promise<undefined|any>}
     */
    static async popTypeInRestaurant(idType, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idRestaurant) && mongoose.Types.ObjectId.isValid(idType)){
            const rest = await this.getById(idRestaurant);
            rest.types.remove(idType);
            return await rest.save();
        } else {
            return undefined;
        }
    }

    /**
     * Remove allergen in restaurant
     * @param idAllergen
     * @param idRestaurant
     * @returns {Promise<undefined|any>}
     */
    static async popAllergenInRestaurant(idAllergen, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idRestaurant) && mongoose.Types.ObjectId.isValid(idAllergen)){
            const rest = await this.getById(idRestaurant);
            rest.allergens.remove(idAllergen);
            return await rest.save();
        } else {
            return undefined;
        }
    }

    /**
     * Remove characteristic in restaurant
     * @param idCharac
     * @param idRestaurant
     * @returns {Promise<undefined|any>}
     */
    static async popCharacInRestaurant(idCharac, idRestaurant){
        if(mongoose.Types.ObjectId.isValid(idRestaurant) && mongoose.Types.ObjectId.isValid(idCharac)){
            const rest = await this.getById(idRestaurant);
            rest.characteristics.remove(idCharac);
            return await rest.save();
        } else {
            return undefined;
        }
    }

    /**
     * Update by id
     * @param id
     * @param updates
     * @returns {Promise<undefined|*>}
     */
    static async modifyById(id, updates){
        if(mongoose.Types.ObjectId.isValid(id)){
            return Restaurant.findOneAndUpdate({_id: id}, updates,{
                new: true //To return model after update
            });
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

        await Restaurant.deleteOne({_id: id}, (err) => {
            if (err) ret =  false;
            ret = true;
        })
        return ret;
    }


}

module.exports = RestaurantDao;
