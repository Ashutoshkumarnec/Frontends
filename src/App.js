import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import io from "socket.io-client/dist/socket.io.js";
var e;
var msg = [],
  msg1 = [];
var tym, sendtym, backmsg;
class App extends Component {
  constructor(props) {
    super(props);
    e = this;
    this.socket = io("http://192.168.100.143:3000", {
      jsonp: false
    });

    this.state = {
      text: "",
      Sevtext: "",
      UserName: "",
      OnlineUser: [],
      Status: 0,
      OwnUsername: "",
      Error: 0,
      myid: "",
      AllMsg: [],
      Clicked: 0,
      DropDown: false,
      typingstatus: 0,
      typing: 0,
      MessageUser: "",
      Replied: "",
      ShowsEmoji: false,
      AllUser: [],
      Selecteduser: ""
    };
    this.socket.on("Server-Send-Text", function(data) {
      e.setState({ Sevtext: data });
    });
    // io.on("connection", (socket, next) => {
    //   const ID = socket.id; // id property on the socket Object
    //   alert("Socket id" + ID);
    // });

    this.socket.on("usernames", function(data) {
      if (e.state.Error !== 1) {
        e.setState({ OnlineUser: data });
      }
    });
    this.socket.on("ForceLogout", function(data) {
      alert("Message from Server : " + data);
      localStorage.removeItem("email");
      localStorage.removeItem("username");
      e.props.history.push("/Go-For-Chat/Login");
    });
    this.socket.on("New-Message", function(data) {
      // e.setState({ NewMsg: data });

      msg.push(data);

      e.setState({ Status: 1 });
    });
    this.socket.on("Reloads", function(msg) {
      e.UpdateUser();
    });
    this.socket.on("typing", function(user) {
      if (e.state.UserName === user) {
        e.setState({ typingstatus: 1 });
      }
    });
    this.socket.on("Closeit", function(user) {
      e.setState({ typingstatus: 0 });
    });
    this.socket.on("Message", function(message) {
      // alert("Message from User " + message);
      // console.log("Message", message);
      // e.setState({ InCommingMsg: message });
      if (e.state.UserName !== "") {
        if (message.Messagefrom !== e.state.UserName) {
          // alert(message.Messagefrom + " : " + message.Message);
          e.setState({
            MessageUser: message.Messagefrom,
            Replied: message.Message
          });
        } else {
          // msg.push(message);
          var d = new Date();
          var dat = d.toDateString();
          var tim = d.toLocaleTimeString();
          tym = dat + " " + tim;
          var allmsg = {
            Messagefrom: message.Messagefrom,
            Messages: message.Message,
            Time: tym
          };
          e.state.AllMsg.push(allmsg);
          e.setState({ Status: 1, typingstatus: 0 });
          console.log("Message from :", message.Messagefrom);
        }
      } else {
        e.Select(message.Messagefrom);
        // msg.push(message);
        var d = new Date();
        var dat = d.toDateString();
        var tim = d.toLocaleTimeString();
        tym = dat + " " + tim;
        // var allmsg = {
        //   Messagefrom: message.Messagefrom,
        //   Messages: message.Message,
        //   Time: tym
        // };
        // e.state.AllMsg.push(allmsg);
        // e.setState({ Status: 1 });
        console.log("Message from :", message.Messagefrom);
      }
    });
    this.socket.on("Error", function(msg) {
      alert("Message from Server : " + msg);
      e.setState({ Error: 1 });
      // e.ErrorLogout();
    });
    // this.socket.on("Error1", function(msg) {
    //   alert("Message from Server :" + msg);
    //   e.ErrorLogout();
    // });
  }

