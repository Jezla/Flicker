/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.elec5619.group14.flicker.AuthApp.model.payload;

import com.elec5619.group14.flicker.AuthApp.validation.annotation.NullOrNotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Schema(name = "Registration Request", description = "The registration request payload")
public class RegistrationRequest {

    @NotNull(message = "Registration username cannot be null")
    @NotBlank(message = "Registration username cannot be blank")
    @Schema(name = "A valid username", required = true, allowableValues = "NonEmpty String")
    private String username;

    @Schema(name = "A valid firstname")
    private String firstName;

    @Schema(name = "A valid lastname")
    private String lastName;

    @NotNull(message = "Registration email cannot be null")
    @NotBlank(message = "Registration email cannot be blank")
    @Schema(name = "A valid email", required = true, allowableValues = "NonEmpty String")
    @Email
    private String email;

    @NotNull(message = "Registration password cannot be null")
    @NotBlank(message = "Registration password cannot be blank")
    @Size(min = 3, message = "Password must be at least 3 characters long")
    @Schema(name = "A valid password string", required = true, allowableValues = "NonEmpty String")
    private String password;

    @NotNull(message = "Phone number cannot be null")
    @NotBlank(message = "Phone number cannot be blank")
    @Schema(name = "A valid phone number", required = true, allowableValues = "NonEmpty String")
    private String phoneNumber;

    @NotNull(message = "Specify whether the user has to be registered as an admin or not")
    @Schema(name = "Flag denoting whether the user is an admin or not", required = true,
            type = "boolean", allowableValues = "true, false")
    private Boolean registerAsAdmin;

    public RegistrationRequest(String username, String firstName, String lastName, String email,
                               String phoneNumber, String password, Boolean registerAsAdmin) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.registerAsAdmin = registerAsAdmin;
    }

    public RegistrationRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getRegisterAsAdmin() {
        return registerAsAdmin;
    }

    public void setRegisterAsAdmin(Boolean registerAsAdmin) {
        this.registerAsAdmin = registerAsAdmin;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
