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

const Register = () => {
  const paperStyle = {
    padding: 20,
    height: "70vh",
    width: 280,
    margin: "20px auto",
  };
  const avatarStyle = { backgroundColor: "blue" };
  const btnstyle = { margin: "8px 0", marginTop: "50px" };

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const postRegister = () => {
    if (password.length < 6) {
      window.alert("Password length should be more than 6");
    } else {
      axios
        .post("http://localhost:5000/users/register", {
          name: name,
          email: email,
          password: password,
        })
        .then((res) => {
          if (res.data.status === 200) {
            window.alert("Registered sucessfully");
            window.alert(res.data.message);
            window.location.replace(`http://${window.location.host}/login`);
          } else if (res.data.status === 400) {
            if (res.data.message) {
              window.alert(res.data.message);
              window.location.reload();
            }
          } else {
            window.alert("Some error occured. check console.");
            console.log(res.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <React.Fragment>
      <Grid>
        <Paper elevation={10} style={paperStyle}>
          <Grid align="center">
            <Avatar style={avatarStyle}>
              <LockOutlinedIcon />
            </Avatar>
            <h2 style={{ marginTop: "20px" }}>Register</h2>
          </Grid>
          <TextField
            label="Name"
            placeholder="Enter Name"
            fullWidth
            required
            value={name}
            style={{ marginTop: "15px" }}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
          <TextField
            label="Email"
            placeholder="Enter Email"
            fullWidth
            required
            value={email}
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
            onClick={postRegister}
          >
            Register
          </Button>
          <Typography style={{ marginTop: "5px" }}>
            {" "}
            Have an account?<Link href="/login"> Login</Link>
          </Typography>
        </Paper>
      </Grid>
    </React.Fragment>
  );
};

export default Register;
