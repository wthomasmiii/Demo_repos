package com.baasllc.stripeintegrationms.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.baasllc.stripeintegrationms.commons.CustomAddress;
import com.baasllc.stripeintegrationms.commons.ChargeBody;
import com.baasllc.stripeintegrationms.commons.CustomerBody;
import com.baasllc.stripeintegrationms.commons.CustomerTransaction;
import com.baasllc.stripeintegrationms.commons.GetCustomerTransactionsBody;
import com.baasllc.stripeintegrationms.commons.PaymentIntentBody;
import com.baasllc.stripeintegrationms.commons.RefundRequestBody;
import com.baasllc.stripeintegrationms.commons.Response;
import com.baasllc.stripeintegrationms.model.ChargeModel;
import com.baasllc.stripeintegrationms.model.CustomerModel;
import com.baasllc.stripeintegrationms.model.RefundModel;
import com.baasllc.stripeintegrationms.service.ChargeService;
import com.baasllc.stripeintegrationms.service.CustomerService;
import com.baasllc.stripeintegrationms.service.RefundService;
import com.baasllc.stripeintegrationms.service.StripeService;
import com.stripe.Stripe;
import com.stripe.model.Charge;
import com.stripe.model.Customer;
import com.stripe.model.CustomerBalanceTransactionCollection;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.Token;
import com.stripe.param.RefundCreateParams.Reason;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stripe")
public class StripeController {
    
    @Value("${stripe.keys.public}")
    private String API_PUBLIC_KEY;

    private StripeService stripeService;
    private CustomerService customerService;
    private ChargeService chargeService;
    private RefundService refundService;

    public StripeController(StripeService stripeService, CustomerService customerService, ChargeService chargeService, RefundService refundService){
        this.stripeService = stripeService;
        this.customerService = customerService;
        this.chargeService = chargeService;
        this.refundService = refundService;
    }

    /**
     * @method POST /api/stripe/create-customer
     * @description Create a new customer with stripe and save relevant information to our database
     * @access Public
     * 
     * @param body {@link com.baasllc.stripeintegrationms.commons.CustomerBody}
     * @return Response object with the newly created mongodb customer document
     */
    @PostMapping("/create-customer")
    public @ResponseBody ResponseEntity<Response> createCustomer(@RequestBody CustomerBody body){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        // Attempt to interact with Stripe API to create a new customer
        Customer customer = null;
        try {
            customer = stripeService.createCustomer(body.getAddress(), body.getEmail(), body.getName(), body.getPhone());
        }catch(Exception ex){
            // Construct and return failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while creating customer with Stripe API", responseData));
        };

        // Save information needed from customer to database
        // Create new customer with fields from the Stripe Customer object
        CustomerModel new_customer = new CustomerModel();
        new_customer.setId(ObjectId.get().toHexString());
        new_customer.setEmail(customer.getEmail());
        new_customer.setAddress(customer.getAddress());
        new_customer.setPhone(customer.getPhone());
        new_customer.setName(customer.getName());
        new_customer.setStripeId(customer.getId());

        // Attempt to save the new customer to the database
        try {
            new_customer = customerService.save(new_customer);
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct and return failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while saving customer to the database", responseData));
        }

        // Construct and return successful response
        responseData.put("customer", new_customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(new Response(true, "Successfully created customer", responseData));
    };

    /**
     * @method PATCH /api/stripe/update-customer/{customerId}
     * @description Update an existing customer with stripe and update the corresponding mongodb document to reflect changes
     * @access Public | Auth
     * 
     * @param customerId The mongodb id of the customer that is to be updated
     * @param body {@link com.baasllc.stripeintegrationms.commons.CustomerBody}
     * @return Response object containing the newly updated mongodb Customer document
     */
    @PatchMapping("/update-customer/{customerId}")
    public @ResponseBody ResponseEntity<Response> updateCustomer(@PathVariable String customerId, @RequestBody CustomerBody body){
      // Initialize response data
      HashMap<String, Object> responseData = new HashMap<String, Object>();
      
      // Attempt to get the customer from our database
      CustomerModel customer = null;
      try {
        customer = customerService.getCustomerById(customerId);
      }catch(Exception ex){
        ex.printStackTrace();

        // Construct and return failed response
        responseData.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred fetching customer from the database", responseData));
      };

      // Attempt to update the customer with Stripe API
      Customer stripe_customer = null;
      try {
        stripe_customer = stripeService.updateCustomer(customer.getStripeId(), body.getAddress(), body.getEmail(), body.getName(), body.getPhone());
      }catch(Exception ex){
        // I am not printing the stack trace in this catch block because in the stripeService methods whenever a method catches, it already prints the stack.
        // Construct and return failed response
        responseData.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Response(false, "Error occurred while interacting with Stripe API", responseData));
      }

      System.out.println(stripe_customer);

      // Attempt to update the customer in our database
      try {
        customer.setAddress(stripe_customer.getAddress());
        customer.setEmail(stripe_customer.getEmail());
        customer.setName(stripe_customer.getName());
        customer.setPhone(stripe_customer.getPhone());

        System.out.println(customer);

        customer = customerService.save(customer);
      }catch(Exception ex){
        ex.printStackTrace();

        // Construct and return failed response
        responseData.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while updating customer in our database", responseData));
      }

      
      // Construct and return successful response
      responseData.put("customer", customer);
      return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully updated customer", responseData));
    };

