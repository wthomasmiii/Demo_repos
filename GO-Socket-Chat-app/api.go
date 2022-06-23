package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"bitbucket.org/morganmoreno/chat-app/auth"
	"bitbucket.org/morganmoreno/chat-app/repository"
	"github.com/google/uuid"
)

type LoginUser struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type API struct {
	UserRepository *repository.UserRepository
}

func (api *API) HandleLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	var user LoginUser

	// Try to decode the JSON request to a LoginUser
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Find the user in the database by username
	fmt.Print(user)
	dbUser := api.UserRepository.FindUserByUsername(user.Username)
	if dbUser == nil {
		fmt.Print("user not found")
		password, _ := auth.GeneratePassword(user.Password)

		newUser := repository.User{
			Name:     user.Username,
			Username: user.Username,
			Password: password,
			Id:       uuid.New().String(),
		}
		fmt.Print(newUser)
		api.UserRepository.AddNewUser(&newUser)
		token, err := auth.CreateJWTToken(&newUser)

		if err != nil {
			returnErrorResponse(w)
			return
		}

		w.Write([]byte(token))
		fmt.Print("New user added")
		return
	}

	// Check if the passwords match
	ok, err := auth.ComparePassword(user.Password, dbUser.Password)

	if !ok || err != nil {
		returnErrorResponse(w)
		return
	}

	// Create a JWT
	token, err := auth.CreateJWTToken(dbUser)

	if err != nil {
		returnErrorResponse(w)
		return
	}

	w.Write([]byte(token))

}

func returnErrorResponse(w http.ResponseWriter) {

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("{\"status\": \"error\"}"))
}
