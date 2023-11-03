package com.elec5619.group14.flicker.AuthApp.model.payload;

import com.elec5619.group14.flicker.AuthApp.validation.annotation.NullOrNotBlank;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

@Schema(name = "Update Profile Request", description = "The update profile request payload")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    @NullOrNotBlank(message = "displayName can be null but not blank")
    @Schema(name = "A valid displayName", allowableValues = "NonEmpty String")
    private String displayName;

    @Schema(name = "A valid phone number")
    private String phoneNumber;

    @Schema(name = "A valid about")
    private String about;

    @Schema(name = "A valid language")
    private String language;

}
