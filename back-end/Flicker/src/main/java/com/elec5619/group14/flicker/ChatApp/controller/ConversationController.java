package com.elec5619.group14.flicker.ChatApp.controller;

import com.elec5619.group14.flicker.AuthApp.annotation.CurrentUser;
import com.elec5619.group14.flicker.AuthApp.model.CustomUserDetails;
import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.dto.UserDTO;
import com.elec5619.group14.flicker.ChatApp.model.*;
import com.elec5619.group14.flicker.ChatApp.model.payload.*;
import com.elec5619.group14.flicker.ChatApp.service.ConversationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("api/conversation")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ConversationController {
    @Autowired
    private ConversationService conversationService;

    @GetMapping ("/get/{conversationId}")
    public ResponseEntity<Conversation> getConversationById(@PathVariable Long conversationId) {
        return ResponseEntity.ok(conversationService.findConversationById(conversationId));
    }
    @PostMapping(path = "/create", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Conversation> createConversation(@CurrentUser CustomUserDetails currentUser, @RequestBody CreateConversationRequest request) {
        Conversation conversation = conversationService.createConversation(currentUser.getId(), request);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping(path = "/create/private-chat")
    public ResponseEntity<Conversation> createPrivateChat(@CurrentUser CustomUserDetails currentUser, @RequestParam Long userId2) {
        return ResponseEntity.ok(conversationService.createPrivateChat(currentUser.getId(), userId2));
    }

    @GetMapping(path = "/get", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Conversation>> getAllConversations(@CurrentUser CustomUserDetails currentUser,
                                                                          @RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<Conversation> conversations = conversationService.getNonHiddenConversations(currentUser.getId());
        Page<Conversation> pagesOfConversations = conversationService.getPagesOfConversations(conversations, pageable);
        return ResponseEntity.ok(pagesOfConversations);
    }

    @GetMapping(path = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Conversation>> searchConversations(@CurrentUser CustomUserDetails currentUser,
                                                                  @RequestParam String query,
                                                                  @RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<Conversation> conversations = conversationService.getNonHiddenConversationsByName(currentUser.getId(), query);
        Page<Conversation> pagesOfConversations = conversationService.getPagesOfConversations(conversations, pageable);
        return ResponseEntity.ok(pagesOfConversations);
    }

    @GetMapping(path = "/get/non-archived", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Conversation>> getNonArchivedConversations(@CurrentUser CustomUserDetails currentUser,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<Conversation> conversations = conversationService.getNonArchivedConversations(currentUser.getId());
        Page<Conversation> pagesOfConversations = conversationService.getPagesOfConversations(conversations, pageable);
        return ResponseEntity.ok(pagesOfConversations);
    }

    @GetMapping(path = "/get/archived", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Conversation>> getArchivedConversations(@CurrentUser CustomUserDetails currentUser,
                                                                          @RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<Conversation> archivedConversations = conversationService.getArchivedConversations(currentUser.getId(), false);
        Page<Conversation> pagesOfArchivedConversations = conversationService.getPagesOfConversations(archivedConversations, pageable);
        return ResponseEntity.ok(pagesOfArchivedConversations);
    }

    @GetMapping(path = "/get/non-hidden", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Conversation>> getNonHiddenConversations(@CurrentUser CustomUserDetails currentUser,
                                                                          @RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<Conversation> conversations = conversationService.getNonHiddenConversations(currentUser.getId());
        Page<Conversation> pagesOfConversations = conversationService.getPagesOfConversations(conversations, pageable);
        return ResponseEntity.ok(pagesOfConversations);
    }

    @GetMapping(path = "/get/hidden", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Conversation>> getHiddenConversations(@CurrentUser CustomUserDetails currentUser,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Set<Conversation> archivedConversations = conversationService.getHiddenConversations(currentUser.getId());
        Page<Conversation> pagesOfArchivedConversations = conversationService.getPagesOfConversations(archivedConversations, pageable);
        return ResponseEntity.ok(pagesOfArchivedConversations);
    }

    @MessageMapping("/update/{conversationId}/users/add/{currentUserId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message addUsers(@DestinationVariable(value = "conversationId") Long conversationId,
                            @DestinationVariable(value = "currentUserId") Long currentUserId,
                            @Payload AddUsersToConversationRequest request) {
        return conversationService.addUsers(currentUserId, conversationId, request);
    }

    /*@PutMapping("/update/users/add/{conversationId}")
    public Message addUsers(@PathVariable Long conversationId, @CurrentUser CustomUserDetails currentUser, @RequestBody AddUsersToConversationRequest request) {
        return conversationService.addUsers(currentUser.getId(), conversationId, request);
    }*/

    @MessageMapping("/update/{conversationId}/users/remove/{currentUserId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message removeUsers(@DestinationVariable(value = "conversationId") Long conversationId,
                               @DestinationVariable(value = "currentUserId") Long currentUserId,
                               @Payload RemoveUsersFromConversationRequest request) {
        return conversationService.removeUsers(currentUserId, conversationId, request);
    }

    /*@PutMapping("/update/users/remove/{conversationId}")
    public Message removeUsers(@PathVariable Long conversationId, @CurrentUser CustomUserDetails currentUser, @RequestBody RemoveUsersFromConversationRequest request) {
        return conversationService.removeUsers(currentUser.getId(), conversationId, request);
    }*/

    @MessageMapping("/update/rename/{conversationId}/{currentUserId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message renameConversation(@DestinationVariable(value = "conversationId") Long conversationId,
                                      @DestinationVariable(value = "currentUserId") Long currentUserId,
                                      @Payload RenameConversationRequest request) {
        return conversationService.renameConversation(currentUserId, conversationId, request);
    }

    @MessageMapping("/update/{conversationId}/user/leave/{currentUserId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message leaveConversation(@DestinationVariable(value = "conversationId") Long conversationId, @DestinationVariable(value = "currentUserId") Long currentUserId) {
        return conversationService.leaveConversation(currentUserId, conversationId);
    }

    /*@PutMapping("/update/user/leave/{conversationId}")
    public Message leaveConversation(@PathVariable Long conversationId, @CurrentUser CustomUserDetails currentUser) {
        return conversationService.leaveConversation(currentUser.getId(), conversationId);
    }*/

    /*@MessageMapping("/update/photo/{conversationId}/{currentUserId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message updateGroupPhoto(@DestinationVariable(value = "conversationId") Long conversationId,
                                    @DestinationVariable(value = "currentUserId") Long currentUserId,
                                    @Payload MultipartFile file) throws Exception {
        return conversationService.updateGroupPhoto(currentUserId, conversationId, file);
    }*/

    @PostMapping("file/groupPhoto/update/{conversationId}")
    public ResponseEntity<Conversation> updateGroupPhoto(@CurrentUser CustomUserDetails currentUser,
                                                 @PathVariable(value = "conversationId") Long conversationId,
                                                 @RequestBody MultipartFile file) throws Exception {
        return ResponseEntity.ok(conversationService.updateGroupPhoto(currentUser.getId(), conversationId, file));
    }

    /*@MessageMapping("/update/photo/remove/{conversationId}/{currentUserId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message removeGroupPhoto(@DestinationVariable(value = "conversationId") Long conversationId,
                                    @DestinationVariable(value = "currentUserId") Long currentUserId) {
        return conversationService.removeGroupPhoto(currentUserId, conversationId);
    }*/

    @PutMapping("file/groupPhoto/remove/{conversationId}")
    public ResponseEntity<Conversation> removeGroupPhoto(@CurrentUser CustomUserDetails currentUser,
                                                         @PathVariable(value = "conversationId") Long conversationId) {
        return ResponseEntity.ok(conversationService.removeGroupPhoto(currentUser.getId(), conversationId));
    }

    /*@MessageMapping("/files/upload/{conversationId}/{currentUserId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message uploadFilesInConversation(@DestinationVariable(value = "currentUserId") Long currentUserId,
                                             @DestinationVariable(value = "conversationId") Long conversationId,
                                             @Payload SendMessageRequest request,
                                             @Payload List<MultipartFile> files) throws Exception {
        return conversationService.uploadFilesInConversation(currentUserId, conversationId, request, files);
    }*/

    @PostMapping(path = "/files/upload/{conversationId}")
    public ResponseEntity<Set<File>> uploadFilesInConversation(@CurrentUser CustomUserDetails currentUser,
                                             @PathVariable Long conversationId,
                                             @RequestBody List<MultipartFile> files) throws Exception {
        return ResponseEntity.ok(conversationService.uploadFilesInConversation(currentUser.getId(), conversationId, files));
    }

    @MessageMapping("/role/grant/{conversationId}/{currentUserId}")
    @SendTo("/topic/conversation/{conversationId}")
    public Message grantUserRole(@DestinationVariable(value = "currentUserId") Long currentUserId,
                                 @DestinationVariable(value = "conversationId") Long conversationId,
                                 @Payload GrantUserRoleRequest request) {
        return conversationService.grantUserRole(currentUserId, conversationId, request);
    }

    /*@PostMapping(path = "/role/grant/{conversationId}")
    public Message grantUserRole(@CurrentUser CustomUserDetails currentUser,
                                 @PathVariable Long conversationId,
                                 @RequestBody GrantUserRoleRequest request) {
        return conversationService.grantUserRole(currentUser.getId(), conversationId, request);
    }*/

    @PostMapping(path = "/archive/{conversationId}")
    public ResponseEntity<ArchivedConversation> archiveConversation(@CurrentUser CustomUserDetails currentUser, @PathVariable Long conversationId) {
        return ResponseEntity.ok(conversationService.archiveConversation(currentUser.getId(), conversationId));
    }

    @DeleteMapping(path = "/unarchive/{archivedConversationId}")
    public ResponseEntity<?> unarchiveConversation(@PathVariable Long archivedConversationId) {
        return ResponseEntity.ok(conversationService.unarchiveConversation(archivedConversationId));
    }

    @DeleteMapping(path = "/mark-removed/{archivedConversationId}")
    public ResponseEntity<?> markRemovedArchivedConversations(@PathVariable Long archivedConversationId) {
        return ResponseEntity.ok(conversationService.markRemovedArchivedConversation(archivedConversationId));
    }

    @DeleteMapping(path = "/remove/{conversationId}")
    public ResponseEntity<?> removeConversation(@CurrentUser CustomUserDetails currentUser, @PathVariable Long conversationId) {
        return ResponseEntity.ok(conversationService.removeConversation(currentUser.getId(), conversationId));
    }

    @PostMapping(path = "/hide/{conversationId}")
    public ResponseEntity<HiddenConversation> hideConversation(@CurrentUser CustomUserDetails currentUser, @PathVariable Long conversationId) {
        return ResponseEntity.ok(conversationService.hideConversation(currentUser.getId(), conversationId));
    }

    @DeleteMapping(path = "/unhide/{hiddenConversationId}")
    public ResponseEntity<?> unhideConversation(@PathVariable Long hiddenConversationId) {
        return ResponseEntity.ok(conversationService.unhideConversation(hiddenConversationId));
    }

    @GetMapping(path = "/language-preference/get/{conversationId}")
    public ResponseEntity<String> getLanguagePreference(@CurrentUser CustomUserDetails currentUser, @PathVariable Long conversationId) {
        return ResponseEntity.ok(conversationService.getLanguagePreferenceForConversationUser(currentUser.getId(), conversationId));
    }

    @PostMapping(path = "/language-preference/set/{conversationId}")
    public ResponseEntity<ConversationUserSetting> setLanguagePreference(@CurrentUser CustomUserDetails currentUser,
                                                                         @PathVariable Long conversationId,
                                                                         @RequestParam String preferredLanguage) {
        return ResponseEntity.ok(conversationService.setLanguagePreferenceForConversationUser(currentUser.getId(), conversationId, preferredLanguage));
    }

    @GetMapping(path = "/files/get/{conversationId}")
    public ResponseEntity<Page<File>> getAllFilesInConversation(@CurrentUser CustomUserDetails currentUser,
                                                             @PathVariable Long conversationId,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "10") int size) throws Exception {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(conversationService.getAllFilesInConversation(currentUser.getId(), conversationId, pageable));
    }

    @GetMapping(path = "/media/get/{conversationId}")
    public ResponseEntity<Page<File>> getMediaInConversation(@CurrentUser CustomUserDetails currentUser,
                                                                @PathVariable Long conversationId,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) throws Exception {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(conversationService.getMediaInConversation(currentUser.getId(), conversationId, pageable));
    }

    @GetMapping(path = "/docs/get/{conversationId}")
    public ResponseEntity<Page<File>> getDocsInConversation(@CurrentUser CustomUserDetails currentUser,
                                                             @PathVariable Long conversationId,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "10") int size) throws Exception {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(conversationService.getDocsInConversation(currentUser.getId(), conversationId, pageable));
    }

    @GetMapping(path = "/get/users-unseen/{messageId}/{conversationId}")
    public ResponseEntity<Set<UserDTO>> getUsersUnseenMessage(@CurrentUser CustomUserDetails currentUser,
                                                           @PathVariable Long messageId,
                                                            @PathVariable Long conversationId){
        return ResponseEntity.ok(conversationService.getUsersUnseenMessage(currentUser.getId(), messageId, conversationId));
    }

    @GetMapping(path = "/get/users-seen/{messageId}/{conversationId}")
    public ResponseEntity<Set<UserDTO>> getUsersSeenMessage(@CurrentUser CustomUserDetails currentUser,
                                                            @PathVariable Long messageId,
                                                            @PathVariable Long conversationId){
        return ResponseEntity.ok(conversationService.getUsersSeenMessage(currentUser.getId(), messageId, conversationId));
    }

    @GetMapping(path = "/get/numOfUnseenMessages/{conversationId}")
    public ResponseEntity<Integer> getNumOfUnseenMessages(@CurrentUser CustomUserDetails currentUser,
                                                            @PathVariable Long conversationId){
        return ResponseEntity.ok(conversationService.getNumOfUnseenMessages(currentUser.getId(), conversationId));
    }

    @GetMapping(path = "/get/userRoles/{conversationId}")
    public ResponseEntity<HashMap<Long, RoleConversationName>> getUserRolesInConversation(@CurrentUser CustomUserDetails currentUser,
                                                                                          @PathVariable Long conversationId){
        return ResponseEntity.ok(conversationService.getUserRolesInConversation(currentUser.getId(), conversationId));
    }

    @PutMapping(path = "/notification/set/{conversationId}")
    public ResponseEntity<ConversationUserSetting> setNotificationStatus(@CurrentUser CustomUserDetails currentUser,
                                                                         @PathVariable Long conversationId,
                                                                         @RequestBody UpdateNotificationRequest request){
        return ResponseEntity.ok(conversationService.setNotificationStatusForConversationUser(currentUser.getId(), conversationId, request));
    }

    @GetMapping(path = "/notification/get/{conversationId}")
    public ResponseEntity<Boolean> getNotificationStatus(@CurrentUser CustomUserDetails currentUser,
                                                         @PathVariable Long conversationId){
        return ResponseEntity.ok(conversationService.getNotificationStatusForConversationUser(currentUser.getId(), conversationId));
    }
}
