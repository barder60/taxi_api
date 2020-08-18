const bodyParser = require('body-parser');
const RestaurantController = require('../controllers').RestaurantController;
const TypeRestaurantController = require('../controllers').TypeRestaurantController;
const SessionDao = require('../dao').SessionDAO;
const AuthMiddleware = require('../middlewares').AuthMiddleware;
const RestaurantListController = require('../controllers').RestaurantListController;
const FriendsListController = require('../controllers').FriendsListUserController;

module.exports = function(app) {

    // TODO attention middleware

    /**
     * Create restaurant
     */
    app.post('/restaurant', AuthMiddleware.isAdmin,bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.saveRestaurant(req);

        if(ret === -1){
            res.status(400).end();
        } else if(ret){
            res.status(201).json(ret);
        }
        res.status(500).end();

    });

    /**
     * Add restaurant from front
     */
    app.post('/restaurant/add/:token', AuthMiddleware.isConnected, bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.addRestaurant(req);

        if(ret === -1){
            res.status(400).end();
        } else if(ret){
            res.status(200).json(ret);
        }
        res.status(500).end();

    });

    /**
     * Get all restaurants
     */
    app.get('/restaurant', bodyParser.json(), async (req, res) => {
        const allRestaurants = await RestaurantController.getAllRestaurants();

        if(allRestaurants){
            if(allRestaurants.length > 0) {
                res.status(200).json(allRestaurants);
            } else {
                res.status(204).end();
            }
        }
        res.status(500).end();
    });

    /**
     * Get random restaurant
     */
    app.post('/restaurant/rand', bodyParser.json(), async (req, res) => {
        const filters = req.body;
        const randRest = await RestaurantController.getRandomRestaurant(filters);
        if(randRest){
            res.status(200).json({restaurant : RestaurantController.manageRestaurant(randRest)});
        }else{
            res.status(200).json({restaurant : null});
        }
        res.status(500).end();

    });

    /**
     * Get random restaurant roll
     */
    app.post('/restaurant/roll/:token', AuthMiddleware.isConnected, bodyParser.json() ,async (req, res, next) => {
        const restaurantsListId = req.body.list;
        const friendListId = req.body.friendList;

        const token = req.params.token;
        const userId = await SessionDao.getUserIDByToken(token);

        const restaurantList = await RestaurantListController.restaurantsListIdNotExist(restaurantsListId);
        if(restaurantList === 0){
            res.status(400).json({
                message: "Veuillez renseigner une liste de restaurants "
            });
        } else if(restaurantList === -1){
            res.status(400).json({
                message: "Your restaurantId doesn't exist in BDD"
            })
        }

        const friendsList  = friendListId ? await FriendsListController.friendsListUserNotExist(req,res,next,friendListId) :
            {
                creator: userId,
                users: [],
                name: "TemporaryList"
            };

        const rollRestaurant = await RestaurantController.getRandomRestaurantByUserList(friendsList,restaurantList);

        if(rollRestaurant){
            if(rollRestaurant === -1){
                res.status(204).end();
            } else if (rollRestaurant){
                res.status(200).json(rollRestaurant);
            }
        }
        res.status(500).end();
    });

    /**
     * Get restaurant by id
     */
    app.get('/restaurant/:id', bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.getRestaurantsById(req.params.id);

        if(ret){
            if(ret === -1){
                res.status(404).end();
            } else if (ret) {
                res.status(200).json(RestaurantController.manageRestaurant(ret));
            }
        }
        res.status(500).end();
    });

    app.put('/restaurant/validate/:id', AuthMiddleware.isAdmin, async (req, res) => {
        const ret = await RestaurantController.updateRestaurantStatus(req.params.id)

        if (ret === -1){
            res.status(400).end();
        } else if (ret) {
            res.status(200).end();
        }
        res.status(500).end();

    });

    /**
     * Modify restaurant by id
     */
    app.put('/restaurant/:id', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.modifyById(req.params.id, req);

        if(ret === -1) {
            res.status(400).end()
        } else if (ret === -2){
            res.status(404).end()
        } else if(ret){
            res.status(200).json(ret);
        }
        res.status(500).end();
    });

    /**
     * Delete restaurant by id
     */
    app.delete('/restaurant/:id', AuthMiddleware.isAdmin, async (req, res) => {
        const ret = await RestaurantController.deleteById(req.params.id);

        if(ret === -1) {
            res.status(404).json({
                message: "This restaurant does not exist"
            });
        } else if(ret){
            res.status(200).end();
        }
        res.status(500).end();
    });

    /**
     * Search restaurant
     */
    app.post('/restaurant/search', bodyParser.json(), async (req, res) => {
        const { name, postalCode, city} = req.body
        let ret = "";

        if(name && !postalCode && !city){
            ret = await RestaurantController.searchRestaurantsByName(name);
        }
        else if(!name && postalCode && !city){
            ret = await RestaurantController.searchRestaurantsByPostalCode(postalCode);
        }
        else if(!name && !postalCode && city){
            ret = await RestaurantController.searchRestaurantsByCity(city);
        }
        else if(!name && postalCode && city){
            ret = await RestaurantController.searchRestaurantsByCityAndPostalCode(city, postalCode);
        }
        else if(name && postalCode && !city){
            ret = await RestaurantController.searchRestaurantsByNameAndPostalCode(name, postalCode);
        }
        else if(name && !postalCode && city){
            ret = await RestaurantController.searchRestaurantsByNameAndCity(name, city);
        }
        else if(name && postalCode && city){
            ret = await RestaurantController.searchRestaurantsByNameAndCityAndPostalCode(name, city, postalCode);
        }

        if(ret){
            res.status(200).json(ret);
        }else{
            res.status(500).end();
        }
    });

    /**
     * Allergen and characteristic management
     */

    /**
     * Add an allergen to restaurant
     */
    app.post('/allergen/restaurant/:idRestaurant', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.addAllergenToRestaurant(req.params.idRestaurant, req.body.idAllergen);

        if(ret === -1){
            res.status(400).end();
        }else{
            res.status(200).json(ret);
        }
        res.status(500).end();
    });

    /**
     * Delete an allergen of a restaurant
     */
    app.delete('/allergen/restaurant/:idRestaurant', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.delAllergenToRestaurant(req.body.idAllergen, req.params.idRestaurant);

        if(ret === -1){
            res.status(400).end();
        }else{
            res.status(200).json(ret);
        }
        res.status(500).end();
    });

    /**
     * Characteristic management
     */

    /**
     * Add a characteristic to a restaurant
     */
    app.post('/characteristic/restaurant/:idRestaurant', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.addCharacteristicToRestaurant(req.params.idRestaurant, req.body.idCharac);

        if(ret === -1){
            res.status(400).end();
        }else{
            res.status(200).json(ret);
        }
        res.status(500).end();
    });

    /**
     * Delete a restaurant characteristic
     */
    app.delete('/characteristic/restaurant/:idRestaurant', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.delCharacteristicToRestaurant(req.body.idCharac, req.params.idRestaurant);

        if(ret === -1){
            res.status(400).end();
        }else{
            res.status(200).json(ret);
        }
        res.status(500).end();
    });

    /**
     * Type restaurants management
     */

    /**
     * Create restaurant type
     */
    app.post('/type/restaurant', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await TypeRestaurantController.saveType(req);

        if(ret === -2){
            res.status(409).end();
        }else if(ret === -1){
            res.status(400).end();
        } else if(ret){
            res.status(201).json(ret);
        }
        res.status(500).end();

    });

    /**
     * Add a type to a restaurant
     */
    app.post('/type/restaurant/:idRestaurant', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.addTypeToRestaurant(req.params.idRestaurant, req.body.idType);

        if(ret === -1){
            res.status(400).end();
        }else{
            res.status(200).json(ret);
        }
        res.status(500).end();
    });

    /**
     * Get all restaurant types
     */
    app.get('/type/restaurant', async (req, res) => {
        const allTypes = await TypeRestaurantController.getTypes();

        if(allTypes){
            if(allTypes.length > 0) {
                res.status(200).json(allTypes);
            } else {
                res.status(204).end();
            }
        }
        res.status(500).end();
    });

    /**
     * Get restaurant type by id
     */
    app.get('/type/restaurant/:id', async (req, res) => {
        const ret = await TypeRestaurantController.getTypeById(req.params.id);

        if(ret){
            if(ret === -1){
                res.status(404).end();
            } else if (ret) {
                res.status(200).json(ret);
            }
        }
        res.status(500).end();
    });

    /**
     * Update restaurant type
     */
    app.put('/type/restaurant/:id', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await TypeRestaurantController.modifyById(req.params.id, req);

        if(ret === -3 ){
            res.status(409).end();
        }else if(ret === -1) {
            res.status(400).end();
        } else if (ret === -2){
            res.status(404).end();
        } else if(ret){
            res.status(200).json(ret);
        }
        res.status(500).end();
    });

    /**
     * Delete a type in a restaurant
     */
    app.delete('/type/restaurant/del/:idRestaurant', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await RestaurantController.delTypeToRestaurant(req.params.idRestaurant, req.body.idType);

        if(ret === -1){
            res.status(400).end();
        }else if(ret){
            res.status(200).json(ret);
        }
        res.status(500).end();
    });

    /**
     * Delete restaurant type by id
     */
    app.delete('/type/restaurant/:id', AuthMiddleware.isAdmin, async (req, res) => {
        const ret = await TypeRestaurantController.deleteById(req.params.id);

        if(ret === -1) {
            res.status(404).json({
                message: "This type does not exist"
            });
        } else if(ret){
            res.status(200).end();
        }
        res.status(500).end();
    });

};
