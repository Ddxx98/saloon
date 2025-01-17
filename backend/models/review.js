const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Review = sequelize.define('review', {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    staffId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    serviceId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    comment: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Review;