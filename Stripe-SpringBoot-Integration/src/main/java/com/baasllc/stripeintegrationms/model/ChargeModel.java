package com.baasllc.stripeintegrationms.model;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "charges")
public class ChargeModel implements Serializable {
    
    @Id
    private String id;

    @DBRef(lazy=true)
    private CustomerModel customer;
    private String stripeId;
    private Long amount;
    private Long created;
    private String currency;
    private String receiptEmail;
    private String status;

   
}
