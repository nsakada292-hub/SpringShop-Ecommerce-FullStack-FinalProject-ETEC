package com.example.SpringShop_Backend.service;

import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {

    public String sanitize(String value) {

        if (value == null || value.isBlank()) {
            return value;
        }

        String sanitized = value
                .replace("\0", "")
                .replace("\r", " ")
                .replace("\n", " ")
                .trim();

        return htmlEncode(sanitized);
    }

    public String sanitizeMultiline(String value) {

        if (value == null || value.isBlank()) {
            return value;
        }

        String sanitized = value
                .replace("\0", "")
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .trim();

        return htmlEncode(sanitized);
    }

    private String htmlEncode(String value) {

        StringBuilder sb = new StringBuilder(value.length() + 32);

        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '<' -> sb.append("&lt;");
                case '>' -> sb.append("&gt;");
                case '"' -> sb.append("&quot;");
                case '\'' -> sb.append("&#39;");
                case '&' -> sb.append("&amp;");
                default -> sb.append(c);
            }
        }

        return sb.toString();
    }
}
