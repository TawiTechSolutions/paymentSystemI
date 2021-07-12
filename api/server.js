const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const connectDB = require("./database/connection");
const userRoutes = require("./routes/UserRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const JWT = require("./Utilities/JWT_Auth");
const startAutoMailing = require("./Utilities/autoMailBills");
var CronJob = require("cron").CronJob;
const payementRoutes = require("./routes/paymentRoutes");

const app = express();

//wait for time to mail
var job = new CronJob("0 7 * * * *", startAutoMailing.mailReceipts);
job.start();

app.use(express.static(path.join(__dirname, "build")));

app.use(
    cors({
        credentials: true,
        origin: true,
    })
);
dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 8080;

//to log request
app.use(morgan("tiny"));

//connect to mongo
connectDB();

//adding body parser
app.use(express.json());

//set view engine
app.set("view engine", "ejs");

//app.set("views", path.resolve(__dirname,"views/ejs"));

app.use(
    "/storage",
    express.static(path.resolve(__dirname, "local_temp_storage"))
);
app.use("/public", express.static(path.resolve(__dirname, "public")));

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.UNDER_DEVELOPMENT === true ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.status(500).send({ message: "error" });
});
app.use("*", function(req, res, next) {
    console.log("the request gotten from req", req.baseUrl);
    if (!req.baseUrl.includes("/users/") &&
        !req.baseUrl.includes("/invoices/") &&
        !req.baseUrl.includes("/payment/")
    ) {
        res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
        next();
    }
});
//use verification
app.use("/", JWT.JWTAuthMiddleware);
//load router
app.use("/users", userRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/payment", payementRoutes);

app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
});