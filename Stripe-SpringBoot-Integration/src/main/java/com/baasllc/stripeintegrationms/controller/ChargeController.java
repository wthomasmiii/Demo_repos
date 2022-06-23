package com.baasllc.stripeintegrationms.controller;

import java.util.HashMap;
import java.util.List;


import com.baasllc.stripeintegrationms.commons.Response;
import com.baasllc.stripeintegrationms.model.ChargeModel;
import com.baasllc.stripeintegrationms.service.ChargeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/charges")
public class ChargeController {
    
    private ChargeService chargeService;

    public ChargeController(ChargeService chargeService){
        this.chargeService = chargeService;
    };

    /**
     * GET /api/charges
     * Get all charges in the database
     * 
     * @return Response object containing all charges in the database
     */
    @GetMapping("")
    public @ResponseBody ResponseEntity<Response> getAllCharges(){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        List<ChargeModel> charges = null;
        try {
            charges = chargeService.getAllCharges();
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct and return failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching charges", responseData));
        };

        // Construct and return successful response
        responseData.put("charges", charges);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved charges", responseData));
    };

    /**
     * GET /api/charges/{chargeId}
     * Get a single charge by mongoId
     * 
     * @param chargeId The mongoId of the charge to query for
     * @return Response object containing an Exception or the charge document that is found
     */
    @GetMapping("/{chargeId}")
    public @ResponseBody ResponseEntity<Response> getChargeById(@PathVariable String chargeId){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        // Attempt to fetch the charge
        ChargeModel charge = null;
        try {
            charge = chargeService.getChargeById(chargeId);
        }catch(Exception ex){
            ex.printStackTrace();
            
            // Construct and return failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching charge", responseData));
        }

        // Construct and return successful response
        responseData.put("charge", charge);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved charge", responseData));
    };


    /**
     * GET /api/charges/byCustomer/{customerId}
     * Get all charges related to a single customer
     * 
     * @param customerId The mongoId of the customer to query for
     * @return Response object containing all charges related to a specific customer
     */
    @GetMapping("/byCustomer/{customerId}")
    public @ResponseBody ResponseEntity<Response> getChargesByCustomerId(@PathVariable String customerId){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        List<ChargeModel> charges = null;
        try {
            charges = chargeService.getChargesByCustomerId(customerId);
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching charges", responseData));
        };

        // Construct successful response
        responseData.put("charges", charges);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved charges", responseData));
    }
}
