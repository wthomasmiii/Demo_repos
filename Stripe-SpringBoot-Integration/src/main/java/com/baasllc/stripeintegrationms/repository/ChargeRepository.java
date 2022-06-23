package com.baasllc.stripeintegrationms.repository;

import com.baasllc.stripeintegrationms.repository.interfaces.ChargeRepositoryInterface;
import com.baasllc.stripeintegrationms.model.ChargeModel;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

@Repository
public class ChargeRepository implements ChargeRepositoryInterface {
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<ChargeModel> getAllCharges(){
        Query query = new Query();

        return mongoTemplate.find(query, ChargeModel.class);
    };

    @Override
    public List<ChargeModel> getChargesByCustomer(String customer_id){
        // Initialize query object
        Query query = new Query();

        // Add criteria to the created query
        query.addCriteria(Criteria.where("customer.id").is(customer_id));

        // Return the result of the query
        return mongoTemplate.find(query, ChargeModel.class);
    };

    @Override
    public ChargeModel getChargeById(String charge_id){
        return mongoTemplate.findById(charge_id, ChargeModel.class);
    };

    @Override
    public ChargeModel saveCharge(ChargeModel charge){
        return mongoTemplate.save(charge, "charges");
    };
}
