package com.elec5619.group14.flicker.ChatApp.model.dto;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.ChatApp.model.File;
import com.elec5619.group14.flicker.ChatApp.model.Message;
import com.elec5619.group14.flicker.ChatApp.model.MessageType;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Data
public class MessageDTO {
    private Long id;
    private String content;
    private MessageType messageType;
    private User sender;
    private Set<File> files;
    private Message.Status status;
    private Boolean deleted;
    private Instant createdAt;
}
