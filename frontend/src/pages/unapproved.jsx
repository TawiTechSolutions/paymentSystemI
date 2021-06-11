import { BrowserRouter } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import HomeIcon from "@material-ui/icons/Home";

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

const Unapproved = () => {
  const classes = useStyles();

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
              Fleet Managment System
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
        You are not approved by the admin
      </Typography>
    </BrowserRouter>
  );
};

export default Unapproved;
