const CoreController = require('./core.controller');
const UserController = require("./user.controller");
const RestaurantController = require('./restaurant.controller');
const FriendsListUserController = require('./friendsListUser.controller');
const HistoryModel = require('../models').Historical;
const SessionDao = require('../dao').SessionDAO;
const HistoricBean = require('../beans').HistoricBean;

class HistoricalController extends CoreController {
    /**
     *
     * @param list
     * @param options
     * @returns {Promise<*>}
     */
    static render(list, options = {}) {
        const populates = [
            {
                path: 'users',
                select: 'name username email',
            },
            {
                path: 'restaurants',
                select: 'name website address city postalCode'
            },
        ];

        return super.render(list, { ...options, populates })
    }

    /**
     * create a ticket with status todo
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async create_history(req, res, next){
        const {friendList, restaurant} = req.body;
        const authorizedFields = [
            'users',
            'restaurants'
        ];
        const data = {
            restaurants: [restaurant],
            users: []
        };
        if(!friendList || friendList.length === 0){
            const token = req.params.token;
            const userId = await SessionDao.getUserIDByToken(token);
            data.users.push(userId)
        }else {
            const friendListModel = await FriendsListUserController.getById(friendList)
            if(friendListModel) {
                friendListModel.users.forEach(user => data.users.push(user))
                data.users.push(friendListModel.creator)
            }
        }

        const order = await HistoricalController.create(data, { authorizedFields });
        if(order){
            const render = await HistoricalController.render(order);
            if(render){
                res.status(201).json(render);
            }else {
                res.status(500).json({
                    message: `Une erreur est survenue`
                })
            }
        }else {
            res.status(500).json({
                message: `Une erreur est survenue`
            })
        }

    }

    /**
     * create a ticket with status todo
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async render_stats_for_front(req, res, next){
        let idTokenUser = req.params.idTokenUser;

        let idUser = await UserController.getUserIdByToken(idTokenUser);
        if(idUser === null){
            idUser = idTokenUser;
        }
        await UserController.userNotExist(req,res,next,idUser);
        let allStats = await HistoricalController.createStatsBean(idUser);

        await res.status(201).json({allStats});
    }

    static async createStatsBean(idUser){
        let restaurantsStats = [];
        let userStats = {};
        const result = await HistoryModel.find({
            users:{
                $in:[idUser]
            }
        });
        userStats.numberPurchase = result.length;
        for (const element of result){
            //Check what type of restaurant user likes to go
            let restaurantInfo = await RestaurantController.getRestaurantsById(element.restaurants);
            if(HistoricalController.containsRestaurant(restaurantsStats,"id",''+restaurantInfo.id)) {
                restaurantsStats.find(function (item, j) {
                    if(item.restaurant.id == ''+restaurantInfo.id){
                        restaurantsStats[j].count++;
                    }
                });
            } else {
                restaurantsStats.push({
                    "restaurant": RestaurantController.manageRestaurant(restaurantInfo) ,
                    "count": 1,
                })
            }
        }

        return restaurantsStats;
    }

    /**
     * create a ticket with status todo
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async render_stats_about_a_user(req, res, next){
        let idTokenUser = req.params.idTokenUser;

        let idUser = await UserController.getUserIdByToken(idTokenUser);
        if(idUser === null){
            idUser = idTokenUser;
        }
        await UserController.userNotExist(req,res,next,idUser);
        let allStats = await HistoricalController.createStats(idUser);



        await res.status(200).json({allStats});
    }

    static async createStats(idUser){
        let userStats = {};
        let friendsStats = [];
        let restaurantsStats = [];
        let allstats;
        const result = await HistoryModel.find({
            users:{
                $in:[idUser]
            }
        });
        userStats.typesGoStats = [];
        userStats.characteristicsGoStats = [];
        userStats.numberPurchase = result.length;
        for (const element of result){
            // Check how many item a user meet an other user
            for (let i = 0; i < element.users.length; i++){
                if(HistoricalController.contains(friendsStats,"friend",''+element.users[i])) {
                    friendsStats.find(function (item, j) {
                        if(item.friend == ''+element.users[i]){
                            friendsStats[j].count++;
                        }
                    });
                } else {
                    friendsStats.push({
                        "friend": element.users[i],
                        "count": 1,
                    })
                }
            }
            //Check what type of restaurant user likes to go
            let restaurantInfo = await RestaurantController.getRestaurantsById(element.restaurants);
            if(HistoricalController.contains(restaurantsStats,"restaurant_id",''+restaurantInfo._id)) {
                restaurantsStats.find(function (item, j) {
                    if(item.restaurant_id == ''+restaurantInfo._id){
                        restaurantsStats[j].count++;
                    }
                });
            } else {

                restaurantsStats.push({
                    "restaurant_id": restaurantInfo._id,
                    "count": 1,
                })
            }

            for (let i = 0; i < restaurantInfo.types.length; i++){
                if(HistoricalController.contains(userStats.typesGoStats,"type",''+restaurantInfo.types[i].name)){
                    for (const goTo of userStats.typesGoStats){
                        if(goTo.type === restaurantInfo.types[i].name){
                            goTo.count++;
                        }
                    }
                } else {
                    userStats.typesGoStats.push({
                        "type": ''+restaurantInfo.types[i].name,
                        "count": 1
                    });
                }
            }
            for (let i = 0; i < restaurantInfo.characteristics.length; i++){
                if(HistoricalController.contains(userStats.characteristicsGoStats,"characteristic",''+restaurantInfo.characteristics[i].name)){
                    for (const characteristic of userStats.characteristicsGoStats){
                        if(characteristic.name === restaurantInfo.characteristics[i].name){
                            characteristic.count++;
                        }
                    }
                } else {
                    userStats.characteristicsGoStats.push({
                        "characteristic": ''+restaurantInfo.characteristics[i].name,
                        "count": 1
                    });
                }
            }


        }


        friendsStats.forEach(element => {
            if(userStats.numberPurchase !== 0){
                element.rateMeetPercent = element.count/userStats.numberPurchase*100;
            }
        });
        userStats.typesGoStats.forEach(element => {
            if(userStats.numberPurchase !== 0){
                element.rateTypePercent = element.count/userStats.numberPurchase*100;
            }
        });

        allstats = {
            friendsStats,
            restaurantsStats,
            userStats,
        };

        return allstats;
    }

    static async render_historic_details(req, res, next){
        let idTokenUser = req.params.idTokenUser;
        let idRestaurant = req.params.idRestaurant;

        let idUser = await UserController.getUserIdByToken(idTokenUser);
        if(idUser === null){
            idUser = idTokenUser;
        }
        await UserController.userNotExist(req,res,next,idUser);


        let allStats = await HistoricalController.generateHistoric(idUser,idRestaurant);

        await res.status(201).json({allStats});
    }

    static async generateHistoric(idUser,idRestaurant){
        let resultsBean = [];
        let result = await HistoricalController.find({$and:[{users:{
                    $in:[idUser]
                }
            },{restaurants:{$eq:idRestaurant}}]});
        result = await HistoricalController.render(result);
        for (let historicFound of result){
            let historicBean = new HistoricBean(historicFound.restaurants,historicFound.date_historical);
            for (let user of historicFound.users){
                if(user._id != idUser){
                    historicBean.users.push(await UserController.getUserById(user._id));
                }
            }
            resultsBean.push(historicBean);
        }

        return resultsBean;

    };
}

HistoricalController.prototype.modelName = 'historical';
module.exports = HistoricalController;
