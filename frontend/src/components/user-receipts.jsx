import { BrowserRouter } from "react-router-dom";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";
import { Container, Typography } from "@material-ui/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import ReceiptRow from "./receipt-table-row";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Button from "@material-ui/core/Button";

const UserReceipts = ({ userID, token, toggleView }) => {
  const [user, setUser] = useState({});
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    getReceipts();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    console.log(user);
    console.log("receipt", receipts);
    // eslint-disable-next-line
  }, [user, receipts]);
  const getReceipts = () => {
    axios
      .get(`http://localhost:5000/receipts/userReceipts/${userID}`, {
        headers: {
          token: token,
        },
      })
      .then((res) => res.data)
      .then((data) => {
        //handle respose
        console.log("data receveied", data);
        setUser(data.user);
        setReceipts(data.receipts);
        if (data.message) {
          window.alert(data.message);
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
        style={{ marginTop: "5px" }}
        variant="h5"
        component="h2"
        align="center"
        gutterBottom
      >
        Receipts of : {user.name}
      </Typography>
      <Container>
        <Box
          style={{
            overflow: "auto",
            margin: "7px",
            marginTop: 0,
            border: "1.5px solid rgb(243, 243, 243)",
            borderBottom: 0,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Invoice Num</b>
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts.map((receipt) => (
                <ReceiptRow key={receipt._id} receipt={receipt} />
              ))}
            </TableBody>
          </Table>
        </Box>
      </Container>
      <Button onClick={toggleView} aria-label="back">
        <ArrowBackIcon /> Back
      </Button>
    </BrowserRouter>
  );
};

export default UserReceipts;
