import { Grid, Paper, Avatar, TextField, Button } from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import axios from "axios";
import React, { useState } from "react";

const ResetPassword = ({
  match: {
    params: { token },
  },
}) => {
  const paperStyle = {
    padding: 20,
    height: "70vh",
    width: 280,
    margin: "20px auto",
  };
  const avatarStyle = { backgroundColor: "rgb(51, 70, 176)" };
  const btnstyle = { margin: "8px 0", marginTop: "68px" };

  const [password, setPassword] = useState("");

  const postNewPassword = () => {
    if (password.length < 6) {
      window.alert("Password should be more than 6");
    } else {
      axios
        .put(
          `http://${window.location.host}/users/changePassword`,
          {
            password: password,
          },
          {
            headers: {
              token: token,
            },
          }
        )
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
    }
  };

  return (
    <Grid>
      <Paper elevation={10} style={paperStyle}>
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <LockOutlinedIcon style={{ backgroundColor: "rgb(51, 70, 176)" }} />
          </Avatar>
          <h2 style={{ marginTop: "20px" }}>Reset Password</h2>
        </Grid>
        <TextField
          label="New Password"
          placeholder="Enter new password"
          type="password"
          fullWidth
          required
          style={{ marginTop: "7px" }}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
        <Button
          type="submit"
          color="primary"
          variant="contained"
          style={btnstyle}
          fullWidth
          onClick={postNewPassword}
        >
          Reset
        </Button>
      </Paper>
    </Grid>
  );
};

export default ResetPassword;
