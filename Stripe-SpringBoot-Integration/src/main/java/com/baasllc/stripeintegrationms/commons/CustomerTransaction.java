package com.baasllc.stripeintegrationms.commons;

import com.google.gson.Gson;

import org.springframework.data.annotation.Transient;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerTransaction {
    
    @Transient
    Gson gson = new Gson();

    private String id;
    private Long amount;
    private Long created;
    private String type;
    private String currency;
    private String invoice;

    public CustomerTransaction(String id, Long amount, Long created, String type, String currency, String invoice){
        this.id = id;
        this.amount = amount;
        this.created = created;
        this.type = type;
        this.currency = currency;
        this.invoice = invoice;
    }
    
    public String getId() {
        return id;
    }
    public Long getAmount() {
        return amount;
    }
    public Long getCreated() {
        return created;
    }
    public String getType() {
        return type;
    }
    public String getCurrency() {
        return currency;
    }
    public String getInvoice() {
        return invoice;
    }

    public void setId(String id) {
        this.id = id;
    }
    public void setAmount(Long amount) {
        this.amount = amount;
    }
    public void setCreated(Long created) {
        this.created = created;
    }
    public void setType(String type) {
        this.type = type;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    public void setInvoice(String invoice) {
        this.invoice = invoice;
    }

    
    public String toJson(){
        return gson.toJson(this);
    }
}
