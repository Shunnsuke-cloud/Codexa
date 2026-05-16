package com.codexa.service;

import com.codexa.dto.auth.AuthResponse;
import com.codexa.dto.auth.LoginRequest;
import com.codexa.dto.auth.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
