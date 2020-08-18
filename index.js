'use strict';
require('dotenv').config();
const express = require('express');
const routes = require('./routes');
var cors = require('cors');
const initDbConnection = require('./dao/connection-manager');
const app = express();
//enables cors
app.use(cors());
initDbConnection();
routes(app);

const API_PORT =  process.env.PORT || process.env.API_PORT;
app.listen(API_PORT, () => console.log(`TaxiArtisan-API Started on port ${API_PORT}...`));
