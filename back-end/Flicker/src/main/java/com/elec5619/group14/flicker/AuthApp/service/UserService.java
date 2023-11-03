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
package com.elec5619.group14.flicker.AuthApp.service;

import com.elec5619.group14.flicker.AuthApp.annotation.CurrentUser;
import com.elec5619.group14.flicker.AuthApp.exception.UserLogoutException;
import com.elec5619.group14.flicker.AuthApp.model.*;
import com.elec5619.group14.flicker.AuthApp.model.dto.UserDTO;
import com.elec5619.group14.flicker.AuthApp.model.payload.LogOutRequest;
import com.elec5619.group14.flicker.AuthApp.model.payload.RegistrationRequest;
import com.elec5619.group14.flicker.AuthApp.model.payload.UpdateProfileRequest;
import com.elec5619.group14.flicker.AuthApp.model.payload.UpdateUserStatusRequest;
import com.elec5619.group14.flicker.AuthApp.repository.UserRepository;
import com.elec5619.group14.flicker.ChatApp.exception.InvalidInputException;
import com.elec5619.group14.flicker.ChatApp.model.File;
import com.elec5619.group14.flicker.ChatApp.model.FriendRequest;
import com.elec5619.group14.flicker.ChatApp.model.Message;
import com.elec5619.group14.flicker.ChatApp.model.payload.UpdateNotificationRequest;
import com.elec5619.group14.flicker.ChatApp.service.FileService;
//import com.elec5619.group14.flicker.ChatApp.service.FriendshipService;
import org.apache.log4j.Logger;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {
    private static final Logger logger = Logger.getLogger(UserService.class);
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleService roleService;
    @Autowired
    private UserDeviceService userDeviceService;
    @Autowired
    private RefreshTokenService refreshTokenService;
    @Autowired
    private ModelMapper modelMapper;
    /*@Autowired
    private FriendshipService friendshipService;*/
    @Autowired
    private FileService fileService;

    /**
     * Finds a user in the database by username
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Finds a user in the database by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find a user in db by id.
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Save the user to the database
     */
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Check is the user exists given the email: naturalId
     */
    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Check is the user exists given the username: naturalId
     */
    public Boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }


    /**
     * Creates a new user from the registration request
     */
    public User createUser(RegistrationRequest registerRequest) {
        User newUser = new User();
        Boolean isNewUserAsAdmin = registerRequest.getRegisterAsAdmin();
        newUser.setFirstName(registerRequest.getFirstName());
        newUser.setLastName(registerRequest.getLastName());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setUsername(registerRequest.getUsername());
        newUser.setDisplayName(registerRequest.getUsername());
        newUser.setPhoneNumber(registerRequest.getPhoneNumber());
        newUser.addRoles(getRolesForNewUser(isNewUserAsAdmin));
        newUser.setActive(false);
        newUser.setIsEmailVerified(false);
        newUser.setOnline(false);
        newUser.setNotification(false);
        return newUser;
    }

    /**
     * Performs a quick check to see what roles the new user could be assigned to.
     *
     * @return list of roles for the new user
     */
    private Set<Role> getRolesForNewUser(Boolean isToBeMadeAdmin) {
        Set<Role> newUserRoles = new HashSet<>(roleService.findAll());
        if (!isToBeMadeAdmin) {
            newUserRoles.removeIf(Role::isAdminRole);
        }
        logger.info("Setting user roles: " + newUserRoles);
        return newUserRoles;
    }

    public UserDTO updateProfile(Long userId, UpdateProfileRequest updateProfileRequest) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found")); // Handle not found
        user.setDisplayName(updateProfileRequest.getDisplayName());
        user.setPhoneNumber(updateProfileRequest.getPhoneNumber());
        user.setAbout(updateProfileRequest.getAbout());
        user.setLanguage(updateProfileRequest.getLanguage());
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    public UserDTO updateStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found")); // Handle not found
        user.setOnline(request.getOnline());
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    public UserDTO updateAvatar(Long userId, MultipartFile file) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if(user.getAvatar() != null && !user.getAvatar().isEmpty()) {
            fileService.deleteFileByUrl(user.getAvatar());
        }
        File fileInfo = fileService.uploadFile(user, file);
        user.setAvatar(fileInfo.getUrl());
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    public UserDTO removeAvatar(Long userId) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if(user.getAvatar() != null && !user.getAvatar().isEmpty()) {
            fileService.deleteFileByUrl(user.getAvatar());
            user.setAvatar(null);
            User savedUser = userRepository.save(user);
            return modelMapper.map(savedUser, UserDTO.class);
        }
        return modelMapper.map(user, UserDTO.class);
    }

    public UserDTO updateCover(Long userId, MultipartFile file) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if(user.getCover() != null && !user.getCover().isEmpty()) {
            fileService.deleteFileByUrl(user.getCover());
        }
        File fileInfo = fileService.uploadFile(user, file);
        user.setCover(fileInfo.getUrl());
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    public UserDTO removeCover(Long userId) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if(user.getCover() != null && !user.getCover().isEmpty()) {
            fileService.deleteFileByUrl(user.getCover());
            user.setCover(null);
            User savedUser = userRepository.save(user);
            return modelMapper.map(savedUser, UserDTO.class);
        }
        return modelMapper.map(user, UserDTO.class);
    }

    public UserDTO getProfile(Long id) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return modelMapper.map(user, UserDTO.class);
    }

    public void logoutUser(@CurrentUser CustomUserDetails currentUser, LogOutRequest logOutRequest) {
        String deviceId = logOutRequest.getDeviceInfo().getDeviceId();
        UserDevice userDevice = userDeviceService.findDeviceByUserId(currentUser.getId(), deviceId)
                .filter(device -> device.getDeviceId().equals(deviceId))
                .orElseThrow(() -> new UserLogoutException(logOutRequest.getDeviceInfo().getDeviceId(), "Invalid device Id supplied. No matching device found for the given user "));

        logger.info("Removing refresh token associated with device [" + userDevice + "]");
        refreshTokenService.deleteById(userDevice.getRefreshToken().getId());
    }

    public Page<UserDTO> searchUsers(String query, Pageable pageable) {
        Page<User> users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(query, query, query, query, pageable);
        Page<UserDTO> userList = users.map(user -> modelMapper.map(user, UserDTO.class));
        return userList;
    }

    public Set<UserDevice> getUserDevicesByUserId(Long userId) {
        User user = findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return userDeviceService.getUserDevicesByUserId(userId);
    }

    public Set<UserDTO> findUsersUnseenMessage(Long messageId, Long conversationId) {
        Set<User> users = userRepository.findUsersUnseenMessage(messageId, conversationId);
        Set<UserDTO> userList = users.stream().map(user -> modelMapper.map(user, UserDTO.class)).collect(Collectors.toSet());
        return userList;
    }

    public Set<UserDTO> findUsersSeenMessage(Long messageId, Long conversationId) {
        Set<User> users = userRepository.findUsersSeenMessage(messageId, conversationId);
        Set<UserDTO> userList = users.stream().map(user -> modelMapper.map(user, UserDTO.class)).collect(Collectors.toSet());
        return userList;
    }

    public UserDTO updateNotification(Long userId, UpdateNotificationRequest request) {
        User user = findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setNotification(request.getNotification());
        User savedUser = save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }
}
