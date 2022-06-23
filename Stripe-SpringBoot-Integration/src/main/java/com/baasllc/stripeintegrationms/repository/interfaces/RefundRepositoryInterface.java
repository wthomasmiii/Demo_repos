package com.baasllc.stripeintegrationms.repository.interfaces;

import java.util.List;

import com.baasllc.stripeintegrationms.model.RefundModel;

public interface RefundRepositoryInterface {
    List<RefundModel> getAllRefunds();

    List<RefundModel> getRefundsByChargeId(String charge_id);

    RefundModel getRefundById(String id);

    RefundModel saveRefund(RefundModel refund);
}
