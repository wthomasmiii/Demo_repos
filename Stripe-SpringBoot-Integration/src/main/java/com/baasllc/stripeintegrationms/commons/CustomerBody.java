package com.baasllc.stripeintegrationms.commons;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerBody {
    private CustomAddress address;
    private String email;
    private String name;
    private String phone;
    
    public CustomAddress getAddress() {
        return address;
    }
    public String getEmail() {
        return email;
    }
    public String getName() {
        return name;
    }
    public String getPhone() {
        return phone;
    }

    public void setAddress(CustomAddress address) {
        this.address = address;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
}
