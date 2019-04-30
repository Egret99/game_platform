const mongoose = require('mongoose');
const { mongoUri } = require('../../config/keys');

mongoose.connect(mongoUri, {useNewUrlParser: true});