const mongoose = require('mongoose');
const {mongoDbUrl} = require('../configuration');

async function connect() {
    try {
        await mongoose.connect(mongoDbUrl);
        console.log('Connect DB is OK');
    } catch (error) {
        console.log('Connect fail');
    }
}

module.exports = { connect };