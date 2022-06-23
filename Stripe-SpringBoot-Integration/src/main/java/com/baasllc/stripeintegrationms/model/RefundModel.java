package com.baasllc.stripeintegrationms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "refunds")
public class RefundModel implements Serializable {
    
    @Id
    private String id;

    @DBRef(lazy = true)
    private CustomerModel customer;

    private String stripeId;
    private Long amount;
    private String chargeId;
    private Long created;
    private String currency;
    private String reason;
    private String status;
    
   

}
