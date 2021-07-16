import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import HomeIcon from "@material-ui/icons/Home";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import UploadBillsData from "../upload-bills";
import UploadReceiptsData from "../upload-receipts";

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

export default function NavBarAdmin({ username, token }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
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
            <UploadBillsData token={token} />
            <UploadReceiptsData token={token} />
            <Button
              className={classes.button_menu}
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              {username}
              <span className="material-icons-outlined">expand_more</span>
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>My account</MenuItem>
              <MenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.replace(`http://${window.location.host}`);
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
