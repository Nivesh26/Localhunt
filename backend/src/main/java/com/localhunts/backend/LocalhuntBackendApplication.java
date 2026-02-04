package com.localhunts.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LocalhuntBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(LocalhuntBackendApplication.class, args);
	}

}
