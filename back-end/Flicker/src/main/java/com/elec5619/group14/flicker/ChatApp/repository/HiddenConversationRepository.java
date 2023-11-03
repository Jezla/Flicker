package com.elec5619.group14.flicker.ChatApp.repository;

import com.elec5619.group14.flicker.ChatApp.model.HiddenConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface HiddenConversationRepository extends JpaRepository<HiddenConversation, Long> {
    Optional<HiddenConversation> findByUserIdAndConversationId(Long userId, Long conversationId);
    Optional<HiddenConversation> findById(Long hiddenConversationId);
    Set<HiddenConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
