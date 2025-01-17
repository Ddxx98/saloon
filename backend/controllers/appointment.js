const Appointment = require('../models/appointment');

exports.createAppointment = async (req, res) => {
    const userId = req.user.id;
    const customer = req.user.name;
    const { staffId, serviceId, date, time, status, service } = req.body;
    try {
        const appointment = await Appointment.create({ userId, customer, staffId, serviceId, serviceName: service, date, status, time });
        res.status(201).json({ message: "Appointment created", appointmentId: appointment.id });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({});
        res.status(200).json({ message: "Appointments fetched", appointments: appointments });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAppointmentsByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const appointments = await Appointment.findAll({ where: { userId: userId } });
        res.status(200).json({ message: "Appointments fetched", appointments: appointments });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAppointmentsByStaffId = async (req, res) => {
    const staffId = req.params.staffId;
    try {
        const appointments = await Appointment.findAll({ where: { staffId: staffId } });
        res.status(200).json({ message: "Appointments fetched", appointments: appointments });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};