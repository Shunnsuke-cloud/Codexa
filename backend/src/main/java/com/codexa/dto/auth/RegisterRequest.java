package com.codexa.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "name is required") String name,
        @Email(message = "email must be valid") @NotBlank(message = "email is required") String email,
        @Size(min = 8, message = "password must be at least 8 characters") @NotBlank(message = "password is required") String password) {
}
