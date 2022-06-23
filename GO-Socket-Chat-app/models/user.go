package models

type User interface {
	GetId() string
	GetName() string
}

type NewUser interface {
	GetId() string
	GetName() string
	GetPassword() string
	GetUserName() string
}

type UserRepository interface {
	AddUser(user User)
	AddNewUser(user NewUser)
	RemoveUser(user User)
	FindUserById(ID string) User
	GetAllUsers() []User
}
