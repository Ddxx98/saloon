const cron = require("node-cron");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { Op } = require("sequelize");
require("dotenv").config();

const Appointment = require("../models/appointment");
const User = require("../models/user");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const sendAppointmentReminders = async (reminderType) => {
    try {
        const now = new Date();
        let startDate, endDate, startTime, endTime;

        if (reminderType === "24hr") {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0, 0);
        } else if (reminderType === "1hr") {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0, 0);
            startTime = `${now.getHours()}:${now.getMinutes()}:00`;
            endTime = `${now.getHours()+1}:${now.getMinutes()}:00`;
        }

        const whereClause = reminderType === "24hr"
            ? { date: { [Op.gte]: startDate, [Op.lte]: endDate } }
            : {
                [Op.and]: [
                    { date: { [Op.gte]: startDate, [Op.lte]: endDate } },
                    { time: { [Op.gte]: startTime, [Op.lte]: endTime } }
                ]
            };

        const appointments = await Appointment.findAll({ where: whereClause });
        console.log(appointments);

        for (const appointment of appointments) {
            console.log(appointment);
            const user = await User.findByPk(appointment.userId);

            if (user) {
                const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
                sendSmtpEmail.subject = "Upcoming Appointment Reminder";
                sendSmtpEmail.sender = { email: "deexith2016@gmail.com", name: "Salon" };
                sendSmtpEmail.to = [{ email: user.email }];
                sendSmtpEmail.htmlContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Appointment Reminder</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 0;
                            }

                            .email-container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #fff;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                border-radius: 8px;
                            }

                            .header {
                                background: #ff5f6d;
                                color: white;
                                text-align: center;
                                padding: 20px;
                                border-radius: 8px 8px 0 0;
                            }

                            .header h1 {
                                margin: 0;
                                font-size: 24px;
                            }

                            .content {
                                padding: 20px;
                                font-size: 16px;
                                line-height: 1.6;
                            }

                            .appointment-details {
                                background: #fafafa;
                                padding: 15px;
                                border-radius: 8px;
                                box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
                                margin-bottom: 20px;
                            }

                            .appointment-details h3 {
                                color: #ff5f6d;
                                margin-bottom: 10px;
                            }

                            .footer {
                                text-align: center;
                                padding: 20px;
                                background-color: #f4f4f4;
                                font-size: 14px;
                                color: #666;
                            }

                            .footer p {
                                margin: 0;
                            }

                            .cta-button {
                                display: inline-block;
                                background-color: #ff5f6d;
                                color: white;
                                padding: 10px 20px;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                            }

                            .cta-button:hover {
                                background-color: #ff3b4f;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">
                                <h1>Appointment Reminder</h1>
                            </div>
                            <div class="content">
                                <p>Hi <strong>${user.name}</strong>,</p>
                                <p>This is a friendly reminder about your upcoming appointment at our salon.</p>
                                <div class="appointment-details">
                                    <h3>Appointment Details</h3>
                                    <p><strong>Service:</strong> ${appointment.serviceName}</p>
                                    <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> ${appointment.time}</p>
                                </div>
                                <p>If you need to reschedule or have any questions, please feel free to contact us.</p>
                                <p>We look forward to serving you!</p>
                                <a href="tel:+123456789" class="cta-button">Contact Us</a>
                            </div>
                            <div class="footer">
                                <p>Thank you for choosing our salon!</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
                const response = await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(sendSmtpEmail);
                console.log(response);
            }
        }
    } catch (error) {
        console.error("Error sending appointment reminders:", error);
    }
};


module.exports = () => {
    cron.schedule("0 * * * *", () => {
        console.log("Running 24-hour reminder scheduler...");
        sendAppointmentReminders("24hr");
    });

    cron.schedule("*/30 * * * *", () => {
        console.log("Running 1-hour reminder scheduler...");
        sendAppointmentReminders("1hr");
    });

    console.log("Reminder schedulers initialized.");
};