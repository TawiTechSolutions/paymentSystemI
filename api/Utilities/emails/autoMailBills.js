const nodemailer = require("nodemailer");
const userDB = require("../../model/user");
const billDB = require("../../model/bill");
const mailHelper = require("./emailHelper");
const CronJob = require("cron").CronJob;

const checkDate = (date, r1, r2) => {
    let email_date0 = new Date(date);
    let email_date1 = new Date(date);
    let email_date2 = new Date(date);
    email_date1.setDate(email_date0.getDate() + r1);
    email_date2.setDate(email_date0.getDate() + r2);
    const email_dates = [
        email_date0.toDateString(),
        email_date1.toDateString(),
        email_date2.toDateString(),
    ];
    let now = new Date();
    if (email_dates.indexOf(now.toDateString()) >= 0) {
        if (email_dates.indexOf(now.toDateString()) > 0) {
            return { overdue: true, date: now };
        }
        return true;
    }
    return false;
};

const mailInvoice = async() => {
    userDB.find().then(async(users) => {
        users.forEach((user) => {
            if (user.bills.length > 0) {
                user.bills.forEach(async(bill_id) => {
                    let bill = await billDB.findById(bill_id);
                    if (bill) {
                        const time_string = bill.invoice_detials.email_time;
                        const hour = time_string.slice(0, 2);
                        const minutes = time_string.slice(2);
                        if (
                            checkDate(
                                new Date(bill.invoice_detials.due_date).toDateString(),
                                bill.invoice_detials.reminder_1,
                                bill.invoice_detials.reminder_2
                            ).overdue
                        ) {
                            //overdue
                            //make date
                            const job = new CronJob(
                                `${minutes} ${hour} * * *`,
                                mailHelper.sendPaymentReminder({
                                        ...JSON.parse(JSON.stringify(user)),
                                        ...JSON.parse(JSON.stringify(bill.invoice_detials)),
                                    },
                                    bill.bill_url
                                ), {
                                    scheduled: false,
                                    timezone: "Asia/Mumbai",
                                }
                            );
                            job.start();
                        }
                        if (
                            checkDate(
                                new Date(bill.invoice_detials.email_dt).toDateString(),
                                0,
                                0
                            )
                        ) {
                            //invoice normal

                            const job = new CronJob(
                                `${minutes} ${hour} * * *`,
                                mailHelper.sendInvoice({
                                        ...JSON.parse(JSON.stringify(user)),
                                        ...JSON.parse(JSON.stringify(bill.invoice_detials)),
                                    },
                                    bill.bill_url
                                ), {
                                    scheduled: false,
                                    timezone: "Asia/Mumbai",
                                }
                            );
                            job.start();
                        }
                    }
                });
            }
        });
    });
};

module.exports = { mailInvoice };