package main

import (
	"encoding/json"
	"log"

	"bitbucket.org/morganmoreno/chat-app/config"

	"bitbucket.org/morganmoreno/chat-app/models"
	"github.com/google/uuid"
)

const PubSubGeneralChannel = "general"

type Server struct {
	users           []models.User
	clients         map[*Client]bool
	register        chan *Client
	unregister      chan *Client
	houses          map[*House]bool
	houseRepository models.HouseRepository
	userRepository  models.UserRepository
}

// NewWebsocketServer creates a new Server type
func NewServer(houseRepository models.HouseRepository, userRepository models.UserRepository) *Server {
	Server := &Server{
		clients:         make(map[*Client]bool),
		register:        make(chan *Client),
		unregister:      make(chan *Client),
		houses:          make(map[*House]bool),
		houseRepository: houseRepository,
		userRepository:  userRepository,
	}

	// Add users from database to server
	Server.users = userRepository.GetAllUsers()

	return Server
}

// Run our websocket server, accepting various requests
func (server *Server) Run() {

	// go server.listenPubSubChannel()
	for {
		select {

		case client := <-server.register:
			server.registerClient(client)

		case client := <-server.unregister:
			server.unregisterClient(client)
		}

	}
}

func (server *Server) registerClient(client *Client) {

	if user := server.findUserByID(client.ID.String()); user == nil {
		// Add user to the repo
		server.userRepository.AddUser(client)
	}

	// Publish user in PubSub
	// server.publishClientJoined(client)

	server.listOnlineClients(client)
	server.clients[client] = true
}

func (server *Server) unregisterClient(client *Client) {
	if _, ok := server.clients[client]; ok {
		delete(server.clients, client)

		// Publish user left in PubSub
		// server.publishClientLeft(client)
	}
}

func (server *Server) publishClientJoined(client *Client) {

	message := &Message{
		Action: UserJoinedAction,
		Sender: client,
	}

	if err := config.Redis.Publish(ctx, PubSubGeneralChannel, message.encode()).Err(); err != nil {
		log.Println(err)
	}
}

func (server *Server) publishClientLeft(client *Client) {

	message := &Message{
		Action: UserLeftAction,
		Sender: client,
	}

	if err := config.Redis.Publish(ctx, PubSubGeneralChannel, message.encode()).Err(); err != nil {
		log.Println(err)
	}
}

func (server *Server) listenPubSubChannel() {

	pubsub := config.Redis.Subscribe(ctx, PubSubGeneralChannel)

	ch := pubsub.Channel()

	for msg := range ch {

		var message Message
		if err := json.Unmarshal([]byte(msg.Payload), &message); err != nil {
			log.Printf("Error on unmarshal JSON message %s", err)
			return
		}

		switch message.Action {
		case UserJoinedAction:
			server.handleUserJoined(message)
		case UserLeftAction:
			server.handleUserLeft(message)
		case JoinHousePrivateAction:
			server.handleUserJoinPrivate(message)
		}

	}
}

func (server *Server) handleUserJoined(message Message) {
	// Add the user to the slice
	server.users = append(server.users, message.Sender)
	server.broadcastToClients(message.encode())
}

func (server *Server) handleUserLeft(message Message) {
	// Remove first occurrence of the user from the slice
	for i, user := range server.users {
		if user.GetId() == message.Sender.GetId() {
			server.users[i] = server.users[len(server.users)-1]
			server.users = server.users[:len(server.users)-1]
			break
		}
	}

	server.broadcastToClients(message.encode())
}

func (server *Server) handleUserJoinPrivate(message Message) {
	// Find client for given user, if found add the user to the house.
	targetClients := server.findClientsByID(message.Message)
	for _, targetClient := range targetClients {
		targetClient.joinHouse(message.House.GetName(), message.Sender)
	}
}

func (server *Server) listOnlineClients(client *Client) {
	var uniqueUsers = make(map[string]bool)
	for _, user := range server.users {
		if ok := uniqueUsers[user.GetId()]; !ok {
			message := &Message{
				Action: UserJoinedAction,
				Sender: user,
			}
			uniqueUsers[user.GetId()] = true
			client.send <- message.encode()
		}
	}
}

func (server *Server) broadcastToClients(message []byte) {
	for client := range server.clients {
		client.send <- message
	}
}

func (server *Server) findHouseByName(name string) *House {
	var foundHouse *House
	for house := range server.houses {
		if house.GetName() == name {
			foundHouse = house
			break
		}
	}

	if foundHouse == nil {
		// Try to run the house from the repository, if it is found.
		foundHouse = server.runHouseFromRepository(name)
	}

	return foundHouse
}

func (server *Server) runHouseFromRepository(name string) *House {
	var house *House
	dbHouse := server.houseRepository.FindHouseByName(name)
	if dbHouse != nil {
		house = NewHouse(dbHouse.GetName(), dbHouse.GetPrivate())
		house.ID, _ = uuid.Parse(dbHouse.GetId())

		go house.RunHouse()
		server.houses[house] = true
	}

	return house
}

func (server *Server) findHouseByID(ID string) *House {
	var foundHouse *House
	for house := range server.houses {
		if house.GetId() == ID {
			foundHouse = house
			break
		}
	}

	return foundHouse
}

func (server *Server) createHouse(name string, private bool) *House {
	house := NewHouse(name, private)
	server.houseRepository.AddHouse(house)

	go house.RunHouse()
	server.houses[house] = true

	return house
}

func (server *Server) findUserByID(ID string) models.User {
	var foundUser models.User
	for _, client := range server.users {
		if client.GetId() == ID {
			foundUser = client
			break
		}
	}

	return foundUser
}

func (server *Server) findClientsByID(ID string) []*Client {
	var foundClients []*Client
	for client := range server.clients {
		if client.GetId() == ID {
			foundClients = append(foundClients, client)
		}
	}

	return foundClients
}
