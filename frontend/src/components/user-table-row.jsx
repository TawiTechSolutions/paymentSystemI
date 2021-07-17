import { useState } from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Button from "@material-ui/core/Button";
import AssignmentIcon from "@material-ui/icons/Assignment";

const axios = require("axios");

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  TableRow: {
    TableCell: { color: "white" },
  },
});

const UserRow = ({ user, token, getReceipts }) => {
  const classes = useStyles();

  const [admin_role, setAdmin_role] = useState(user.isAdmin);
  const [approved, setApproved] = useState(user.approved);

  const updateRole = (id, event) => {
    if (!admin_role) {
      let result = window.confirm(
        "Make admin? After user is made admin you cannot change back"
      );
      if (result) {
        setAdmin_role(event.target.value);
        let updated_user = {
          name: user.name,
          email: user.email,
          password: user.password,
          isAdmin: true,
        };

        axios
          .put(`http://localhost:5000/users/updateRole/${id}`, updated_user, {
            headers: { token: token, "Content-Type": "application/json" },
          })
          .then((res) => {
            window.alert(res.data.message);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      window.alert("Cannot change role of admin");
    }
  };

  const updateApprove = (id) => {
    let result = window.confirm("Apprrove? This action cannot be reversed");
    if (result) {
      setApproved(true);
      let updated_user = {
        name: user.name,
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
        approved: true,
      };

      axios
        .put(`http://localhost:5000/users/update/${id}`, updated_user, {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          window.alert(res.data.message);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const deleteUser = (id) => {
    let result = window.confirm("Want to delete?");
    if (result) {
      axios
        .delete(`http://localhost:5000/users/${id}`, {
          headers: {
            token: token,
          },
        })
        .then((res) => {
          window.alert(res.data.message);
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const switchToReceipts = () => {
    getReceipts(user._id);
  };

  return (
    <TableRow>
      <TableCell style={{ padding: "0 16px" }}>{user.name}</TableCell>
      <TableCell style={{ padding: "0 16px" }}>{user.email}</TableCell>
      <TableCell style={{ padding: "0 16px" }}>
        {approved ? (
          "Approved"
        ) : (
          <Button
            onClick={() => {
              updateApprove(user._id);
            }}
            variant="contained"
            color="primary"
          >
            Approve
          </Button>
        )}
      </TableCell>
      <TableCell style={{ padding: "0 16px" }}>
        <FormControl className={classes.formControl}>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={admin_role}
            onChange={(event) => {
              updateRole(user._id, event);
            }}
          >
            <MenuItem value={true}>Admin</MenuItem>
            <MenuItem value={false}>User</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell style={{ padding: "0 16px", textAlign: "center" }}>
        <IconButton
          onClick={switchToReceipts}
          aria-label="update"
          className={classes.margin}
        >
          <AssignmentIcon />
        </IconButton>
      </TableCell>
      <TableCell style={{ padding: "0 16px", textAlign: "center" }}>
        <IconButton
          onClick={() => {
            deleteUser(user._id);
          }}
          aria-label="delete"
          className={classes.margin}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
