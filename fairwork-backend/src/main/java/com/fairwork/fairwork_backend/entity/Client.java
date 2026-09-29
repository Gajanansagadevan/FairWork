package com.fairwork.fairwork_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

	@Entity
	public class Client {

	@Id
	private Long id;

	private String name;

	}
