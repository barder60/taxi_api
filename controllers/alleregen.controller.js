const AllergenDAO = require('../dao').AllergenDAO;

class AllergenController {

    /**
     * Save the allergen
     * @param req
     * @returns {Promise<void>}
     */
    static async saveAllergen(req){
        const isExist = await AllergenDAO.getByName(req.body.name);

        if (isExist) {
            return -2; //conflict
        }
        let allerg = await this.buildAllergen(req);

        if(allerg){
            allerg = await AllergenDAO.saveAllergen(allerg);
            return allerg;
        } else {
            return -1; //Bad request
        }
    }

    /**
     * Get all allergens
     * @returns {Promise<undefined|*>}
     */
    static async getAllergens(){
        const allAllergens = await AllergenDAO.getAll();

        if(allAllergens){
            return allAllergens;
        }
        return undefined;
    }

    /**
     * Get allergen by id
     * @param id
     * @returns {Promise<undefined>}
     */
    static async getAllergenById(id){
        const allerg = await AllergenDAO.getById(id);

        if(allerg){
            return allerg;
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
        const isExist = await AllergenDAO.getByName(req.body.name);


        if (isExist) {
            return -3; //conflict
        }

        let modifiedType = await this.buildAllergen(req);

        if(modifiedType){
            modifiedType = await AllergenDAO.modifyById(id, modifiedType);
            if(modifiedType){
                return modifiedType;
            } else {
                return -2;  //Not found
            }
        } else {
            return -1; //Bad request
        }

    }

    /**
     * Delete allergen if exist
     * @param id
     * @returns {Promise<number|*>}
     */
    static async deleteById(id){
        const allerg = await AllergenDAO.getById(id);

        if(allerg) {
            const isDeleted = await AllergenDAO.deleteById(id);
            return isDeleted
        } else {
            return -1; //404 not found
        }
    }

    /**
     * Build the allergen
     * @param req
     * @returns {Promise<{name: *}|boolean>}
     */
    static async buildAllergen(req){
        if (req.body.name) {
            const type = { name: req.body.name };
            return type;
        } else {
            return false;
        }
    }
}

module.exports = AllergenController;
