const TypeRestaurantDAO = require('../dao').TypeRestaurantDAO;
const TypeBean = require('../beans/type.bean');

class TypeRestaurantController {

    /**
     * Save the restaurant type
     * @param req
     * @returns {Promise<void>}
     */
    static async saveType(req){
        const isExist = await TypeRestaurantDAO.getByName(req.body.name);

        if (isExist) {
            return -2; //conflict
        }
        let type = await this.buildType(req);

        if(type){
            type = await TypeRestaurantDAO.saveTypeRestaurant(type);
            return type;
        } else {
            return -1; //Bad request
        }
    }

    /**
     * Get all restaurants
     * @returns {Promise<undefined|*>}
     */
    static async getTypes(){
        const allTypes = await TypeRestaurantDAO.getAll();

        if(allTypes){
            return TypeRestaurantController.manageTypes(allTypes);
        }
        return undefined;
    }

    static manageTypes(types){
        const result = []
        types.forEach(t => result.push(new TypeBean(t._id, t.name)))
        return result;
    }

    /**
     * Get type by id
     * @param id
     * @returns {Promise<undefined>}
     */
    static async getTypeById(id){
        const type = await TypeRestaurantDAO.getById(id);

        if(type){
            return type;
        } else {
            return -1;
        }
    }

    /**
     *
     * @param id
     * @param req
     * @returns {Promise<number|*>}
     */
    static async modifyById(id, req){
        const isExist = await TypeRestaurantDAO.getByName(req.body.name);

        if (isExist) {
            return -3; //conflict
        }

        let modifiedType = await this.buildType(req);

        if(modifiedType){
            modifiedType = await TypeRestaurantDAO.modifyById(id, modifiedType);
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
     * Delete restaurant if exist
     * @param id
     * @returns {Promise<number|*>}
     */
    static async deleteById(id){
        const restaurant = await TypeRestaurantDAO.getById(id);

        if(restaurant) {
            return await TypeRestaurantDAO.deleteById(id);
        } else {
            return -1; //404 not found
        }
    }

    /**
     * Build the restaurant type
     * @param req
     * @returns {Promise<{name: *}|boolean>}
     */
    static async buildType(req){
        if (req.body.name) {
            return { name: req.body.name };
        } else {
            return false;
        }
    }

}

module.exports = TypeRestaurantController;
