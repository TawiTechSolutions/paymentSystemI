const express = require("express");
const route = express.Router();
const controller = require("../controller/controller");
const verify = require("./verfiyToken");

//api route
route.post("/api/login", controller.login);
route.post("/api/users", controller.register);

//to get all users
route.get("/api/all_users/:token", verify, controller.getAll);
//to get one user
route.get("/api/single_user/:token", verify, controller.getOne);
//delete
route.delete("/api/users/:token/:id", verify, controller.delete);
//update role
route.put("/api/updateRole/:token/:id", verify, controller.updateRole);
//update user
route.put("/api/update/:token/:id", verify, controller.update);

//forgot password mail
route.put("/api/forgotPassword/:email", controller.mailForgotPassword);

//mail password reset link
route.put(
    "/api/mailResetPassword/:token",
    verify,
    controller.mailResetPassword
);

// password reset to database
route.put("/api/changePassword/:token", verify, controller.changePassword);

//verify user
route.put("/api/verifyUser/:token", verify, controller.verifyAccount);

module.exports = route;