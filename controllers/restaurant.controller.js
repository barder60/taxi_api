const RestaurantDAO = require('../dao').RestaurantDAO;
const RestaurantListDAO = require('../dao').RestaurantListDao;
const TypeRestaurantDAO = require('../dao').TypeRestaurantDAO;
const AllergenDAO = require('../dao').AllergenDAO;
const CharacteristicDAO = require('../dao').CharacteristicDAO;
const SessionDao = require('../dao').SessionDAO;

const CoreController = require('./core.controller');
const AllergenController = require('./alleregen.controller');
const CharacteristicController = require('./characteristic.controller');
const TypeRestaurantController = require('./type-restaurant.controller');
const TicketController = require('./ticket.controller');
const FriendsListController = require('./friendsListUser.controller');


const RestaurantBean = require('../beans').RestaurantBean;
const Tools = require('../utils').Util;

class RestaurantController extends CoreController{

    /**
     * Save the restaurant
     * @param req
     * @returns {Promise<void>}
     */
    static async saveRestaurant(req){
        let restaurant = await this.buildRestaurant(req);

        if(restaurant){
            restaurant = await RestaurantDAO.saveRestaurant(restaurant);
            restaurant = await this.getRestaurantsById(restaurant._id);
            return restaurant;
        } else {
            return -1; //Bad request
        }
    }
    /**
     * add the restaurant
     * @param req
     * @returns {Promise<void>}
     */
    static async addRestaurant(req){
        const token = req.params.token;
        const userId = await SessionDao.getUserIDByToken(token);
        const restaurantBean = await this.buildRestaurantFromBean(req);
        const restaurant = await RestaurantDAO.saveRestaurant(restaurantBean);
        const ticketToCreate = {
            status: 'created',
            title: 'Création du restaurant ' + restaurant.name,
            restaurant: restaurant._id,
            message: "Nom: " + restaurant.name +
                     " Ville: " + restaurant.city +
                     " Address: " + restaurant.address +
                     " Code postale : " + restaurant.postalCode +
                     " Site web " + restaurant.website,
            type: 'newRestaurant',
            author: userId
        }
        const ticketCreated = await TicketController.create(ticketToCreate)

        if(restaurant && ticketCreated){
            return restaurant;
        } else {
            return -1; //Bad request
        }
    }

    /**
     * Get all restaurants
     * @returns {Promise<undefined|*>}
     */
    static async getAllRestaurants(){
        const allRestaurants = await RestaurantDAO.getAll();

        if(allRestaurants){
            return allRestaurants;
        }
        return undefined;
    }

    /**
     * Get restaurant by id
     * @param id
     * @returns {Promise<undefined>}
     */
    static async getRestaurantsById(id){
        const restaurant = await RestaurantDAO.getById(id);

        if(restaurant){
            return restaurant;
        } else {
            return -1;
        }
    }

    /**
     * search restaurant
     * @param name
     */
    static async searchRestaurantsByName(name){
        const restaurants = await RestaurantDAO.searchByName(name);

        return RestaurantController.manageRestaurants(restaurants);
    }
    /**
     * search restaurant
     * @param city
     */
    static async searchRestaurantsByCity(city){
        const restaurants = await RestaurantDAO.searchByCity(city);
        return RestaurantController.manageRestaurants(restaurants)
    }
    /**
     * search restaurant
     * @param postalCode
     */
    static async searchRestaurantsByPostalCode(postalCode){
        const restaurants = await RestaurantDAO.searchByPostalCode(postalCode);
        return RestaurantController.manageRestaurants(restaurants)
    }
    /**
     * search restaurant
     * @param city
     * @param postalCode
     */
    static async searchRestaurantsByCityAndPostalCode(city, postalCode){
        const restaurants = await RestaurantDAO.searchByCityAndPostalCode(city, postalCode);
        return RestaurantController.manageRestaurants(restaurants)
    }
    /**
     * search restaurant
     * @param name
     * @param postalCode
     */
    static async searchRestaurantsByNameAndPostalCode(name, postalCode){
        const restaurants = await RestaurantDAO.searchByNameAndPostalCode(name, postalCode);
        return RestaurantController.manageRestaurants(restaurants)
    }
    /**
     * search restaurant
     * @param name
     * @param city
     */
    static async searchRestaurantsByNameAndCity(name, city){
        const restaurants = await RestaurantDAO.searchByNameAndCity(name, city);
        return RestaurantController.manageRestaurants(restaurants)
    }
    /**
     * search restaurant
     * @param name
     * @param city
     * @param postalCode
     */
    static async searchRestaurantsByNameAndCityAndPostalCode(name, city, postalCode){
        const restaurants = await RestaurantDAO.searchByNameAndCityAndPostalCode(name, city, postalCode);
        return RestaurantController.manageRestaurants(restaurants)
    }

