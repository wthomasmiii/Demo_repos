package repository

import (
	"database/sql"

	"bitbucket.org/morganmoreno/chat-app/models"
)

type House struct {
	Id      string
	Name    string
	Private bool
}

func (house *House) GetId() string {
	return house.Id
}

func (house *House) GetName() string {
	return house.Name
}

func (house *House) GetPrivate() bool {
	return house.Private
}

type HouseRepository struct {
	Db *sql.DB
}

func (repo *HouseRepository) AddHouse(house models.House) {
	stmt, err := repo.Db.Prepare("INSERT INTO house(id, name, private) values(?,?,?)")
	checkErr(err)

	_, err = stmt.Exec(house.GetId(), house.GetName(), house.GetPrivate())
	checkErr(err)
}

func (repo *HouseRepository) FindHouseByName(name string) models.House {

	row := repo.Db.QueryRow("SELECT id, name, private FROM house where name = ? LIMIT 1", name)

	var house House

	if err := row.Scan(&house.Id, &house.Name, &house.Private); err != nil {
		if err == sql.ErrNoRows {
			return nil
		}
		panic(err)
	}

	return &house

}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
