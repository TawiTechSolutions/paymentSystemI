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
import BillRow from "./bill-table-row";

const UserBills = ({ token }) => {
  const [user, setUser] = useState({});
  const [Bills, setBills] = useState([]);

  useEffect(() => {
    getBills();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    console.log(user);
    console.log("receipt", Bills);
    // eslint-disable-next-line
  }, [user, Bills]);
  const getBills = () => {
    axios
      .get(`http://localhost:5000/invoices/userBills`, {
        headers: {
          token: token,
        },
      })
      .then((res) => res.data)
      .then((data) => {
        console.log("data receveied", data);
        setUser(data.user);
        setBills(data.bills);
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
        Pending Bills
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
              {Bills.map((bill) => (
                <BillRow key={bill._id} bill={bill} />
              ))}
            </TableBody>
          </Table>
        </Box>
      </Container>
    </BrowserRouter>
  );
};

export default UserBills;
