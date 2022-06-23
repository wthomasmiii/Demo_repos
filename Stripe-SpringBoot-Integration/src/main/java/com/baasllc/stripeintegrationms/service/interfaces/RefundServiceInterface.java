package com.baasllc.stripeintegrationms.service.interfaces;

import java.util.List;

import com.baasllc.stripeintegrationms.model.RefundModel;

public interface RefundServiceInterface {

    List<RefundModel> getAllRefunds();
    
    List<RefundModel> getRefundsByChargeId(String charge_id);

    RefundModel getRefundById(String id);

    RefundModel save(RefundModel refund);
}
