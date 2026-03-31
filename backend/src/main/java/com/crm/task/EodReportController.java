package com.crm.task;

import com.crm.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class EodReportController {

    private final EodReportService reportService;

    @PostMapping
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<EodReport> submit(
            @RequestParam String summary,
            @RequestParam(required = false) String blockers,
            @RequestParam(required = false) MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(reportService.submitReport(user.getId(), summary, blockers, file));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<List<EodReport>> myReports(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.getMyReports(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    public ResponseEntity<List<EodReport>> getReports(
            @RequestParam(required = false) UUID memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getReports(memberId, date));
    }
}
