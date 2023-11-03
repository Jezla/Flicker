/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.elec5619.group14.flicker.AuthApp.repository;

import com.elec5619.group14.flicker.AuthApp.model.User;
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
public interface UserRepository extends JpaRepository<User, Long> {
    @Query(value = "SELECT u.* FROM users u\n" +
            "WHERE u.user_id IN (SELECT mus.user_id FROM message_user_setting mus\n" +
            "WHERE mus.message_id = :messageId AND mus.conversation_id = :conversationId\n" +
            "AND mus.status != 'SEEN')", nativeQuery = true)
    Set<User> findUsersUnseenMessage(@Param("messageId") Long messageId, @Param("conversationId") Long conversationId);

    @Query(value = "SELECT u.* FROM users u\n" +
            "WHERE u.user_id IN (SELECT mus.user_id FROM message_user_setting mus\n" +
            "WHERE mus.message_id = :messageId AND mus.conversation_id = :conversationId\n" +
            "AND mus.status = 'SEEN')", nativeQuery = true)
    Set<User> findUsersSeenMessage(@Param("messageId") Long messageId, @Param("conversationId") Long conversationId);

    Optional<User> findByUsername(String username);

    Boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);

    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(
            String username, String email, String displayName, String phoneNumber, Pageable pageable);
}
