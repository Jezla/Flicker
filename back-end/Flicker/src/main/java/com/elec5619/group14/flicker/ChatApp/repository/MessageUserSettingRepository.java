package com.elec5619.group14.flicker.ChatApp.repository;

import com.elec5619.group14.flicker.ChatApp.model.ConversationUserSetting;
import com.elec5619.group14.flicker.ChatApp.model.MessageUserSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface MessageUserSettingRepository extends JpaRepository<MessageUserSetting, Long> {
    Set<MessageUserSetting> findByUserIdAndConversationId(Long userId, Long conversationId);
    @Query(value = "SELECT mus.* FROM message_user_setting mus\n" +
            "WHERE mus.user_id = :userId AND mus.conversation_id = :conversationId\n" +
            "AND mus.status != 'SEEN'", nativeQuery = true)
    Set<MessageUserSetting> findUnseenMessages(@Param("userId") Long userId, @Param("conversationId") Long conversationId);
    Optional<MessageUserSetting> findByUserIdAndMessageId(Long userId, Long messageId);
    Set<MessageUserSetting> findByMessageIdAndConversationId(Long messageId, Long conversationId);
    Optional<MessageUserSetting> findByUserIdAndMessageIdAndConversationId(Long userId, Long messageId, Long conversationId);
}
