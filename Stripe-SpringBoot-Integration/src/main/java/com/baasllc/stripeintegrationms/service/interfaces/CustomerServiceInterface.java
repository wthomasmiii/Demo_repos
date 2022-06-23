package com.baasllc.stripeintegrationms.service.interfaces;

import java.util.List;

import com.baasllc.stripeintegrationms.model.CustomerModel;


public interface CustomerServiceInterface {
    List<CustomerModel> getAllCustomers();
    
    CustomerModel getCustomerByEmail(String email);

    CustomerModel getCustomerById(String id);

    CustomerModel save(CustomerModel customer);
}
