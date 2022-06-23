package com.baasllc.stripeintegrationms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;


import java.io.Serializable;

import com.stripe.model.Address;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "customers")
public class CustomerModel implements Serializable {


    @Id
    private String id;

    private String stripeId;
    
    private String name;

    @Indexed(unique = true)
    private String email;

    private Address address;
    
    private String phone;

  
}