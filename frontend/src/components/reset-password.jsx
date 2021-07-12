import Button from "@material-ui/core/Button";

const ResetPassword = ({ token }) => {
  const goToResetPage = () => {
    window.location.replace(
      `http://${window.location.host}/resetPassword/${token}`
    );
  };

  return (
    <Button
      style={{ margin: 20 }}
      variant="contained"
      color="primary"
      onClick={goToResetPage}
    >
      Reset Password
    </Button>
  );
};

export default ResetPassword;
