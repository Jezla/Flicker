package com.elec5619.group14.flicker.AuthApp.model.payload;

import com.elec5619.group14.flicker.AuthApp.validation.annotation.NullOrNotBlank;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Schema(name = "Update Online Status Request", description = "The update online status request payload")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserStatusRequest {
    @NotBlank(message = "active status can not be blank")
    @NotNull(message = "active status can not be null")
    @Schema(name = "A valid displayName", allowableValues = "NonEmpty String")
    private Boolean online;
}
