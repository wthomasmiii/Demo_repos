package com.baasllc.stripeintegrationms.commons;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetCustomerTransactionsBody {
    
    private String customerEmail;
    private String endingBefore;
    private Long limit;
    private String startingAfter;

    public GetCustomerTransactionsBody(String customerEmail){
        this.customerEmail = customerEmail;
    }
    public GetCustomerTransactionsBody(String customerEmail, Long limit){
        this.customerEmail = customerEmail;
        this.limit = limit;
    }

}
