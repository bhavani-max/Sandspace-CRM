package com.crm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String store(MultipartFile file, String subDir) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        Path dir = Paths.get(uploadDir, subDir);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename));
        return subDir + "/" + filename;
    }

    public void delete(String relativePath) throws IOException {
        Path path = Paths.get(uploadDir, relativePath);
        Files.deleteIfExists(path);
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : "";
    }
}
