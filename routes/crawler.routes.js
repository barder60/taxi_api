const bodyParser = require('body-parser');
const CrawlerController = require('../controllers').CrawlerController;

module.exports = function(app) {

    app.get('/crawler/:DishName', CrawlerController.renderDishData);

};