    static manageRestaurant(restaurant){
        return new RestaurantBean(restaurant._id, restaurant.name, restaurant.types,
            restaurant.address, restaurant.city, restaurant.website, restaurant.postalCode,
            restaurant.characteristics, restaurant.allergens);
    }

    static manageRestaurants(restaurants){
        const result = []
        restaurants.forEach(r => {
            if(r.status !== 'pending'){
                result.push(this.manageRestaurant(r))
            }
        })
        return result;
    }

    static isPresent(item){
        return item && item !== "";
    }

    static arePresent(items){
        return items && items.length > 0;
    }

    /**
     * Return a random restaurant
     * @returns {Promise<*>}
     */
    static async getRandomRestaurant(filters){
        const { city, characteristics, allergens, types } = filters
        let allRestaurants
        if(RestaurantController.isPresent(city) &&
                RestaurantController.arePresent(characteristics)
                && RestaurantController.arePresent(allergens)
                && RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCityAndCharacteristicsAndAllergensAndTypes(city, characteristics, allergens, types)
        }else if(RestaurantController.isPresent(city) &&
                RestaurantController.arePresent(characteristics)
                && !RestaurantController.arePresent(types)
                && RestaurantController.arePresent(allergens)){
            allRestaurants = await RestaurantDAO.getByCityAndCharacteristicsAndAllergens(city, characteristics, allergens)
        }else if(RestaurantController.isPresent(city)
            && !RestaurantController.arePresent(allergens)
            && !RestaurantController.arePresent(types) &&
            RestaurantController.arePresent(characteristics)){
            allRestaurants = await RestaurantDAO.getByCityAndCharacteristics(city, characteristics)
        }else if(RestaurantController.isPresent(city)
            && !RestaurantController.arePresent(allergens)
            && !RestaurantController.arePresent(types)
            && !RestaurantController.arePresent(characteristics)){
            allRestaurants = await RestaurantDAO.getByCity(city)
        }else if(
            !RestaurantController.isPresent(city)
            && RestaurantController.arePresent(characteristics)
            && RestaurantController.arePresent(allergens)
            && RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCharacteristicsAndAllergensAndTypes(characteristics, allergens, types)
        }else if(RestaurantController.isPresent(city) &&
            RestaurantController.arePresent(characteristics)
            && !RestaurantController.arePresent(allergens)
            && RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCityAndCharacteristicsAndTypes(city, characteristics, types)
        }else if(RestaurantController.isPresent(city) &&
            !RestaurantController.arePresent(characteristics)
            && RestaurantController.arePresent(allergens)
            && RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCityAndAllergensAndTypes(city, allergens, types)
        }else if(RestaurantController.isPresent(city) &&
            !RestaurantController.arePresent(characteristics)
            && RestaurantController.arePresent(allergens)
            && !RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCityAndAllergens(city, allergens)
        }else if(RestaurantController.isPresent(city) &&
            !RestaurantController.arePresent(characteristics)
            && !RestaurantController.arePresent(allergens)
            && RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCityAndTypes(city, types)
        }else if(!RestaurantController.isPresent(city) &&
            RestaurantController.arePresent(characteristics)
            && !RestaurantController.arePresent(allergens)
            && RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCharacteristicsAndTypes(characteristics, types)
        }else if(!RestaurantController.isPresent(city) &&
            RestaurantController.arePresent(characteristics)
            && RestaurantController.arePresent(allergens)
            && !RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCharacteristicsAndAllergens(characteristics, allergens)
        }else if(!RestaurantController.isPresent(city) &&
            !RestaurantController.arePresent(characteristics)
            && RestaurantController.arePresent(allergens)
            && RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByAllergensAndTypes(allergens, types)
        }else if(!RestaurantController.isPresent(city) &&
            RestaurantController.arePresent(characteristics)
            && !RestaurantController.arePresent(allergens)
            && !RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByCharacteristics(characteristics)
        }else if(!RestaurantController.isPresent(city) &&
            !RestaurantController.arePresent(characteristics)
            && RestaurantController.arePresent(allergens)
            && !RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByAllergens(allergens)
        }else if(!RestaurantController.isPresent(city) &&
            !RestaurantController.arePresent(characteristics)
            && !RestaurantController.arePresent(allergens)
            && RestaurantController.arePresent(types)){
            allRestaurants = await RestaurantDAO.getByTypes(allergens)
        }
        if (allRestaurants && allRestaurants.length > 0){
            const randomNumber = Tools.getRandomInt(0, allRestaurants.length -1);
            return allRestaurants[randomNumber];
        } else {
            return null;
        }
    }

