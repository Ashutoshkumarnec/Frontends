import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import { Link, Redirect } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import App from "./App";
import Forget from "./Forget";
import Reset from "./Reset";
const Main = () => (
  <div>
    <Switch>
      <Route path="/Register" component={Register} />
      <Route path="/Login" component={Login} />
      <Route path="/Forget" component={Forget} />
      <Route path="/App" component={App} />
      <Route path="/Reset" component={Reset} />
    </Switch>
  </div>
);
export default Main;
