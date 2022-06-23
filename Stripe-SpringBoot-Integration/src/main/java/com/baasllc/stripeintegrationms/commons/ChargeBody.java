package com.baasllc.stripeintegrationms.commons;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChargeBody {
    private Long amount;
    private String currency;
    private String customerEmail;    
    private String sourceToken;

    public ChargeBody(Long amount, String currency, String customerEmail){
        this.amount = amount;
        this.currency = currency;
        this.customerEmail = customerEmail;
    };
}
