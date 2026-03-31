package com.crm.auth;

public record RegisterRequest(String name, String email, String password, String role) {}
