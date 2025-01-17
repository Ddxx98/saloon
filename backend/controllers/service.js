const Services = require('../models/services')
const Staff = require('../models/staff')

exports.createService = async (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const duration = req.body.duration;
    const price = req.body.price;
    const staffId = req.body.staffId
    const status = "moved";
    try{
        const service = await Services.create({ staffId: staffId, name: name, username: username, duration: duration, price: price });
        const staff = await Staff.update({ status: status }, { where: { id: staffId } });
        res.status(201).json({ message: "Service created", serviceId: service.id });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.updateService = async (req, res, next) => {
    const { name, description, duration, price, serviceId} = req.body;
    try{
        const service = await Services.update({ name: name, description: description, duration: duration, price: price }, { where: { id: serviceId } });
        res.status(200).json({ message: "Service updated" });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllServices = async (req, res, next) => {
    try{
        const services = await Services.findAll({});
        res.status(200).json({ message: "Services fetched", services: services });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}