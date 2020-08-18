const FriendsListUserModel = require('../models').FriendsListUser;
const FriendsListUserDao = require('../dao').FriendsListUserDao;
const ShortUserBean = require('../beans/shortUser.bean');
const FriendsListUsersBean = require('../beans/friendsListUsers.bean');
const CoreController = require('./core.controller');
const SessionDao = require('../dao').SessionDAO;
const UserController = require('./user.controller');
const mongoose = require('mongoose');

class FriendsListUserController extends CoreController {

    static render(list, options = {}) {
        const populates = [
            {path: 'users'},
            {path: 'creator'}
        ];
        return super.render(list, {...options, populates});
    }

    static async createFriendsListUser(req, res, next) {
        let data = req.body;
        const authorizedFields = ['name', 'users', 'creator'];
        Promise.resolve().then(() => {
            return FriendsListUserDao.find({$and: [{"creator": {$eq: data.creator}}, {"name": {$eq: req.body.name}}]}
            );
        })
            .then(friendsListUser => {
                if (friendsListUser.length) {
                    res.status(409).json({
                        status: 409,
                        message: "This friendsListUser name already exist in our friendsList"
                    }).end();
                    throw new Error("This friendsListUser name already exist in our friendsList");
                }

                if (!Array.isArray(data.users)) {
                    res.status(406).json({
                        status: 406,
                        message: "You need to add users Array in your body"
                    }).end();
                    throw new Error("You need to add users Array in your body");
                }


                const promiseAll = [];

                data.users.forEach((elem, i) => {
                    promiseAll.push(UserController.userNotExist(req, res, next, elem._id));
                });

                return Promise.all(promiseAll);
            })
            .then(() => FriendsListUserController.create(data, {authorizedFields}))
            .then(friendsListUser => FriendsListUserController.render(friendsListUser))
            .then(friendsListUser => res.json(friendsListUser))
            .catch(next);
    };

    static async getAllFriendsListUsers(req, res, next) {
        const order = req.query.order || 'create_at';
        Promise.resolve()
            .then(() => FriendsListUserController.find({}))
            .then(list => FriendsListUserController.render(list))
            .then(friendsListUser => res.status(200).json(friendsListUser))
            .catch(next);
    };

    static async getAllFriendsListUsersForUser(req, res, next) {
        const token = req.params.token;
        const userId = await SessionDao.getUserIDByToken(token);
        if (userId) {
            const groups = await FriendsListUserDao.getAllFriendsListUsersForUserId(userId)
            res.status(200).json(FriendsListUserController.manageFriendsListUsers(groups))
        } else {
            res.status(500).json({
                message: `Une erreur est survenue`
            })
        }
    };

    static async friendsListUsersAddUser(req, res, next) {
        const {idFriend} = req.body;
        const users = await FriendsListUserController.getUsers(req)
        users.push(idFriend)
        await FriendsListUserController.update(req, res, users)
    }

    static async friendsListUsersCreate(req, res, next) {
        const {name} = req.body; // name
        const token = req.params.token;
        const userId = await SessionDao.getUserIDByToken(token); // creator
        const newGroup = {
            name: name,
            creator: userId,
            users: []
        }
        const result = await FriendsListUserController.create(newGroup)
        if (result) {
            res.status(200).json({})
        } else {
            res.status(500).json({
                message: `Impossible d'enregistrer le nouveau groupe`
            })
        }
    }

    static async friendsListUsersDeleteUser(req, res, next) {
        const {idFriend} = req.body;
        const users = await FriendsListUserController.getUsers(req)
        users.remove(idFriend)
        await FriendsListUserController.update(req, res, users)
    }

    static async update(req, res, users) {
        const token = req.params.token;
        const {idGroup} = req.body;
        const userId = await SessionDao.getUserIDByToken(token);

        await FriendsListUserModel.updateOne({"_id": idGroup}, {users: FriendsListUserController.eliminateDuplicates(users)})
        const groups = await FriendsListUserDao.getAllFriendsListUsersForUserId(userId)
        res.status(200).json(FriendsListUserController.manageFriendsListUsers(groups))
    }

