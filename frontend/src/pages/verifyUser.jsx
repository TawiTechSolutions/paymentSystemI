import { Button } from "@material-ui/core";
import { BrowserRouter } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import HomeIcon from "@material-ui/icons/Home";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  button_menu: {
    color: "white",
  },
  title: {
    flexGrow: 1,
  },
}));

const VerifyUser = ({
  match: {
    params: { token },
  },
}) => {
  const classes = useStyles();
  useEffect(() => {
    verifyuser();
    // eslint-disable-next-line
  }, []);
  const verifyuser = () => {
    axios
      .get(`http://${window.location.host}/users/verifyUser/${token}`)
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
        window.alert("some error occured please check console");
        console.log(err);
      });
  };

  return (
    <BrowserRouter>
      <div className={classes.root}>
        <AppBar position="static" style={{ marginBottom: "5px" }}>
          <Toolbar>
            <IconButton
              href="/"
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="home"
            >
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Payment management service
            </Typography>
            <div>
              <Button
                className={classes.button_menu}
                aria-controls="simple-menu"
                aria-haspopup="true"
                href="/login"
              >
                Log In
              </Button>
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <Typography
        style={{ marginTop: "5px" }}
        variant="h5"
        component="h2"
        align="center"
        gutterBottom
      >
        You have been verified
      </Typography>
    </BrowserRouter>
  );
};

export default VerifyUser;
