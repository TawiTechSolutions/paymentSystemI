import { BrowserRouter } from "react-router-dom";
import { Container, Typography } from "@material-ui/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import UnpaidInvoice from "./unpaid-invoice";

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
          <UnpaidInvoice rows_data={Bills} inAdmin={false} token={token} />
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
