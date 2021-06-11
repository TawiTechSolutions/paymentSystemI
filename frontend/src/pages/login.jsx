import {
  Grid,
  Paper,
  Avatar,
  TextField,
  Button,
  Typography,
  Link,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import axios from "axios";
import React, { useState } from "react";

const Login = () => {
  const paperStyle = {
    padding: 20,
    height: "70vh",
    width: 280,
    margin: "20px auto",
  };
  const avatarStyle = { backgroundColor: "rgb(51, 70, 176)" };
  const btnstyle = { margin: "8px 0", marginTop: "58px" };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const postLogin = () => {
    axios
      .post("http://localhost:5000/api/login", {
        email: email,
        password: password,
      })
      .then((res) => res.data)
      .then((data) => {
        if (data.status === 400) {
          window.alert(data.message);
        } else {
          localStorage.setItem("token", data.token);
          if (data.user.isAdmin) {
            window.location.replace(`http://${window.location.host}/dashboard`);
          } else {
            if (data.user.approved) {
              window.location.replace(
                `http://${window.location.host}/loggedIn`
              );
            } else {
              window.location.replace(
                `http://${window.location.host}/unapproved`
              );
            }
          }
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
          <h2 style={{ marginTop: "20px" }}>Login</h2>
        </Grid>
        <TextField
          label="Email"
          placeholder="Enter Email"
          fullWidth
          required
          value={email}
          style={{ marginTop: "20px" }}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        <TextField
          label="Password"
          placeholder="Enter password"
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
          onClick={postLogin}
        >
          Log in
        </Button>
        <Typography style={{ marginTop: "5px" }}>
          {" "}
          New here? <Link href="/register">Register</Link>
        </Typography>
        <Typography style={{ marginTop: "5px" }}>
          {" "}
          Forgot password? <Link href="/forgotPassword">Click here</Link>
        </Typography>
      </Paper>
    </Grid>
  );
};

export default Login;
