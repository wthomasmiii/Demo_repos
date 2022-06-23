package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"bitbucket.org/morganmoreno/chat-app/auth"
	"bitbucket.org/morganmoreno/chat-app/models"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	// Max wait time when writing message to peer
	writeWait = 10 * time.Second

	// Max time till next pong from peer
	pongWait = 60 * time.Second

	// Send ping interval, must be less then pong wait time
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 10000
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
}

// Client represents the websocket client at the server
type Client struct {
	// The actual websocket connection.
	conn   *websocket.Conn
	Server *Server
	send   chan []byte
	ID     uuid.UUID `json:"id"`
	Name   string    `json:"name"`
	houses map[*House]bool
}

func newClient(conn *websocket.Conn, Server *Server, name string, ID string) *Client {

	client := &Client{
		Name:   name,
		conn:   conn,
		Server: Server,
		send:   make(chan []byte, 256),
		houses: make(map[*House]bool),
	}

	if ID != "" {
		client.ID, _ = uuid.Parse(ID)
	}

	return client
}

func (client *Client) readPump() {
	defer func() {
		client.disconnect()
	}()

	client.conn.SetReadLimit(maxMessageSize)
	client.conn.SetReadDeadline(time.Now().Add(pongWait))
	client.conn.SetPongHandler(func(string) error { client.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	// Start endless read loop, waiting for messages from client
	for {
		_, jsonMessage, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("unexpected close error: %v", err)
			}
			break
		}

		client.handleNewMessage(jsonMessage)
	}

}

func (client *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		client.conn.Close()
	}()
	for {
		select {
		case message, ok := <-client.send:
			client.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The Server closed the channel.
				client.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Attach queued chat messages to the current websocket message.
			n := len(client.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-client.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			client.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := client.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (client *Client) disconnect() {
	client.Server.unregister <- client
	for house := range client.houses {
		house.unregister <- client
	}
	close(client.send)
	client.conn.Close()
}

// ServeWs handles websocket requests from clients requests.
func ServeWs(Server *Server, w http.ResponseWriter, r *http.Request) {

	userCtxValue := r.Context().Value(auth.UserContextKey)
	if userCtxValue == nil {
		log.Println("Not authenticated")
		return
	}

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	user := userCtxValue.(models.User)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := newClient(conn, Server, user.GetName(), user.GetId())

	go client.writePump()
	go client.readPump()

	Server.register <- client
}

func (client *Client) handleNewMessage(jsonMessage []byte) {

	var message Message
	if err := json.Unmarshal(jsonMessage, &message); err != nil {
		log.Printf("Error on unmarshal JSON message %s", err)
		return
	}

	message.Sender = client
	fmt.Println(message)
	switch message.Action {
	case SendMessageAction:
		houseID := message.House.GetId()
		fmt.Println(houseID)
		if house := client.Server.findHouseByID(houseID); house != nil {
			house.broadcast <- &message
		}

	case JoinHouseAction:
		client.handleJoinHouseMessage(message)

	case LeaveHouseAction:
		client.handleLeaveHouseMessage(message)

	case JoinHousePrivateAction:
		client.handleJoinHousePrivateMessage(message)
	}

}

func (client *Client) handleJoinHouseMessage(message Message) {
	houseName := message.Message

	client.joinHouse(houseName, nil)
}

func (client *Client) handleLeaveHouseMessage(message Message) {
	house := client.Server.findHouseByID(message.Message)
	if house == nil {
		return
	}

	if _, ok := client.houses[house]; ok {
		delete(client.houses, house)
	}

	house.unregister <- client
}

func (client *Client) handleJoinHousePrivateMessage(message Message) {

	target := client.Server.findUserByID(message.Message)

	if target == nil {
		return
	}

	// create unique house name combined to the two IDs
	houseName := message.Message + client.ID.String()

	// Join house
	joinedHouse := client.joinHouse(houseName, target)

	// Invite target user
	if joinedHouse != nil {
		client.inviteTargetUser(target, joinedHouse)
	}

}

func (client *Client) joinHouse(houseName string, sender models.User) *House {

	house := client.Server.findHouseByName(houseName)
	if house == nil {
		house = client.Server.createHouse(houseName, sender != nil)
	}

	// Don't allow to join private houses through public house message
	if sender == nil && house.Private {
		return nil
	}

	if !client.isInHouse(house) {

		client.houses[house] = true
		house.register <- client

		client.notifyHouseJoined(house, sender)
	}

	fmt.Println(house)
	return house

}

func (client *Client) isInHouse(house *House) bool {
	if _, ok := client.houses[house]; ok {
		return true
	}

	return false
}

func (client *Client) inviteTargetUser(target models.User, house *House) {
	inviteMessage := &Message{
		Action:  JoinHousePrivateAction,
		Message: target.GetId(),
		House:   house,
		Sender:  client,
	}

	client.send <- inviteMessage.encode()

	// if err := config.Redis.Publish(ctx, PubSubGeneralChannel, inviteMessage.encode()).Err(); err != nil {
	// 	log.Println(err)
	// }
}

func (client *Client) notifyHouseJoined(house *House, sender models.User) {
	message := Message{
		Action: HouseJoinedAction,
		House:  house,
		Sender: sender,
	}

	client.send <- message.encode()
}

func (client *Client) GetName() string {
	return client.Name
}

func (client *Client) GetId() string {
	return client.ID.String()
}
