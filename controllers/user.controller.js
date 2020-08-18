const UserBean = require('../beans/user.bean');
const ShortUserBean = require('../beans/shortUser.bean');
const AllergenBean = require('../beans/allergen.bean');
const CharacteristicBean = require('../beans/characteristic.bean');
const UserDao = require('../dao').UserDAO;
const SessionDao = require('../dao').SessionDAO;
const CoreController = require('./core.controller');
const SecurityUtil = require('../utils').SecurityUtil;
const SessionController = require('./session.controller');
const UserModel = require('../models').User;

class UserController extends CoreController{

    /**
     * Subscribe function to create User
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async subscribe(req, res, next){
        let data = req.body;
        data.password = SecurityUtil.hashPassword(data.password);
        const authorizedFields = ['lastName','firstName','town','address','postalCode','phone','email','password','type'];

        if( data.lastName &&
            data.firstName &&
            data.town &&
            data.address &&
            data.postalCode &&
            data.phone &&
            data.email &&
            data.password &&
            data.type ){

                Promise.resolve().then(() => {
                    return UserDao.findOne({email:data.email});
                }).then(user => {
                    if(user){
                        res.status(409).json({
                            message:"This email already exist"
                        }).end();
                        throw new Error("This email already exist");
                    }
                    return UserController.create(data, {authorizedFields});
                })
                    .then(user => UserController.render(user))
                    .then(user => res.json(user))
                    .catch(next);
        }else{
            Promise.resolve().then(() => {
                res.status(409).json({
                    message:"One or more fields are empty"
                }).end();
                throw new Error("One or more fields are empty");
            }).then(() => res.json())
        }
    };

    /**
     * Create a token for the user
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async login(req, res, next){
        let data = req.body;
        data.password = SecurityUtil.hashPassword(data.password);

        const user = await UserDao.findOne({
            email: data.email,
            password: data.password
        });

        if(!user) {
            res.status(401).json({
                message:"Incorrect email or password"
            }).end();
            throw new Error("Incorrect email or password");
        }

        const token = await SecurityUtil.randomToken();
        const session = await SessionController.create(user,token);

        if(session){
            res.status(200).json({
                token: session.token
            });
        } else {
            res.status(500).end();
        }
    }

    /**
     * Close the session
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async logout(req, res, next){

        const token = req.params.token;

        const ret = await SessionDao.deleteByToken(token);

        if(ret){
            res.status(200).json({
                message: `The user has been logout`
            })
        } else {
            res.status(404).json({
                message: `Invalid token or user is not logged`
            });
        }
    }

    static async deleteUser(req,res,next){
        const id = req.params.userId;
        Promise.resolve()
            .then(() =>  UserController.userNotExist(req,res,next,id))
            .then(() => {
                // Check of product alreadyExist to be sure we avoid duplicate Name
                if(UserDao.deleteById(id)){
                    res.status(200).json({
                        message: `The user ${id} has been delete with success`
                    }).end();
                }
            })
            .catch(next);
    }

    static async updateUser(req, res, next){
        const token = req.params.token;
        let data = req.body;
        const userId = await SessionDao.getUserIDByToken(token);
        if(userId){
            const user = await UserController.getUserById(userId);
            if(user){
                let userUpdated = null;
                // check if isNewEmail => already exists
                const email = data.email;
                if(email !== user.email){
                    const exists = await UserController.getUserByEmail(email)
                    if(exists){
                        res.status(500).end();
                    }else{
                        userUpdated = await UserController.update_user(data, userId, true);
                    }
                }else {
                    // save new data
                   userUpdated = await UserController.update_user(data, userId, true);
                }
                if(userUpdated){
                    res.status(200).json(userUpdated);
                } else {
                    res.status(500).end();
                }
            } else {
                res.status(500).end();
            }
        }else{
            res.status(500).end();
        }

    }

    static async userNotExist(req,res,next,id){
        return Promise.resolve().then(() => UserDao.findById(id))
            .then(user =>{
                if(!user){
                    res.status(409).json({
                        message: `The user ${id} doesn't exist`
                    });
                    throw new Error(`The user ${id} doesn't exist`);
                }
                return user;
            });
    }

    static async getUser(req,res){
        const token = req.params.token;
        const userId = await SessionDao.getUserIDByToken(token);
        const user = await UserController.getUserById(userId);
        if(user){
            res.status(200).json(user);
        } else {
            res.status(500).end();
        }
    }

    static async getAllUser(){
        let allUser = await UserController.getModel().find({});
        const results = [];
        for(let user of allUser){
            const userBean = new UserBean(user.lastName,user.firstName,user.address,user.phone,user.town,user.email,user.postalCode,user.cgu, user.hasCompletedSituation, user.type);
            userBean.allergens = [];
            userBean.characteristics = [];
            user.allergens.forEach(allergen => userBean.allergens.push(new AllergenBean(allergen.id, allergen.name)))
            user.characteristics.forEach(characteristic => userBean.characteristics.push(new CharacteristicBean(characteristic.id, characteristic.name)))
            results.push(userBean)
        }
        return results;
    }



    /**
     * Render All Menu
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async getAllUserWithId(req, res, next) {
        const fields = [
            '_id',
            'lastName',
            'firstName',
            'address',
            'phone',
            'town',
            'email',
            'postalCode',
            'cgu',
            'allergens',
            'characteristics',
            'hasCompletedSituation',
            'type',
        ];

        Promise.resolve()
            .then(() => UserModel.find({}))
            .then(users => UserController.read(users, { fields },true))
            .then(users => {
                const response = users.map(user => user);

                if(response.count === 0){
                    res.status(204).end();
                }
                res.status(200).json(response);
            }).catch(err => {
            res.status(400).json({
                message: "Bad request",
                err,
            })
        });
    };

    static async searchUserByFirstName(firstName){
        const users = await UserDao.searchUserByFirstName(firstName)
        const results = []
        for(let user of users){
            results.push(new ShortUserBean(user._id, user.firstName, user.lastName))
        }
        return results
    }

    static async searchUserByLastName(lastName){
        const users = await UserDao.searchUserByLastName(lastName)
        const results = []
        for(let user of users){
            results.push(new ShortUserBean(user._id, user.firstName, user.lastName))
        }
        return results
    }

    static async searchUserByFirstNameAndLastName(firstName, lastName){
        const users = await UserDao.searchUserByFirstNameAndLastName(firstName, lastName)
        const results = []
        for(let user of users){
            results.push(new ShortUserBean(user._id, user.firstName, user.lastName))
        }
        return results
    }

    static async getUserById(userId){
        const userDao = await UserDao.findById(userId);
        if(userDao){
            const user = new UserBean(userDao.lastName,userDao.firstName,userDao.address,userDao.phone,userDao.town,
                userDao.email,userDao.postalCode,userDao.cgu, userDao.hasCompletedSituation, userDao.type, userDao._id);
            user.allergens = [];
            user.characteristics = [];
            userDao.allergens.forEach(allergen => user.allergens.push(new AllergenBean(allergen.id, allergen.name)))
            userDao.characteristics.forEach(characteristic => user.characteristics.push(new CharacteristicBean(characteristic.id, characteristic.name)))
            return user;
        }
        return null;
    }


    static async getSmallUserById(userId){
        return await UserDao.findSmallById(userId);
    }


    static async getUserByEmail(email){
        const userDao = await UserDao.findByEmail(email);
        return !!userDao;
    }

    static async update_user(userUpdate, userId, isAccount){
        return await UserDao.updateUser(userUpdate, userId, isAccount);
    }

    static async getUserIdByToken(token){
        return await SessionDao.getUserIDByToken(token);
    }

}
UserController.prototype.modelName = 'User';
module.exports = UserController;
