package com.baasllc.stripeintegrationms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class StripeIntegrationMsApplication {


	public static void main(String[] args) {
		SpringApplication.run(StripeIntegrationMsApplication.class, args);
	}


}
