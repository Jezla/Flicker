package com.elec5619.group14.flicker.ChatApp.repository;

import com.elec5619.group14.flicker.ChatApp.model.ArchivedConversation;
import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface ArchivedConversationRepository extends JpaRepository<ArchivedConversation, Long> {
    Optional<ArchivedConversation> findByUserIdAndConversationId(Long userId, Long conversationId);
    Optional<ArchivedConversation> findById(Long archivedConversationId);
    Optional<ArchivedConversation> findByIdAndIsRemoved(Long archivedConversationId, Boolean isRemoved);
    Set<ArchivedConversation> findByUserIdAndIsRemoved(Long userId, Boolean isRemoved);
}
