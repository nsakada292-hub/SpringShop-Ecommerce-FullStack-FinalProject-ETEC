package com.example.SpringShop_Backend.exception;

public class LockedAccountException extends RuntimeException {
    public LockedAccountException(String message) {
        super(message);
    }
}
