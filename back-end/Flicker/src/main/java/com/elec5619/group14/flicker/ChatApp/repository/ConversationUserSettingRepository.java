package com.elec5619.group14.flicker.ChatApp.repository;

import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.model.ConversationUserSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface ConversationUserSettingRepository extends JpaRepository<ConversationUserSetting, Long> {
    Optional<ConversationUserSetting> findByUserIdAndConversationId(Long userId, Long conversationId);

    @Query(value = "SELECT cus.* FROM conversation_user_setting cus WHERE cus.conversation_id = :conversationId AND cus.date_left IS NULL", nativeQuery = true)
    Set<ConversationUserSetting> findByConversationId(@Param("conversationId") Long conversationId);
}