    /**
     * @method POST /api/stripe/create-payment-intent
     * @description Create a payment intent with stripe and save relevant information to our database
     * @access Public | Auth 
     * 
     * @param body {@link com.baasllc.stripeintegrationms.commons.PaymentIntentBody}
     * @return Response object with the newly created mongodb PaymentIntent document
     */
    @PostMapping("/create-payment-intent")
    public @ResponseBody ResponseEntity<Response> createPaymentIntent(@RequestBody PaymentIntentBody body){
      // Initialize response data
      HashMap<String, Object> responseData = new HashMap<String, Object>();

      // Attempt to create new Payment Intent with Stripe API
      PaymentIntent intent = null;
      try {
        intent = stripeService.createPaymentIntent(body.getAmount(), body.getCurrency());
      }catch(Exception ex){
        // Construct and return failed response
        responseData.put("error", ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while creating payment intent with Stripe API", responseData));
      };

      // Save information needed from payment intent to database

      // Construct and return successful response
      responseData.put("client_secret", intent.getClientSecret());      
      return ResponseEntity.status(HttpStatus.CREATED).body(new Response(true, "Successfully created payment intent", responseData));
    };

    /**
     * POST /api/public/create-charge
     * Accept a card payment from a customer
     * 
     * @param body {@link com.baasllc.stripeintegrationms.commons.ChargeBody}
     * @return A response object with the charge object returned from Stripe
     */
    @PostMapping("/create-charge")
    public @ResponseBody ResponseEntity<Response> createCharge(@RequestBody ChargeBody body){
        
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        // User the customer_email to find customer information from the database
        CustomerModel customer = customerService.getCustomerByEmail(body.getCustomerEmail());

        // Check if a customer not found
        if(customer == null){
            // If customer was not found, create a new customer with stripe
            Customer stripe_customer = stripeService.createCustomer(new CustomAddress(), body.getCustomerEmail(), null, null);

            // Then create a new customer with our database
            CustomerModel new_customer = new CustomerModel();
            new_customer.setId(ObjectId.get().toHexString());
            new_customer.setEmail(stripe_customer.getEmail());
            new_customer.setName(stripe_customer.getName());
            new_customer.setStripeId(stripe_customer.getId());
            customer = customerService.save(new_customer);
        };

        // Initialize charge object
        Charge stripe_charge = null;

        // Send create Charge request to Stripe
        try {
            Stripe.apiKey = API_PUBLIC_KEY;
            /****  THIS IS FOR DEVELOPMENT PURPOSES. THIS LOGIC WILL BE HANDLED ON THE FRONTEND. ****/
            HashMap<String, Object> card = new HashMap<String, Object>();
            card.put("number", "4242424242424242");
            card.put("exp_month", 5);
            card.put("exp_year", 2022);
            card.put("cvc", "314");

            HashMap<String, Object> params = new HashMap<String, Object>();
            params.put("card", card);

            Token token = Token.create(params);
            /***************************************************************************************/

            // REPLACE TOKEN WITH THE TOKEN FROM THE BODY.
            stripe_charge = stripeService.createCharge(body.getAmount(), body.getCurrency(), body.getCustomerEmail(), token.getId());
        }catch(Exception ex){
            // Construct and return failed response
            responseData.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while creating charge with Stripe API", responseData));
        };

        // Extract relevant information from stripe_charge
        ChargeModel charge = new ChargeModel();
        charge.setId(ObjectId.get().toHexString());
        charge.setAmount(stripe_charge.getAmount());
        charge.setCreated(stripe_charge.getCreated());
        charge.setCurrency(stripe_charge.getCurrency());
        charge.setReceiptEmail(stripe_charge.getReceiptEmail());
        charge.setStatus(stripe_charge.getStatus());
        charge.setStripeId(stripe_charge.getId());
        charge.setCustomer(customer);

        // Attempt to save the new charge object to our database
        try {
            charge = chargeService.save(charge);
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct and return failed response
            responseData.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while saving charge to the database", responseData));
        };
        
        // Construct and return successful response
        responseData.put("charge", charge);
        return ResponseEntity.status(HttpStatus.CREATED).body(new Response(true, "Successfully created charge", responseData));

    };

    /**
     * POST /api/stripe/create-refund-request
     * Create a refund request for a specific charge on behalf of a customer
     * 
     * @param body {@link com.baasllc.stripeintegrationms.commons.RefundRequestBody}
     * @return Repsonse object with a custom refund object containing relevant fields from the newly created Refund object returned from Stripe
     */
    @PostMapping("/create-refund-request")
    public @ResponseBody ResponseEntity<Response> createRefundRequest(@RequestBody RefundRequestBody body){
        // Initialize return data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        Charge stripe_charge = null;
        Refund stripe_refund = null;
        Reason refund_reason = null;
        try {
            // Interact with Stripe API to attempt to create a refund object
            String reason = body.getReason();

            if(reason == "fraudulent"){
                refund_reason = Reason.FRAUDULENT;
            }else if(reason == "duplicate"){
                refund_reason = Reason.DUPLICATE;
            }else{
                refund_reason = Reason.REQUESTED_BY_CUSTOMER;
            };

            stripe_refund = stripeService.createRefund(body.getChargeId(), body.getAmount(), refund_reason);
            stripe_charge = Charge.retrieve(body.getChargeId());

        }catch(Exception ex){
            // Construct and return failed response
            responseData.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while creating refund with Stripe API", responseData));
        }

        System.out.println("*** Stripe Charge ***");
        System.out.println(stripe_charge);
        System.out.println("*** Receipt Email ***");
        System.out.println(stripe_charge.getReceiptEmail());

        // Construct a new Refund Document
        RefundModel refund = new RefundModel();
        refund.setId(ObjectId.get().toHexString());
        refund.setAmount(stripe_refund.getAmount());
        refund.setChargeId(stripe_refund.getCharge());
        refund.setCreated(stripe_refund.getCreated());
        refund.setCurrency(stripe_refund.getCurrency());
        refund.setReason(stripe_refund.getReason());
        refund.setStatus(stripe_refund.getStatus());
        refund.setStripeId(stripe_refund.getId());

        // Attempt to save new refund document to the database
        try {
            // Find the related customer document to save a reference to it within the refund document
            CustomerModel customer = customerService.getCustomerByEmail(stripe_charge.getReceiptEmail());

            if(!customer.equals(null)){
                refund.setCustomer(customer);
            }
            
            refund = refundService.save(refund);
        }catch(Exception ex){
            System.out.println("*** Error Saving Refund to DB ***");
            System.out.println("*** Error Message ***");
            System.out.println(ex.getMessage());
            
            ex.printStackTrace();

            // Construct and send failed response
            responseData.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while saving refund to the database", responseData));
        };

        // Construct and return successful response
        responseData.put("refund", refund);
        return ResponseEntity.status(HttpStatus.CREATED).body(new Response(true, "Successfully created refund", responseData));
    };

        /**
     * POST /api/stripe/get-customer-transactions
     * Get all transactions related to a specific customer
     * 
     * @param body {@link com.baasllc.stripeintegrationms.commons.GetCustomerTransactionsBody}
     * @return Response object ith the transactions returned from Stripe
     */
    @PostMapping("/get-customer-transactions")
    public @ResponseBody ResponseEntity<Response> getTransactions(@RequestBody GetCustomerTransactionsBody body){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();
        List<String> transactions = new ArrayList<String>();

        // Get the customer from the database by email
        CustomerModel customer = customerService.getCustomerByEmail(body.getCustomerEmail());

        // Check if customer exists
        if(customer == null){
            // If customer is null
            // Construct and return failed response
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(new Response(false, "Customer with email " + body.getCustomerEmail() + " does not exist"));
        };

        // If customer does exist
        Customer stripe_customer = null;
        CustomerBalanceTransactionCollection  stripe_transactions = null;
        try {
            // Attempt to retrieve the customer from the Stripe API
            stripe_customer = stripeService.getCustomer(customer.getStripeId());

            // Construct a params object for the balance transactions request
            HashMap<String, Object> params = new HashMap<String, Object>();
            params.put("limit", 10);

            stripe_transactions = stripeService.getCustomerTransactions(stripe_customer, params);
        }catch(Exception ex){
            ex.printStackTrace();
            // Construct and return failed response
            responseData.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching transactions from Stripe API", responseData));
        };
        System.out.println("*** STRIPE TRANSACTIONS ***");
        System.out.println(stripe_transactions);

        // Extract relevant fields from the stripe_transactions into custom transaction objects and add them to a list
        stripe_transactions.autoPagingIterable().forEach((transaction) -> {
            CustomerTransaction new_transaction = new CustomerTransaction(transaction.getId(), transaction.getAmount(), transaction.getCreated(), transaction.getType(), transaction.getCurrency(), transaction.getInvoice());

            transactions.add(new_transaction.toJson());
        });

        // Construct and return success response
        responseData.put("transactions", transactions);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved transactions", responseData));
    };
}
