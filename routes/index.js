const authRoutes = require('./auth.routes');
const restaurantRoutes = require('./restaurant.routes');
const userRoutes = require('./user.routes');
const ticketRoutes = require('./ticket.routes');
const allergCharac = require('./allerg.charac.routes');
const situation = require('./situation.routes');
const crawlerRoutes = require('./crawler.routes');

module.exports = function (app) {
    crawlerRoutes(app);
    authRoutes(app);
    restaurantRoutes(app);
    userRoutes(app);
    ticketRoutes(app);
    allergCharac(app);
    situation(app);
};
