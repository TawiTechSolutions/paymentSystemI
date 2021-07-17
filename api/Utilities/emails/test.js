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
            return { overdue: true };
        }
        return true;
    }
    return false;
};

console.log(
    checkDate("Sat Jul 14 2021 01:19:25 GMT+0530 (India Standard Time)", 99, 9)
    .overdue ?
    true :
    false
);