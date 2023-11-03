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
package com.elec5619.group14.flicker.AuthApp.controller;

import com.elec5619.group14.flicker.AuthApp.annotation.CurrentUser;
import com.elec5619.group14.flicker.AuthApp.event.OnUserAccountChangeEvent;
import com.elec5619.group14.flicker.AuthApp.event.OnUserLogoutSuccessEvent;
import com.elec5619.group14.flicker.AuthApp.exception.UpdatePasswordException;
import com.elec5619.group14.flicker.AuthApp.model.CustomUserDetails;
import com.elec5619.group14.flicker.AuthApp.model.dto.UserDTO;
import com.elec5619.group14.flicker.AuthApp.model.payload.*;
import com.elec5619.group14.flicker.AuthApp.service.AuthService;
import com.elec5619.group14.flicker.AuthApp.service.UserService;
import com.elec5619.group14.flicker.ChatApp.model.payload.UpdateNotificationRequest;
import com.elec5619.group14.flicker.ChatApp.service.FriendshipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.util.HashMap;
import java.util.Set;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Tag(name = "User Rest API", description = "Defines endpoints for the logged in user. It's secured by default")
public class UserController {

    private static final Logger logger = Logger.getLogger(UserController.class);
    @Autowired
    private  AuthService authService;
    @Autowired
    private UserService userService;
    @Autowired
    private FriendshipService friendshipService;
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    /**
     * Gets the current user profile of the logged in user
     */
    @GetMapping("/data")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Returns the current user data")
    public ResponseEntity<CustomUserDetails> getUserData(@CurrentUser CustomUserDetails currentUser) {
        logger.info(currentUser.getEmail() + " has role: " + currentUser.getRoles());
        return ResponseEntity.ok(currentUser);
    }

    /**
     * Returns all admins in the system. Requires Admin access
     */
    @GetMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Returns the list of configured admins. Requires ADMIN Access")
    public ResponseEntity getAllAdmins() {
        logger.info("Inside secured resource with admin");
        return ResponseEntity.ok("Hello. This is about admins");
    }

    /**
     * Updates the password of the current logged in user
     */
    @PostMapping("/password/update")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Allows the user to change his password once logged in by supplying the correct current " +
            "password")
    public ResponseEntity updateUserPassword(@CurrentUser CustomUserDetails customUserDetails,
                                             @Param(value = "The UpdatePasswordRequest payload") @Valid @RequestBody UpdatePasswordRequest updatePasswordRequest) {

        return authService.updatePassword(customUserDetails, updatePasswordRequest)
                .map(updatedUser -> {
                    OnUserAccountChangeEvent onUserPasswordChangeEvent = new OnUserAccountChangeEvent(updatedUser,
                            "Update Password", "Change successful");
                    applicationEventPublisher.publishEvent(onUserPasswordChangeEvent);
                    return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
                })
                .orElseThrow(() -> new UpdatePasswordException("--Empty--", "No such user present."));
    }

    /**
     * Log the user out from the app/device. Release the refresh token associated with the
     * user device.
     */
    @PostMapping("/logout")
    @Operation(summary = "Logs the specified user device and clears the refresh tokens associated with it")
    public ResponseEntity logoutUser(@CurrentUser CustomUserDetails customUserDetails,
                                     @Param(value = "The LogOutRequest payload") @Valid @RequestBody LogOutRequest logOutRequest) {
        userService.logoutUser(customUserDetails, logOutRequest);
        Object credentials = SecurityContextHolder.getContext().getAuthentication().getCredentials();

        OnUserLogoutSuccessEvent logoutSuccessEvent = new OnUserLogoutSuccessEvent(customUserDetails.getEmail(),
                credentials.toString(), logOutRequest);
        applicationEventPublisher.publishEvent(logoutSuccessEvent);
        return ResponseEntity.ok(new ApiResponse(true, "Log out successful"));
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Returns the user profile")
    public ResponseEntity<UserDTO> getUserProfile(@PathVariable Long userId) {
        UserDTO userResponse = userService.getProfile(userId);
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/self-profile")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Returns the current user profile")
    public ResponseEntity<UserDTO> getCurrentUserProfile(@CurrentUser CustomUserDetails currentUser) {
        UserDTO userResponse = userService.getProfile(currentUser.getId());
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping ("/profile/update")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Updates the current user profile")
    public ResponseEntity<UserDTO> updateUserProfile(@CurrentUser CustomUserDetails currentUser, @RequestBody UpdateProfileRequest updateProfileRequest) {
        UserDTO userResponse =  userService.updateProfile(currentUser.getId(), updateProfileRequest);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping ("/status/update")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Updates the current user status")
    public ResponseEntity<UserDTO> updateUserStatus(@CurrentUser CustomUserDetails currentUser, @RequestBody UpdateUserStatusRequest request) {
        UserDTO userResponse =  userService.updateStatus(currentUser.getId(), request);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping ("/avatar/update")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Updates the current user avatar")
    public ResponseEntity<UserDTO> updateUserAvatar(@CurrentUser CustomUserDetails currentUser, @RequestBody MultipartFile file) throws Exception {
        UserDTO userResponse =  userService.updateAvatar(currentUser.getId(), file);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping ("/avatar/remove")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Removes the current user avatar")
    public ResponseEntity<UserDTO> removeUserAvatar(@CurrentUser CustomUserDetails currentUser, @RequestBody MultipartFile file) throws IOException {
        UserDTO userResponse =  userService.removeAvatar(currentUser.getId());
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping ("/cover/update")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Updates the current user cover photo")
    public ResponseEntity<UserDTO> updateUserCover(@CurrentUser CustomUserDetails currentUser, @RequestBody MultipartFile file) throws Exception {
        UserDTO userResponse =  userService.updateCover(currentUser.getId(), file);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping ("/cover/remove")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Removes the current user cover photo")
    public ResponseEntity<UserDTO> removeUserCover(@CurrentUser CustomUserDetails currentUser, @RequestBody MultipartFile file) throws IOException {
        UserDTO userResponse =  userService.removeCover(currentUser.getId());
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Searches the list of users")
    public ResponseEntity<Page<UserDTO>> searchUsers(@RequestParam String query,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserDTO> userList = userService.searchUsers(query, pageable);
        return ResponseEntity.ok(userList);
    }

    @GetMapping(path = "/searchWithStatus", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Searches the list of users")
    public ResponseEntity<HashMap<Long, String>> searchUsersWithStatus(@CurrentUser CustomUserDetails currentUser,
                                                                @RequestParam String query,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        HashMap<Long, String> userList = friendshipService.searchUsersWithStatus(currentUser.getId(), query, pageable);
        return ResponseEntity.ok(userList);
    }

    @PutMapping ("/notification/update")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Updates the notification status of user")
    public ResponseEntity<UserDTO> updateNotificationStatus(@CurrentUser CustomUserDetails currentUser, @RequestBody UpdateNotificationRequest request) {
        UserDTO userResponse =  userService.updateNotification(currentUser.getId(), request);
        return ResponseEntity.ok(userResponse);
    }
}
