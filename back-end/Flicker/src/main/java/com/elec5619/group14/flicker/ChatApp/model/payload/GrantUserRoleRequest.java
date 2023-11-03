package com.elec5619.group14.flicker.ChatApp.model.payload;

import com.elec5619.group14.flicker.ChatApp.model.RoleConversationName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Schema(name = "Grant user role in conversation Request", description = "The grant user role in conversation request payload")
@Getter
@Setter
public class GrantUserRoleRequest {
    @NotNull
    @NotBlank
    @Schema(name = "A valid user id", required = true)
    private Long userId;
    @NotNull
    @NotBlank
    @Schema(name = "A valid role", required = true)
    private RoleConversationName role;
}
