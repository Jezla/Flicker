package com.elec5619.group14.flicker.ChatApp.repository;

import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.model.Message;
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
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query(value = "SELECT * FROM message m WHERE m.conversation= :conversationId ORDER BY m.created_at DESC", nativeQuery = true)
    public Page<Message> findAllInConversationWithPagination(Pageable pageable, @Param("conversationId") Long conversationId);

    @Query(value = "SELECT m.* FROM Message m WHERE m.conversation = :conversationId ORDER BY m.created_at DESC LIMIT 1", nativeQuery = true)
    public Optional<Message> findLatestMessageByConversationId(@Param("conversationId") Long conversationId);

    @Query(value = "SELECT m.* \n" +
            "FROM message m\n" +
            "JOIN conversation c ON m.conversation = c.conversation_id\n" +
            "LEFT JOIN conversation_user_setting cus ON m.conversation = cus.conversation_id AND cus.user_id = :userId\n" +
            "WHERE m.conversation = :conversationId \n" +
            "  AND (cus.date_joined IS NULL OR m.created_at >= cus.date_joined)\n" +
            "  AND (cus.date_left IS NULL OR m.created_at <= cus.date_left)\n" +
            "  AND m.message_id NOT IN (SELECT mus.message_id \n" +
            "  FROM message_user_setting mus WHERE mus.user_id = :userId AND mus.conversation_id = :conversationId AND mus.hidden = true) \n" +
            "ORDER BY m.created_at DESC", nativeQuery = true)
    public Page<Message> findAllBeforeLeft(Pageable pageable, @Param("userId") Long userId, @Param("conversationId") Long conversationId);

    @Query(value = "SELECT m.* FROM message m\n" +
            "JOIN message_user_setting mus ON m.message_id = mus.message_id\n" +
            "WHERE mus.conversation_id = :conversationId\n" +
            "AND mus.user_id = :userId\n" +
            "AND mus.status != 'SEEN'\n" +
            "ORDER BY m.created_at DESC", nativeQuery = true)
    public Page<Message> findUnseenMessages(Pageable pageable, @Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query(value = "SELECT m.* \n" +
            "FROM message m\n" +
            "LEFT JOIN archived_conversation ac ON m.conversation = ac.conversation_id AND ac.user_id = :userId\n" +
            "WHERE m.conversation= :conversationId \n" +
            "  AND (ac.updated_at IS NULL OR m.created_at > ac.updated_at)\n" +
            "ORDER BY m.created_at DESC", nativeQuery = true)
    Page<Message> findMessagesAfterArchive(Pageable pageable, @Param("userId") Long userId, @Param("conversationId") Long conversationId);
    @Query(value = "SELECT m.* \n" +
            "FROM message m\n" +
            "JOIN archived_conversation ac ON m.conversation = ac.conversation_id\n" +
            "WHERE ac.archived_conversation_id = :archivedConversationId \n" +
            "  AND m.created_at <= ac.updated_at\n" +
            "ORDER BY m.created_at DESC", nativeQuery = true)
    Page<Message> findMessagesBeforeArchive(Pageable pageable, @Param("archivedConversationId") Long archivedConversationId);

    @Query(value = "SELECT m.* \n" +
            "FROM message m\n" +
            "JOIN archived_conversation ac ON m.conversation = ac.conversation_id\n" +
            "LEFT JOIN conversation_user_setting cus ON m.conversation = cus.conversation_id AND cus.user_id = :userId\n" +
            "WHERE ac.archived_conversation_id = :archivedConversationId \n" +
            "  AND m.created_at <= ac.updated_at\n" +
            "  AND (cus.date_joined IS NULL OR m.created_at >= cus.date_joined)\n" +
            "  AND (cus.date_left IS NULL OR m.created_at <= cus.date_left)\n" +
            "  AND m.message_id NOT IN (SELECT mus.message_id \n" +
            "  FROM message_user_setting mus WHERE mus.user_id = :userId AND mus.conversation_id = :conversationId AND mus.hidden = true) \n" +
            "ORDER BY m.created_at DESC", nativeQuery = true)
    Page<Message> findMessagesBeforeArchiveAndBeforeLeft(Pageable pageable, @Param("userId") Long userId, @Param("archivedConversationId") Long archivedConversationId);

    @Query(value = "SELECT m.* \n" +
            "FROM message m\n" +
            "JOIN archived_conversation ac ON m.conversation = ac.conversation_id AND ac.user_id = :userId\n" +
            "LEFT JOIN conversation_user_setting cus ON m.conversation = cus.conversation_id AND cus.user_id = :userId\n" +
            "WHERE m.conversation = :conversationId \n" +
            "  AND m.created_at > ac.updated_at\n" +
            "  AND (cus.date_joined IS NULL OR m.created_at >= cus.date_joined)\n" +
            "  AND (cus.date_left IS NULL OR m.created_at <= cus.date_left)\n" +
            "  AND m.message_id NOT IN (SELECT mus.message_id \n" +
            "  FROM message_user_setting mus WHERE mus.user_id = :userId AND mus.conversation_id = :conversationId AND mus.hidden = true) \n" +
            "ORDER BY m.created_at DESC", nativeQuery = true)
    Page<Message> findMessagesAfterArchiveAndBeforeLeft(Pageable pageable, @Param("userId") Long userId, @Param("conversationId") Long conversationId);

    @Query(value = "SELECT m.* FROM message m WHERE m.message_id = :messageId AND m.conversation = :conversationId", nativeQuery = true)
    Optional<Message> findByMessageIdAndConversationId(@Param("messageId") Long messageId, @Param("conversationId") Long conversationId);
    @Query(value = "SELECT m.* \n" +
            "FROM message m\n" +
            "JOIN conversation c ON m.conversation = c.conversation_id\n" +
            "LEFT JOIN conversation_user_setting cus ON m.conversation = cus.conversation_id AND cus.user_id = :userId\n" +
            "WHERE m.conversation = :conversationId \n" +
            "  AND (cus.date_joined IS NULL OR m.created_at >= cus.date_joined)\n" +
            "  AND (cus.date_left IS NULL OR m.created_at <= cus.date_left)\n" +
            "  AND m.message_id NOT IN (SELECT mus.message_id \n" +
            "  FROM message_user_setting mus WHERE mus.user_id = :userId AND mus.conversation_id = :conversationId AND mus.hidden = true) \n" +
            "ORDER BY m.created_at DESC", nativeQuery = true)
    public Set<Message> findAllBeforeLeftForFilter(@Param("userId") Long userId, @Param("conversationId") Long conversationId);

    @Query(value = "SELECT m.* \n" +
            "FROM message m\n" +
            "JOIN archived_conversation ac ON m.conversation = ac.conversation_id AND ac.user_id = :userId\n" +
            "LEFT JOIN conversation_user_setting cus ON m.conversation = cus.conversation_id AND cus.user_id = :userId\n" +
            "WHERE m.conversation = :conversationId \n" +
            "  AND m.created_at > ac.updated_at\n" +
            "  AND (cus.date_joined IS NULL OR m.created_at >= cus.date_joined)\n" +
            "  AND (cus.date_left IS NULL OR m.created_at <= cus.date_left)\n" +
            "  AND m.message_id NOT IN (SELECT mus.message_id \n" +
            "  FROM message_user_setting mus WHERE mus.user_id = :userId AND mus.conversation_id = :conversationId AND mus.hidden = true) \n" +
            "ORDER BY m.created_at DESC", nativeQuery = true)
    Set<Message> findMessagesAfterArchiveAndBeforeLeftForFilter(@Param("userId") Long userId, @Param("conversationId") Long conversationId);
}
