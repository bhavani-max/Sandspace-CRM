package com.crm.workspace;

import com.crm.config.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepo;
    private final WorkspaceMemberRepository memberRepo;
    private final WorkspaceDocRepository docRepo;
    private final FileStorageService fileStorage;

    @Transactional
    public Workspace createWorkspace(UUID createdBy, UUID assignmentId, String name) {
        Workspace ws = workspaceRepo.save(Workspace.builder()
                .createdBy(createdBy)
                .assignmentId(assignmentId)
                .name(name)
                .build());
        // Creator is automatically a member
        memberRepo.save(WorkspaceMember.builder()
                .workspaceId(ws.getId())
                .userId(createdBy)
                .build());
        return ws;
    }

    @Transactional
    public void addMembers(UUID workspaceId, List<UUID> userIds) {
        userIds.forEach(userId -> {
            if (!memberRepo.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
                memberRepo.save(WorkspaceMember.builder()
                        .workspaceId(workspaceId)
                        .userId(userId)
                        .build());
            }
        });
    }

    public List<Workspace> getMyWorkspaces(UUID userId) {
        return workspaceRepo.findByMemberId(userId);
    }

    public Workspace getById(UUID id) {
        return workspaceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + id));
    }

    public List<WorkspaceMember> getMembers(UUID workspaceId) {
        return memberRepo.findByWorkspaceId(workspaceId);
    }

    @Transactional
    public Workspace updateNotes(UUID workspaceId, String notes) {
        Workspace ws = getById(workspaceId);
        ws.setNotes(notes);
        return workspaceRepo.save(ws);
    }

    @Transactional
    public WorkspaceDoc uploadDoc(UUID workspaceId, UUID userId, MultipartFile file) throws IOException {
        String filePath = fileStorage.store(file, "workspace/" + workspaceId);
        return docRepo.save(WorkspaceDoc.builder()
                .workspaceId(workspaceId)
                .uploadedBy(userId)
                .filePath(filePath)
                .fileName(file.getOriginalFilename())
                .build());
    }

    public List<WorkspaceDoc> getDocs(UUID workspaceId) {
        return docRepo.findByWorkspaceId(workspaceId);
    }
}
