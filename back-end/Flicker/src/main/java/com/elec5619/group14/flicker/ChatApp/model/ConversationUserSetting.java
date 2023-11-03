package com.elec5619.group14.flicker.ChatApp.model;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.audit.DateAudit;
import lombok.*;
import org.hibernate.annotations.NaturalId;

import javax.persistence.*;
import java.time.Instant;

@Entity(name="CONVERSATION_USER_SETTING")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConversationUserSetting extends DateAudit {
    @Id
    @Column(name = "CONVERSATION_USER_SETTING_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @ManyToOne
    @JoinColumn(name = "CONVERSATION_ID")
    private Conversation conversation;

    @Column(name = "DATE_JOINED")
    private Instant dateJoined;

    @Column(name = "DATE_LEFT")
    private Instant dateLeft;

    @Column(name = "PREFERRED_LANGUAGE")
    private String preferredLanguage;

    @Column(name = "ROLE_CONVERSATION_NAME")
    @Enumerated(EnumType.STRING)
    private RoleConversationName role;

    @Column(name = "NOTIFICATION")
    private Boolean notification;
}
