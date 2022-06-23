# Trucking Software Public API

## Initial Setup

```
npm install
```

## Run Dev Server

```
npm run dev
```

## Run Server

```
npm start
```

## Config

The following configuration options need to be set up inside of a file titled `.env` in the root project folder

- MONGODB_URL: Url to the mongodb instance
- PORT: Port to run the server on
- JWT_SECRET: Secret key that will be used whenever creating JWT
- JWT_EXPIRES: Timeframe that the `access_token` will remain valid
- JWT_REFRESH_EXPIRE: Timeframe that the `refresh_token` will remain valid
- STRIPE_SECRET_KEY: Secret key provided by stripe, unique to an acount
- STRIPE_WEBHOOK_SECRET: Secret key provided by stripe, given once a webhook route has been configured with Stripe.

## Data

(Listed in populating importance)

- User (503)
- Category (25)
- Article (1000)
- Article Comment (2000)
- Ticket (500: [450 assigned][50 unassigned])
- Ticket Message (500)
- Article View (2000)

**_If you would like, I have updated the `populate_db.js` script in the root directory of the project to populate the data with the above mentioned numbers for each model_**<br>
This can be run as follows:
`node populate_db.js`
