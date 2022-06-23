package com.baasllc.stripeintegrationms.repository.interfaces;

import java.util.List;

import com.baasllc.stripeintegrationms.model.CustomerModel;

public interface CustomerRepositoryInterface {
    List<CustomerModel> getAllCustomers();

    CustomerModel getCustomerByEmail(String email);

    CustomerModel getCustomerById(String id);

    CustomerModel saveCustomer(CustomerModel customer);
};
