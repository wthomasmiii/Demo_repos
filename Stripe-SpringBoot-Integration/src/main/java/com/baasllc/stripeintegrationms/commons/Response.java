package com.baasllc.stripeintegrationms.commons;

import java.util.HashMap;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Response {
    
    private boolean success;
    private String message;
    private HashMap<String, Object> data;

    public Response(boolean success){
        this.success = success;
    };

    public Response(boolean success, String message){
        this.success = success;
        this.message = message;
    };

    @Override
    public String toString(){
        return "Response{" + "success=" + success + ", message='" + message + '\'' + ", data=" + data + '}';
    };
}
