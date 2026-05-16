package com.codexa.security;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    @Test
    public void generateAndValidateToken() {
        String secret = "my-very-secret-key-that-is-long-enough-for-hmac";
        JwtService jwtService = new JwtService(secret, 60);

        String subject = "user@example.com";
        String token = jwtService.generateToken(subject);

        assertNotNull(token);
        assertEquals(subject, jwtService.extractSubject(token));
        assertTrue(jwtService.isValid(token, subject));
    }
}
