const bodyParser = require('body-parser');
const AllergenController = require('../controllers').AllergenController;
const CharacteristicController = require('../controllers').CharacteristicController;
const AllergenBean = require('../beans').AllergenBean;
const CharacteristicnBean = require('../beans').CharacteristicnBean;
const AuthMiddleware = require('../middlewares').AuthMiddleware;

module.exports = function(app) {

    /**
     * Allergen management
     */

    /**
     * Create an allergen
     */
    app.post('/allergen', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await AllergenController.saveAllergen(req);

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
     * Get all allergens
     */
    app.get('/allergens', async (req, res) => {
        const allergens = await AllergenController.getAllergens()
        if(allergens){
            if(allergens.length > 0) {
                const resultAllergen = []
                allergens.forEach(allergen => resultAllergen.push(new AllergenBean(allergen._id, allergen.name)))
                res.status(200).json(resultAllergen);
            } else {
                res.status(204).end();
            }
        }
        res.status(500).end();
    });

    /**
     * Get allergen by id
     */
    app.get('/allergen/:id', async (req, res) => {
        const ret = await AllergenController.getAllergenById(req.params.id);

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
     * Update allergen
     */
    app.put('/allergen/:id', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await AllergenController.modifyById(req.params.id, req);

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
     * Delete allergen by id
     */
    app.delete('/allergen/:id', AuthMiddleware.isAdmin, async (req, res) => {
        const ret = await AllergenController.deleteById(req.params.id);

        if(ret === -1) {
            res.status(404).json({
                message: "This type does not exist"
            });
        } else if(ret){
            res.status(200).end();
        }
        res.status(500).end();
    });

    /**
     * Characteristic management
     */

    /**
     * Create a characteristic
     */
    app.post('/characteristic', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await CharacteristicController.saveCharacteristic(req);

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
     * Get all characteristics
     */
    app.get('/characteristics', async (req, res) => {
        const characteristics = await CharacteristicController.getCharacteristics();

        if(characteristics){
            if(characteristics.length > 0) {
                const resultCharacteristics = []
                characteristics.forEach(characteristic => resultCharacteristics.push(new CharacteristicnBean(characteristic._id, characteristic.name)))
                res.status(200).json(resultCharacteristics);
            } else {
                res.status(204).end();
            }
        }
        res.status(500).end();
    });

    /**
     * Get characteristic by id
     */
    app.get('/characteristic/:id', async (req, res) => {
        const ret = await CharacteristicController.getCharacteristicById(req.params.id);

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
     * Update characteristic type
     */
    app.put('/characteristic/:id', AuthMiddleware.isAdmin, bodyParser.json(), async (req, res) => {
        const ret = await CharacteristicController.modifyById(req.params.id, req);

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
     * Delete characteristic by id
     */
    app.delete('/characteristic/:id', AuthMiddleware.isAdmin, async (req, res) => {
        const ret = await CharacteristicController.deleteById(req.params.id);

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
