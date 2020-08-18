const UserController = require('../controllers/user.controller');
const CharacteristicController = require('../controllers/characteristic.controller');
const AllergenController = require('../controllers/alleregen.controller');
const SituationBean = require('../beans/situation.bean');
const bodyParser = require('body-parser');
const AuthMiddleware = require('../middlewares').AuthMiddleware;

module.exports = function(app) {
    app.get('/situation/:token', AuthMiddleware.isConnected,async (req, res) => {

        const userId = await UserController.getUserIdByToken(req.params.token)
        const user = await UserController.getUserById(userId)

        const situationBean = new SituationBean();
        if(user){
            user.characteristics.forEach(userCharacteristic => {
                situationBean.characteristics.push(userCharacteristic.id)
            });
            user.allergens.forEach(userAllergen => {
                situationBean.allergens.push(userAllergen.id)
            });
        }

        if(userId && user){
            res.status(200).json({
                ...situationBean
            });
        } else {
            res.status(500).end();
        }
    });
    app.post('/situation/:token', AuthMiddleware.isConnected, bodyParser.json(), async (req, res) => {
        const userId = await UserController.getUserIdByToken(req.params.token)
        const userToUpdate = await UserController.getUserById(userId)
        const response = req.body
        if(userToUpdate){
            userToUpdate.characteristics = [];
            for(const characteristic of response.characteristics){
                const newCharacteristic = await CharacteristicController.getCharacteristicById(characteristic.id)
                if(newCharacteristic !== -1 && characteristic.selected){
                    userToUpdate.characteristics.push(newCharacteristic)
                }
            }
            userToUpdate.allergens = [];
            for(const allergen of response.allergens){
                const newAllergen = await AllergenController.getAllergenById(allergen.id)
                if(newAllergen !== -1 && allergen.selected){
                    userToUpdate.allergens.push(newAllergen)
                }
            }
            userToUpdate.hasCompletedSituation = true;
            const update = await UserController.update_user(userToUpdate, userId, false)
            if(update){
                res.status(200).json({message : 'the user has been updated'});
            } else {
                res.status(500).end();
            }
        }

        if(userToUpdate){
            res.status(500).end();
        }
    });
}
