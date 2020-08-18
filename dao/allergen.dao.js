const Allergen = require('../models').Allergen;
const mongoose = require('mongoose');

class AllergenDao {

    /**
     * Save a new allergen
     * @param restaurant
     * @returns {Promise<*>}
     */
    static async saveAllergen(allergen) {
        const allerg1 = new Allergen(allergen);
        const ret = await allerg1.save();

        return ret;
    }

    /**
     * Get all allergens
     * @returns {Promise<*>}
     */
    static async getAll() {
        const allAllergens = await Allergen.find()
            // .populate('restaurants', '-__v -_id -allergens')
            .populate({
                path: 'restaurants',
                model: 'Restaurant',
                select: 'id name types address city postalCode dep',
                populate: {
                    path: 'types',
                    model: 'TypeRestaurant',
                    select: 'name'
                }
            });

        return allAllergens;
    }

    /**
     * Get the allergen if exist
     * @param id
     * @returns {Promise<undefined|*>}
     */
    static async getById(id) {
        if (mongoose.Types.ObjectId.isValid(id)) {
            const allerg = await Allergen.findOne({_id: id})
                .populate({
                    path: 'restaurants',
                    model: 'Restaurant',
                    select: 'id name types address city postalCode dep',
                    populate: {
                        path: 'types',
                        model: 'TypeRestaurant',
                        select: 'name'
                    }
                });
            return allerg;
        } else {
            return undefined;
        }
        ;
    }

    /**
     * Get allergen by name
     * @param name
     * @returns {Promise<undefined|*>}
     */
    static async getByName(name) {
        const allerg = await Allergen.findOne({name: name})
            .populate({
                path: 'restaurants',
                model: 'Restaurant',
                select: 'id name types address city postalCode dep',
                populate: {
                    path: 'types',
                    model: 'TypeRestaurant',
                    select: 'name'
                }
            });

        if (allerg) {
            return allerg;
        } else {
            return undefined;
        }
    }

    /**
     * Push a restaurant into an allergen
     * @param idAllerg
     * @param idRestaurant
     * @returns {Promise<void>}
     */
    static async pushRestaurantInAllergen(idAllerg, idRestaurant) {
        if (mongoose.Types.ObjectId.isValid(idAllerg) && mongoose.Types.ObjectId.isValid(idRestaurant)) {
            const allerg = await this.getById(idAllerg);
            allerg.restaurants.push(idRestaurant);
            const ret = await allerg.save();
            return ret;
        } else {
            return undefined;
        }
    }

    /**
     * Remove a restaurant in the allergen
     * @param idAllergen
     * @param idRestaurant
     * @returns {Promise<undefined|*>}
     */
    static async popRestaurantInAllergen(idAllergen, idRestaurant) {
        if (mongoose.Types.ObjectId.isValid(idAllergen) && mongoose.Types.ObjectId.isValid(idRestaurant)) {
            const allerg = await this.getById(idAllergen);
            allerg.restaurants.remove(idRestaurant);
            let ret = await allerg.save();
            return ret;
        } else {
            return undefined;
        }
    }

    /**
     * Push a user into an allergen
     * @param idAllergen
     * @param idUser
     * @returns {Promise<void>}
     */
    static async pushUserInAllergen(idAllergen, idUser) {
        if (mongoose.Types.ObjectId.isValid(idAllergen) && mongoose.Types.ObjectId.isValid(idUser)) {
            const allerg = await this.getById(idAllergen);
            allerg.users.push(idUser);
            return await allerg.save();
        } else {
            return undefined;
        }
    }

    /**
     * Remove a restaurant in the allergen
     * @param idType
     * @param idUser
     * @returns {Promise<undefined|*>}
     */
    static async popUserInType(idType, idUser) {
        if (mongoose.Types.ObjectId.isValid(idType) && mongoose.Types.ObjectId.isValid(idUser)) {
            const allerg = await this.getById(idType);
            allerg.users.remove(idUser);
            let ret = await allerg.save();
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
    static async modifyById(id, updates) {
        if (mongoose.Types.ObjectId.isValid(id)) {
            return Allergen.findOneAndUpdate({_id: id}, updates, {
                new: true //To return model after update
            })
                .populate({
                    path: 'restaurants',
                    model: 'Restaurant',
                    select: 'id name types address city postalCode dep',
                    populate: {
                        path: 'types',
                        model: 'TypeRestaurant',
                        select: 'name'
                    }
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
    static async deleteById(id) {
        let ret = false;

        await Allergen.deleteOne({_id: id}, (err) => {
            if (err) ret = false;
            ret = true;
        });
        return ret;
    }
}

module.exports = AllergenDao;
