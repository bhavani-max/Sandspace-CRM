package com.crm.task;

import com.crm.config.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EodReportService {

    private final EodReportRepository reportRepo;
    private final FileStorageService fileStorage;

    @Transactional
    public EodReport submitReport(UUID memberId, String summary, String blockers,
                                   MultipartFile file) throws IOException {
        LocalDate today = LocalDate.now();
        if (reportRepo.findByMemberIdAndReportDate(memberId, today).isPresent()) {
            throw new RuntimeException("EOD report already submitted for today");
        }
        String filePath = null;
        if (file != null && !file.isEmpty()) {
            filePath = fileStorage.store(file, "eod");
        }
        return reportRepo.save(EodReport.builder()
                .memberId(memberId)
                .reportDate(today)
                .summary(summary)
                .blockers(blockers)
                .filePath(filePath)
                .build());
    }

    public List<EodReport> getMyReports(UUID memberId) {
        return reportRepo.findByMemberId(memberId);
    }

    public List<EodReport> getReports(UUID memberId, LocalDate date) {
        if (memberId != null && date != null) {
            return reportRepo.findByMemberIdAndReportDate(memberId, date)
                    .map(List::of).orElse(List.of());
        }
        if (memberId != null) return reportRepo.findByMemberId(memberId);
        if (date != null) return reportRepo.findByReportDate(date);
        return reportRepo.findAll();
    }
}
