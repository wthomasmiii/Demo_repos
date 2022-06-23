# README #

This README would normally document whatever steps are necessary to get your application up and running.

### Set Up
* Run `go build .` after cloning
* To Run Server: Run `chat.exe` in terminal if on Windows or `./chat` if on Mac
* To Run Client: If on Windows, enable Telnet Client from Programs and Features
    Run `telnet localhost 8888` to connect to server

### Commands
#### Must run after have server and client running and connected
* /nick NAME - change client's name
* /join ROOM - join room of name ROOM or creates if not created
* /msg MSG - messages MSG when in room
* /rooms - lists rooms available
* /quit - quits the client