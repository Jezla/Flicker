package com.elec5619.group14.flicker.ChatApp.model.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Schema(name = "Push notification Request", description = "The push notification request payload")
@Getter
@Setter
public class PushNotificationRequest {
    @NotNull
    @NotBlank
    @Schema(name = "A valid title", required = true)
    private String title;

    @NotNull
    @NotBlank
    @Schema(name = "A valid message", required = true)
    private String message;

    @Schema(name = "A valid topic")
    private String topic;

    @Schema(name = "A valid token")
    private String token;
}
