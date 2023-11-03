package com.elec5619.group14.flicker.AuthApp.model.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String username;
    private String displayName;
    private String firstName;
    private String lastName;
    private String avatar;
    private String cover;
    private String about;
    private String phoneNumber;
    private Boolean online;
    private String language;
    private Boolean notification;
    private Instant createdAt;
}
