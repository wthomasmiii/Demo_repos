package com.baasllc.stripeintegrationms.repository;

import java.util.List;

import com.baasllc.stripeintegrationms.model.RefundModel;
import com.baasllc.stripeintegrationms.repository.interfaces.RefundRepositoryInterface;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class RefundRepository implements RefundRepositoryInterface {
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<RefundModel> getAllRefunds(){
        Query query = new Query();

        return mongoTemplate.find(query, RefundModel.class);
    };

    @Override
    public List<RefundModel> getRefundsByChargeId(String charge_id){
        // Create Query object
        Query query = new Query();

        // Add Criteria to the Query object
        query.addCriteria(Criteria.where("chargeId").is(charge_id));

        // Return the result of a findOne query with the declared query object
        return mongoTemplate.find(query, RefundModel.class);
    };

    @Override
    public RefundModel getRefundById(String id){
        return mongoTemplate.findById(id, RefundModel.class);
    };

    @Override
    public RefundModel saveRefund(RefundModel refund){
        return mongoTemplate.save(refund, "refunds");
    };
}
