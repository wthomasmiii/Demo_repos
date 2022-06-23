package main

import (
	"encoding/json"
	"log"

	"bitbucket.org/morganmoreno/chat-app/models"
)

const SendMessageAction = "send-message"
const JoinRoomAction = "join-room"
const LeaveRoomAction = "leave-room"
const UserJoinedAction = "user-join"
const UserLeftAction = "user-left"
const JoinRoomPrivateAction = "join-room-private"
const JoinHousePrivateAction = "join-house-private"
const RoomJoinedAction = "room-joined"
const JoinHouseAction = "join-house"
const LeaveHouseAction = "leave-house"
const HouseJoinedAction = "house-joined"

type Message struct {
	Action  string      `json:"action"`
	Message string      `json:"message"`
	Room    *Room       `json:"room"`
	House   *House      `json:"house"`
	Sender  models.User `json:"sender"`
}

func (message *Message) encode() []byte {
	json, err := json.Marshal(message)
	if err != nil {
		log.Println(err)
	}

	return json
}

func (message *Message) UnmarshalJSON(data []byte) error {
	type Alias Message
	msg := &struct {
		Sender Client `json:"sender"`
		*Alias
	}{
		Alias: (*Alias)(message),
	}
	if err := json.Unmarshal(data, &msg); err != nil {
		log.Printf("error decoding sakura response: %v", err)
		if e, ok := err.(*json.SyntaxError); ok {
			log.Printf("syntax error at byte offset %d", e.Offset)
		}
		log.Printf("sakura response: %q", data)
		return err
	}
	message.Sender = &msg.Sender
	return nil
}
