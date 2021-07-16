import NavBarUser from "../components/nav-bar/nav-bar-user";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import UserBills from "../components/user-bills";
import UserReceiptsUserPage from "../components/user-receipts-for-userPage";

const axios = require("axios");
const UserPage = () => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({});

  useEffect(() => {
    if (token) {
      axios
        .get(`http://localhost:5000/users/single_user`, {
          headers: {
            token: token,
          },
        })
        .then((res) => {
          setUser(res.data);
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
      <NavBarUser username={user.name} token={token} />
      <UserBills token={token} />
      <UserReceiptsUserPage token={token} />
    </BrowserRouter>
  );
};

export default UserPage;