    /**
     * Return a random restaurant by user List
     * @returns {Promise<*>}
     */
    static async getRandomRestaurantByUserList(friendList,restaurantList){
        // we push the creator in the friendList for the situation
        friendList.users.push(friendList.creator);

        if(restaurantList && restaurantList.restaurants){
            if (restaurantList.restaurants.length > 0){
                const situation = await FriendsListController.getFriendsListSituation(friendList);
                const restaurantsWithScore = await RestaurantController.calculateScore(situation, restaurantList);
                let limit = restaurantsWithScore.length/3;
                if(restaurantsWithScore.length <= 2){
                    limit = 1;
                }
                const results = await RestaurantController.sortOnly(restaurantsWithScore, limit);

                const randomNumber = Tools.getRandomInt(0, results.length -1);

                const restaurantResult = this.manageRestaurant(results[randomNumber])

                return {restaurant:restaurantResult, score:results[randomNumber].score};
            } else {
                return -1;
            }
        }
        return undefined;
    }

    static async sortOnly(results, limit){
        let resultSorted = [];
        // sort by Score
        results.sort(compareScore);
        for (let i = 0; i < limit; i++){
            resultSorted.push(results[i]);
        }
        return resultSorted;
    }

    static async calculateScore(situation, restaurantList){
        let result = [];
        for(const restaurantId of restaurantList.restaurants){
            const restaurantData = await RestaurantDAO.getById(restaurantId);

            let score = 0;
            // calculate of restaurant
            for ( const allergen of situation.allergens){
                if(RestaurantController.contains(restaurantData.allergens, "name", allergen.name)){
                    for(let i = 0; i < restaurantData.allergens.length; i++){
                        if(restaurantData.allergens[i].name === allergen.name){
                            score -= 10*allergen.rate/100
                        }
                    }
                }
                else {
                    score += 10;
                }
            }

            for (const characteristic of situation.characteristics){
                if(RestaurantController.contains(restaurantData.characteristics, "name", characteristic.name)){
                    for(let i = 0; i < restaurantData.characteristics.length; i++){
                        if(restaurantData.characteristics[i].name === characteristic.name){
                            score += 15*characteristic.rate/100;
                        }
                    }
                }
            }

            restaurantData.score = score;
            result.push(restaurantData);
        }
        return result;
    }
    /**
     * Return a random restaurant by user List and name
     * @returns {Promise<*>}
     */
    static async getRandomRestaurantByUserListAndName(listId, name){
        const list = await RestaurantListDAO.findById(listId);

        if(list && list.restaurants){
            const filteredList = list.restaurants.filter(restaurant => restaurant.name.toLowerCase().contains(name.toLowerCase()))
            if (filteredList.length > 0){
                const randomNumber = Tools.getRandomInt(0, filteredList.length -1);
                return filteredList[randomNumber];
            } else {
                return -1;
            }
        }
        return undefined;
    }

