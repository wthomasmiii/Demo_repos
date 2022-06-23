package com.baasllc.stripeintegrationms.service;

import java.util.List;

import com.baasllc.stripeintegrationms.model.CustomerModel;
import com.baasllc.stripeintegrationms.repository.CustomerRepository;
import com.baasllc.stripeintegrationms.service.interfaces.CustomerServiceInterface;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerService implements CustomerServiceInterface {

    @Autowired 
    private CustomerRepository repository;

    @Override
    public List<CustomerModel> getAllCustomers(){
        return repository.getAllCustomers();
    };

    @Override
    public CustomerModel getCustomerByEmail(String email){
        return repository.getCustomerByEmail(email);
    };

    @Override
    public CustomerModel getCustomerById(String id){
        return repository.getCustomerById(id);
    };

    @Override
    public CustomerModel save(CustomerModel customer){
        return repository.saveCustomer(customer);
    };
    
};