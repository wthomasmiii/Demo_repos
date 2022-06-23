package com.baasllc.stripeintegrationms.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.model.Application;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import com.google.gson.JsonSyntaxException;

@RestController
@RequestMapping("/api")
public class WebhookController {
    
    @Value("${stripe.keys.webhooks.root}")
    private String ENDPOINT_SECRET_KEY;

    public WebhookController(){};

    @PostMapping("/webhooks")
    public @ResponseBody HashMap<String, Object> handleWebhooks(@RequestBody String payload, HttpServletRequest request){
        System.out.println("WEBHOOK ROUTE HIT");

        String sigHeader = request.getHeader("Stripe-Signature");

        Event event = null;
        HashMap<String, Object> response = new HashMap<String, Object>();

        // Verify webhook signature and extract the event
        // See https://stripe.com/docs/webhooks/signatures for more information
        try {
            event = Webhook.constructEvent(payload, sigHeader, ENDPOINT_SECRET_KEY);
        }catch(JsonSyntaxException e){
            System.out.println(e.getMessage());
        }catch(SignatureVerificationException e){
            System.out.println(e.getMessage());
        }

        if("payment_intent.created".equals(event.getType())){
            System.out.println("*** Payment Intent Created ***");
        }else if("payment_intent.payment_failed".equals(event.getType())){
            System.out.println("*** Payment Intent Failed ***");
        }else if("payment_intent.succeeded".equals(event.getType())){
            System.out.println("*** Payment Intent Succeeded ***");
        }else if("charge.succeeded".equals(event.getType())){
            System.out.println("*** Charge Succeeded ***");
        }else if("account.application.deauthorized".equals(event.getType())){
            // Deserialize the nested object inside the event
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            Application application = null;
            if(dataObjectDeserializer.getObject().isPresent()){
                application = (Application) dataObjectDeserializer.getObject().get();
                String connectedAccountId = event.getAccount();
                handleDeauthorization(connectedAccountId, application);                
            }else{
                // Deserialization failed, probably due to an API version mismatch.
                // Refer to the Javadoc documentation on `EventDataObjectDeserializer` for
                // instructions on how to handle this case, or return an error here.
            }
        }

        response.put("success", true);
        return response;
    };

    private static void handleDeauthorization(String connectedAccountId, Application application){
        // Clean up account state.
        System.out.println("Connected account ID: " + connectedAccountId);
        System.out.println(application.getId());
    };
}
