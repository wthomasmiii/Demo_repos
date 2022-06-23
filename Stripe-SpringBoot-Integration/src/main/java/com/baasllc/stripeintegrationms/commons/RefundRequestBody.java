package com.baasllc.stripeintegrationms.commons;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefundRequestBody {

    private String chargeId;
    private Long amount;
    private String reason;

}
