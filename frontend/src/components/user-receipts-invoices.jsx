import { BrowserRouter } from "react-router-dom";
import { Typography } from "@material-ui/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import KeyboardBackspaceRoundedIcon from "@material-ui/icons/KeyboardBackspaceRounded";
import InvoicesTable from "./invoices-table";
import UnpaidInvoice from "./unpaid-invoice";

const addCommas = (e) => {
  let l,
    t,
    n = (e = e.toString()).indexOf(".");
  if (
    (n >= 0 ? ((l = e.slice(0, n)), (t = e.slice(n))) : ((l = e), (t = "")),
    l.length > 3)
  ) {
    let e = l.slice(0, l.length - 3) + "," + l.slice(l.length - 3);
    for (let l = 2; e.length - 4 - l > 0; l += 3)
      e = e.slice(0, e.length - 4 - l) + "," + e.slice(e.length - 4 - l);
    return e + t;
  }
  return e;
};

const UserReceiptsInvoices = ({ userID, token, toggleView }) => {
  const [user, setUser] = useState({});
  const [receipts, setReceipts] = useState([]);
  const [bills, setBills] = useState([]);
  const [haveBills, setHavebills] = useState(false);
  const [haveReceipts, setHaveReceipts] = useState(false);
  const [receiptYTD, setReceiptYTD] = useState({});
  const [billYTD, setBillYTD] = useState({});
  const [currenciesBill, setCurrenciesBill] = useState([]);
  const [currenciesReceipt, setCurrenciesReceipt] = useState([]);

  useEffect(() => {
    getReceipts();
    getBills();
    getReceiptsYTD();
    getBillsYTD();
    // eslint-disable-next-line
  }, []);

  const getReceipts = () => {
    axios
      .get(
        userID
          ? `http://${window.location.host}/invoices/userReceipts/${userID}`
          : `http://${window.location.host}/invoices/userReceipts/:id`,
        {
          headers: {
            token: token,
          },
        }
      )
      .then((res) => res.data)
      .then((data) => {
        setUser(data.user);
        setReceipts(data.receipts);
        if (data.haveReceipts) {
          setHaveReceipts(true);
        }
      })
      .catch((err) => {
        window.alert("some error occured check console");
        console.log(err);
      });
  };

  const getBills = () => {
    axios
      .get(
        userID
          ? `http://${window.location.host}/invoices/userBills/${userID}`
          : `http://${window.location.host}/invoices/userBills/:id`,
        {
          headers: {
            token: token,
          },
        }
      )
      .then((res) => res.data)
      .then((data) => {
        setBills(data.bills);
        if (data.haveBills) {
          setHavebills(true);
        }
      })
      .catch((err) => {
        window.alert("some error occured check console");
        console.log(err);
      });
  };
  const getReceiptsYTD = () => {
    axios
      .get(
        userID
          ? `http://${window.location.host}/invoices/userReceiptsYTD/${userID}`
          : `http://${window.location.host}/invoices/userReceiptsYTD/:id`,
        {
          headers: {
            token: token,
          },
        }
      )
      .then((res) => res.data)
      .then((data) => {
        if (data.user) setUser(data.user);
        if (data.total) setReceiptYTD(data.total);
        if (data.currencies) setCurrenciesReceipt(data.currencies);
        if (data.message) window.alert(data.message);
      })
      .catch((err) => {
        window.alert("some error occured check console");
        console.log(err);
      });
  };

  const getBillsYTD = () => {
    axios
      .get(
        userID
          ? `http://${window.location.host}/invoices/userBillsYTD/${userID}`
          : `http://${window.location.host}/invoices/userBillsYTD/:id`,
        {
          headers: {
            token: token,
          },
        }
      )
      .then((res) => res.data)
      .then((data) => {
        if (data.user) setUser(data.user);
        if (data.total) setBillYTD(data.total);
        if (data.currencies) setCurrenciesBill(data.currencies);
        if (data.message) window.alert(data.message);
      })
      .catch((err) => {
        window.alert("some error occured check console");
        console.log(err);
      });
  };

  return (
    <BrowserRouter>
      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="body1"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>Invoice Total:</b>{" "}
        {currenciesBill.length
          ? currenciesBill.map((item) => (
              <Typography
                style={{ marginTop: "5px", marginLeft: "30px" }}
                variant="body1"
                component="h2"
                align="left"
                gutterBottom
              >
                {item} : {item + " " + addCommas(billYTD[item].toFixed(2))}
              </Typography>
            ))
          : 0}
      </Typography>
      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="body1"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>YTD Total Paid:</b>{" "}
        {currenciesReceipt.length
          ? currenciesReceipt.map((item) => (
              <Typography
                style={{ marginTop: "5px", marginLeft: "30px" }}
                variant="body1"
                component="h2"
                align="left"
                gutterBottom
              >
                {item} : {item + " " + addCommas(receiptYTD[item].toFixed(2))}
              </Typography>
            ))
          : 0}
      </Typography>
      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="h6"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>Pending Invoices </b> {userID && " of :" + user.name}
      </Typography>

      {haveBills ? (
        <UnpaidInvoice token={token} rows_data={bills} />
      ) : (
        <Typography
          style={{ marginTop: "5px", marginLeft: "30px" }}
          variant="body1"
          component="h2"
          align="left"
          gutterBottom
        >
          {userID ? "User" : "You"} has no pending bills
        </Typography>
      )}

      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="h6"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>Paid Invoices</b> {userID && " of :" + user.name}
      </Typography>
      {haveReceipts ? (
        <InvoicesTable rows_data={receipts} inAdmin={true} />
      ) : (
        <Typography
          style={{ marginTop: "5px", marginLeft: "30px" }}
          variant="body1"
          component="h2"
          align="left"
          gutterBottom
        >
          User has no receipts
        </Typography>
      )}

      {userID && (
        <Typography align="center">
          <Button
            onClick={toggleView}
            variant="contained"
            color="primary"
            style={{ marginRight: "10px" }}
          >
            <KeyboardBackspaceRoundedIcon style={{ fontSize: "30px" }} />
          </Button>
        </Typography>
      )}
    </BrowserRouter>
  );
};

export default UserReceiptsInvoices;
