package com.elec5619.group14.flicker.ChatApp.model.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Schema(name = "Rename conversation Request", description = "The rename conversation request payload")
@Getter
@Setter
public class RenameConversationRequest {
    @NotBlank(message = "Conversation name cannot be blank")
    private String conversationName;
}
