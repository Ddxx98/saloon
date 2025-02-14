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
    appointmentId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    review: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Review;