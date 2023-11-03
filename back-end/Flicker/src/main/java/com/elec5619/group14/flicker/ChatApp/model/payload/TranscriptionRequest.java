package com.elec5619.group14.flicker.ChatApp.model.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Schema(name = "Transcription Request", description = "The transcription request payload")
@Getter
@Setter
public class TranscriptionRequest {
    @NotNull
    @NotBlank
    @Schema(name = "A valid audio file path", required = true)
    private String audioFilePath;
}
