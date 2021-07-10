import { BrowserRouter, Route, Switch } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Register from "./pages/register";
import LoginRegister from "./pages/login-register";
import NotFound from "./components/not-found";
import Unapproved from "./pages/unapproved";
import UserPage from "./pages/userPage";
import ResetPassword from "./pages/reset-password";
import VerifyUser from "./pages/verifyUser";
import ForgotPassword from "./pages/forgotpassword";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={LoginRegister} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/unapproved" component={Unapproved} />
        <Route exact path="/userPage" component={UserPage} />
        <Route exact path="/forgotPassword" component={ForgotPassword} />
        <Route path="/resetPassword/:token" component={ResetPassword} />
        <Route path="/verifyUser/:token" component={VerifyUser} />

        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
