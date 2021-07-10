import Button from "@material-ui/core/Button";

const axios = require("axios");
const ResetPassword = ({ token }) => {
  const mailResetLink = () => {
    if (token) {
      axios
        .get(`http://localhost:5000/users/mailResetPassword`, {
          headers: {
            token: token,
          },
        })
        .then((res) => {
          window.alert(res.data.message);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      window.alert("You are not logged in");
    }
  };

  return (
    <Button
      style={{ margin: 20 }}
      variant="contained"
      color="primary"
      onClick={mailResetLink}
    >
      Reset Password
    </Button>
  );
};

export default ResetPassword;
