package com.elec5619.group14.flicker.ChatApp.model.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Schema(name = "Subscription to topic Request", description = "The subscription to topic request payload")
@Getter
@Setter
public class SubscriptionRequest {
    @NotNull
    @NotBlank
    @Schema(name = "A valid userId", required = true)
    private Long userId;

    @NotNull
    @NotBlank
    @Schema(name = "A valid topic", required = true)
    private String topic;

    @Schema(name = "A valid token")
    private List<String> tokens;
}
