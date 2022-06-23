package main

import (
	"fmt"

	"github.com/google/uuid"
)

type House struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message
	rooms      map[*Room]bool
	Private    bool `json:"private"`
}

// NewHouse creates a new House
func NewHouse(name string, private bool) *House {
	return &House{
		ID:         uuid.New(),
		Name:       name,
		clients:    make(map[*Client]bool),
		rooms:      make(map[*Room]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *Message),
		Private:    private,
	}
}

// RunHouse runs our house, accepting various requests
func (house *House) RunHouse() {
	for {
		select {
		case client := <-house.register:
			house.registerClientInHouse(client)
		case client := <-house.unregister:
			house.unregisterClientInHouse(client)
		case message := <-house.broadcast:
			house.broadcastToClientsInHouse(message.encode())
		}
	}
}

// Creates a room
func (house *House) createRoom(name string, private bool) *Room {
	room := NewRoom(name, private)
	go room.RunRoom()
	house.rooms[room] = true

	return room
}

// Gets house ID
func (house *House) GetId() string {
	return house.ID.String()
}

// Gets house name
func (house *House) GetName() string {
	return house.Name
}

// Gets house privateness
func (house *House) GetPrivate() bool {
	return house.Private
}

// Registers client to a house
func (house *House) registerClientInHouse(client *Client) {
	house.notifyClientJoinedInHouse(client)
	house.clients[client] = true
}

// Unregisters client from a house
func (house *House) unregisterClientInHouse(client *Client) {
	if _, ok := house.clients[client]; ok {
		delete(house.clients, client)
	}
}

// Broadcasts message to clients in a house
func (house *House) broadcastToClientsInHouse(message []byte) {
	for client := range house.clients {
		client.send <- message
	}
}

// Notify clients that new client has joined
func (house *House) notifyClientJoinedInHouse(client *Client) {
	message := &Message{
		Action:  SendMessageAction,
		House:   house,
		Message: fmt.Sprintf(welcomeMessage, client.GetName()),
	}

	house.broadcastToClientsInHouse(message.encode())
}

// Broadcasts message to all clients
// func (server *Server) broadcastToClients(message []byte) {
// 	for client := range server.clients {
// 		client.send <- message
// 	}
// }
