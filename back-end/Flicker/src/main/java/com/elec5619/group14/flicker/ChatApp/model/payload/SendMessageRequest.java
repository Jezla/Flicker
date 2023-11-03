package com.elec5619.group14.flicker.ChatApp.model.payload;

import com.elec5619.group14.flicker.AuthApp.validation.annotation.NullOrNotBlank;
import com.elec5619.group14.flicker.ChatApp.model.File;
import com.elec5619.group14.flicker.ChatApp.model.MessageType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Schema(name = "Send Message Request", description = "The send message request payload")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SendMessageRequest {
    @NotNull
    @NotBlank
    @Schema(name = "A valid message content", required = true)
    private String content;

    @NotNull
    @Schema(name = "A valid message type", required = true)
    private MessageType messageType;

    @Schema(name = "A valid message file", required = true)
    private Set<Long> fileIds;

}
