
let socket: any;
const serverUrl = "ws://localhost:8080/ws"

export const connectToWebsocket = (token: string, name: string) => {
    console.log('hello')
    let ws;
    if (token) {
      ws = new WebSocket(serverUrl + "?bearer=" + token);
    } else {
      ws = new WebSocket(serverUrl + "?name=" + name);
    }
    
    ws.onopen = () => {
        console.log("Successfully Connected");
    };

    ws.onmessage = msg => {
        const obj = JSON.parse(msg.data)
        console.log(obj)
        const action = obj.action

        if(action === "house-joined") {
            localStorage.setItem('currentHouse', obj.house)
        }
    };

    ws.onclose = event => {
        console.log("Socket Closed Connection: ", event);
    };

    ws.onerror = error => {
        console.log("Socket Error: ", error);
    };
  }

let connect = () => {
    console.log("Attempting Connection...");

    socket.onopen = () => {
        console.log("Successfully Connected");
    };

    socket.onmessage = msg => {
        var obj = JSON.parse(msg.data)
        console.log(obj)
        var action = obj.action

        if(action === "house-joined") {
            localStorage.setItem('currentHouse', obj.house)
        }
    };

    socket.onclose = event => {
        console.log("Socket Closed Connection: ", event);
    };

    socket.onerror = error => {
        console.log("Socket Error: ", error);
    };
};

let sendHouseMessage = (msg: string) => {
    const currentHouse = localStorage.getItem('currentHouse')
    console.log(currentHouse)
    var message = {
        action: 'send-message',
        message: msg,
        house: currentHouse,
        sender: socket
    }

    socket.send(JSON.stringify(message))
}

let joinHouse = () => {
    console.log("Joining House")
    socket.send(JSON.stringify({ action: 'join-house', message: 'join this house'}))

}

export { connect, sendHouseMessage, joinHouse }