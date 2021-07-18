import NavBarUser from "../components/nav-bar/nav-bar-user";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import UserReceiptsInvoices from "../components/user-receipts-invoices";

const axios = require("axios");
const UserPage = () => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({});

  useEffect(() => {
    if (token) {
      axios
        .get(`http://${window.location.host}/users/single_user`, {
          headers: {
            token: token,
          },
        })
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          window.alert("some error occured please check console");
          console.log(err);
        });
    } else {
      window.alert("You are not logged in");
    }
  }, [token]);

  return (
    <BrowserRouter>
      <NavBarUser username={user.name} token={token} />
      <UserReceiptsInvoices token={token} />
    </BrowserRouter>
  );
};

export default UserPage;
