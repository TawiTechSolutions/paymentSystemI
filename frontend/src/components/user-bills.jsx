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
  const [Bills, setBills] = useState([]);
  const [haveBills, setHavebills] = useState(false);

  useEffect(() => {
    getBills();
    // eslint-disable-next-line
  }, []);

  const getBills = () => {
    axios
      .get(`http://localhost:5000/invoices/userBills`, {
        headers: {
          token: token,
        },
      })
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

  return (
    <BrowserRouter>
      <Typography
        style={{ marginTop: "5px", marginLeft: "30px" }}
        variant="h6"
        component="h2"
        align="left"
        gutterBottom
      >
        <b>Pending Invoices</b>
      </Typography>
      <Container>
        {haveBills ? (
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
        ) : (
          <Typography
            style={{ marginTop: "5px", marginLeft: "15px" }}
            variant="body1"
            component="h2"
            align="left"
            gutterBottom
          >
            You dont have any pending bills
          </Typography>
        )}
      </Container>
    </BrowserRouter>
  );
};

export default UserBills;
