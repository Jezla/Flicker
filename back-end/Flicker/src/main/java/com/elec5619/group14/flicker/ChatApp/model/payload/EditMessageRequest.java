package com.elec5619.group14.flicker.ChatApp.model.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Schema(name = "Edit Message Request", description = "The edit message request payload")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EditMessageRequest {
    @NotNull
    @NotBlank
    @Schema(name = "A valid message content", required = true)
    private String content;
}
