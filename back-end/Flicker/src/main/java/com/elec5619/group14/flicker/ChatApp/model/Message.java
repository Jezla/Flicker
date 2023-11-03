package com.elec5619.group14.flicker.ChatApp.model;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.audit.DateAudit;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity(name="MESSAGE")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Message extends DateAudit {
    @Id
    @Column(name = "MESSAGE_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CONTENT")
    @NotNull(message = "Content must not be null")
    @NotBlank(message = "Content must not be blank")
    private String content;

    @Column(name = "MESSAGE_TYPE")
    @Enumerated(value = EnumType.STRING)
    private MessageType messageType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender")
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "conversation")
    @JsonIgnore
    private Conversation conversation;

    @Column(name = "MESSAGE_USER_SETTINGS")
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "message")
    @JsonIgnore
    private Set<MessageUserSetting> messageUserSettings = new HashSet<>();

    @Column(name = "FILES")
    @OneToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "message")
    private Set<File> files = new HashSet<>();

    @Column(name = "deleted")
    private Boolean deleted;

    @Column(name = "STATUS")
    @Enumerated(value = EnumType.STRING)
    private Message.Status status;

    public enum Status {
        PENDING,
        SENT,
        RECEIVED,
        SEEN
    }
}
