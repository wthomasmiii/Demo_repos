package com.baasllc.stripeintegrationms.controller;

import java.util.HashMap;
import java.util.List;

import com.baasllc.stripeintegrationms.commons.Response;
import com.baasllc.stripeintegrationms.model.CustomerModel;
import com.baasllc.stripeintegrationms.service.CustomerService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    
    private CustomerService customerService;

    public CustomerController(CustomerService customerService){
        this.customerService = customerService;
    };

    /**
     * GET /api/customers
     * Get all customers in the database
     * 
     * @return Response object with all customers found in the database
     */
    @GetMapping("")
    public @ResponseBody ResponseEntity<Response> getAllCustomers(){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        // Attempt to get all customers
        List<CustomerModel> customers = null;
        try {
            customers = customerService.getAllCustomers();
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct and return failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching customers from the database", responseData));
        };


        // Construct successful response
        responseData.put("customers", customers);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved customers", responseData));
    };

    /**
     * GET /api/customers/{customerId}
     * Get a single customer by mongoId
     * 
     * @param customerId The mongoId of the customer to search for
     * @return Response object with the found customer document
     */
    @GetMapping("/{customerId}")
    public @ResponseBody ResponseEntity<Response> getCustomerById(@PathVariable String customerId){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        // Attempt to find the customer
        CustomerModel customer = null;
        try {
            customer = customerService.getCustomerById(customerId);
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct and return failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching customer from the database", responseData));
        };

        // Construct successful response
        responseData.put("customer", customer);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved customer", responseData));
    };
}
