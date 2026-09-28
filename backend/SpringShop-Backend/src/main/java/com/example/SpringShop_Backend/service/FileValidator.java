package com.example.SpringShop_Backend.service;

import com.example.SpringShop_Backend.exception.BadRequestException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Set;

@Component
public class FileValidator {

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    // magic-byte signatures -> allowed content types that can claim them
    private static final Map<String, String> MAGIC_BYTES = Map.of(
            "jpeg", "image/jpeg",  // FF D8 FF
            "png", "image/png",    // 89 50 4E 47
            "gif", "image/gif",    // 47 49 46 38
            "webp", "image/webp"   // 52 49 46 46 ... 57 45 42 50
    );

    public void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Image file must be at most 2 MB");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BadRequestException("Only JPEG, PNG, GIF, and WebP images are allowed");
        }

        String filename = file.getOriginalFilename();

        if (filename != null && filename.contains("..")) {
            throw new BadRequestException("Invalid file name");
        }

        verifyMagicBytes(file, contentType);
    }

    private void verifyMagicBytes(MultipartFile file, String declaredContentType) {

        try (InputStream in = file.getInputStream()) {
            byte[] header = new byte[12];
            int read = in.read(header);

            if (read < 4) {
                throw new BadRequestException("File is too small to be a valid image");
            }

            String detected = detectFormat(header, read);

            if (detected == null || !detected.equals(declaredContentType)) {
                throw new BadRequestException("File content does not match its declared type");
            }
        } catch (IOException ex) {
            throw new BadRequestException("Could not read the uploaded file");
        }
    }

    private String detectFormat(byte[] header, int length) {

        // JPEG: FF D8 FF
        if (length >= 3
                && (header[0] & 0xFF) == 0xFF
                && (header[1] & 0xFF) == 0xD8
                && (header[2] & 0xFF) == 0xFF) {
            return MAGIC_BYTES.get("jpeg");
        }

        // PNG: 89 50 4E 47
        if (length >= 4
                && (header[0] & 0xFF) == 0x89
                && header[1] == 'P'
                && header[2] == 'N'
                && header[3] == 'G') {
            return MAGIC_BYTES.get("png");
        }

        // GIF: 47 49 46 38
        if (length >= 4
                && header[0] == 'G'
                && header[1] == 'I'
                && header[2] == 'F'
                && header[3] == '8') {
            return MAGIC_BYTES.get("gif");
        }

        // WebP: RIFF....WEBP
        if (length >= 12
                && header[0] == 'R' && header[1] == 'I'
                && header[2] == 'F' && header[3] == 'F'
                && header[8] == 'W' && header[9] == 'E'
                && header[10] == 'B' && header[11] == 'P') {
            return MAGIC_BYTES.get("webp");
        }

        return null;
    }
}
