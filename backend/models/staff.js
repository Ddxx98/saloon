const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Staff = sequelize.define('staff', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: true
    },
    specialization: {
        type: Sequelize.STRING,
        allowNull: true
    },
    start_time: {
        type: Sequelize.STRING,
        allowNull: true
    },
    end_time: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Staff;