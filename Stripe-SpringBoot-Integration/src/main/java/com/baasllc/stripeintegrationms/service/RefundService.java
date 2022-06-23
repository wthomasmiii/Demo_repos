package com.baasllc.stripeintegrationms.service;

import java.util.List;

import com.baasllc.stripeintegrationms.model.RefundModel;
import com.baasllc.stripeintegrationms.repository.RefundRepository;
import com.baasllc.stripeintegrationms.service.interfaces.RefundServiceInterface;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RefundService implements RefundServiceInterface {
    
    @Autowired
    private RefundRepository repository;

    @Override
    public List<RefundModel> getAllRefunds(){
        return repository.getAllRefunds();
    }

    @Override
    public List<RefundModel> getRefundsByChargeId(String charge_id){
        return repository.getRefundsByChargeId(charge_id);
    };

    @Override
    public RefundModel getRefundById(String id){
        return repository.getRefundById(id);
    };

    @Override
    public RefundModel save(RefundModel refund){
        return repository.saveRefund(refund);
    };
}
