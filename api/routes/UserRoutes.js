const express = require("express");
const route = express.Router();
var userDB = require("../model/user");
const validate = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const JWT = require("../Utilities/JWT_Auth");

//register
route.post("/register", async(req, res) => {
    let user;
    console.log("insdie create", req.body);
    if (!req.body) {
        res.send({ status: 400, message: "content is empty. cannot be empty" });
        return;
    }
    //validate data
    const checked = validate.checkRegister(req.body);
    if (checked != true)
        return res.send({ status: 400, message: checked[0].message });

    //already exist?
    try {
        const emailExists = await userDB.findOne({ email: req.body.email });
        if (emailExists)
            return res.send({ status: 400, message: "user already exists" });
    } catch (err) {
        res.status(400).send(err.message || "some error while sending to db");
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    user = new userDB({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
    });

    //save user to db

    user
        .save(user)
        .then(async(data) => {
            const token = jwt.sign({ _id: data._id }, process.env.TOKEN_SECRET);
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "usingfornodemailer@gmail.com",
                    pass: "nodemailer@1",
                },
            });
            let mailOptions = {
                from: "usingfornodemailer@gmail.com", // sender address
                to: data.email, // list of receivers
                subject: "Password reset", // Subject line
                text: `Click to verify- 
                    ${process.env.HOST}/verifyUser/${token}`, // plain text body
                html: `<a href="${process.env.HOST}/verifyUser/${token}" >Click here to verify</a>`, // html body
            };
            await transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    res.status(500).send({ status: 500, message: err });
                } else {
                    res.send({
                        status: 200,
                        message: "verification link send to mail ",
                    });
                }
            });
        })
        .catch((err) => {
            res.status(500).send(err.message || "some error while sending to db");
        });
});

//login
route.post("/login", async(req, res) => {
    //validate data
    console.log(req.body);
    const checked = validate.checkLogin(req.body);
    if (checked != true)
        return res.send({
            status: 400,
            message: "Invalid input/too long/too short",
        });

    //already exist?
    const user = await userDB.findOne({ email: req.body.email });
    if (!user)
        return res.send({ status: 400, message: "No such email/password" });

    //has the password
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
        return res.send({ status: 400, message: "No such email/password" });

    //create and give tokenes
    const token = JWT.GenerateJWT({
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
    });

    try {
        if (user.verified) {
            if (user.approved) {
                res.send({ status: 200, user: user, token: token });
            } else {
                res.send({ status: 200, user: user });
            }
        } else {
            res.send({
                status: 400,
                message: "user is not verified. check email to verify",
            });
        }
    } catch (err) {
        res.send({ status: 400, message: err });
    }
});

//to get all users
route.get("/all_users", (req, res) => {
    token = req.headers.token;
    if (token) {
        const requestingUser = JWT.getUserData(token);
        if (requestingUser.isAdmin) {
            userDB
                .find()
                .then((user) => {
                    let users = [];
                    user.forEach((element) => {
                        if (element.verified) {
                            users.push(element);
                        }
                    });
                    console.log(users);
                    res.send(users);
                })
                .catch((err) => {
                    res.status(500).send({
                        message: err.message || "some error while getting from db",
                    });
                });
        } else {
            res.send({ status: 400, message: "Classified action. Not admin" });
        }
    } else {
        res.send({ status: 400, message: "no token" });
    }
});

//to get one user
route.get("/single_user", (req, res) => {
    const token = req.headers.token;
    if (token) {
        const requestingUser = JWT.getUserData(token);
        const id = requestingUser._id;
        userDB
            .findById(id)
            .then((data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    res.send(data);
                }
            })
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: err + "err retrieving user with id" + id });
            });
    } else {
        res.send({ status: 400, message: "no token" });
    }
});

//delete
route.delete("/:id", (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            message: "Data to delete can not be empty",
        });
    }
    const token = req.headers.token;
    const id = req.params.id;
    const requestingUser = JWT.getUserData(token);

    if (requestingUser.isAdmin) {
        userDB
            .findById(id)
            .then((data) => {
                if (!data) {
                    res.send({
                        status: 400,
                        message: "didnt find the user with id" + id,
                    });
                } else {
                    if (!data.isAdmin) {
                        //update user
                        userDB
                            .findByIdAndDelete(id)
                            .then((data) => {
                                if (!data) {
                                    res.send({
                                        status: 400,
                                        message: `cannot delete with ${id}.maybe not found`,
                                    });
                                } else {
                                    res.send({
                                        status: 200,
                                        message: "deleted succesfully",
                                    });
                                }
                            })
                            .catch((err) => {
                                res.status(500).send({ message: "error in deleting" });
                            });
                    } else {
                        res.send({ status: 400, message: "cannot delete a admin" });
                    }
                }
            })
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: err + "err retrieving user with id" + id });
            });
    } else {
        res.send({ status: 400, message: "Classified action. Not admin" });
    }
});

//update role
route.put("/updateRole/:id", (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Data to update can not be empty" });
    }

    const token = req.headers.token;
    const id = req.params.id;
    const requestingUser = JWT.getUserData(token);

    if (requestingUser.isAdmin) {
        userDB
            .findById(id)
            .then((data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    if (!data.isAdmin) {
                        //update user
                        userDB
                            .findByIdAndUpdate(id, req.body, {
                                useFindAndModify: false,
                            })
                            .then((data) => {
                                if (!data) {
                                    res.status(400).send({
                                        message: `cannot update with ${id}.maybe not found`,
                                    });
                                } else {
                                    res.send({ message: "Made admin" });
                                }
                            })
                            .catch((err) => {
                                res.status(500).send({ message: "error in updating" });
                            });
                    } else {
                        res.send({ message: "an admin cannot be made into user" });
                    }
                }
            })
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: err + "err retrieving user with id" + id });
            });
    } else {
        res.send({ status: 400, message: "invalid token" });
    }
});

