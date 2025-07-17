const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
dotenv.config();
require('./config/db');

const authRoute=require('./routes/wm_authRoute');
const roleRoute=require('./routes/wm_roleRoute');
const userRoute=require('./routes/wm_userRoute');
const companyRoute=require('./routes/wm_companyRoute');
const departmentRoute=require('./routes/wm_departmentRoute');
const machineRoute=require('./routes/wm_machineRoute');
const workOrderRoute=require('./routes/wm_workOrderRoute');
const trackingRoute=require('./routes/wm_trackingRoute');
const clientRoute=require('./routes/wm_clientRoute');
const punchInOutRoute=require('./routes/wm_punchInOutRoute');
const mailRoute= require('./routes/mailRoute');
const qrCodeRoute = require('./routes/qrCode');
const employeeQRCodeRoute = require('./routes/employeeQRCodeRoute');
const machineQRCodeRoute = require('./routes/machineQRCodeRoute');

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/wm/auth',authRoute);
app.use('/wm/role',roleRoute);
app.use('/wm/user',userRoute);
app.use('/wm/company',companyRoute);
app.use('/wm/department',departmentRoute);
app.use('/wm/machine',machineRoute);
app.use('/wm/work-order',workOrderRoute);
app.use('/wm/tracking',trackingRoute);
app.use('/wm/client',clientRoute);
app.use('/wm/punch-in-out',punchInOutRoute);
app.use('wm/mail',mailRoute);
app.use('/wm/qr-code',qrCodeRoute);
app.use('/wm/employee-qr-code',employeeQRCodeRoute);
app.use('/wm/machine-qr-code',machineQRCodeRoute);

const PORT= process.env.PORT || 7000;

app.get('/', (req, res, next) => {
    res.send("work monitoring")
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
