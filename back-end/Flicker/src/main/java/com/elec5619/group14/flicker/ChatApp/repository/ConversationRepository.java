package com.elec5619.group14.flicker.ChatApp.repository;

import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query(value = "SELECT c.conversation_name FROM conversation c WHERE c.conversation_id = :id", nativeQuery = true)
    String getConversationNameById(@Param(value = "id") Long id);

    List<Conversation> findByConversationName(String conversationName);

    @Query(value = "SELECT c.* FROM conversation c WHERE c.conversation_id IN (SELECT cus.conversation_id FROM conversation_user_setting cus WHERE cus.user_id = :userId)", nativeQuery = true)
    Page<Conversation> findAllConversations(Pageable pageable, @Param(value = "userId") Long userId);

    @Query(value = "SELECT c.* FROM conversation c WHERE c.conversation_id = (SELECT cu1.CONVERSATION_ID\n" +
            "FROM CONVERSATION_USER cu1\n" +
            "JOIN CONVERSATION_USER cu2 ON cu1.CONVERSATION_ID = cu2.CONVERSATION_ID\n" +
            "WHERE cu1.USER_ID = :userId1 AND cu2.USER_ID = :userId2\n" +
            "AND NOT EXISTS (\n" +
            "    SELECT 1 FROM CONVERSATION_USER cu3 \n" +
            "    WHERE cu3.CONVERSATION_ID = cu1.CONVERSATION_ID \n" +
            "    AND cu3.USER_ID NOT IN (:userId1, :userId2)\n" +
            ")\n" +
            "LIMIT 1)", nativeQuery = true)
    Optional<Conversation> findByTwoUsers(@Param(value = "userId1") Long userId1, @Param(value = "userId2") Long userId2);

    @Query(value = "SELECT c.* FROM conversation c WHERE c.conversation_id IN (SELECT cu.conversation_id FROM conversation_user cu WHERE cu.user_id = :userId) AND NOT EXISTS (SELECT ac FROM archived_conversation ac WHERE ac.conversation_id = c.conversation_id AND ac.user_id = :userId) ORDER BY c.updated_at DESC", nativeQuery = true)
    Set<Conversation> findNonArchivedConversationsForUser(@Param("userId") Long userId);

    @Query(value = "SELECT c.* FROM conversation c WHERE c.conversation_id IN (SELECT cu.conversation_id FROM conversation_user cu WHERE cu.user_id = :userId) AND EXISTS (SELECT ac FROM archived_conversation ac WHERE ac.conversation_id = c.conversation_id AND ac.user_id = :userId AND ac.is_removed = :isRemoved) ORDER BY c.updated_at DESC", nativeQuery = true)
    Set<Conversation> findArchivedConversationsForUser(@Param("userId") Long userId, @Param("isRemoved") Boolean isRemoved);

    @Query(value = "SELECT c.* FROM conversation c WHERE c.conversation_id IN (SELECT cu.conversation_id FROM conversation_user cu WHERE cu.user_id = :userId) AND NOT EXISTS (SELECT hc FROM hidden_conversation hc WHERE hc.conversation_id = c.conversation_id AND hc.user_id = :userId) ORDER BY c.updated_at DESC", nativeQuery = true)
    Set<Conversation> findNonHiddenConversationsForUser(@Param("userId") Long userId);

    /*@Query(value = "SELECT c.* FROM conversation c WHERE c.conversation_id IN (SELECT cus.conversation_id FROM conversation_user_setting cus WHERE cus.user_id = :userId) AND NOT EXISTS (SELECT hc FROM hidden_conversation hc WHERE hc.conversation_id = c.conversation_id AND hc.user_id = :userId) ORDER BY c.updated_at DESC", nativeQuery = true)
    Set<Conversation> findNonHiddenConversationsForUser(@Param("userId") Long userId);*/

    @Query(value = "SELECT c.* FROM conversation c WHERE c.conversation_id IN (SELECT cu.conversation_id FROM conversation_user cu WHERE cu.user_id = :userId) AND EXISTS (SELECT hc FROM hidden_conversation hc WHERE hc.conversation_id = c.conversation_id AND hc.user_id = :userId) ORDER BY c.updated_at DESC", nativeQuery = true)
    Set<Conversation> findHiddenConversationsForUser(@Param("userId") Long userId);

    Page<Conversation> findByConversationNameContainingIgnoreCase(String conversationName, Pageable pageable);

}