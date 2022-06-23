import React, { Component, useState } from "react";
import "./App.css";
import { connect, sendHouseMessage, joinHouse } from "./api";
import LoginForm from "./components/Login";

class App extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      house: ''
    };
    // connect();
  }

  send() {
    console.log("hello")
    sendHouseMessage("hello")
  }

  joinHouse() {
    joinHouse()
  }

  render() {
    return (
      <div className="App">
        <LoginForm />
        <button onClick={this.joinHouse}>Join House</button>
        <button onClick={this.send}>Message House</button>
      </div>
    );
  }
}

export default App;