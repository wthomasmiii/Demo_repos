package com.baasllc.stripeintegrationms.controller;

import java.util.HashMap;
import java.util.List;

import com.baasllc.stripeintegrationms.commons.Response;
import com.baasllc.stripeintegrationms.model.RefundModel;
import com.baasllc.stripeintegrationms.service.RefundService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private RefundService refundService;

    public RefundController(RefundService refundService){
        this.refundService = refundService;
    };

    /**
     * GET /api/refunds
     * Get all refunds
     * 
     * @return Response object with all refunds
     */
    @GetMapping("")
    public @ResponseBody ResponseEntity<Response> getAllRefunds(){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        List<RefundModel> refunds = null;
        try {
            refunds = refundService.getAllRefunds();
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct and return failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching refunds from the database", responseData));
        };

        // Construct and return successful response
        responseData.put("refunds", refunds);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved responses", responseData));
    };

    /**
     * GET /api/refunds/{id}
     * Get a single refund by id
     * 
     * @param refundId The mongoId of the refund to search for
     * @return Response object with the found refund
     */
    @GetMapping("/{refundId}")
    public @ResponseBody ResponseEntity<Response> getOneRefund(@PathVariable String refundId){
        // Initialize response data
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        RefundModel refund = null;
        try {
            refund = refundService.getRefundById(refundId);
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct and return  failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching refunds from the database", responseData));
        };

        // Construct successful response
        responseData.put("refund", refund);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved refund", responseData));
    };

    /**
     * GET /api/refunds/byCharge/{chargeId}
     * Get all refunds pertaining to a single charge
     * 
     * @param chargeId The stripeId of the charge that refunds should pertain to
     * @return Response object with the found refunds
     */
    @GetMapping("/byCharge/{chargeId}")
    public @ResponseBody ResponseEntity<Response> getRefundsByCharge(@PathVariable String chargeId){
        // Initialize response variables
        HashMap<String, Object> responseData = new HashMap<String, Object>();

        List<RefundModel> refunds = null;
        try {
            refunds = refundService.getRefundsByChargeId(chargeId);
        }catch(Exception ex){
            ex.printStackTrace();

            // Construct and return failed response
            responseData.put("error", ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new Response(false, "Error occurred while fetching refunds from the database", responseData));
        };

        // Construct successful response
        responseData.put("refunds", refunds);
        return ResponseEntity.status(HttpStatus.OK).body(new Response(true, "Successfully retrieved refunds", responseData));
    };
}
