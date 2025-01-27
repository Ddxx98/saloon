const Review = require("../models/review");
const Appointment = require("../models/appointment");

module.exports.createReview = async (req, res) => {
    const userId = req.user.id;
    const { staffId, appointmentId, rating, review } = req.body;
    try {
        const response = await Review.create({ userId, staffId, appointmentId, rating, review });
        const appointment = await Appointment.findByPk(appointmentId);
        await Appointment.update({ review: true }, { where: { id: appointmentId } });
        res.status(201).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.getAllReviews = async (req, res) => {
    try {
        const rev = await Review.findAll({});
        res.status(200).json(rev);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};