import { BrowserRouter } from "react-router-dom";
import { Typography } from "@material-ui/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import KeyboardBackspaceRoundedIcon from "@material-ui/icons/KeyboardBackspaceRounded";
import InvoicesTable from "./invoices-table";
import UnpaidInvoice from "./unpaid-invoice";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const UserReceipts = ({ userID, token, toggleView }) => {
  const [user, setUser] = useState({});
  const [receipts, setReceipts] = useState([]);
  const [bills, setBills] = useState([]);
  const [haveBills, setHavebills] = useState(false);
  const [haveReceipts, setHaveReceipts] = useState(false);
  const [receiptYTD, setReceiptYTD] = useState(0);
  const [billYTD, setBillYTD] = useState(0);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    getReceipts();
    getBills();

    // eslint-disable-next-line
  }, []);

  const getReceipts = () => {
    axios
      .get(
        userID
          ? `http://localhost:5000/invoices/userReceipts/${userID}`
          : `http://localhost:5000/invoices/userReceipts/:id`,
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

  const getReceiptsYTD = () => {
    axios
      .get(
        userID
          ? `http://localhost:5000/invoices/userReceiptsYTD/${userID}/${currency}`
          : `http://localhost:5000/invoices/userReceiptsYTD/:id/${currency}`,
        {
          headers: {
            token: token,
          },
        }
      )
      .then((res) => res.data)
      .then((data) => {
        setUser(data.user);
        setReceiptYTD(data.total);
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
          ? `http://localhost:5000/invoices/userBills/${userID}`
          : `http://localhost:5000/invoices/userBills/:id`,
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

  const getBillsYTD = () => {
    axios
      .get(
        userID
          ? `http://localhost:5000/invoices/userBillsYTD/${userID}/${currency}`
          : `http://localhost:5000/invoices/userBillsYTD/:id/${currency}`,
        {
          headers: {
            token: token,
          },
        }
      )
      .then((res) => res.data)
      .then((data) => {
        setBillYTD(data.total);
      })
      .catch((err) => {
        window.alert("some error occured check console");
        console.log(err);
      });
  };

  return (
    <BrowserRouter>
      <InputLabel id="demo-simple-select-label">Currency</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={currency}
        onChange={(e) => {
          setCurrency(e.target.value);
        }}
      >
        <MenuItem value={"INR"}>INR</MenuItem>
        <MenuItem value={"EUR"}>EUR</MenuItem>
        <MenuItem value={"USD"}>USD</MenuItem>
        <MenuItem value={"GBP"}>GBP</MenuItem>
        <MenuItem value={"AED"}>AED</MenuItem>
      </Select>
      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="body1"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>Invoice Total:</b> {billYTD}
      </Typography>
      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="body1"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>YTD Total Paid:</b> {Math.round(receiptYTD * 100) / 100}
      </Typography>
      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="h6"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>Pending Invoices:</b> {user.name}
      </Typography>

      {haveBills ? (
        <UnpaidInvoice rows_data={bills} />
      ) : (
        <Typography
          style={{ marginTop: "5px", marginLeft: "30px" }}
          variant="body1"
          component="h2"
          align="left"
          gutterBottom
        >
          User has no pending bills
        </Typography>
      )}

      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="h6"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>Paid Invoices of :</b> {user.name}
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
    </BrowserRouter>
  );
};

export default UserReceipts;
