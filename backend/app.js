const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const http = require('http')
require('dotenv').config()

const sequelize = require('./util/database')
const signupRoutes = require('./routes/signup')
const loginRoutes = require('./routes/login')
const appointmentRoutes = require('./routes/appointment')
const serviceRoutes = require('./routes/service')
const staffRoutes = require('./routes/staff')
const payRoutes = require('./routes/pay')
const reviewRoutes = require('./routes/review')
const cron = require('./controllers/cron')

const User = require('./models/user')
const Staff = require('./models/staff')
const Services = require('./models/services')
const Appointment = require('./models/appointment')
const Review = require('./models/review')

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);

app.get("/",(req, res) => {
   res.send("Hello World")
});

app.use('/signup', signupRoutes)
app.use('/login', loginRoutes)
app.use('/appointments', appointmentRoutes)
app.use('/service', serviceRoutes)
app.use('/staff', staffRoutes)
app.use('/pay', payRoutes)
app.use('/review', reviewRoutes)

cron();

User.hasMany(Appointment, { foreignKey: "userId" });
Appointment.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Review);
Review.belongsTo(User);

Staff.hasMany(Appointment);
Appointment.belongsTo(Staff);

Staff.hasMany(Services)
Services.belongsTo(Staff);

Services.hasMany(Appointment);
Appointment.belongsTo(Services);

Services.hasMany(Review);
Review.belongsTo(Services);

sequelize.sync()
    .then(result => {
        server.listen(process.env.PORT || 3000, () => {
            console.log("Server running in 3000")
        });
    })
    .catch(err => {
        console.log(err);
    });