    /**
     * Add a type to a restaurant
     * @param idRestaurant
     * @param idType
     * @returns {Promise<void|undefined>}
     */
    static async addTypeToRestaurant(idRestaurant, idType){
        if(!idRestaurant, !idType){
            return -1; //Bad request
        }
        const isAddToType = TypeRestaurantDAO.pushRestaurantInType(idType, idRestaurant);
        const isAddToRest = RestaurantDAO.pushTypeInRestaurant(idType, idRestaurant);

        if (await isAddToType && await isAddToRest){
            return await this.getRestaurantsById(idRestaurant);
        }
        return undefined;
    }

    /**
     * Add an allergen to a restaurant
     * @param idRestaurant
     * @param idAllergen
     * @returns {Promise<void|undefined>}
     */
    static async addAllergenToRestaurant(idRestaurant, idAllergen){
        if(!idRestaurant, !idAllergen){
            return -1; //Bad request
        }
        const isAddToAllerg = AllergenDAO.pushRestaurantInAllergen(idAllergen, idRestaurant);
        const isAddToRest = RestaurantDAO.pushAllergenInRestaurant(idAllergen, idRestaurant);

        if (await isAddToAllerg && await isAddToRest){
            return await this.getRestaurantsById(idRestaurant);
        }
        return undefined;
    }

    /**
     * Add an allergen to a restaurant
     * @param idRestaurant
     * @param idCharac
     * @returns {Promise<void|undefined>}
     */
    static async addCharacteristicToRestaurant(idRestaurant, idCharac){
        if(!idRestaurant, !idCharac){
            return -1; //Bad request
        }
        const isAddToCharac = CharacteristicDAO.pushRestaurantInCharac(idCharac, idRestaurant);
        const isAddToRest = RestaurantDAO.pushCharacInRestaurant(idCharac, idRestaurant);

        if (await isAddToCharac && await isAddToRest){
            return await this.getRestaurantsById(idRestaurant);
        }
        return undefined;
    }

    /**
     * Delete a type of a restaurant
     * @param idRestaurant
     * @param idType
     * @returns {Promise<undefined|number>}
     */
    static async delTypeToRestaurant(idRestaurant, idType){
        if(!idRestaurant, !idType){
            return -1; //Bad request
        }
        const isAddToType = await TypeRestaurantDAO.popRestaurantInType(idType, idRestaurant);
        const isAddToRest = await RestaurantDAO.popTypeInRestaurant(idType, idRestaurant);

        if (isAddToType && isAddToRest){
            return await this.getRestaurantsById(idRestaurant);
        }
        return undefined;
    }

    /**
     * Delete a allergen of a restaurant
     * @param idAllergen
     * @param idRestaurant
     * @returns {Promise<undefined|number>}
     */
    static async delAllergenToRestaurant(idAllergen, idRestaurant){
        if(!idAllergen, !idRestaurant){
            return -1; //Bad request
        }
        const isAddToType = await AllergenDAO.popRestaurantInAllergen(idAllergen, idRestaurant);
        const isAddToRest = await RestaurantDAO.popAllergenInRestaurant(idAllergen, idRestaurant);

        if (isAddToType && isAddToRest){
            return await this.getRestaurantsById(idRestaurant);
        }
        return undefined;
    }

    /**
     * Delete characteristic to a restaurant
     * @param idCharac
     * @param idRestaurant
     * @returns {Promise<undefined|number>}
     */
    static async delCharacteristicToRestaurant(idCharac, idRestaurant){
        if(!idCharac, !idRestaurant){
            return -1; //Bad request
        }
        const isAddToType = await CharacteristicDAO.popRestaurantInCharac(idCharac, idRestaurant);
        const isAddToRest = await RestaurantDAO.popCharacInRestaurant(idCharac, idRestaurant);

        if (isAddToType && isAddToRest){
            return await this.getRestaurantsById(idRestaurant);
        }
        return undefined;
    }

    static async updateRestaurantStatus(idRestaurant){
        if (idRestaurant) {
            const restaurant = await RestaurantDAO.updateStatusById(idRestaurant);
            return restaurant;
        } else {
            return -1; // Bad request
        }
    }


