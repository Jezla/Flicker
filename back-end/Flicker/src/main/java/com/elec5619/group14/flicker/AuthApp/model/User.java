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
package com.elec5619.group14.flicker.AuthApp.model;

import com.elec5619.group14.flicker.AuthApp.model.audit.DateAudit;
import com.elec5619.group14.flicker.AuthApp.validation.annotation.NullOrNotBlank;
import com.elec5619.group14.flicker.ChatApp.model.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.NaturalId;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity(name = "USERS")
@Getter
@Setter
public class User extends DateAudit {
    private static final String USERNAME_SIZE_ERROR = "'username' should be between 3-30 characters.";
    private static final String EMAIL_ERROR = "Invalid 'email'.";
    @Id
    @Column(name = "USER_ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", allocationSize = 1)
    private Long id;

    @NaturalId
    @Column(name = "EMAIL", unique = true)
    @Email(message = EMAIL_ERROR)
    @NotNull(message = "User email cannot be null")
    @NotBlank(message = "User email cannot be blank")
    private String email;

    @Column(name = "USERNAME", unique = true)
    @NotNull(message = "Username cannot be null")
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 30, message = USERNAME_SIZE_ERROR)
    private String username;

    @Column(name = "DISPLAY_NAME")
    @NullOrNotBlank(message = "Display name can not be blank")
    private String displayName;

    @Column(name = "PASSWORD")
    @NotNull(message = "Password cannot be null")
    @NotBlank(message = "Password can not be blank")
    @Size(min = 3, message = "Password must be at least 3 characters long")
    @JsonIgnore
    private String password;

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean active;

    @Column(name = "IS_ONLINE", nullable = false)
    private Boolean online;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST})
    @JoinTable(name = "USER_AUTHORITY", joinColumns = {
            @JoinColumn(name = "USER_ID", referencedColumnName = "USER_ID")}, inverseJoinColumns = {
            @JoinColumn(name = "ROLE_ID", referencedColumnName = "ROLE_ID")})
    @JsonIgnore
    private Set<Role> roles = new HashSet<>();

    @Column(name = "IS_EMAIL_VERIFIED", nullable = false)
    private Boolean isEmailVerified;

    @OneToMany(mappedBy = "sender")
    @JsonIgnore
    private Set<FriendRequest> sentRequests;

    @OneToMany(mappedBy = "receiver")
    @JsonIgnore
    private Set<FriendRequest> receivedRequests;

    @Column(name = "AVATAR")
    private String avatar;

    @Column(name = "COVER")
    private String cover;

    @Column(name = "ABOUT")
    private String about;

    @Column(name = "PHONE_NUMBER")
    @NotNull(message = "Phone number cannot be null")
    @NotBlank(message = "Phone number cannot be blank")
    private String phoneNumber;

    @Column(name = "LANGUAGE")
    private String language;

    @Column(name = "NOTIFICATION")
    private Boolean notification;

    @Column(name = "CONVERSATIONS")
    @ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Conversation> conversations = new HashSet<>();

    @Column(name = "ARCHIVED_CONVERSATIONS")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "user")
    @JsonIgnore
    private Set<ArchivedConversation> archivedConversations;

    @Column(name = "CONVERSATION_USER_SETTINGS")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "user")
    @JsonIgnore
    private Set<ConversationUserSetting> conversationUserSettings = new HashSet<>();

    @Column(name = "MESSAGE_USER_SETTINGS")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "user")
    @JsonIgnore
    private Set<MessageUserSetting> messageUserSettings = new HashSet<>();

    @Column(name = "MESSAGES")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "sender")
    @JsonIgnore
    private Set<Message> messages = new HashSet<>();

    @Column(name = "FILES")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "user")
    @JsonIgnore
    private Set<File> files = new HashSet<>();

    public User() {
        super();
    }

    public User(User user) {
        id = user.getId();
        username = user.getUsername();
        password = user.getPassword();
        firstName = user.getFirstName();
        lastName = user.getLastName();
        email = user.getEmail();
        active = user.getActive();
        roles = user.getRoles();
        isEmailVerified = user.getIsEmailVerified();
        avatar = user.getAvatar();
        about = user.getAbout();
        phoneNumber = user.getPhoneNumber();
        language = user.getLanguage();
    }

    public void addRole(Role role) {
        roles.add(role);
        role.getUserList().add(this);
    }

    public void addRoles(Set<Role> roles) {
        roles.forEach(this::addRole);
    }

    public void removeRole(Role role) {
        roles.remove(role);
        role.getUserList().remove(this);
    }

    public void markVerificationConfirmed() {
        this.setIsEmailVerified(true);
    }

    @Override
    public String toString() {
        return "User{" + "id=" + id + ", email='" + email + '\'' + ", username='" + username + '\'' + ", password='"
                + password + '\'' + ", firstName='" + firstName + '\'' + ", lastName='" + lastName + '\'' + ", active="
                + active + ", roles=" + roles + ", isEmailVerified=" + isEmailVerified + '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                     // Compare memory addresses.
        if (o == null || getClass() != o.getClass()) return false; // Check for null and compare runtime types.

        User other = (User) o;

        return Objects.equals(id, other.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;  // Compute hash code based on id.
    }


}
