const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order', {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    staffId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    orderId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    serviceId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    serviceName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    time: {
        type: Sequelize.TIME,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Order;