var userDB = require("../model/model");
const validate = require("../../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const checkIfAdmin = (id, res) => {
    if (id) {
        userDB
            .findById(id)
            .then((data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    if (data.isAdmin) {
                        //code here that only amdin can do
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
};
// creating and saving user
exports.register = async(req, res) => {
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
                    http://localhost:3000/verifyUser/${token}`, // plain text body
                html: `<a href="http://localhost:3000/verifyUser/${token}" >Click here to verify</a>`, // html body
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
};

//login
exports.login = async(req, res) => {
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
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.setHeader("auth-token", token);

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
};

//find  user
exports.getOne = (req, res) => {
    if (req.params.token) {
        const id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;
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
};

//get all users in db
exports.getAll = (req, res) => {
    if (req.params.token) {
        id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;
        if (id) {
            userDB
                .findById(id)
                .then((data) => {
                    if (!data) {
                        res
                            .status(404)
                            .send({ message: "didnt find the user with id" + id });
                    } else {
                        if (data.isAdmin) {
                            userDB
                                .find()
                                .then((user) => {
                                    console.log(user);
                                    res.send(user);
                                })
                                .catch((err) => {
                                    res.status(500).send({
                                        message: err.message || "some error while getting from db",
                                    });
                                });
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
    } else {
        res.send({ status: 400, message: "no token" });
    }
};

//upadte role
exports.updateRole = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Data to update can not be empty" });
    }
    const admin_id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;
    const id = req.params.id;

    if (admin_id) {
        userDB
            .findById(admin_id)
            .then((data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    if (data.isAdmin) {
                        //code here that only amdin can do
                        userDB
                            .findById(id)
                            .then((data) => {
                                if (!data) {
                                    res
                                        .status(404)
                                        .send({ message: "didnt find the user with id" + id });
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

    //check if admin
};

//update user (doesnt have any coditions)
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Data to update can not be empty" });
    }
    const admin_id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;
    const id = req.params.id;
    if (admin_id) {
        userDB
            .findById(admin_id)
            .then((data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    if (data.isAdmin) {
                        //code here that only amdin can do
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
};

//delete user (cannot delete admin)
exports.delete = (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            message: "Data to delete can not be empty",
        });
    }
    const admin_id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;
    const id = req.params.id;

    if (admin_id) {
        userDB
            .findById(admin_id)
            .then((data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    if (data.isAdmin) {
                        //code here that only amdin can do
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
                                                        message: "deldeted succesfully",
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
};

//deletes admins also
exports.delete_admin_also = (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            message: "Data to delete can not be empty",
        });
    }
    const admin_id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;
    const id = req.params.id;

    if (admin_id) {
        userDB
            .findById(admin_id)
            .then((data) => {
                if (!data) {
                    res.status(404).send({ message: "didnt find the user with id" + id });
                } else {
                    if (data.isAdmin) {
                        //code here that only amdin can do
                        userDB
                            .findByIdAndDelete(id)
                            .then((data) => {
                                if (!data) {
                                    res.send({
                                        status: 400,
                                        message: `cannot delete with ${id}.maybe not found`,
                                    });
                                } else {
                                    res.send({ status: 200, message: "deldeted succesfully" });
                                }
                            })
                            .catch((err) => {
                                res.status(500).send({ message: "error in deleting" });
                            });
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
};

//verify account
exports.verifyAccount = async(req, res) => {
    if (req.params.token) {
        const id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;
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
};

//forgot password mail send
exports.mailForgotPassword = async(req, res) => {
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
                html: `<a href="http://localhost:3000/resetPassword/${token}" >Click here to reset password</a>`, // html body
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
};

//reset password mail send
exports.mailResetPassword = async(req, res) => {
    if (req.params.token) {
        const id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;

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
                            http://localhost:3000/resetPassword/${req.params.token}`, // plain text body
                        html: `<a href="http://localhost:3000/resetPassword/${req.params.token}" >Click here to reset password</a>`, // html body
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
};

//change password in db
exports.changePassword = async(req, res) => {
    if (req.params.token) {
        const id = jwt.verify(req.params.token, process.env.TOKEN_SECRET)._id;
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
};