package com.elec5619.group14.flicker.ChatApp.model;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.audit.DateAudit;
import com.elec5619.group14.flicker.AuthApp.validation.annotation.NullOrNotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity(name="CONVERSATION")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Conversation extends DateAudit {
    private static final String INVALID_NAME = "'name' should be between 1-40 characters.";

    @Id
    @Column(name = "CONVERSATION_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CONVERSATION_NAME")
    @NullOrNotBlank(message = "Conversation name cannot be blank")
    private String conversationName;

    @Column(name = "AVATAR")
    private String avatar;

    @Column(name = "USERS")
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "CONVERSATION_USER",
            joinColumns = @JoinColumn(name = "CONVERSATION_ID", referencedColumnName = "CONVERSATION_ID"),
            inverseJoinColumns = @JoinColumn(name = "USER_ID", referencedColumnName = "USER_ID"))
    @NotNull
    private Set<User> users = new HashSet<>();

    @Column(name = "MESSAGES")
    @OneToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "conversation")
    @JsonIgnore
    private Set<Message> messages = new HashSet<>();

    @Column(name = "FILES")
    @OneToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "conversation")
    @JsonIgnore
    private Set<File> files = new HashSet<>();

    @Column(name = "ARCHIVED_CONVERSATIONS")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "conversation")
    @JsonIgnore
    private Set<ArchivedConversation> archivedConversations = new HashSet<>();

    @Column(name = "CONVERSATION_USER_SETTINGS")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "conversation")
    @JsonIgnore
    private Set<ConversationUserSetting> conversationUserSettings = new HashSet<>();

    @Column(name = "MESSAGE_USER_SETTINGS")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "conversation")
    @JsonIgnore
    private Set<MessageUserSetting> messageUserSettings = new HashSet<>();

    @Column(name = "IS_GROUP")
    private Boolean isGroup;
    
    public void addToConversation(User user) {
        this.getUsers().add(user);
    }

    public void removeFromConversation(User user) {
        this.getUsers().remove(user);
    }
}
