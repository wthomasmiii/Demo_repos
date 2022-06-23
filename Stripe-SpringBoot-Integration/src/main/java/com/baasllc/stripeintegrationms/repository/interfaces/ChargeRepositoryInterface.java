package com.baasllc.stripeintegrationms.repository.interfaces;

import java.util.List;

import com.baasllc.stripeintegrationms.model.ChargeModel;

public interface ChargeRepositoryInterface {
    List<ChargeModel> getAllCharges();

    List<ChargeModel> getChargesByCustomer(String customer_id);

    ChargeModel getChargeById(String charge_id);

    ChargeModel saveCharge(ChargeModel charge);
}