  StorageChange = async event => {
    if (event.newValue === null) {
      await this.Logout();
      this.props.history.push("/Go-For-Chat/Login");
    }
  };
  componentWillUnmount() {
    this.socket.emit("unmounting", localStorage.getItem("email"));
  }
  componentDidMount = async () => {
    window.addEventListener("storage", this.StorageChange);
    var username = await localStorage.getItem("email");

    if (username === null) {
      this.props.history.push("/Go-For-Chat/Login");
    } else {
      fetch("http://192.168.100.143:3000/CheckLogin", {
        headers: {
          Accept: "application/json",
          "Content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ email: username })
      })
        .then(response => {
          return response.json();
        })
        .then(resp => {
          if (resp.data === "Allowed") {
            this.setState({ OwnUsername: "" });

            fetch("http://192.168.100.143:3000/SignUps", {
              headers: {
                Accept: "application/json",
                "Content-type": "application/json"
              },
              method: "POST",
              body: JSON.stringify({
                Username: username
              })
            })
              .then(response => {
                return response.json();
              })
              .then(resp => {
                console.log("All user", resp.alluser);
                this.setState({ myid: resp.data, AllUser: resp.alluser });

                // if (resp.data === "offline") {
                this.setState({ OwnUsername: username });
                this.Send();
                // } else {
                //   alert("You are already Logged in");
                //   this.ErrorLogout();
                // }
              });
          } else {
            localStorage.removeItem("email");
            localStorage.removeItem("username");
            this.props.history.push("/Go-For-Chat/Login");
          }
        });
    }

    // var username = window.prompt("Enter username");
    if (username === null) {
      // alert("Please Enter username");
      this.props.history.push("/Go-For-Chat/Login");
    } else {
      // fetch("http://192.168.100.143:3000/SignUp", {
      //   headers: {
      //     Accept: "application/json",
      //     "Content-type": "application/json"
      //   },
      //   method: "POST",
      //   body: JSON.stringify({
      //     Username: username
      //   })
      // })
      //   .then(response => {
      //     return response.json();
      //   })
      //   .then(resp => {
      //     this.setState({ myid: resp.data });
      //   });
      // this.socket.emit("new-user", this.state.UserName);
    }
  };
  UpdateUser = () => {
    fetch("http://192.168.100.143:3000/UpdateAllUser", {
      headers: {
        Accept: "application/json",
        "Content-type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        email: localStorage.getItem("email")
      })
    })
      .then(response => {
        return response.json();
      })
      .then(resp => {
        console.log("All user", resp.alluser);
        this.setState({ AllUser: resp.alluser });

        // if (resp.data === "offline") {
        // this.setState({ OwnUsername: username });
        // this.Send();
        // } else {
        //   alert("You are already Logged in");
        //   this.ErrorLogout();
        // }
      });
  };
  ShowEmoji = () => {
    this.setState({ ShowsEmoji: !this.state.ShowsEmoji });
  };
  ErrorLogout = async () => {
    var email = await localStorage.removeItem("email");
    await localStorage.removeItem("username");
    e.setState({ Status: 1 });
    this.props.history.push("/Go-For-Chat/Login");
  };
  Logout = async () => {
    var email = await localStorage.getItem("email");
    fetch("http://192.168.100.143:3000/ChangeStatus", {
      headers: {
        Accept: "application/json",
        "Content-type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        Status: "offline",
        email: email
      })
    })
      .then(response => {
        return response.json();
      })
      .then(resp => {
        console.log("Status changed");
      });

