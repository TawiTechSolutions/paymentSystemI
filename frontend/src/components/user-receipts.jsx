import { BrowserRouter } from "react-router-dom";
import { Typography } from "@material-ui/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import KeyboardBackspaceRoundedIcon from "@material-ui/icons/KeyboardBackspaceRounded";
import InvoicesTable from "./invoices-table";

const UserReceipts = ({ userID, token, toggleView }) => {
  const [user, setUser] = useState({});
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    getReceipts();
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
        if (!data.haveReceipts) {
          window.alert("user doesnt have any receipts");
        }
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
        variant="h6"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>Paid Invoices of :</b> {user.name}
      </Typography>
      <InvoicesTable rows_data={receipts} inAdmin={true} />
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
