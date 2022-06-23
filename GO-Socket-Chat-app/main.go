package main

import (
	"context"
	"flag"
	"log"
	"net/http"

	"bitbucket.org/morganmoreno/chat-app/auth"
	"bitbucket.org/morganmoreno/chat-app/config"
	"bitbucket.org/morganmoreno/chat-app/repository"
)

var addr = flag.String("addr", ":8080", "http server address")
var ctx = context.Background()

func main() {
	flag.Parse()

	// config.CreateRedisClient()
	db := config.InitDB()
	defer db.Close()

	userRepository := &repository.UserRepository{Db: db}

	wsServer := NewServer(&repository.HouseRepository{Db: db}, userRepository)
	go wsServer.Run()

	api := &API{UserRepository: userRepository}

	http.HandleFunc("/ws", auth.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")

		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		ServeWs(wsServer, w, r)
	}))

	http.HandleFunc("/api/login", api.HandleLogin)

	fs := http.FileServer(http.Dir("./public"))
	http.Handle("/", fs)

	log.Fatal(http.ListenAndServe("localhost:8080", nil))
}
