package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.ChatApp.model.ConversationUserSetting;
import com.elec5619.group14.flicker.ChatApp.repository.ConversationUserSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class ConversationUserSettingService {
    @Autowired
    private ConversationUserSettingRepository conversationUserSettingRepository;

    public Optional<ConversationUserSetting> findByUserIdAndConversationId(Long userId, Long conversationId) {
        return conversationUserSettingRepository.findByUserIdAndConversationId(userId, conversationId);
    }

    public ConversationUserSetting save (ConversationUserSetting conversationUserSetting) {
        return conversationUserSettingRepository.save(conversationUserSetting);
    }

    public Set<ConversationUserSetting> findByConversationId(Long conversationId) {
        return conversationUserSettingRepository.findByConversationId(conversationId);
    }
}
