package com.elec5619.group14.flicker.ChatApp.model;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.audit.DateAudit;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;

@Entity(name = "FILE")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class File extends DateAudit {
    @Id
    @Column(name = "FILE_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message")
    @JsonIgnore
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation")
    @JsonIgnore
    private Conversation conversation;

    @Column(name = "ORIGINAL_FILE_NAME")
    private String originalFileName;

    @Column(name = "STORED_FILE_NAME")
    private String storedFileName;

    @Column(name = "CONTENT_TYPE")
    private String contentType;

    @Column(name = "URL")
    private String url;

}
