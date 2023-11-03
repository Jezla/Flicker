package com.elec5619.group14.flicker.ChatApp.model;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.audit.DateAudit;
import lombok.*;

import javax.persistence.*;
import java.time.Instant;

@Entity(name="MESSAGE_USER_SETTING")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageUserSetting extends DateAudit {
    @Id
    @Column(name = "MESSAGE_USER_SETTING_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @ManyToOne
    @JoinColumn(name = "MESSAGE_ID")
    private Message message;

    @ManyToOne
    @JoinColumn(name = "CONVERSATION_ID")
    private Conversation conversation;

    @Column(name = "TARGETED_LANGUAGE")
    private String targetedLanguage;

    @Column(name = "TRANSLATED_TEXT")
    private String translatedText;

    @Column(name = "DATE_SEEN")
    private Instant dateSeen;

    @Column(name = "STATUS")
    @Enumerated(value = EnumType.STRING)
    private Message.Status status;

    @Column(name = "HIDDEN")
    private Boolean hidden;
}
