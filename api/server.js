const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const connectDB = require("./server/database/connection");

const app = express();
app.use(cors());
dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 8080;

//to log request
app.use(morgan("tiny"));

//connect to mongo
connectDB();

//adding body parser
//app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());

//set view engine
app.set("view engine", "ejs");

//app.set("views", path.resolve(__dirname,"views/ejs"));

app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));

//load router
app.use("/", require("./server/routes/router"));

app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
});