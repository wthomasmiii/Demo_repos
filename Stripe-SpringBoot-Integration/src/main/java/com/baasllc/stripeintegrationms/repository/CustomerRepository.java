package com.baasllc.stripeintegrationms.repository;

import java.util.List;

import com.baasllc.stripeintegrationms.model.CustomerModel;
import com.baasllc.stripeintegrationms.repository.interfaces.CustomerRepositoryInterface;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class CustomerRepository implements CustomerRepositoryInterface {
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<CustomerModel> getAllCustomers(){
        Query query = new Query();

        return mongoTemplate.find(query, CustomerModel.class);
    };

    @Override
    public CustomerModel getCustomerByEmail(String email) {
        // Create Query Object
        Query query = new Query();

        // Add Criteria to the Query object
        query.addCriteria(Criteria.where("email").is(email));

        // Return the result of a findOne query with the declared query object
        return mongoTemplate.findOne(query, CustomerModel.class);
    }

    @Override
    public CustomerModel getCustomerById(String id){
        return mongoTemplate.findById(id, CustomerModel.class);
    };

    @Override
    public CustomerModel saveCustomer(CustomerModel customer){
        // Save customer to the database and return
        return mongoTemplate.save(customer, "customers");
    };
}
