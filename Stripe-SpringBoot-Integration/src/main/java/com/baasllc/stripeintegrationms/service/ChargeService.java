package com.baasllc.stripeintegrationms.service;

import java.util.List;

import com.baasllc.stripeintegrationms.model.ChargeModel;
import com.baasllc.stripeintegrationms.repository.ChargeRepository;
import com.baasllc.stripeintegrationms.service.interfaces.ChargeServiceInterface;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChargeService implements ChargeServiceInterface {
    
    @Autowired
    private ChargeRepository repository;

    @Override
    public List<ChargeModel> getAllCharges(){
        return repository.getAllCharges();
    };

    @Override
    public List<ChargeModel> getChargesByCustomerId(String customer_id){
        return repository.getChargesByCustomer(customer_id);
    };

    @Override
    public ChargeModel getChargeById(String charge_id){
        return repository.getChargeById(charge_id);
    }

    @Override
    public ChargeModel save(ChargeModel charge){
        return repository.saveCharge(charge);
    };
}
