package com.baasllc.stripeintegrationms.service;

import java.util.HashMap;

import com.baasllc.stripeintegrationms.commons.CustomAddress;
import com.baasllc.stripeintegrationms.service.interfaces.StripeServiceInterface;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.model.Charge;
import com.stripe.model.Customer;
import com.stripe.model.CustomerBalanceTransactionCollection;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.ChargeCreateParams;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.RefundCreateParams.Reason;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
public class StripeService implements StripeServiceInterface {
    
    @Value("${stripe.keys.secret}")
    private String API_SECRET_KEY;

    public StripeService(){
    };

    /**
     * Interact with the Stripe Api to create a new customer
     * @param address Object that contains the customer's billing address information
     * @param name Name associated with the customer
     * @param phone Phone associated with the customer
     * @param email Email associated with the customer
     * @return The customer object that is returned from the Stripe Api
     */
    public Customer createCustomer(CustomAddress address, String email, String name, String phone){
        Customer customer = null;
        try {
            Stripe.apiKey = API_SECRET_KEY;
            // Create a Stripe Address object
            CustomerCreateParams.Address stripe_address = null;

            if(address.getLineTwo() == null){
                stripe_address = CustomerCreateParams.Address.builder()
                    .setCity(address.getCity())
                    .setCountry(address.getCountry())
                    .setLine1(address.getLineOne())
                    .setPostalCode(address.getPostalCode())
                    .setState(address.getState())
                    .build();                
            }else{
                stripe_address = CustomerCreateParams.Address.builder()
                    .setCity(address.getCity())
                    .setCountry(address.getCountry())
                    .setLine1(address.getLineOne())
                    .setLine2(address.getLineTwo())
                    .setPostalCode(address.getPostalCode())
                    .setState(address.getState())
                    .build();
            }

            // Create a Customer Params object
            CustomerCreateParams customerParams = CustomerCreateParams.builder()
                .setAddress(stripe_address)
                .setEmail(email)
                .setName(name)
                .setPhone(phone)
                .build();


            // Create a new customer
            customer = Customer.create(customerParams);
        }catch(Exception ex){
            ex.printStackTrace();
        };
        return customer;
    };

    /**
     * Interact with the Stripe Api to update an existing customer
     * @param customerId Stripe id of the customer that is being updated
     * @param address New value to set customer address to
     * @param email New value to set customer email to
     * @param name New value to set customer name to
     * @param phone New value to set customer phone to
     * @return The updated customer object returned from the Stripe Api
     */
    public Customer updateCustomer(String customerId, CustomAddress address, String email, String name, String phone){
        Customer customer = null;
        try {
            System.out.println(address.toString());
            System.out.println(email);
            System.out.println(name);
            System.out.println(phone);

            Stripe.apiKey = API_SECRET_KEY;

            // Fetch existing customer from Stripe Api
            customer = Customer.retrieve(customerId);

            // Build out new Address object
            CustomerUpdateParams.Address stripe_address = CustomerUpdateParams.Address.builder()
                .setCity(address.getCity())
                .setLine1(address.getLineOne())
                .setLine2(address.getLineTwo())
                .setCountry(address.getCountry())
                .setState(address.getState())
                .setPostalCode(address.getPostalCode())
                .build();

            // Build out the Update Customer Params
            CustomerUpdateParams params = CustomerUpdateParams.builder()
                .setAddress(stripe_address)
                .setEmail(email)
                .setName(name)
                .setPhone(phone)
                .build();

            // Send update request to Stripe Api
            customer = customer.update(params);
        }catch(StripeException ex){
            System.out.println("*** Stripe Exception: Status Code ***");
            System.out.println(ex.getStatusCode());
            System.out.println("*** Stripe Exception: Stripe Error ***");
            System.out.println(ex.getStripeError());
            System.out.println("*** Stripe Exception: Message ***");
            System.out.println(ex.getMessage());
            ex.printStackTrace();
        }

        return customer;
    };

