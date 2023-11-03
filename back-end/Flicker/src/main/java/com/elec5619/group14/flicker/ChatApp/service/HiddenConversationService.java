package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.ChatApp.model.ArchivedConversation;
import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.model.HiddenConversation;
import com.elec5619.group14.flicker.ChatApp.repository.ArchivedConversationRepository;
import com.elec5619.group14.flicker.ChatApp.repository.HiddenConversationRepository;
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
public class HiddenConversationService {
    @Autowired
    private HiddenConversationRepository hiddenConversationRepository;

    public Optional<HiddenConversation> findById(Long hiddenConversationId) {
        return hiddenConversationRepository.findById(hiddenConversationId);
    }
    public Optional<HiddenConversation> findByUserIdAndConversationId(Long userId, Long conversationId) {
        return hiddenConversationRepository.findByUserIdAndConversationId(userId, conversationId);
    }

    public HiddenConversation save (HiddenConversation hiddenConversation) {
        return hiddenConversationRepository.save(hiddenConversation);
    }

    public void delete (HiddenConversation hiddenConversation) {
        hiddenConversationRepository.delete(hiddenConversation);
    }

    public List<HiddenConversation> findAll() {
        return hiddenConversationRepository.findAll();
    }

    public Set<HiddenConversation> findByUserId(Long userId) {
        return hiddenConversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }
}
