package com.baasllc.stripeintegrationms.service.interfaces;

import java.util.List;

import com.baasllc.stripeintegrationms.model.ChargeModel;

public interface ChargeServiceInterface {
    List<ChargeModel> getAllCharges();

    List<ChargeModel> getChargesByCustomerId(String customer_id);

    ChargeModel getChargeById(String charge_id);

    ChargeModel save(ChargeModel charge);
}