//update user
route.put("/update/:id", (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Data to update can not be empty" });
    }
    const token = req.headers.token;
    const id = req.params.id;

    const requestingUser = JWT.getUserData(token);
    if (requestingUser.isAdmin) {
        userDB
            .findByIdAndUpdate(id, req.body, { useFindAndModify: false })
            .then((data) => {
                if (!data) {
                    res.status(400).send({
                        message: `cannot update with ${id}.maybe not found`,
                    });
                } else {
                    res.send({ message: "User approved" });
                }
            })
            .catch((err) => {
                res.status(500).send({ message: "error in updating" });
            });
    } else {
        res.send({ status: 400, message: "invalid token" });
    }
});

//forgot password mail
route.put("/forgotPassword/:email", async(req, res) => {
    if (req.params.email) {
        const User = await userDB.findOne({ email: req.params.email });
        if (User) {
            const token = jwt.sign({ _id: User._id }, process.env.TOKEN_SECRET);
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "usingfornodemailer@gmail.com",
                    pass: "nodemailer@1",
                },
            });
            let mailOptions = {
                from: "usingfornodemailer@gmail.com", // sender address
                to: req.params.email, // list of receivers
                subject: "Password reset", // Subject line
                html: `<a href="${process.env.HOST}/resetPassword/${token}" >Click here to reset password</a>`, // html body
            };
            await transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    res.send({ status: 500, message: err });
                } else {
                    res.send({
                        status: 200,
                        message: "password reset link send to mail ",
                    });
                }
            });
        } else {
            res.send({ status: 400, message: "no such email in database" });
        }
    } else {
        res.send({ status: 400, message: "no email in url" });
    }
});

//mail password reset link
route.get("/mailResetPassword", async(req, res) => {
    const token = req.headers.token;

    if (token) {
        const id = JWT.getUserData(token)._id;

        //finding mail that has same id as user
        userDB
            .findById(id)
            .then(async(data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    console.log("data given by findbyid in .eresest password", data);
                    let transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "usingfornodemailer@gmail.com",
                            pass: "nodemailer@1",
                        },
                    });
                    let mailOptions = {
                        from: "usingfornodemailer@gmail.com", // sender address
                        to: data.email, // list of receivers
                        subject: "Password reset", // Subject line
                        text: `Click the link below to reset password or copy this link- 
                        ${process.env.HOST}/resetPassword/${token}`, // plain text body
                        html: `<a href="${process.env.HOST}/resetPassword/${token}" >Click here to reset password</a>`, // html body
                    };
                    await transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            res.send({ status: 500, message: err });
                        } else {
                            res.send({
                                status: 200,
                                message: "reset link send to mail " + info.response,
                            });
                        }
                    });
                }
            })
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: err + "err retrieving user with id" + id });
            });
    } else {
        res.send({ status: 400, message: "no token" });
    }
});

// password reset to database
route.put("/changePassword", async(req, res) => {
    const token = req.headers.token;

    if (token) {
        const id = JWT.getUserData(token)._id;
        userDB
            .findById(id)
            .then(async(data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(req.body.password, salt);
                    let user = data;
                    user.password = hashPassword;
                    userDB
                        .findByIdAndUpdate(id, user, { useFindAndModify: false })
                        .then((data) => {
                            if (!data) {
                                res.status(400).send({
                                    message: `cannot update with ${id}.maybe not found`,
                                });
                            } else {
                                res.send({ message: "Password changed" }); //final message if everything works
                            }
                        })
                        .catch((err) => {
                            res.status(500).send({ message: "error in updating" });
                        });
                }
            })
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: err + "err retrieving user with id" + id });
            });
    } else {
        res.send({ status: 400, message: "no token" });
    }
});

//verify user (link send to mail(to be clicked))
route.put("/verifyUser/:token", async(req, res) => {
    const token = req.params.token;

    if (token) {
        const id = JWT.getUserData(token)._id;
        userDB
            .findById(id)
            .then(async(data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    let user = data;
                    user.verified = true;
                    userDB
                        .findByIdAndUpdate(id, user, { useFindAndModify: false })
                        .then((data) => {
                            if (!data) {
                                res.status(400).send({
                                    message: `cannot update with ${id}.maybe not found`,
                                });
                            } else {
                                res.send({ message: "User verified. You can login now" }); //final message if everything works
                            }
                        })
                        .catch((err) => {
                            res.status(500).send({ message: "error in updating" });
                        });
                }
            })
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: err + "err retrieving user with id" + id });
            });
    } else {
        res.send({ status: 400, message: "no token" });
    }
});

//upload users
route.post("/uploadUsers", async(req, res) => {
    let users = req.body.users_data;
    users.forEach(async(item, index, array) => {
        let user = item;
        const email = user.cust_email;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(randomstring.generate(), salt);
        user.password = hashPassword;
        user.email = email;
        user.name = user.cust_keyman;
        user.verified = true;
        user.approved = true;

        user = new userDB(user);

        //save user to db

        user
            .save(user)
            .then(async(data) => {
                console.log("saved user =", data);
                let transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "usingfornodemailer@gmail.com",
                        pass: "nodemailer@1",
                    },
                });
                let mailOptions = {
                    from: "usingfornodemailer@gmail.com", // sender address
                    to: email, // list of receivers
                    subject: "Account created", // Subject line

                    html: `<p >your account was created. ur password is ${hashPassword}. ur email is this email</p>`, // html body
                };
                await transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
            })
            .catch((err) => {
                console.log(err);
                return;
            });
    });
    res.send({ message: "received data" });
});

module.exports = route;