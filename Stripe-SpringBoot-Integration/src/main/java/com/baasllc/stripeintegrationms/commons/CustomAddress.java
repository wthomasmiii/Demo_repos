package com.baasllc.stripeintegrationms.commons;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomAddress {
    private String city;
    private String country;
    private String lineOne;
    private String lineTwo;
    private String postalCode;
    private String state;


    public CustomAddress(String lineOne, String city, String country, String state, String postalCode){
        this.lineOne = lineOne;
        this.city = city;
        this.country = country;
        this.state = state;
        this.postalCode = postalCode;
    };
    
    @Override
    public String toString(){
        if(this.lineTwo != null){
            return this.lineOne
                .concat(" " + this.lineTwo)
                .concat(" " + this.city)
                .concat(" " + this.state)
                .concat(" " + this.country)
                .concat(" " + this.postalCode);
        }else {
            return this.lineOne
            .concat(" " + this.city)
            .concat(" " + this.state)
            .concat(" " + this.country)
            .concat(" " + this.postalCode);
        }
    };

}