    this.socket.emit("Logout", email);
    var email = await localStorage.removeItem("email");
    await localStorage.removeItem("username");
    this.props.history.push("/Go-For-Chat/Login");
  };
  Send = () => {
    this.socket.emit("new-user", this.state.OwnUsername);
    // alert("Sending name" + this.state.UserName);
  };
  Deni = () => {
    this.socket.emit("Close-typing", this.state.UserName);
  };
  SendMessage = e => {
    if (this.state.UserName === "") {
      alert("Select User");
    } else {
      if (this.state.UserName === this.state.OwnUsername) {
        alert("You cant send message to yourself, Please select another user");
      } else {
        if (this.state.text === "") {
          alert("Enter Messages");
        } else {
          // msg.push({
          //   Messagefrom: this.state.OwnUsername,
          //   Message: this.state.text
          // });
          var d = new Date();
          var dat = d.toDateString();
          var tim = d.toLocaleTimeString();
          sendtym = dat + " " + tim;
          // sendtym = d.toLocaleString(d);
          var allmsg = {
            Messagefrom: this.state.OwnUsername,
            Messages: this.state.text,
            Time: sendtym
          };
          this.state.AllMsg.push(allmsg);
          fetch("http://192.168.100.143:3000/SaveMessages", {
            headers: {
              Accept: "application/json",
              "Content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
              myid: this.state.myid,
              OwnUsername: this.state.OwnUsername,
              Username: this.state.UserName,
              Message: this.state.text,
              Time: sendtym
            })
          })
            .then(response => {
              return response.json();
            })
            .then(resp => {
              // msg = null;
              msg.push(resp.data);
            });
          this.setState({ Status: 1 });
          this.refs.texts.value = "";
          this.socket.emit("newMessage", this.state.text, this.state.UserName);
          e.target.value = "";
          this.setState({ text: "" });
        }
      }
    }
  };
  DropDown1 = () => {
    if (this.state.DropDown !== false) {
      this.setState({ DropDown: false });
    }
  };
  show = () => {
    this.setState({ DropDown: !this.state.DropDown });
  };
  ShowProfile = () => {
    alert("Write Down Code");
  };
  Select = async data => {
    if (data === this.state.MessageUser) {
      this.setState({ MessageUser: "", Replied: "" });
    }
    if (data !== this.state.UserName) {
      await this.setState({ UserName: data, AllMsg: [], Selecteduser: data });
      fetch("http://192.168.100.143:3000/Find", {
        headers: {
          Accept: "application/json",
          "Content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          Username: this.state.UserName,
          myid: this.state.myid
        })
      })
        .then(response => {
          return response.json();
        })
        .then(resp => {
          if (resp.data !== "No Record") {
            // msg.push(resp.data);
            console.log("All Message", resp.data.Message[1]);
            for (var i = 0; i < resp.data.Message.length; i++) {
              this.state.AllMsg.push(resp.data.Message[i]);
              // console.log("Messages", resp.data.Message[i]);
            }
            console.log("After all message push", this.state.AllMsg);
            // resp.data.Message[0].map(data =>
            //   console.log("After all message push", data.Messages)
            // );
            // this.setState({ AllMsg: resp.data.Message });
            this.setState({ Status: 1 });
            // this.state.AllMsg.map(data =>
            //   console.log("After state set", data.Messages)
            // );
          } else {
            this.setState({ AllMsg: [] });
          }
        });
    }

    console.log("MyID in DataBase", this.state.myid);
  };
  settext = e => {
    this.setState({ text: e.target.value });
    if (this.state.UserName !== this.state.OwnUsername) {
      this.socket.emit("is-typing", this.state.UserName);
    }
  };
  render() {
    return (
      <div>
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        {/*---- Include the above in your HEAD tag --------*/}
        <title>Whatsapp Template</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
        />
        <link rel="stylesheet" href="styles/style.css" />
        {/* Font Awesome File */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <div
          className="container app"
          onClick={this.DropDown1}
          style={{ width: 1360, height: 600 }}
        >
          <div className="row app-one" style={{ height: 600 }}>
            <div className="col-sm-4 side" style={{ width: 380 }}>
              <div className="side-one">
                {/* Heading */}
                <div className="row heading">
                  <div className="col-sm-3 col-xs-3 heading-avatar">
                    <div className="heading-avatar-icon">
                      <img src="users.png" />
                    </div>
                  </div>
                  <p>
                    {this.state.OwnUsername}{" "}
                    <img
                      src="green-dot.png"
                      style={{
                        borderRadius: 5,
                        width: 10,
                        height: 10,
                        marginLeft: 40
                      }}
                    />
                  </p>

                  {/*<div className="col-sm-1 col-xs-1  heading-dot  pull-right">
                    <i
                      className="fa fa-ellipsis-v fa-2x  pull-right"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="col-sm-2 col-xs-2 heading-compose  pull-right">
                    <i
                      className="fa fa-comments fa-2x  pull-right"
                      aria-hidden="true"
                    />
                  </div>*/}
                </div>
                {/* Heading End */}
                {/* SearchBox */}
                <div className="row searchBox">
                  <div className="col-sm-12 searchBox-inner">
                    <div className="form-group has-feedback">
                      <input
                        id="searchText"
                        type="text"
                        className="form-control"
                        name="searchText"
                        placeholder="Search"
                      />
                      <span className="glyphicon glyphicon-search form-control-feedback" />
                    </div>
                  </div>
                </div>
                {/* Search Box End */}
                {/* sideBar */}
                <div className="row sideBar">
                  {this.state.AllUser.length !== 0 ? (
                    this.state.AllUser.map((data, key) => (
                      <div
                        className="row sideBar-body"
                        onClick={() => this.Select(data.email)}
                        style={
                          this.state.Selecteduser === data.email
                            ? { backgroundColor: "gray" }
                            : { backgroundColor: "white" }
                        }
                      >
                        <div className="col-sm-3 col-xs-3 sideBar-avatar">
                          <div className="avatar-icon">
                            <img src="users.png" />
                          </div>
                        </div>
                        {this.state.MessageUser === data.email ? (
                          <span style={{ color: "blue" }}>
                            {this.state.Replied}
                          </span>
                        ) : (
                          ""
                        )}

                        <div className="col-sm-9 col-xs-9 sideBar-main">
                          <div className="row">
                            <div className="col-sm-8 col-xs-8 sideBar-name">
                              <span key={data} className="name-meta">
                                {data.email}
                              </span>
                            </div>

                            <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                              {/*<span className="time-meta pull-right">
                                18:18
                    </span>*/}
                              {this.state.OnlineUser.map(
                                (data1, key) =>
                                  data1 === data.email ? (
                                    <img
                                      src="green-dot.png"
                                      style={{
                                        borderRadius: 5,
                                        width: 10,
                                        height: 10
                                      }}
                                    />
                                  ) : (
                                    ""
                                  )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p />
                  )}

                  {/*
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>

    */}
                </div>
                {/* Sidebar End */}
              </div>
              <div className="side-two">
                {/* Heading */}
                <div className="row newMessage-heading">
                  <div className="row newMessage-main">
                    <div className="col-sm-2 col-xs-2 newMessage-back">
                      <i className="fa fa-arrow-left" aria-hidden="true" />
                    </div>
                    <div className="col-sm-10 col-xs-10 newMessage-title">
                      New Chat
                    </div>
                  </div>
                </div>
                {/* Heading End */}
                {/* ComposeBox */}
                <div className="row composeBox">
                  <div className="col-sm-12 composeBox-inner">
                    <div className="form-group has-feedback">
                      <input
                        id="composeText"
                        type="text"
                        className="form-control"
                        name="searchText"
                        placeholder="Search People"
                      />
                      <span className="glyphicon glyphicon-search form-control-feedback" />
                    </div>
                  </div>
                </div>
                {/* ComposeBox End */}
                {/* sideBar */}
                <div className="row compose-sideBar">
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row sideBar-body">
                    <div className="col-sm-3 col-xs-3 sideBar-avatar">
                      <div className="avatar-icon">
                        <img src="http://shurl.esy.es/y" />
                      </div>
                    </div>
                    <div className="col-sm-9 col-xs-9 sideBar-main">
                      <div className="row">
                        <div className="col-sm-8 col-xs-8 sideBar-name">
                          <span className="name-meta">Ankit Jain</span>
                        </div>
                        <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
                          <span className="time-meta pull-right">18:18</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Sidebar End */}
            </div>
            {/* New Message Sidebar End */}
            {/* Conversation Start */}
            <div className="col-sm-8 conversation" style={{ width: 980 }}>
              {/* Heading */}
              <div className="row heading">
                <div className="col-sm-2 col-md-1 col-xs-3 heading-avatar">
                  <div className="heading-avatar-icon">
                    <img src="users.png" />
                  </div>
                </div>
                <div className="col-sm-8 col-xs-7 heading-name">
                  <a className="heading-name-meta">{this.state.UserName}</a>
                  <span className="heading-online">Online</span>
                </div>
                {this.state.typingstatus === 1 ? (
                  <p
                    style={{
                      position: "absolute",
                      zIndex: 5,
                      width: 100,
                      height: 100,
                      marginLeft: 50,
                      marginTop: 25
                    }}
                  >
                    typing .....
                  </p>
                ) : (
                  <p />
                )}
                <div
                  className="col-sm-1 col-xs-1  heading-dot pull-right"
                  onClick={this.show}
                >
                  <i
                    className="fa fa-ellipsis-v fa-2x  pull-right"
                    aria-hidden="true"
                  />
                </div>
                {this.state.DropDown === true ? (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      opacity: 0.5,
                      position: "absolute",
                      zIndex: 5,
                      marginTop: 30,
                      marginRight: 40,
                      backgroundColor: "white",
                      border: "solid",
                      marginLeft: 840,
                      borderWidth: 1,
                      borderColor: "orange",
                      borderRadius: 10
                    }}
                  >
                    <a href="#">
                      <p
                        onClick={this.Logout}
                        style={{
                          marginTop: 20,
                          marginLeft: 13,
                          color: "black",
                          fontSize: 15
                        }}
                      >
                        Logout
                      </p>
                    </a>
                    <a href="#">
                      <p
                        onClick={this.ShowProfile}
                        style={{
                          marginTop: 20,
                          marginLeft: 13,
                          color: "black",
                          fontSize: 15
                        }}
                      >
                        ShowProfile
                      </p>
                    </a>
                  </div>
                ) : (
                  ""
                )}
              </div>
              {/* Heading End */}
              {/* Message Box */}
              <div
                className="row message"
                id="conversation"
                style={{ backgroundImage: "url(whatsapp.jpg)" }}
              >
                <div className="row message-previous">
                  {/*<div className="col-sm-12 previous">
                    <a onclick="previous(this)" id="ankitjain28" name={20}>
                      Show Previous Message!
                    </a>
  </div>*/}
                </div>

                {this.state.AllMsg.map(
                  (data, key) =>
                    data.Messagefrom !== this.state.OwnUsername ? (
                      <div className="row message-body">
                        <div className="col-sm-12 message-main-receiver">
                          <div className="receiver">
                            <div className="message-text">
                              <div> {data.Messages}</div>
                            </div>
                            <span className="message-time pull-right">
                              {data.Time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="row message-body">
                        <div className="col-sm-12 message-main-sender">
                          <div className="sender">
                            <div className="message-text">
                              <div>{data.Messages}</div>
                              <div>
                                <img
                                  src="tick.png"
                                  style={{
                                    height: 10,
                                    width: 15,
                                    marginLeft: 90
                                  }}
                                />
                              </div>
                            </div>
                            <span className="message-time pull-right">
                              {data.Time}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                )}
              </div>
              {/* Message Box End */}
              {/* Reply Box */}
              <div className="row reply">
                <div
                  className="col-sm-1 col-xs-1 reply-emojis"
                  onClick={this.ShowEmoji}
                >
                  <i className="fa fa-smile-o fa-2x" />
                </div>
                <div className="col-sm-9 col-xs-9 reply-main">
                  <textarea
                    className="form-control"
                    rows={1}
                    id="comment"
                    defaultValue={""}
                    name="text"
                    ref="texts"
                    onChange={this.settext}
                    onBlur={this.Deni}
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="col-sm-1 col-xs-1 reply-recording">
                  <i className="fa fa-microphone fa-2x" aria-hidden="true" />
                </div>
                <div className="col-sm-1 col-xs-1 reply-send">
                  <i
                    className="fa fa-send fa-2x"
                    aria-hidden="true"
                    onClick={this.SendMessage}
                  />
                </div>
              </div>
              {/* Reply Box End */}
            </div>
            {/* Conversation End */}
          </div>
          {/* App One End */}
        </div>
        {/* App End */}
      </div>
    );
  }
}

export default App;
