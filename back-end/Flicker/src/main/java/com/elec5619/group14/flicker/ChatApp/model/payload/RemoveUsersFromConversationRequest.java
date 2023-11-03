package com.elec5619.group14.flicker.ChatApp.model.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Schema(name = "Remove users from conversation Request", description = "The remove users from conversation request payload")
@Getter
@Setter
public class RemoveUsersFromConversationRequest {
    @NotNull(message = "Set of users cannot be null")
    @NotBlank(message = "Set of users cannot be blank")
    @Schema(name = "A valid set of usernames")
    private Set<Long> userIds;
}
