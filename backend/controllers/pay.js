const razorpay = require('razorpay');
require('dotenv').config();

const Order = require('../models/order');
const Services = require('../models/services');

const instance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createPayment = async (req, res) => {
    const { service, staffId, serviceId, date, time } = req.body;
    const userId = req.user.id;
    try {
        const serviceDetails = await Services.findOne({ where: { id: serviceId } });
        if (!serviceDetails) {
            return res.status(404).json({ message: "Service not found" });
        }
        const amount = serviceDetails.price;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {}
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Payment failed" });
            }
            const newOrder = Order.create({ userId: userId, orderId: order.id, status: "pending", amount: amount, serviceName: service, staffId: staffId, serviceId: serviceId, date: date, time: time });
            return res.status(200).json({ message: "Payment successful", order });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updatePayment = async (req, res) => {
    const { paymentId, orderId } = req.body;
    try {
        const order = await Order.findOne({ where: { orderId: orderId } });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const response = await instance.payments.fetch(paymentId);
        if (response.status === "captured") {
            order.status = "Success";
            await order.save();
        }
        return res.status(200).json({ message: "Payment updated", order });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};