package com.example.SpringShop_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpringShopBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringShopBackendApplication.class, args);
	}

}
