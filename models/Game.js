const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const Game = new Schema({
    word :{type: String},
    characters: {type: Array},
    users: {type: Array},
    isSpin: {type: Number},
    turnNum: {type: Number},
    date: { type: Date, default: Date.now }
},{
    timestamps: true,
});

module.exports = mongoose.model('Game', Game);