export class historicRestaurant {
    restaurant_id;
    restaurants;
    name;

    constructor(restaurant_id,restaurant,date_historical) {
        this.restaurant_id = restaurant_id;
        this.restaurant = restaurant;
        this.date_historical = date_historical;
    }
}
