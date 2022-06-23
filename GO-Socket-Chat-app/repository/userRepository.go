package repository

import (
	"database/sql"
	"fmt"
	"log"

	"bitbucket.org/morganmoreno/chat-app/models"
)

type User struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func (user *User) GetId() string {
	return user.Id
}

func (user *User) GetName() string {
	return user.Name
}

func (user *User) GetUserName() string {
	return user.Username
}
func (user *User) GetPassword() string {
	return user.Password
}

type UserRepository struct {
	Db *sql.DB
}

func (repo *UserRepository) AddUser(user models.User) {
	stmt, err := repo.Db.Prepare("INSERT INTO user(id, name) values(?,?)")
	checkErr(err)

	_, err = stmt.Exec(user.GetId(), user.GetName())
	checkErr(err)
}
func (repo *UserRepository) AddNewUser(user models.NewUser) {
	stmt, err := repo.Db.Prepare("INSERT INTO user(id, name, username, password) values(?,?,?,?)")
	checkErr(err)

	_, err = stmt.Exec(user.GetId(), user.GetName(), user.GetUserName(), user.GetPassword())
	checkErr(err)
}

func (repo *UserRepository) RemoveUser(user models.User) {
	stmt, err := repo.Db.Prepare("DELETE FROM user WHERE id = ?")
	checkErr(err)

	_, err = stmt.Exec(user.GetId())
	checkErr(err)
}

func (repo *UserRepository) FindUserById(ID string) models.User {

	row := repo.Db.QueryRow("SELECT id, name FROM user where id = ? LIMIT 1", ID)

	var user User

	if err := row.Scan(&user.Id, &user.Name); err != nil {
		if err == sql.ErrNoRows {
			return nil
		}
		panic(err)
	}

	return &user

}

func (repo *UserRepository) GetAllUsers() []models.User {

	rows, err := repo.Db.Query("SELECT id, name FROM user")

	if err != nil {
		log.Fatal(err)
	}
	var users []models.User
	defer rows.Close()
	for rows.Next() {
		var user User
		rows.Scan(&user.Id, &user.Name)
		users = append(users, &user)
	}

	return users
}

func (repo *UserRepository) FindUserByUsername(username string) *User {

	row := repo.Db.QueryRow("SELECT id, name, username, password FROM user where name = ? LIMIT 1", username)
	var user User

	if err := row.Scan(&user.Id, &user.Name, &user.Username, &user.Password); err != nil {
		fmt.Print(user)
		if err == sql.ErrNoRows {
			return nil
		}
		return nil
		// panic(err)
	}

	return &user

}
