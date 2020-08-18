const CharacteristicDAO = require('../dao').CharacteristicDAO;

class CharacteristicController {

    /**
     * Save the characteristic
     * @param req
     * @returns {Promise<void>}
     */
    static async saveCharacteristic(req){
        const isExist = await CharacteristicDAO.getByName(req.body.name);

        if (isExist) {
            return -2; //conflict
        }
        let charac = await this.buildCharacteristic(req);

        if(charac){
            charac = await CharacteristicDAO.saveCharac(charac);
            return charac;
        } else {
            return -1; //Bad request
        }
    }

    /**
     * Get all characteristics
     * @returns {Promise<undefined|*>}
     */
    static async getCharacteristics(){
        const allCharac = await CharacteristicDAO.getAll();

        if(allCharac){
            return allCharac;
        }
        return undefined;
    }

    /**
     * Get characteristics by id
     * @param id
     * @returns {Promise<undefined>}
     */
    static async getCharacteristicById(id){
        const charac = await CharacteristicDAO.getById(id);

        if(charac){
            return charac;
        } else {
            return -1;
        }
    }

    /**
     * Modify by id
     * @param id
     * @param req
     * @returns {Promise<number|*>}
     */
    static async modifyById(id, req){
        const isExist = await CharacteristicDAO.getByName(req.body.name);

        if (isExist) {
            return -3; //conflict
        }

        let modifiedCharac = await this.buildCharacteristic(req);

        if(modifiedCharac){
            modifiedCharac = await CharacteristicDAO.modifyById(id, modifiedCharac);
            if(modifiedCharac){
                return modifiedCharac;
            } else {
                return -2;  //Not found
            }
        } else {
            return -1; //Bad request
        }
    }

    /**
     * Delete characteristic if exist
     * @param id
     * @returns {Promise<number|*>}
     */
    static async deleteById(id){
        const charac = await CharacteristicDAO.getById(id);

        if(charac) {
            return await CharacteristicDAO.deleteById(id);
        } else {
            return -1; //404 not found
        }
    }

    /**
     * Build the characteristic
     * @param req
     * @returns {Promise<{name: *}|boolean>}
     */
    static async buildCharacteristic(req){
        if (req.body.name) {
            return { name: req.body.name };
        } else {
            return false;
        }
    }
}

module.exports = CharacteristicController;
