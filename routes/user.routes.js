const bodyParser = require('body-parser');
const FriendsListUserController = require('../controllers').FriendsListUserController;
const RestaurantListController = require('../controllers').RestaurantListController;
const UserController = require('../controllers').UserController;
const HistoricalController = require('../controllers').HistoricalController;
const SessionDao = require('../dao').SessionDAO;
const AuthMiddleware = require('../middlewares').AuthMiddleware;


module.exports = function(app) {

    /**
     * Menu management
     */

    app.post('/gotoRestaurant/user/:token', AuthMiddleware.isConnected, bodyParser.json(), HistoricalController.create_history);
  
    app.get('/frontTracking/restaurant/user/:idTokenUser',  AuthMiddleware.isConnected, HistoricalController.render_stats_for_front);
    app.get('/tracking/restaurant/user/:idTokenUser',  AuthMiddleware.isConnected, HistoricalController.render_stats_about_a_user);
  
    app.get('/historic/restaurant/:idTokenUser/:idRestaurant', AuthMiddleware.isConnected, HistoricalController.render_historic_details);

    app.post('/manage/create/friendsListUser', AuthMiddleware.isConnected, bodyParser.json(), FriendsListUserController.createFriendsListUser);

    app.put('/manage/friendsListUser/:friendsListUserId', AuthMiddleware.isConnected, bodyParser.json() , FriendsListUserController.updateFriendsListUser);

    app.delete('/manage/friendsListUser/:friendsListUserId',  AuthMiddleware.isConnected,FriendsListUserController.deleteFriendsListUser);

    app.put('/manage/friendsListUser/products/:friendsListUserId',  AuthMiddleware.isConnected, bodyParser.json() , FriendsListUserController.add_users);

    app.delete('/manage/friendsListUser/products/:friendsListUserId',  AuthMiddleware.isConnected, bodyParser.json(), FriendsListUserController.deleteFriendsListUser);

    app.get('/friendsListUsers',  AuthMiddleware.isConnected, FriendsListUserController.getAllFriendsListUsers);
    app.get('/myFriendsListUsers/:token', AuthMiddleware.isConnected, FriendsListUserController.getAllFriendsListUsersForUser);
    app.post('/myFriendsListUsers/add/:token', AuthMiddleware.isConnected, bodyParser.json(), FriendsListUserController.friendsListUsersAddUser);
    app.post('/myFriendsListUsers/new/:token', AuthMiddleware.isConnected, bodyParser.json(), FriendsListUserController.friendsListUsersCreate);
    app.post('/myFriendsListUsers/delete/:token', AuthMiddleware.isConnected, bodyParser.json(), FriendsListUserController.friendsListUsersDeleteUser);
    app.get('/friendsListUser/:friendsListUserId', AuthMiddleware.isConnected, FriendsListUserController.getFriendsListUserById);
    app.delete('/manage/friendsListUser/users/:friendsListUserId', AuthMiddleware.isConnected, bodyParser.json(), FriendsListUserController.deleteFriendsListUserForUser);


    app.get('/myRestaurantList/:token', AuthMiddleware.isConnected, RestaurantListController.getAllForUser);
    app.post('/myRestaurantList/new/:token', AuthMiddleware.isConnected, bodyParser.json(), RestaurantListController.createForUser);
    app.post('/myRestaurantList/add/:token', AuthMiddleware.isConnected, bodyParser.json(), RestaurantListController.addRestaurant);
    app.post('/myRestaurantList/delete/:token', AuthMiddleware.isConnected, bodyParser.json(), RestaurantListController.deleteRestaurant);
    app.delete('/myRestaurantList/:id', AuthMiddleware.isConnected, RestaurantListController.deleteList);

    app.get('/users/',  AuthMiddleware.isAdmin, async (req,res) =>{
        const result = await UserController.getAllUser();
        res.status(200).json(result)
    });
    app.get('/usersWithId/', AuthMiddleware.isAdmin, UserController.getAllUserWithId);
    app.get('/user/:token', AuthMiddleware.isConnected, UserController.getUser);



    app.post('/user/update/:token', AuthMiddleware.isConnected, bodyParser.json(), UserController.updateUser);

    app.post('/user/search/:token', AuthMiddleware.isConnected, bodyParser.json(), async (req, res) => {
        // UserController.search_user
        let ret;
        const token = req.params.token;
        const userId = await SessionDao.getUserIDByToken(token);
        if(userId){
            const { firstName, lastName} = req.body
            if(firstName && !lastName){
                ret = await UserController.searchUserByFirstName(firstName)
            }else if(!firstName && lastName){
                ret = await UserController.searchUserByLastName(lastName)
            }else if(firstName && lastName){
                ret = await UserController.searchUserByFirstNameAndLastName(firstName, lastName)
            }
            const newRes = ret.filter(user => user.id.toString() !== userId.toString())
            if(newRes){
                res.status(200).json(newRes);
            }else{
                res.status(500).end();
            }
        }else{
            res.status(500).end();
        }

    });

};