    static async getUsers(req) {
        const {idGroup} = req.body;
        const group = await FriendsListUserDao.findById(idGroup);
        return group.users;
    }

    static async getById(id) {
        return await FriendsListUserDao.findById(id);
    }

    static manageFriendsListUsers(friendsListUsers) {
        const result = [];
        for (let group of friendsListUsers) {
            const friends = []
            for (let friend of group.users) {
                friends.push(new ShortUserBean(friend._id, friend.firstName, friend.lastName))
            }
            result.push(new FriendsListUsersBean(friends, group._id, group.name))
        }
        return result;

    }

    static async getFriendsListUserById(req, res, next) {
        const id = req.params.friendsListUserId;
        Promise.resolve()
            .then(() => FriendsListUserController.friendsListUserNotExist(req, res, next, id))
            .then(() => {
                FriendsListUserModel
                    .findById(id).populate("users")
                    .select('name users _id')
                    .exec()
                    .then(doc => {
                        if (doc) {
                            res.status(200).json({
                                friendsListUser: doc,
                                request: {
                                    type: 'GET',
                                    url: `http://localhost:3000/friendsListUsers`,
                                }
                            });
                        }
                    }).catch(err => {
                    res.status(400).json({
                        message: "Bad request",
                        err,
                    });
                });
            });
    };

