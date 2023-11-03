package com.elec5619.group14.flicker.ChatApp.controller;

import com.elec5619.group14.flicker.AuthApp.annotation.CurrentUser;
import com.elec5619.group14.flicker.AuthApp.model.CustomUserDetails;
import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.dto.UserDTO;
import com.elec5619.group14.flicker.ChatApp.model.FriendRequest;
import com.elec5619.group14.flicker.ChatApp.service.FriendshipService;
import io.swagger.v3.oas.annotations.Operation;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friendship")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FriendshipController {
    @Autowired
    private FriendshipService friendshipService;

    @PostMapping("/sendRequest")
    public ResponseEntity<?> sendFriendRequest(@CurrentUser CustomUserDetails currentUser, @RequestParam Long receiverId) {
        FriendRequest request = friendshipService.sendFriendRequest(currentUser.getId(), receiverId);
        return ResponseEntity.ok(request);
    }

    @PutMapping("/acceptRequest/{userId2}")
    public ResponseEntity<?> acceptFriendRequest(@CurrentUser CustomUserDetails currentUser, @PathVariable Long userId2) {
        FriendRequest request = friendshipService.acceptFriendRequest(userId2, currentUser.getId());
        return ResponseEntity.ok(request);
    }

    @PutMapping("/declineRequest/{userId2}")
    public ResponseEntity<?> declineFriendRequest(@CurrentUser CustomUserDetails currentUser, @PathVariable Long userId2) {
        FriendRequest request = friendshipService.declineFriendRequest(userId2, currentUser.getId());
        return ResponseEntity.ok(request);
    }

    @PutMapping("/removeSentRequest/{userId2}")
    public ResponseEntity<String> removeSentFriendRequest(@CurrentUser CustomUserDetails currentUser, @PathVariable Long userId2) {
        friendshipService.removeSentFriendRequest(currentUser.getId(), userId2);
        return ResponseEntity.ok("Successfully removed sent friend request");
    }

    @GetMapping("/pendingSentRequests")
    public ResponseEntity<?> listPendingSentRequests(@CurrentUser CustomUserDetails currentUser) {
        Set<UserDTO> pendingSentRequestsDTO = friendshipService.listPendingSentRequestsUsers(currentUser.getId());
        return ResponseEntity.ok(pendingSentRequestsDTO);
    }

    @GetMapping("/numOfPendingSentRequests")
    public ResponseEntity<?> numOfPendingSentRequests(@CurrentUser CustomUserDetails currentUser) {
        Integer numOfPendingSentRequests = friendshipService.numOfPendingSentRequestsUsers(currentUser.getId());
        return ResponseEntity.ok(numOfPendingSentRequests);
    }

    @GetMapping("/pendingReceivedRequests")
    public ResponseEntity<?> listPendingReceivedRequests(@CurrentUser CustomUserDetails currentUser) {
        Set<UserDTO> pendingReceivedRequestsDTO = friendshipService.listPendingReceivedRequestsUsers(currentUser.getId());
        return ResponseEntity.ok(pendingReceivedRequestsDTO);
    }

    @GetMapping("/numOfPendingReceivedRequests")
    public ResponseEntity<?> numOfPendingReceivedRequests(@CurrentUser CustomUserDetails currentUser) {
        Integer numOfPendingReceivedRequests = friendshipService.numOfPendingReceivedRequestsUsers(currentUser.getId());
        return ResponseEntity.ok(numOfPendingReceivedRequests);
    }

    @PutMapping("/unfriend/{userId2}")
    public ResponseEntity<?> unfriend(@CurrentUser CustomUserDetails currentUser, @PathVariable Long userId2) {
        return ResponseEntity.ok(friendshipService.unfriend(currentUser.getId(), userId2));
    }

    @GetMapping("/status/{userId2}")
    public ResponseEntity<FriendRequest.Status> getRequestStatus(@CurrentUser CustomUserDetails currentUser,  @PathVariable Long userId2) {
        FriendRequest.Status status = friendshipService.getRequestStatus(currentUser.getId(), userId2);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/friends")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Gets a list of friends of current user")
    public ResponseEntity<Page<UserDTO>> getFriends(@CurrentUser CustomUserDetails currentUser,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<UserDTO> friends = friendshipService.getFriends(currentUser.getId());
        Page<UserDTO> friendList = friendshipService.getPagesOfFriends(friends, pageable);
        return ResponseEntity.ok(friendList);
    }

    @GetMapping("/self-numOfFriends")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Gets the number of friends of current user")
    public ResponseEntity<Integer> getSelfNumOfFriends(@CurrentUser CustomUserDetails currentUser) {
        Integer numOfFriends = friendshipService.getNumOfFriends(currentUser.getId());
        return ResponseEntity.ok(numOfFriends);
    }

    @GetMapping("/numOfFriends/{userId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Gets the number of friends of any user")
    public ResponseEntity<Integer> getNumOfFriends(@PathVariable Long userId) {
        Integer numOfFriends = friendshipService.getNumOfFriends(userId);
        return ResponseEntity.ok(numOfFriends);
    }

    @GetMapping("/friends/search")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Search friends of a current user")
    public ResponseEntity<Page<UserDTO>> searchFriends(@CurrentUser CustomUserDetails currentUser,
                                                    @RequestParam String searchTerm,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<UserDTO> filteredFriends = friendshipService.getFilteredFriends(currentUser.getId(), searchTerm, pageable);
        Page<UserDTO> filteredFriendList = friendshipService.getPagesOfFriends(filteredFriends, pageable);
        return ResponseEntity.ok(filteredFriendList);
    }
}
