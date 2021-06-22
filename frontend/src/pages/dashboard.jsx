import NavBar from "../components/nav-bar";
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
import UploadUsers from "../components/upload_csv";
import UploadReciptData from "../components/upload_recipts";

const axios = require("axios");

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [userName, setUsername] = useState("");

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

  return (
    <BrowserRouter>
      <NavBar username={userName} />
      <UploadUsers token={token} />
      <UploadReciptData token={token} />

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
                <TableCell>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <UserRow token={token} key={user._id} user={user} />
              ))}
            </TableBody>
          </Table>
        </Box>
      </Container>
    </BrowserRouter>
  );
};

export default Dashboard;
