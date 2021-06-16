const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const connectDB = require("./database/connection");
const UserRoutes = require("./routes/UserRoutes");

const JWT = require("./Utilities/JWT_Auth");

const app = express();
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

app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.UNDER_DEVELOPMENT === true ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.status(500).send({ message: "error" });
});

//use verification
app.use("/", JWT.JWTAuthMiddleware);

//load router
app.use("/users", UserRoutes);

app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
});