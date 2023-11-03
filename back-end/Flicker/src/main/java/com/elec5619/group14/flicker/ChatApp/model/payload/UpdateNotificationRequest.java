package com.elec5619.group14.flicker.ChatApp.model.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Schema(name = "Update Notification Request", description = "The update notification request payload")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateNotificationRequest {
    @NotBlank(message = "Notification status can not be blank")
    @NotNull(message = "Notification status can not be null")
    @Schema(name = "A valid notification status", allowableValues = "NonEmpty String")
    private Boolean notification;
}
