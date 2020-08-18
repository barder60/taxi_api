class RestaurantListBean{
    id;
    restaurants;
    name;

    constructor(restaurants, id, name) {
        this.restaurants = restaurants;
        this.name = name;
        this.id = id;
    }

}
module.exports = RestaurantListBean;
