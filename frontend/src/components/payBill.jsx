import React from "react";
import Button from "@material-ui/core/Button";
import PaymentIcon from "@material-ui/icons/Payment";

const axios = require("axios");

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

function PayBill({ token, id, bill }) {
  const displayRazorpay = async () => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    axios
      .get(`http://${window.location.host}/payment/razorpay/${id}`, {
        headers: {
          token: token,
        },
      })
      .then((res) => {
        console.log(res.data);

        const user = localStorage.getItem("user");

        let options = {
          //enter key below
          key: res.data.key,
          currency: res.data.currency,
          amount: res.data.amount.toString(),
          order_id: res.data.id,
          name: "Pay Bill",
          description: bill.invoice_detials.desc,
          image: "https://i.ibb.co/7XDR2G9/Koyo-logo.jpg",
          handler: function (response) {
            alert("Payment made successfully. Check mail for receipt");
          },
        };
        if (user) {
          options.prefill = {
            name: user.name,
            email: user.email,
            phone_number: user.cust_ph_num,
          };
        }
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      })
      .catch((err) => {
        window.alert("Some error occured in connecting to RazorPay");
        console.log(err);
      });
  };

  return (
    <Button onClick={displayRazorpay} aria-label="view">
      <PaymentIcon style={{ marginRight: "5px" }} />
      Pay Bill
    </Button>
  );
}

export default PayBill;
