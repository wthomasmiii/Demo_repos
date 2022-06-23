# Stripe Integration Microservice

## Installation

Not entirely sure how local installation of this projects works honestly. I do know when I was getting set up that I needed to ensure that Gradle was installed on my machine.

## Running

```bash
$ ./gradlew bootRun
```

## Controllers

---

### Stripe Controller

[Link](src/main/java/com/baasllc/stripeintegrationms/controller/StripeController.java)

- `/api/stripe/create-customer`

  - Description: Interacts with the Stripe API to create a new customer object and saves relevant fields to our database
  - Request Method: POST
  - Request Body:

    - address:
      - lineOne: string
      - lineTwo: string
      - city: string
      - state: string
      - country: string
      - postalCode: string
    - email: string
    - name: string
    - phone: string

- `/api/stripe/update-customer/{customerId}`

  - Description: Interacts with the Stripe API to update an existing customer and updates relevant fields in our database
  - Request Method: PATCH
  - Request Body:
    - address:
      - lineOne: string
      - lineTwo: string
      - city: string
      - state: string
      - country: string
      - postalCode: string
    - email: string
    - name: string
    - phone: string

- `/api/stripe/create-payment-intent`

  - Description: Interact with the Stripe API to create a new payment intent and return the identifying client_secret to the client
  - Request Method: POST
  - Request Body:
    - amount: Long `(NOTE: Stripe reads amounts as cents, so 500 represents a purchase of $5.00 )`
    - currency: string `(NOTE: Valid 3-digit currency code. "usd")`

- `/api/stripe/create-charge`

  - Description: Interact with Stripe API to create and process a new charge and save relevant information to our database
  - Request Method: POST
  - Request Body:
    - amount: Long `(NOTE: Stripe reads amounts as cents, so 500 represents a purchase of $5.00 )`
    - currency: String `(NOTE: Valid 3-digit currency code. "usd")`
    - customerEmail: String
    - sourceToken: String `(NOTE: This token is created by Stripe.js on the frontend, the way the api is set up currently is that this is not needed in the body. I have the logic to create a token for a test card inside of this controller method )`

- `/api/stripe/create-refund-request`

  - Description: Interact with Stripe API to create a new refund request for a specific charge and save relevant information to our database
  - Request Method: POST
  - Request Body:
    - chargeId: String `(NOTE: StripeId for the charge this refund applies to)`
    - amount: Long `(NOTE: Stripe reads amounts as cents, so 500 represents a purchase of $5.00 )`
    - reason: "fraudulent" | "duplicate" | "requested_by_customer"

- `/api/stripe/get-customer-transactions`
  - Description: Interact with Stripe API to fetch all transactions that pertain to a specific customer
  - Request Method: POST
  - Request Body:
    - customerEmail: string
    - endingBefore: string `(NOTE: This is the stripeId of the object that the query should end before )`
    - limit: string `(NOTE: The limit of transactions to return. Between 1 and 100, default is 10 )`
    - startingAfter: string `(NOTE: This is the stripeId of the object that the query should start after )`

---

### Customer Controller

[Link](src/main/java/com/baasllc/stripeintegrationms/controller/CustomerController.java)

- `/api/customers`

  - Description: Get all customer documents from the database
  - Request Method: GET

- `/api/customers/{customerId}`
  - Description: Get a single customer from the database by mongoId
  - Request Method: GET
  - Request Params:
    - customerId: string

---

### Refund Controller

[Link](src/main/java/com/baasllc/stripeintegrationms/controller/RefundController.java)

- `/api/refunds`

  - Description: Get all refunds from the database
  - Request Method: GET

- `/api/refunds/{refundId}`

  - Description: Get a single refund from the database by mongoId
  - Request Method: GET
  - Request Params:
    - refundId: string

- `/api/refunds/byCharge/{chargeId}`
  - Description: Get all refunds that are associated to a single charge
  - Request Method: GET
  - Request Params:
    - chargeId: string

---

### Charge Controller

[Link](src/main/java/com/baasllc/stripeintegrationms/controller/ChargeController.java)

- `/api/charges`

  - Description: Get all charges from the database
  - Request Method: GET

- `/api/charges/{chargeId}`

  - Description: Get a single charge from the database by mongoId
  - Request Method: GET
  - Request Params:
    - chargeId: string

- `/api/charges/byCustomer/{customerId}`
  - Description: Get all charges pertaining to a single customer
  - Request Method: GET
  - Request Params:
    - customerId: string

---