    static async updateFriendsListUser(req, res, next) {
        const id = req.params.friendsListUserId;
        let data = req.body;
        Promise.resolve().then(() => {
            const promiseAll = [];
            // Check of friendsListUser alreadyExist to be sure we avoid duplicate Name
            if (data.name) promiseAll.push(FriendsListUserController.friendsListUserNameNotSameIdAlreadyExist(req, res, next, id));
            if (data.users) data.users.forEach((elem, i) => {
                promiseAll.push(UserController.userNotExist(req, res, next, elem._id));
            });

            return Promise.all(promiseAll);
        })
            .then(() => FriendsListUserController.friendsListUserNotExist(req, res, next, id))
            .then(friendsListUser => {
                friendsListUser.set(data);
                return friendsListUser.save();
            })
            .then(friendsListUser => FriendsListUserController.render(friendsListUser))
            .then(friendsListUser => res.json({
                friendsListUser,
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/friendsListUser/${id}`
                }
            }))
            .catch(next);
    }

    static async deleteFriendsListUser(req, res, next) {
        const id = req.params.friendsListUserId;
        Promise.resolve()
            .then(() => FriendsListUserController.friendsListUserNotExist(req, res, next, id))
            .then(() => {
                // Check of friendsListUser alreadyExist to be sure we avoid duplicate Name
                if (FriendsListUserDao.deleteById(id)) {
                    res.status(200).json({
                        message: `The friendsListUser ${id} has been delete with success`
                    }).end();
                }
            })
            .catch(next);
    }

    static async deleteFriendsListUserForUser(req, res, next) {
        const id = req.params.friendsListUserId;
        let data = req.body;
        const promiseAll = [];
        Promise.resolve().then(() => {

            data.users.forEach((elem, i) => {
                promiseAll.push(UserController.userNotExist(req, res, next, elem._id));
            });
            promiseAll.push(FriendsListUserController.friendsListUserNotExist(req, res, next, id));

            return Promise.all(promiseAll);
        })
            .then(() => {
                // taking users id in order to check them
                return FriendsListUserModel.find({_id: id}).then(doc => {
                    let users = doc[0].users;
                    // remove id one by one
                    data.users.forEach(elem => {
                        let index = users.indexOf(elem._id);
                        if (index !== -1) {
                            users.splice(index, 1);
                        }
                    });
                    // cast into ObjectId
                    let usersFinal = [];
                    users.forEach(elem => {
                        usersFinal.push(mongoose.Types.ObjectId(elem));
                    });
                    // push du new array objectId of user
                    return FriendsListUserModel.updateOne({'_id': id}, {'$set': {"users": usersFinal}});
                });
            })
            .then(() => FriendsListUserController.render(FriendsListUserDao.findById(id)))
            .then(friendsListUser => res.json({
                friendsListUser,
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/friendsListUser/${id}`
                }
            }))
            .catch(next);
    }

    static async add_users(req, res, next) {
        const id = req.params.friendsListUserId;
        let data = req.body;
        Promise.resolve().then(() => {
            const promiseAll = [];
            data.users.forEach((elem, i) => {
                promiseAll.push(UserController.userNotExist(req, res, next, elem._id));
            });
            promiseAll.push(FriendsListUserController.friendsListUserNotExist(req, res, next, id));

            return Promise.all(promiseAll);
        })
            .then(() => {
                data.users = FriendsListUserController.eliminateDuplicates(data.users);
                return FriendsListUserModel.updateOne({"_id": id}, {$push: {users: {$each: data.users}}})
            })
            .then(() => FriendsListUserController.render(FriendsListUserDao.findById(id)))
            .then(friendsListUser => res.json({
                friendsListUser,
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/friendsListUser/${id}`
                }
            }))
            .catch(next);
    }

    static async friendsListUserNotExist(req, res, next, id) {
        return Promise.resolve()
            .then(() => FriendsListUserDao.findById(id))
            .then(friendsListUser => {
                if (!friendsListUser) {
                    res.status(404).json({
                        message: `This friendsListUser ${id} doesn't exist`
                    }).end();
                    throw new Error(`This friendsListUser ${id} doesn't exist`);
                }
                return friendsListUser;
            });
    }

    static async friendsListUserNameNotSameIdAlreadyExist(req, res, next, id) {
        Promise.resolve().then(() => FriendsListUserDao
            .find({$and: [{"_id": {$ne: id}}, {"name": {$eq: req.body.name}}]}
            ))
            .then(friendsListUser => {
                if (Array.isArray(friendsListUser) && friendsListUser.length) {
                    res.status(409).json({
                        message: "This friendsListUser already exist"
                    }).end();
                    throw new Error("This friendsListUser already exist");
                }
            }).catch(next)
    }

    static async getFriendsListSituation(friendsList) {
        const situation = {};
        situation.allergens = [];
        situation.characteristics = [];

        for (const userId of friendsList.users) {
            const userData = await UserController.getUserById(userId);
            if(userData){
                for (let i = 0; i < userData.allergens.length; i++){
                    if (FriendsListUserController.contains(situation.allergens, "id", '' + userData.allergens[i].id)) {
                        for (const allergen of situation.allergens){
                            if(allergen.id === userData.allergens[i].id){
                                allergen.count++;
                            }
                        }
                    } else {
                        situation.allergens.push({
                            "id": '' + userData.allergens[i].id,
                            "name": ''+ userData.allergens[i].name,
                            "count": 1
                        });
                    }
                }

                for (let i = 0; i < userData.characteristics.length; i++){
                    if (FriendsListUserController.contains(situation.characteristics, "id", '' + userData.characteristics[i].id)) {
                        for (const characteristics of situation.characteristics){
                            if(characteristics.id === userData.characteristics[i].id){
                                characteristics.count++;
                            }
                        }
                    } else {
                        situation.characteristics.push({
                            "id": '' + userData.characteristics[i].id,
                            "name": ''+ userData.characteristics[i].name,
                            "count": 1
                        });
                    }
                }
            }
        }
        situation.characteristics.forEach(element => {
            if(friendsList.users.length !== 0){
                element.rate = element.count/friendsList.users.length*100;
            }
        });

        situation.allergens.forEach(element => {
            if(friendsList.users.length !== 0){
                element.rate = element.count/friendsList.users.length*100;
            }
        });

        return situation;

    }
}

FriendsListUserController.prototype.modelName = 'FriendsListUser';
module.exports = FriendsListUserController;



