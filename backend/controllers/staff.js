const Staff = require('../models/staff');

exports.createStaff = async (req, res, next) => {
    const userId = req.user.id;
    const name = req.user.name;
    const specialization = req.body.specialization;
    const status = "available";
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;
    try{
        const staff = await Staff.create({ name: name, status: status, userId: userId, specialization: specialization, start_time: start_time, end_time: end_time });
        res.status(201).json({ message: "Staff created", staffId: staff.id });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.updateStaff = async (req, res, next) => {
    const staffId = req.body.staffId;
    const specialization = req.body.specialization;
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;
    try{
        const staff = await Staff.update({ specialization: specialization, start_time: start_time, end_time: end_time }, { where: { id: staffId } });
        res.status(200).json({ message: "Staff updated" });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getStaffs = async (req, res, next) => {
    const userId = req.user.id;
    try{
        const staffs = await Staff.findAll({ where: { userId: userId } });
        res.status(200).json({ message: "Staffs fetched", staffs: staffs });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllStaffs = async (req, res, next) => {
    try{
        const staffs = await Staff.findAll();
        res.status(200).json({ message: "Staffs fetched", staffs: staffs });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}