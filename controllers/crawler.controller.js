let FriendsListUserModel = require('../models').FriendsListUser;
let FriendsListUserDao = require('../dao').FriendsListUserDao;
let CoreController = require('./core.controller');
let UserController = require('./user.controller');
let mongoose = require('mongoose');
let cheerio = require('cheerio');
let puppeteer = require('puppeteer');
let fs = require('fs');

class CrawlerController {

    /*static render(list,options = {}){
        const populates = [
            {path:'users'},
            {path:'creator'}
        ];
        return super.render(list, { ...options,populates});
    }*/

    /*// -------------------------
    // Exécute puppeteer sur une page et l'envoie au callback
    // -------------------------
    async static puppeteerRequest(url, callback, data) {


        return (
            // On envoie la page au callback
            callback(page, data)
        );
    }*/

    static async renderDishData(req,res,next) {
        const dishName = req.params.DishName;
        try{
            // On démarre le navigateur
            const browser = await puppeteer.launch(
                { headless: false },
                { devtools: true }
            );
            // On ouvre une page vierge
            const page = await browser.newPage();

            // On défini une durée de timeout
            await page.setDefaultNavigationTimeout(10000);

            // On intercepte et empeche l'utilisation de css pour les evenements de transition et pour accélérer la vitesse de puppeteer
            //await page.setRequestInterception(true);
            /*page.on('request', (req) => {
                if (
                    req.resourceType() === 'stylesheet' ||
                    req.resourceType() === 'font'
                ) {
                    req.abort()
                } else {

                }
            });*/

            // On se rend sur la page
            await page.goto("https://www.marmiton.org/");
            await page.focus('#mrtn-search-input');
            await page.keyboard.type(dishName);
            await page.focus('#mrtn-search-input');
            await page.keyboard.press('Enter');
            await page.waitForNavigation();
            //Nouvelle page
            //const bodyHandle = await page.$('body');

            // 1er Resultat
            await page.$$eval('.recipe-card-link', elements => elements[0].click());
            const bodyHandle = await page;
            await console.log(bodyHandle);
            //const html = await page.evaluate(body => body.innerHTML, bodyHandle);*/
            //await bodyHandle.dispose();
            //await browser.close();
        } catch (e) {
            console.log(e);
        }

        
        /*return page.evaluate(function() => {
            const urls = []
            $('.row .col-lg-4.col-md-6').each((i, elem) => {
                let url = $(elem).find('a').attr('href')

                let price = $(elem)
                    .find('.accommodation-price .font-bold')
                    .text()
                    .replace(/\s/gi, '')
                if (price) price = price.replace('€', '')
                else price = -1

                let surface =
                    $(elem)
                        .find('.hidden-sm-down')
                        .next()
                        .text()
                        .replace('m2', '')
                        .trim() || -1

                let bedrooms = $(elem)
                    .find('.hidden-sm-down')
                    .first()
                    .text()
                    .match(/\d+/gi)
                bedrooms = Array.isArray(bedrooms) ? bedrooms[0] : -1

                let city_name = $(elem)
                    .find('.accommodation-infos .font-bold')
                    .text()
                    .trim()
                    .split(' - ')
                city_name = Array.isArray(city_name) ? city_name[1] : ''

                urls.push({
                    uri: url,
                    ad: {
                        price,
                        surface,
                        bedrooms,
                        city_name,
                    },
                })
            })
            return urls
        });*/



        /*Promise.resolve()
            .then(() => FriendsListUserController.friendsListUserNotExist(req,res,next,id))
            .then(() => {
                FriendsListUserModel
                    .findById(id).populate("users")
                    .select('name users _id')
                    .exec()
                    .then(doc => {
                        if(doc){
                            res.status(200).json({
                                friendsListUser: doc,
                                request: {
                                    type: 'GET',
                                    url: `http://localhost:3000/friendsListUsers`,
                                }
                            });
                        }
                    }).catch(err => {
                    res.status(400).json({
                        message: "Bad request",
                        err,
                    });
                });
            });*/
    };
}

module.exports = CrawlerController;



