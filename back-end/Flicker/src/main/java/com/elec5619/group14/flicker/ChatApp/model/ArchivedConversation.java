package com.elec5619.group14.flicker.ChatApp.model;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.audit.DateAudit;
import lombok.*;

import javax.persistence.*;

@Entity(name="ARCHIVED_CONVERSATION")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ArchivedConversation extends DateAudit {
    @Id
    @Column(name = "ARCHIVED_CONVERSATION_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @ManyToOne
    @JoinColumn(name = "CONVERSATION_ID")
    private Conversation conversation;

    @Column(name = "IS_REMOVED")
    private Boolean isRemoved;
}

