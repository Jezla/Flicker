package com.elec5619.group14.flicker.ChatApp.repository;

import com.elec5619.group14.flicker.ChatApp.model.File;
import com.elec5619.group14.flicker.ChatApp.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {
    Optional<File> findByStoredFileName(String storedFileName);
    Optional<File> findById(Long id);
    Optional<File> findByUrl(String url);
    @Query(value = "SELECT f.* FROM file f WHERE f.conversation = :conversationId ORDER BY f.created_at DESC", nativeQuery = true)
    public Page<File> findAllInConversation(Pageable pageable, @Param("conversationId") Long conversationId);
   /* @Query(value = "SELECT f.* FROM file f WHERE f.conversation = :conversationId AND f.content_type LIKE '%application%' ORDER BY f.created_at DESC", nativeQuery = true)
    public Page<File> findDocsInConversation(Pageable pageable, @Param("conversationId") Long conversationId);
*/
    @Query(value = "SELECT f.* FROM file f " +
            "JOIN conversation_user_setting cus ON f.conversation = cus.conversation_id AND cus.user_id = :userId " +
            "WHERE f.conversation = :conversationId AND f.content_type LIKE '%application%' " +
            "AND (cus.date_joined IS NULL OR f.created_at >= cus.date_joined) " +
            "AND (cus.date_left IS NULL OR f.created_at <= cus.date_left) " +
            "ORDER BY f.created_at DESC", nativeQuery = true)
    public Page<File> findDocsInConversation(Pageable pageable, @Param("conversationId") Long conversationId, @Param("userId") Long userId);

    /*@Query(value = "SELECT f.* FROM file f WHERE f.conversation = :conversationId AND f.content_type NOT LIKE '%application%' ORDER BY f.created_at DESC", nativeQuery = true)
    public Page<File> findMediaInConversation(Pageable pageable, @Param("conversationId") Long conversationId);*/

    @Query(value = "SELECT f.* FROM file f " +
            "JOIN conversation_user_setting cus ON f.conversation = cus.conversation_id AND cus.user_id = :userId " +
            "WHERE f.conversation = :conversationId AND f.content_type NOT LIKE '%application%' " +
            "AND (cus.date_joined IS NULL OR f.created_at >= cus.date_joined) " +
            "AND (cus.date_left IS NULL OR f.created_at <= cus.date_left) " +
            "ORDER BY f.created_at DESC", nativeQuery = true)
    public Page<File> findMediaInConversation(Pageable pageable, @Param("conversationId") Long conversationId, @Param("userId") Long userId);

}
