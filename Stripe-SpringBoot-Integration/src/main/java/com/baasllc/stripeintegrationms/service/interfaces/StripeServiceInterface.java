package com.baasllc.stripeintegrationms.service.interfaces;


import java.util.HashMap;

import com.baasllc.stripeintegrationms.commons.CustomAddress;
import com.stripe.model.Charge;
import com.stripe.model.Customer;
import com.stripe.model.CustomerBalanceTransactionCollection;
import com.stripe.model.PaymentIntent;

public interface StripeServiceInterface {
    Customer createCustomer(CustomAddress address, String email, String name, String phone);
    Customer updateCustomer(String customer_id, CustomAddress address, String email, String name, String phone);
    Charge createCharge(Long amount, String currency, String customer_email, String source_token);
    PaymentIntent createPaymentIntent(Long amount, String currency);
    Customer getCustomer(String stripeId);
    CustomerBalanceTransactionCollection getCustomerTransactions(Customer customer, HashMap<String, Object> params);
}
