package com.elec5619.group14.flicker.ChatApp.model.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Schema(name = "OpenAI Translation Request", description = "The OpenAI Translation request payload")
@Getter
@Setter
public class OpenAITranslationRequest {
    @NotNull
    @NotBlank
    @Schema(name = "A valid message text", required = true)
    private String model;

    @NotNull
    @NotBlank
    @Schema(name = "A valid message text", required = true)
    private String prompt;

    @NotNull
    @NotBlank
    @Schema(name = "A valid target language", required = true)
    private Integer max_tokens;
}
