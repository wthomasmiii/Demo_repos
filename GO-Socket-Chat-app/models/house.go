package models

type House interface {
	GetId() string
	GetName() string
	GetPrivate() bool
}

type HouseRepository interface {
	AddHouse(house House)
	FindHouseByName(name string) House
}
