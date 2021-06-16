import { Grid, Paper, Avatar, TextField, Button } from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import axios from "axios";
import React, { useState } from "react";

const ForgotPassword = () => {
  const paperStyle = {
    padding: 20,
    height: "70vh",
    width: 280,
    margin: "20px auto",
  };
  const avatarStyle = { backgroundColor: "rgb(51, 70, 176)" };
  const btnstyle = { margin: "8px 0", marginTop: "68px" };

  const [Email, setEmail] = useState("");

  const findAndSendMail = () => {
    axios
      .put(`http://localhost:5000/users/forgotPassword/${Email}`)
      .then((res) => res.data)
      .then((data) => {
        if (data.status === 400) {
          window.alert(data.message);
        } else {
          window.alert(data.message);
          window.location.replace(`http://${window.location.host}/login`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Grid>
      <Paper elevation={10} style={paperStyle}>
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <LockOutlinedIcon style={{ backgroundColor: "rgb(51, 70, 176)" }} />
          </Avatar>
          <h2 style={{ marginTop: "20px" }}>Forgot Password</h2>
        </Grid>
        <TextField
          label="Email"
          placeholder="Enter Email"
          type="Email"
          fullWidth
          required
          style={{ marginTop: "7px" }}
          value={Email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        <Button
          type="submit"
          color="primary"
          variant="contained"
          style={btnstyle}
          fullWidth
          onClick={findAndSendMail}
        >
          Send mail
        </Button>
      </Paper>
    </Grid>
  );
};

export default ForgotPassword;
