class historicBean{
    users;
    restaurants;
    date_historical;

    constructor(restaurants,date_historical) {
        this.users = [];
        this.restaurants = restaurants;
        this.date_historical = date_historical;
    }

}
module.exports = historicBean;