    /**
     * Update the model by id
     * @param id
     * @param req
     * @returns {Promise<*|{site: *, address, city, postalCode, name: *, _idSituation, dep}|boolean|number>}
     */
    static async modifyById(id, req){
        let modifiedRestaurant = await this.buildRestaurant(req);

        if(modifiedRestaurant){
            modifiedRestaurant = await RestaurantDAO.modifyById(id, modifiedRestaurant);
            if(modifiedRestaurant){
                return modifiedRestaurant;
            } else {
                return -2;  //Not found
            }
        } else {
            return -1; //Bad request
        }

    }

    /**
     * Delete restaurant if exist
     * @param id
     * @returns {Promise<number|*>}
     */
    static async deleteById(id){
        const restaurant = await RestaurantDAO.getById(id);

        if(restaurant) {
            return await RestaurantDAO.deleteById(id);
        } else {
            return -1; //404 not found
        }
    }

    /**
     * Check and build the restaurant
     * @param req
     * @returns {Promise<{site: *, address, city, postalCode, name: *, _idSituation, dep}|boolean>}
     */
    static async buildRestaurant(req){

        if (req.body.name && req.body.site && req.body.address && req.body.city &&
            req.body.postalCode && req.body.dep && req.body.types && req.body._idSituation ) {

            return {
                name: req.body.name, website: req.body.site, address: req.body.address,
                city: req.body.city, postalCode: req.body.postalCode, dep: req.body.dep, types: req.body.types,
                _idSituation: req.body._idSituation
            }

        } else {
            return false;
        }
    }

    static async getCharacteristics(selectedCharacteristics){
        const characteristics = []
        for(const characteristic of selectedCharacteristics){
            const newCharacteristic = await RestaurantController.getCharacteristic(characteristic)
            if(newCharacteristic !== -1){
                characteristics.push(newCharacteristic)
            }
        }
        return characteristics;
    }

    static async getTypesFromRequest(selectedTypes){
        const types = []
        for(const type of selectedTypes){
            const newType = await RestaurantController.getType(type)
            if(newType !== -1){
                types.push(newType)
            }
        }
        return types;
    }

    static async getType(type){
        return await TypeRestaurantController.getTypeById(type.id)
    }

    static async getCharacteristic(characteristic){
        return await CharacteristicController.getCharacteristicById(characteristic.id)
    }

    static async getAllergen(allergen){
        return await AllergenController.getAllergenById(allergen.id)
    }

    static async getAllergens(allergens ){
        const allergensResult = []
        for(const allergen of allergens){
            const newAllergen = await RestaurantController.getAllergen(allergen)
            if(newAllergen !== -1){
                allergensResult.push(newAllergen)
            }
        }
        return allergensResult;
    }

    static async buildRestaurantFromBean(req){
        let characteristics = []
        let allergens = []
        let types = []

        if (req.body.name && req.body.address && req.body.city &&
            req.body.postalCode ) {
            if(req.body.allergens){
                const selectedAllergens = req.body.allergens.filter(a => a.selected)
                allergens = await RestaurantController.getAllergens(selectedAllergens)
            }
            if(req.body.characteristics){
                const selectedCharacteristics = req.body.characteristics.filter(c => c.selected)
                characteristics = await RestaurantController.getCharacteristics(selectedCharacteristics)
            }
            if(req.body.types){
                const selectedTypes = req.body.types.filter(t => t.selected)
                types = await RestaurantController.getTypesFromRequest(selectedTypes)
            }
            return {
                name: req.body.name,
                website: req.body.website,
                address: req.body.address,
                city: req.body.city,
                postalCode: req.body.postalCode,
                dep: req.body.dep,
                characteristics: characteristics,
                types: types,
                allergens: allergens,
                status: 'pending',
            }

        } else {
            return false;
        }
    }

}

function compareScore(a, b) {
    const scoreA = a.score;
    const scoreB = b.score;

    let comparison = 0;
    if (scoreA < scoreB) {
        comparison = 1;
    } else if (scoreA > scoreB) {
        comparison = -1;
    }
    return comparison;
}

module.exports = RestaurantController;
