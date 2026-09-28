package com.example.SpringShop_Backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, SlidingWindow> buckets = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000L;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String key = clientKey(request) + "|" + request.getRequestURI() + "|" + request.getMethod();

        SlidingWindow window = buckets.computeIfAbsent(key, k -> new SlidingWindow(WINDOW_MS));
        long now = System.currentTimeMillis();

        synchronized (window) {
            window.cleanup(now);
            if (window.count() >= MAX_REQUESTS) {
                response.setStatus(429);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(
                        "{\"status\":429,\"message\":\"Too many requests. Please try again later.\"}"
                );
                return;
            }
            window.add(now);
        }

        filterChain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String ip = request.getRemoteAddr();
        return ip == null ? "unknown" : ip;
    }

    private static class SlidingWindow {
        private final long[] timestamps;
        private final long windowMs;
        private int size;

        SlidingWindow(long windowMs) {
            this.windowMs = windowMs;
            this.timestamps = new long[32];
        }

        synchronized void cleanup(long now) {
            int write = 0;
            for (int i = 0; i < size; i++) {
                if (now - timestamps[i] <= windowMs) {
                    timestamps[write++] = timestamps[i];
                }
            }
            size = write;
        }

        synchronized int count() {
            return size;
        }

        synchronized void add(long now) {
            if (size < timestamps.length) {
                timestamps[size++] = now;
            }
        }
    }
}
