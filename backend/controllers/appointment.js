const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();
const { Op, Sequelize } = require("sequelize");

const Appointment = require('../models/appointment');
const User = require('../models/user');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

exports.createAppointment = async (req, res) => {
    const userId = req.user.id;
    const customer = req.user.name;
    const now = new Date();
    const { staffId, serviceId, date, time, status, service, duration } = req.body;
    const endTime = Number(time.split(":")[0]) + 2 + ":" + time.split(":")[1];
    console.log(endTime);
    try {
        const check = await Appointment.findOne({where:{staffId:staffId, date:date, time:{[Op.between]: [time, endTime]}}});
        if(check){
            return res.status(400).json({ message: "Appointment already exists" });
        }
        const appointment = await Appointment.create({ userId, customer, staffId, serviceId, serviceName: service, date, status, time, duration });
        const user  = await User.findByPk(userId);
        await SendSmtpEmail(appointment,user)
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

async function SendSmtpEmail(appointment, user) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: user.email }];
    sendSmtpEmail.sender = { email: "deexith2016@gmail.com", name: "Salon" };
    sendSmtpEmail.subject = "Your Appointment is Confirmed!";

    sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background: linear-gradient(90deg, #ff5f6d, #ffc371);
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-header h1 {
                margin: 0;
                font-size: 24px;
            }
            .email-body {
                padding: 20px;
                font-size: 16px;
                line-height: 1.6;
            }
            .email-body p {
                margin: 10px 0;
            }
            .appointment-details {
                margin: 20px 0;
                background: #f9f9f9;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 15px;
            }
            .appointment-details h3 {
                margin: 0 0 10px;
                color: #ff5f6d;
            }
            .appointment-details p {
                margin: 5px 0;
            }
            .email-footer {
                text-align: center;
                padding: 15px;
                background: #f4f4f4;
                font-size: 14px;
                color: #666;
            }
            .btn {
                display: inline-block;
                background: #ff5f6d;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                margin-top: 15px;
            }
            .btn:hover {
                background: #e2545d;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header Section -->
            <div class="email-header">
                <h1>Appointment Confirmed!</h1>
            </div>

            <!-- Email Body -->
            <div class="email-body">
                <p>Dear <strong>${user.name}</strong>,</p>
                <p>Thank you for booking an appointment with us. We are excited to serve you!</p>

                <!-- Appointment Details Section -->
                <div class="appointment-details">
                    <h3>Appointment Details</h3>
                    <p><strong>Date:</strong> ${appointment.date}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Service:</strong> ${appointment.serviceName || "Not specified"}</p>
                </div>

                <p>If you need to reschedule or have any questions, feel free to contact us.</p>

                <!-- Call-to-Action Button -->
                <a href="https://your-salon-website.com/contact" class="btn">Contact Us</a>
            </div>

            <!-- Footer Section -->
            <div class="email-footer">
                <p>Thank you for choosing <strong>Salon</strong>. We look forward to seeing you!</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(sendSmtpEmail);
        console.log("Appointment confirmation email sent successfully:", response);
    } catch (error) {
        console.error("Failed to send appointment confirmation email:", error);
    }
}

module.exports.updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { date, time, duration, status } = req.body;
    try {
        const response = await Appointment.update({ date, time, duration, status }, { where: { id } });
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.deleteAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await Appointment.destroy({ where: { id } });
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};