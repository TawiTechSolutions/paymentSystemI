import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState } from "react";
import InvoicesTable from "./invoices-table";
import { Typography } from "@material-ui/core";

const UserReceiptsUserPage = ({ token }) => {
  const [receipts, setReceipts] = useState([]);
  const [haveReceipts, setHaveReceipts] = useState(false);

  useEffect(() => {
    getReceipts();
    // eslint-disable-next-line
  }, []);

  const getReceipts = () => {
    axios
      .get(`http://localhost:5000/invoices/userReceipts/:id`, {
        headers: {
          token: token,
        },
      })
      .then((res) => res.data)
      .then((data) => {
        //handle respose
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

  return (
    <BrowserRouter>
      {haveReceipts ? (
        <InvoicesTable rows_data={receipts} />
      ) : (
        <Typography variant="h5" component="h2" align="left" gutterBottom>
          You dont have any paid invoices
        </Typography>
      )}
    </BrowserRouter>
  );
};

export default UserReceiptsUserPage;