    /**
     * Interact with the Stripe Api to generate a new charge object
     * @param amount The amount of the charge
     * @param currency The currency related to the amount of the charge
     * @param customerEmail The email of the customer to which the receipt will be sent
     * @param sourceToken Stripe.js generated token for the payment source to be used in this charge
     * @return A newly created Charge object
     */
    public Charge createCharge(Long amount, String currency, String customerEmail, String sourceToken){
        
        Charge charge = null;
        try {
            Stripe.apiKey = API_SECRET_KEY;
            // Build out the Charge Params object
            ChargeCreateParams chargeParams = ChargeCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .setReceiptEmail(customerEmail)
                .setSource(sourceToken)
                .build();
            
            // Create the Charge
            charge = Charge.create(chargeParams);
        }catch(Exception ex){
            ex.printStackTrace();
        };
        return charge;
    };


    /**
     * Interact with Stripe Api to generate a new PaymentIntent object
     * @param amount The amount of the payment intent
     * @param currency The currency related to the amount of the charge
     * @return A newly created PaymentIntent object
     */
    public PaymentIntent createPaymentIntent(Long amount, String currency){
        PaymentIntent payment_intent = null;

        try {
            Stripe.apiKey = API_SECRET_KEY;

            // Create a PaymentIntent Params Object
            PaymentIntentCreateParams paymentParams = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .build();

            // Create a PaymentIntent
            payment_intent = PaymentIntent.create(paymentParams);
        }catch(Exception ex){
            ex.printStackTrace();
        };
        
        return payment_intent;
    };

    /**
     * Interact with the Stripe API to create a new refund request on behalf of a customer
     * @param chargeId The id that stripe uses to identify a specific charge
     * @param amount The amount of the charge to refund
     * @param reason The reason for submitting this refund {@link com.stripe.param.RefundCreateParams.Reason}
     * @return The refund object that is returned from the Stripe API
     */
    public Refund createRefund(String chargeId, Long amount, Reason reason){
        Refund refund = null;
        try {
            Stripe.apiKey = API_SECRET_KEY;

            RefundCreateParams params = RefundCreateParams.builder()
                .setAmount(amount)
                .setCharge(chargeId)
                .setReason(reason)
                .build();

            refund = Refund.create(params);

        }catch(StripeException ex){
            ex.printStackTrace();
        }

        return refund;
    };

    /**
     * Interact with the Stripe API to retrieve a customer by their stripe id
     * @param stripeId The id that stripe uses to identify a specific customer
     * @return The customer object that is returned from the Stripe API
     */
    public Customer getCustomer(String stripeId){
        Customer customer = null;
        try {
            Stripe.apiKey = API_SECRET_KEY;

            customer = Customer.retrieve(stripeId);
        }catch(StripeException ex){
            System.out.println("*** Stripe Status Code ***");
            System.out.println(ex.getStatusCode());
            System.out.println("*** Stripe Message ***");
            System.out.println(ex.getMessage());
            ex.printStackTrace();
        };

        return customer;
    };

    /**
     * Interact with the Stripe API to retrieve a list of customer balance transactions
     * @param customer The stripe customer object that we are using to search for transactions
     * @param params A hashmap that contains the parameters for searching transactions:
     * - ending_before: The stripe id of the transaction to end the query before
     * - limit: The limit of objects that stripe will return. Between 1 and 100, defaults to 10.
     * - starting_after: The stripe id of the transaction to start the query after
     */
    public CustomerBalanceTransactionCollection getCustomerTransactions(Customer customer, HashMap<String, Object> params){
        CustomerBalanceTransactionCollection transactions = null;
        try {
            transactions = customer.balanceTransactions(params);
        }catch(StripeException ex){
            System.out.println("*** Stripe Status Code ***");
            System.out.println(ex.getStatusCode());
            System.out.println("*** Stripe Message ***");
            System.out.println(ex.getMessage());
            ex.printStackTrace();
        };
        return transactions;
    };

}
