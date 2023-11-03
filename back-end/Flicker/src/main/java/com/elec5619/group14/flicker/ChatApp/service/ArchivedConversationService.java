package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.ChatApp.model.ArchivedConversation;
import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.repository.ArchivedConversationRepository;
import com.elec5619.group14.flicker.ChatApp.util.DataStructuresHandle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ArchivedConversationService {
    @Autowired
    private ArchivedConversationRepository archivedConversationRepository;
    private DataStructuresHandle handle = new DataStructuresHandle();

    public Optional<ArchivedConversation> findById(Long archivedConversationId) {
        return archivedConversationRepository.findById(archivedConversationId);
    }
    public Optional<ArchivedConversation> findByIdAndIsRemoved(Long archivedConversationId, Boolean isRemoved) {
        return archivedConversationRepository.findByIdAndIsRemoved(archivedConversationId, isRemoved);
    }
    public Optional<ArchivedConversation> findByUserIdAndConversationId(Long userId, Long conversationId) {
        return archivedConversationRepository.findByUserIdAndConversationId(userId, conversationId);
    }

    public ArchivedConversation save (ArchivedConversation archivedConversation) {
        return archivedConversationRepository.save(archivedConversation);
    }

    public void delete (ArchivedConversation archivedConversation) {
        archivedConversationRepository.delete(archivedConversation);
    }

    public List<ArchivedConversation> findAll() {
        return archivedConversationRepository.findAll();
    }

    public Set<ArchivedConversation> findByUserIdAndIsRemoved(Long userId, Boolean isRemoved) {
        return archivedConversationRepository.findByUserIdAndIsRemoved(userId, isRemoved);
    }

    public Page<ArchivedConversation> getPagesOfArchivedConversationsByUserId(Set<ArchivedConversation> conversations, Pageable pageable) {
        return handle.setToPage(conversations, pageable);
    }
}
