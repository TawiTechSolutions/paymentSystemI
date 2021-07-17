import NavBarAdmin from "../components/nav-bar/nav-bar-admin";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import ResetPassword from "../components/reset-password";
const axios = require("axios");

const AccountInfo = () => {
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
      <NavBarAdmin username={user.name} token={token} />
      <ResetPassword token={token} />
    </BrowserRouter>
  );
};

export default AccountInfo;
