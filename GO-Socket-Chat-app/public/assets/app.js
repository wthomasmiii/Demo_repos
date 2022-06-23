var app = new Vue({
  el: '#app',
  data: {
    ws: null,
    serverUrl: "ws://" + location.host + "/ws",
    houseInput: null,
    houses: [],
    user: {
      name: "",
      username: "",
      password: "",
      token: ""
    },
    users: [],
    initialReconnectDelay: 1000,
    currentReconnectDelay: 0,
    maxReconnectDelay: 16000,
    loginError: ""
  },
  mounted: function () {
  },
  methods: {
    connect() {
      this.connectToWebsocket();
    },
    async login() {
      try {
        const result = await axios.post("http://" + location.host + '/api/login', this.user);
        if (result.data.status !== "undefined" && result.data.status == "error") {
          this.loginError = "Login failed";
        } else {
          this.user.token = result.data;
          this.connectToWebsocket();
        }
      } catch (e) {
        this.loginError = "Login failed";
        console.log(e);
      }
    },
    connectToWebsocket() {
      if (this.user.token != "") {
        this.ws = new WebSocket(this.serverUrl + "?bearer=" + this.user.token);
      } else {
        this.ws = new WebSocket(this.serverUrl + "?name=" + this.user.name);
      }
      this.ws.addEventListener('open', (event) => { this.onWebsocketOpen(event) });
      this.ws.addEventListener('message', (event) => { this.handleNewMessage(event) });
      this.ws.addEventListener('close', (event) => { this.onWebsocketClose(event) });
    },
    onWebsocketOpen() {
      console.log("connected to WS!");
      this.currentReconnectDelay = 1000;
    },

    onWebsocketClose() {
      this.ws = null;

      setTimeout(() => {
        this.reconnectToWebsocket();
      }, this.currentReconnectDelay);

    },

    reconnectToWebsocket() {
      if (this.currentReconnectDelay < this.maxReconnectDelay) {
        this.currentReconnectDelay *= 2;
      }
      this.connectToWebsocket();
    },

    handleNewMessage(event) {
      let data = event.data;
      data = data.split(/\r?\n/);

      for (let i = 0; i < data.length; i++) {
        let msg = JSON.parse(data[i]);
        console.log(msg)
        switch (msg.action) {
          case "send-message":
            this.handleChatMessage(msg);
            break;
          case "user-join":
            this.handleUserJoined(msg);
            break;
          case "user-left":
            this.handleUserLeft(msg);
            break;
          case "house-joined":
            this.handleHouseJoined(msg);
            break;
          default:
            break;
        }

      }
    },
    handleChatMessage(msg) {
      const house = this.findHouse(msg.house.id);
      if (typeof house !== "undefined") {
        house.messages.push(msg);
      }
    },
    handleUserJoined(msg) {
      if(!this.userExists(msg.sender)) {
        this.users.push(msg.sender);
      }
    },
    handleUserLeft(msg) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].id == msg.sender.id) {
          this.users.splice(i, 1);
          return;
        }
      }
    },
    handleHouseJoined(msg) {
      house = msg.house;
      house.name = house.private ? msg.sender.name : house.name;
      house["messages"] = [];
      this.houses.push(house);
    },
    sendMessage(house) {
      if (house.newMessage !== "") {
        this.ws.send(JSON.stringify({
          action: 'send-message',
          message: house.newMessage,
          house: {
            id: house.id,
            name: house.name
          }
        }));
        house.newMessage = "";
      }
    },
    findHouse(houseId) {
      for (let i = 0; i < this.houses.length; i++) {
        if (this.houses[i].id === houseId) {
          return this.houses[i];
        }
      }
    },
    joinHouse() {
      this.ws.send(JSON.stringify({ action: 'join-house', message: this.houseInput }));
      this.houseInput = "";
    },
    leaveHouse(house) {
      this.ws.send(JSON.stringify({ action: 'leave-house', message: house.id }));

      for (let i = 0; i < this.houses.length; i++) {
        if (this.houses[i].id === house.id) {
          this.houses.splice(i, 1);
          break;
        }
      }
    },
    joinPrivateHouse(house) {
      this.ws.send(JSON.stringify({ action: 'join-house-private', message: house.id }));
    },
    userExists(user) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].id == user.id) {
          return true;
        }
      }
      return false;
    } 
  }
})