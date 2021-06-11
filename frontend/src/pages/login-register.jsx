import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  login: {
    margin: "50px",
  },
  register: {
    margin: "0 50px",
  },
});

const LoginRegister = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Container className={classes.container} maxWidth="xs">
        <Button
          className={classes.login}
          variant="contained"
          color="primary"
          href="/login"
        >
          Login
        </Button>
        <Button
          className={classes.register}
          variant="contained"
          color="primary"
          href="/register"
        >
          Register
        </Button>
      </Container>
    </React.Fragment>
  );
};

export default LoginRegister;
