import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";
import UserRow from "../components/user-table-row";
import { Container, Typography } from "@material-ui/core";
import UserReceipts from "../components/user-receipts-invoices";
import NavBarAdmin from "../components/nav-bar/nav-bar-admin";

const axios = require("axios");

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [userName, setUsername] = useState("");
  const [onDashboard, setOnDashboard] = useState(true);
  const [fetchReciptsOf, setFetchReciptsOf] = useState(null);

  useEffect(() => {
    if (token) {
      axios
        .get(`http://localhost:5000/users/single_user`, {
          headers: {
            token: token,
          },
        })
        .then((res) => {
          setUsername(res.data.name);
        })
        .catch((err) => {
          window.alert("some error occured check console");
          console.log(err);
        });

      axios
        .get(`http://localhost:5000/users/all_users`, {
          headers: {
            token: token,
          },
        })
        .then(function (response) {
          setUsers(response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      window.alert("You are not logged in");
    }
  }, [token]);

  const getReceipts = (userId) => {
    setFetchReciptsOf(userId);
    setOnDashboard(false);
  };
  const toggleView = () => {
    setOnDashboard(true);
  };

  return (
    <BrowserRouter>
      <NavBarAdmin username={userName} token={token} />
      {onDashboard ? (
        <div>
          <Typography
            style={{ marginTop: "5px" }}
            variant="h5"
            component="h2"
            align="center"
            gutterBottom
          >
            Admin Dashboard
          </Typography>
          <Container>
            <Box
              style={{
                overflow: "auto",
                margin: "7px",
                marginTop: 0,
                border: "1.5px solid rgb(243, 243, 243)",
                borderBottom: 0,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>User Name</b>
                    </TableCell>
                    <TableCell>
                      <b>Email</b>
                    </TableCell>
                    <TableCell>
                      <b>Approval</b>
                    </TableCell>
                    <TableCell>
                      <b>Role</b>
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <b>Payments</b>
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <b>Delete User</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <UserRow
                      token={token}
                      key={user._id}
                      user={user}
                      getReceipts={getReceipts}
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Container>
        </div>
      ) : (
        <UserReceipts
          userID={fetchReciptsOf}
          token={token}
          toggleView={toggleView}
        />
      )}
    </BrowserRouter>
  );
};

export default Dashboard;
