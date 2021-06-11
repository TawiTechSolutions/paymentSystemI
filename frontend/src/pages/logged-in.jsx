import NavBar from "../components/nav-bar";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";

const axios = require("axios");
const LoggedIn = () => {
  const token = localStorage.getItem("token");
  const [userName, setUsername] = useState("");

  const mailResetLink = () => {
    if (token) {
      axios
        .put(
          `http://localhost:5000/api/mailResetPassword/${localStorage.getItem(
            "token"
          )}`
        )
        .then((res) => {
          window.alert(res.data.message);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      window.alert("You are not logged in");
    }
  };

  useEffect(() => {
    if (token) {
      axios
        .get(
          `http://localhost:5000/api/single_user/${localStorage.getItem(
            "token"
          )}`
        )
        .then((res) => {
          setUsername(res.data.name);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      window.alert("You are not logged in");
    }
  }, [token]);

  return (
    <BrowserRouter>
      <NavBar username={userName} />
      <Typography
        style={{ marginTop: "5px" }}
        variant="h5"
        component="h2"
        align="center"
        gutterBottom
      >
        You are Logged in
      </Typography>
      <Button
        style={{ margin: 20 }}
        variant="contained"
        color="primary"
        onClick={mailResetLink}
      >
        Reset Password
      </Button>
    </BrowserRouter>
  );
};

export default LoggedIn;
