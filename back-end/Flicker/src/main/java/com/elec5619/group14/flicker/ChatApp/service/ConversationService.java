package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.dto.UserDTO;
import com.elec5619.group14.flicker.AuthApp.service.UserService;
import com.elec5619.group14.flicker.ChatApp.exception.InvalidInputException;
import com.elec5619.group14.flicker.ChatApp.model.*;
import com.elec5619.group14.flicker.ChatApp.model.payload.*;
import com.elec5619.group14.flicker.ChatApp.repository.ConversationRepository;
import com.elec5619.group14.flicker.ChatApp.repository.MessageRepository;
import com.elec5619.group14.flicker.ChatApp.util.DataStructuresHandle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ConversationService {
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private ArchivedConversationService archivedConversationService;
    @Autowired
    private HiddenConversationService hiddenConversationService;
    @Autowired
    private ConversationUserSettingService conversationUserSettingService;
    @Autowired
    private MessageUserSettingService messageUserSettingService;
    @Autowired
    private FileService fileService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    private DataStructuresHandle handle = new DataStructuresHandle();

    public Conversation findConversationById(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        return conversation;
    }

    public Page<Conversation> getAllConversations(Long userId, Pageable pageable) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return conversationRepository.findAllConversations(pageable, userId);
    }

    public Set<Conversation> getNonArchivedConversations(Long userId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return conversationRepository.findNonArchivedConversationsForUser(userId);
    }

    public Set<Conversation> getArchivedConversations(Long userId, Boolean isRemoved) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return conversationRepository.findArchivedConversationsForUser(userId, isRemoved);
    }

    public Set<Conversation> getNonHiddenConversations(Long userId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return conversationRepository.findNonHiddenConversationsForUser(userId);
    }

    public Set<Conversation> getNonHiddenConversationsWithMessages(Long userId, Pageable pageable) {
        userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Set<Conversation> conversations = conversationRepository.findNonHiddenConversationsForUser(userId);

        Set<Conversation> results = conversations.stream().filter(c -> {
            Optional<ArchivedConversation> archivedConversation = archivedConversationService.findByUserIdAndConversationId(userId, c.getId());
            if (!archivedConversation.isPresent()) {
                Page<Message> messages = messageRepository.findAllBeforeLeft(pageable, userId, c.getId());
                return messages.getContent().size() >= 1;
            }
            else {
                Page<Message> messages = messageRepository.findMessagesAfterArchiveAndBeforeLeft(pageable, userId, c.getId());
                return messages.getContent().size() >= 1;
            }

        }).collect(Collectors.toSet());

        return results;
    }

    public Set<Conversation> getHiddenConversations(Long userId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return conversationRepository.findHiddenConversationsForUser(userId);
    }

    public Page<Conversation> getPagesOfConversations(Set<Conversation> conversations, Pageable pageable) {
        return handle.setToPage(conversations, pageable);
    }

    public String getConversationNameById(Long id) {
        return conversationRepository.getConversationNameById(id);
    }

    public Page<Conversation> getAllConversationsByName(String conversationName, Pageable pageable) {
        return conversationRepository.findByConversationNameContainingIgnoreCase(conversationName, pageable);
    }

    public Set<Conversation> getNonHiddenConversationsByName(Long userId, String query) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Set<Conversation> nonHiddenConversations = getNonHiddenConversations(userId);
        Set<Conversation> filteredConversations = nonHiddenConversations.stream()
                .filter(c -> {
                    if(c.getIsGroup()) {
                        if (c.getConversationName() != null)
                            return c.getConversationName().toLowerCase().contains(query.toLowerCase());
                        else
                            return false;
                    }
                    else {
                        Set<User> filteredUsers = c.getUsers().stream().filter(u -> u.getDisplayName().toLowerCase().contains(query.toLowerCase()) && !u.getDisplayName().equalsIgnoreCase(user.getDisplayName())).collect(Collectors.toSet());
                        return filteredUsers.size() > 0;
                    }
                })
                .collect(Collectors.toSet());
        Set<Conversation> sortedConversations = new TreeSet<>(
                Comparator.comparing(Conversation::getUpdatedAt).reversed()
        );

        sortedConversations.addAll(filteredConversations);
        return sortedConversations;
    }

    public Conversation save (Conversation conversation) {
        return conversationRepository.save(conversation);
    }

    public Conversation validateUserInConversation(User user, Long conversationId) {
        Conversation conversation = findConversationById(conversationId);
        Boolean exist = false;
        for(User member: conversation.getUsers()) {
            if(member.getId() == user.getId()) {
                exist = true;
                break;
            }
        }

        if (!exist) {
            throw new IllegalArgumentException("User: " + user.getUsername() + " not in specified conversation: " + conversation.getId());
        }
        return conversation;
    }

    public Boolean userWasInConversation(Long userId, Long conversationId) {
        Optional<ConversationUserSetting> conversationUserSetting = conversationUserSettingService.findByUserIdAndConversationId(userId, conversationId);
        return conversationUserSetting.isPresent();
    }

    public Boolean checkUserInConversation(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = findConversationById(conversationId);
        return conversation.getUsers().contains(user);
    }

    public Set<Long> getAllUsersIdByConversationId(Long id) {
        Conversation conversation = findConversationById(id);
        Set<User> users = conversation.getUsers();
        Set<Long> userIds = new HashSet<>();
        users.stream().forEach(user -> userIds.add(user.getId()));
        return userIds;
    }

    public Set<String> getAllUserDisplayNamesByConversationId(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        Set<User> users = conversation.getUsers();
        Set<String> userDisplayName = new HashSet<>();
        users.stream().forEach(u -> userDisplayName.add(u.getDisplayName()));
        return userDisplayName;
    }

    public Conversation createPrivateChat(Long userId1, Long userId2) {
        if(userId1 == userId2)
            throw new IllegalArgumentException("Cannot create a conversation that just includes 2 same userIds");
        User user1 = userService.findById(userId1).orElseThrow(() -> new IllegalArgumentException("User id: " + userId1 + " not found"));
        User user2 = userService.findById(userId2).orElseThrow(() -> new IllegalArgumentException("User id: " + userId2 + " not found"));

        Optional<Conversation> c = conversationRepository.findByTwoUsers(userId1, userId2);
        if(!c.isPresent()) {
            Conversation conversation = new Conversation();
            conversation.getUsers().add(user1);
            conversation.getUsers().add(user2);
            conversation.setIsGroup(false);
            Conversation savedConversation = save(conversation);

            ConversationUserSetting conversationUserSetting1 = ConversationUserSetting.builder()
                    .user(user1).conversation(conversation).dateJoined(Instant.now()).role(RoleConversationName.ROLE_PARTICIPANT).preferredLanguage(user1.getLanguage()).notification(true).build();
            conversationUserSettingService.save(conversationUserSetting1);
            ConversationUserSetting conversationUserSetting2 = ConversationUserSetting.builder()
                    .user(user2).conversation(conversation).dateJoined(Instant.now()).role(RoleConversationName.ROLE_PARTICIPANT).preferredLanguage(user2.getLanguage()).notification(true).build();
            conversationUserSettingService.save(conversationUserSetting2);

            savedConversation.getUsers().forEach(u -> {
                simpMessagingTemplate.convertAndSend("/topic/user/" + u.getId(), savedConversation);
            });

            return savedConversation;
        }
        return c.get();
    }

    public Conversation createConversation(Long userId, CreateConversationRequest request) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (request == null || request.getUserIds() == null || request.getUserIds().size() < 3 || request.getUserIds().size() > 100) {
            throw new InvalidInputException("Number of participants in a group must be between 3 and 100");
        }
        request.getUserIds().add(userId);
        String name = "";
        Set<User> users = new HashSet<>();
        Conversation conversation = Conversation.builder().users(users).isGroup(true).build();
        save(conversation);

        for (Long currId : request.getUserIds()) {
            User member = userService.findById(currId).orElseThrow(() -> new IllegalArgumentException("Member not found"));
            users.add(member);
            name += " " + member.getDisplayName() + ",";
            ConversationUserSetting conversationUserSetting;
            if(currId == userId) {
                conversationUserSetting = ConversationUserSetting.builder()
                        .user(member).conversation(conversation).dateJoined(Instant.now()).role(RoleConversationName.ROLE_ADMIN).preferredLanguage(user.getLanguage()).notification(true).build();
            }
            else {
                conversationUserSetting = ConversationUserSetting.builder()
                        .user(member).conversation(conversation).dateJoined(Instant.now()).role(RoleConversationName.ROLE_PARTICIPANT).preferredLanguage(member.getLanguage()).notification(true).build();
            }
            conversationUserSettingService.save(conversationUserSetting);
        }

        conversation.setUsers(users);

        if(request.getName() == null || request.getName().equals("")) {
            conversation.setConversationName(name);
        }
        else {
            conversation.setConversationName(request.getName());
        }

        Conversation savedConversation = save(conversation);

        savedConversation.getUsers().forEach(u -> {
            simpMessagingTemplate.convertAndSend("/topic/user/" + u.getId(), conversation);
        });

        Message message = Message.builder()
                .content(String.format("'@%s' has created the group: %s", user.getDisplayName(), conversation.getConversationName(), user.getDisplayName()))
                .messageType(MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                .sender(user)
                .status(Message.Status.SENT)
                .conversation(savedConversation)
                .deleted(false)
                .build();
        Message savedMessage = messageRepository.save(message);

        simpMessagingTemplate.convertAndSend("/topic/conversation/" + savedConversation.getId(), savedMessage);

        notificationService.sendNotificationToTopic(savedConversation, savedMessage);

        return savedConversation;
    }
    public Message addUsers(Long userId, Long conversationId, AddUsersToConversationRequest request) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        Set<User> oldUsers = new HashSet<User>(conversation.getUsers());
        ConversationUserSetting CUS = conversationUserSettingService.findByUserIdAndConversationId(userId, conversationId).orElseThrow(() -> new IllegalArgumentException("Not found conversation id: " + conversationId + " for the user id: " + userId));
        if(CUS.getRole() != RoleConversationName.ROLE_ADMIN && CUS.getRole() != RoleConversationName.ROLE_SUB_ADMIN) {
            throw new IllegalArgumentException("You don't have permission to add new members. Just admin or sub-admin of the conversation can add new members");
        }

        else {
            String users = "";
            for (Long currId : request.getUserIds()) {
                User member = userService.findById(currId).orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (currId != userId) {
                    if (!conversation.getUsers().contains(member)) {
                        users += "'@" + member.getDisplayName() + "' ";
                        conversation.addToConversation(member);
                        Optional<ConversationUserSetting> conversationUserSetting = conversationUserSettingService.findByUserIdAndConversationId(currId, conversationId);
                        ConversationUserSetting cus;
                        if (!conversationUserSetting.isPresent()) {
                            cus = ConversationUserSetting.builder()
                                    .user(member).conversation(conversation).dateJoined(Instant.now()).role(RoleConversationName.ROLE_PARTICIPANT).preferredLanguage(member.getLanguage()).notification(true).build();
                        } else {
                            cus = conversationUserSetting.get();
                            cus.setDateJoined(Instant.now());
                            cus.setDateLeft(null);
                            cus.setRole(RoleConversationName.ROLE_PARTICIPANT);
                        }
                        conversationUserSettingService.save(cus);
                    }
                }
            }

            conversation.setUpdatedAt(Instant.now());

            Conversation savedConversation = save(conversation);

            Message message = Message.builder()
                    .content(String.format("%s was added to the group: %s by '@%s'.", users, conversation.getConversationName(), user.getDisplayName()))
                    .messageType(MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                    .sender(user)
                    .status(Message.Status.SENT)
                    .conversation(conversation)
                    .deleted(false)
                    .build();

            Message savedMessage = messageRepository.save(message);

            savedConversation.getUsers().stream().filter(u -> oldUsers.stream().noneMatch(ou -> ou.getId() == u.getId())).forEach(u -> {
                simpMessagingTemplate.convertAndSend("/topic/user/" + u.getId(), savedConversation);
            });

            oldUsers.forEach(u -> {
                simpMessagingTemplate.convertAndSend("/topic/user/" + u.getId() + "/updateUsers", savedConversation);
            });

            notificationService.sendNotificationToTopic(savedConversation, savedMessage);

            return savedMessage;
        }
    }

    public Message leaveConversation(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        Set<User> oldUsers = new HashSet<User>(conversation.getUsers());
        Message message = Message.builder()
                .content(String.format("'@%s' left the group: %s", user.getDisplayName(), conversation.getConversationName()))
                .messageType(MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                .sender(user)
                .status(Message.Status.SENT)
                .conversation(conversation)
                .deleted(false)
                .build();
        conversation.removeFromConversation(user);
        conversation.setUpdatedAt(Instant.now());
        Conversation savedConversation = save(conversation);

        ConversationUserSetting conversationUserSetting = conversationUserSettingService.findByUserIdAndConversationId(userId, conversationId).orElseThrow(() -> new IllegalArgumentException("Cannot find setting for user conversation: " + conversationId));
        conversationUserSetting.setDateLeft(Instant.now());
        conversationUserSettingService.save(conversationUserSetting);

        Message savedMessage = messageRepository.save(message);

        oldUsers.forEach(u -> {
            simpMessagingTemplate.convertAndSend("/topic/user/" + u.getId() + "/updateUsers", savedConversation);
        });

        notificationService.sendNotificationToTopic(savedConversation, savedMessage);

        return savedMessage;
    }

    public Message removeUsers(Long initiatorId, Long conversationId, RemoveUsersFromConversationRequest request) {
        User initiator = userService.findById(initiatorId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(initiator, conversationId);
        Set<User> oldUsers = new HashSet<User>(conversation.getUsers());
        ConversationUserSetting cus = conversationUserSettingService.findByUserIdAndConversationId(initiatorId, conversationId).orElseThrow(() -> new IllegalArgumentException("Not found conversation id: " + conversationId + " for the user id: " + initiatorId));
        if(cus.getRole() != RoleConversationName.ROLE_ADMIN && cus.getRole() != RoleConversationName.ROLE_SUB_ADMIN) {
            throw new IllegalArgumentException("You don't have permission to remove members. Just admin or sub-admin of the conversation can remove members");
        }
        else {
            String users = "";
            for (Long currId : request.getUserIds()) {
                User toBeRemoved = userService.findById(currId).orElseThrow(() -> new IllegalArgumentException("User not found"));
                validateUserInConversation(toBeRemoved, conversationId);
                if (conversation.getUsers().contains(toBeRemoved)) {
                    ConversationUserSetting conversationUserSetting = conversationUserSettingService.findByUserIdAndConversationId(currId, conversationId).orElseThrow(() -> new IllegalArgumentException("Cannot find setting for user conversation: " + conversationId));
                    if(conversationUserSetting.getRole() == RoleConversationName.ROLE_ADMIN)
                        continue;
                    users += toBeRemoved.getDisplayName();
                    conversation.removeFromConversation(toBeRemoved);
                    conversationUserSetting.setDateLeft(Instant.now());
                    conversationUserSettingService.save(conversationUserSetting);
                }
            }
            conversation.setUpdatedAt(Instant.now());

            Conversation savedConversation = save(conversation);

            Message message = Message.builder()
                    .content(String.format("'@%s' was removed from the group: %s by '@%s'.", users, conversation.getConversationName(), initiator.getDisplayName()))
                    .messageType(MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                    .sender(initiator)
                    .status(Message.Status.SENT)
                    .conversation(conversation)
                    .deleted(false)
                    .build();

            oldUsers.forEach(u -> {
                simpMessagingTemplate.convertAndSend("/topic/user/" + u.getId() + "/updateUsers", savedConversation);
            });

            Message savedMessage = messageRepository.save(message);

            notificationService.sendNotificationToTopic(savedConversation, savedMessage);

            return savedMessage;
        }
    }

    public Message grantUserRole(Long initiatorId, Long conversationId, GrantUserRoleRequest request) {
        User initiator = userService.findById(initiatorId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        User u = userService.findById(request.getUserId()).orElseThrow(() -> new IllegalArgumentException("The user to be granted role not found"));
        Conversation conversation = validateUserInConversation(initiator, conversationId);
        validateUserInConversation(u, conversationId);

        ConversationUserSetting cus = conversationUserSettingService.findByUserIdAndConversationId(initiatorId, conversationId).orElseThrow(() -> new IllegalArgumentException("Not found conversation id: " + conversationId + " for the user id: " + initiatorId));
        if(cus.getRole() != RoleConversationName.ROLE_ADMIN) {
            throw new IllegalArgumentException("You don't have permission to grant roles to other members. Just admin in the conversation can grant roles to members");
        }
        else {
            ConversationUserSetting cus1 = conversationUserSettingService.findByUserIdAndConversationId(request.getUserId(), conversationId).orElseThrow(() -> new IllegalArgumentException("Not found conversation id: " + conversationId + " for the user id: " + request.getUserId()));
            cus1.setRole(request.getRole());
            conversationUserSettingService.save(cus1);

            conversation.setUpdatedAt(Instant.now());

            Conversation savedConversation = save(conversation);

            Message message = Message.builder()
                    .content(String.format("'@%s' was granted the role '%s' by '@%s' in the group: %s", u.getDisplayName(), request.getRole(), initiator.getDisplayName(), conversation.getConversationName()))
                    .messageType(MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                    .sender(initiator)
                    .status(Message.Status.SENT)
                    .conversation(conversation)
                    .deleted(false)
                    .build();

            Message savedMessage = messageRepository.save(message);
            savedConversation.getUsers().forEach(user -> {
                simpMessagingTemplate.convertAndSend("/topic/user/" + user.getId() + "/updateUsers", savedConversation);
            });

            notificationService.sendNotificationToTopic(savedConversation, savedMessage);

            return savedMessage;
        }
    }

    public Message renameConversation(Long userId, Long conversationId, RenameConversationRequest request) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        if (conversation.getConversationName().equals(request.getConversationName())) {
            return null;
        }
        Message message = Message.builder()
                .content(String.format("'@%s' renamed the group: %s to: '%s'", user.getDisplayName(), conversation.getConversationName(), request.getConversationName()))
                .messageType(MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                .sender(user)
                .status(Message.Status.SENT)
                .conversation(conversation)
                .deleted(false)
                .build();

        conversation.setConversationName(request.getConversationName());
        conversation.setUpdatedAt(Instant.now());
        Conversation savedConversation = save(conversation);
        Message savedMessage = messageRepository.save(message);

        simpMessagingTemplate.convertAndSend("/topic/user/" + savedConversation.getId() + "/conversationName", savedConversation);
        notificationService.sendNotificationToTopic(savedConversation, savedMessage);

        return savedMessage;
    }

    /*public Message updateGroupPhoto(Long userId, Long conversationId, MultipartFile file) throws Exception {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        if(conversation.getAvatar() != null && !conversation.getAvatar().isEmpty()) {
            fileService.deleteFileByUrl(conversation.getAvatar());
        }
        File fileInfo = fileService.uploadFile(user, file);
        conversation.setAvatar(fileInfo.getUrl());

        Message message = Message.builder()
                .content(String.format("'@%s' updated the group's photo in the group %s", user.getDisplayName(), conversation.getConversationName()))
                .messageType(MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                .sender(user)
                .status(Message.Status.SENT)
                .conversation(conversation)
                .build();

        conversation.setUpdatedAt(Instant.now());
        save(conversation);
        return messageRepository.save(message);
    }*/

    public Conversation updateGroupPhoto(Long userId, Long conversationId, MultipartFile file) throws Exception {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        if(conversation.getAvatar() != null && !conversation.getAvatar().isEmpty()) {
            fileService.deleteFileByUrl(conversation.getAvatar());
        }
        File fileInfo = fileService.uploadFile(user, file);
        conversation.setAvatar(fileInfo.getUrl());
        conversation.setUpdatedAt(Instant.now());


        Conversation savedConversation = save(conversation);
        conversation.getUsers().forEach(u -> simpMessagingTemplate.convertAndSend("/topic/user/" + savedConversation.getId() + "/conversationAvatar", savedConversation));
        return savedConversation;
    }

    /*public Message removeGroupPhoto(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        if(conversation.getAvatar() != null && !conversation.getAvatar().isEmpty()) {
            fileService.deleteFileByUrl(conversation.getAvatar());
            conversation.setAvatar(null);
            Message message = Message.builder()
                    .content(String.format("'@%s' has removed the group's photo", user.getDisplayName()))
                    .messageType(MessageType.MESSAGE_TYPE_SYSTEM_TEXT)
                    .sender(user)
                    .status(Message.Status.SENT)
                    .conversation(conversation)
                    .build();
            conversation.setUpdatedAt(Instant.now());
            save(conversation);
            return messageRepository.save(message);
        }
        return null;
    }*/

    public Conversation removeGroupPhoto(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        if(conversation.getAvatar() != null && !conversation.getAvatar().isEmpty()) {
            fileService.deleteFileByUrl(conversation.getAvatar());
            conversation.setAvatar(null);
            conversation.setUpdatedAt(Instant.now());
            Conversation savedConversation = save(conversation);
            conversation.getUsers().forEach(u -> simpMessagingTemplate.convertAndSend("/topic/user/" + savedConversation.getId() + "/conversationAvatar", savedConversation));
            return savedConversation;
        }
        throw new IllegalArgumentException("The group's photo does not exist");
    }

    public ArchivedConversation archiveConversation(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Optional<ArchivedConversation> archivedConversation = archivedConversationService.findByUserIdAndConversationId(userId, conversationId);
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow( () -> new IllegalArgumentException("Conversation not found for id: " + conversationId));

        if (!archivedConversation.isPresent()) {
            ArchivedConversation newArchivedConversation = ArchivedConversation.builder()
                    .user(user)
                    .conversation(conversation)
                    .isRemoved(false)
                    .build();
            return archivedConversationService.save(newArchivedConversation);
        }
        else {
            ArchivedConversation existingArchivedConversation = archivedConversation.get();
            existingArchivedConversation.setUpdatedAt(Instant.now());
            return archivedConversationService.save(existingArchivedConversation);
        }
    }

    public Boolean unarchiveConversation(Long archivedConversationId) {
        ArchivedConversation archivedConversation = archivedConversationService.findById(archivedConversationId).orElseThrow(() -> new IllegalArgumentException("Archived Conversation not found for the id " + archivedConversationId));
        archivedConversationService.delete(archivedConversation);
        return true;
    }

    public ArchivedConversation markRemovedArchivedConversation(Long archivedConversationId) {
        ArchivedConversation archivedConversation = archivedConversationService.findById(archivedConversationId).orElseThrow(() -> new IllegalArgumentException("Archived Conversation not found for id: " + archivedConversationId));
        archivedConversation.setIsRemoved(true);
        return archivedConversationService.save(archivedConversation);
    }

    public ArchivedConversation removeConversation(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Optional<ArchivedConversation> archivedConversation = archivedConversationService.findByUserIdAndConversationId(userId, conversationId);
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow( () -> new IllegalArgumentException("Conversation not found for id: " + conversationId));

        if (!archivedConversation.isPresent()) {
            ArchivedConversation newArchivedConversation = ArchivedConversation.builder()
                    .user(user)
                    .conversation(conversation)
                    .isRemoved(true)
                    .build();
            return archivedConversationService.save(newArchivedConversation);
        }
        else {
            ArchivedConversation existingArchivedConversation = archivedConversation.get();
            existingArchivedConversation.setIsRemoved(true);
            existingArchivedConversation.setUpdatedAt(Instant.now());
            return archivedConversationService.save(existingArchivedConversation);
        }
    }

    public HiddenConversation hideConversation(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Optional<HiddenConversation> hiddenConversation = hiddenConversationService.findByUserIdAndConversationId(userId, conversationId);
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow( () -> new IllegalArgumentException("Conversation not found for id: " + conversationId));

        if (!hiddenConversation.isPresent()) {
            HiddenConversation newHiddenConversation = HiddenConversation.builder()
                    .user(user)
                    .conversation(conversation)
                    .build();
            return hiddenConversationService.save(newHiddenConversation);
        }
        else {
            HiddenConversation existingHiddenConversation = hiddenConversation.get();
            existingHiddenConversation.setUpdatedAt(Instant.now());
            return hiddenConversationService.save(existingHiddenConversation);
        }
    }

    public Boolean unhideConversation(Long hiddenConversationId) {
        HiddenConversation hiddenConversation = hiddenConversationService.findById(hiddenConversationId).orElseThrow(() -> new IllegalArgumentException("Hidden Conversation not found for the id " + hiddenConversationId));
        hiddenConversationService.delete(hiddenConversation);
        return true;
    }

    public ConversationUserSetting setLanguagePreferenceForConversationUser(Long userId, Long conversationId, String preferredLanguage) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        Optional<ConversationUserSetting> conversationUserPreference = conversationUserSettingService.findByUserIdAndConversationId(userId, conversationId);
        if(conversationUserPreference.isPresent()) {
            conversationUserPreference.get().setPreferredLanguage(preferredLanguage);
            return conversationUserSettingService.save(conversationUserPreference.get());
        }
        else {
            ConversationUserSetting conversationUserSetting1 = ConversationUserSetting.builder()
                    .user(user).conversation(conversation).dateJoined(Instant.now()).preferredLanguage(preferredLanguage).build();
            return conversationUserSettingService.save(conversationUserSetting1);
        }
    }

    public String getLanguagePreferenceForConversationUser(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        validateUserInConversation(user, conversationId);
        ConversationUserSetting conversationUserSetting = conversationUserSettingService.findByUserIdAndConversationId(userId, conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation id: " + conversationId + " not found for user id: " + userId));
        return conversationUserSetting.getPreferredLanguage();
    }

    public Set<File> uploadFilesInConversation(Long userId, Long conversationId, List<MultipartFile> files) throws Exception {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);

        return fileService.uploadFilesInConversation(user, conversation, files);
    }

    public Page<File> getAllFilesInConversation(Long userId, Long conversationId, Pageable pageable) throws Exception {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);

        return fileService.getAllFilesInConversation(conversationId, pageable);

    }

    public Page<File> getMediaInConversation(Long userId, Long conversationId, Pageable pageable) throws Exception {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);

        return fileService.getMediaInConversation(userId, conversationId, pageable);

    }

    public Page<File> getDocsInConversation(Long userId, Long conversationId, Pageable pageable) throws Exception {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);

        return fileService.getDocsInConversation(userId, conversationId, pageable);

    }

    public Set<UserDTO> getUsersUnseenMessage(Long userId, Long messageId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        validateUserInConversation(user, conversationId);
        Message message = messageRepository.findByMessageIdAndConversationId(messageId, conversationId).orElseThrow(() -> new IllegalArgumentException("Message with id: " + messageId + " not found in coversation id: " + conversationId));
        return userService.findUsersUnseenMessage(messageId, conversationId);
    }

    public Set<UserDTO> getUsersSeenMessage(Long userId, Long messageId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        validateUserInConversation(user, conversationId);
        Message message = messageRepository.findByMessageIdAndConversationId(messageId, conversationId).orElseThrow(() -> new IllegalArgumentException("Message with id: " + messageId + " not found in coversation id: " + conversationId));
        return userService.findUsersSeenMessage(messageId, conversationId);
    }

    public Integer getNumOfUnseenMessages(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        validateUserInConversation(user, conversationId);
        return messageUserSettingService.findUnseenMessages(userId, conversationId).size();
    }

    public HashMap<Long, RoleConversationName> getUserRolesInConversation(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        HashMap<Long, RoleConversationName> userRoles = new HashMap<>();
        Set<ConversationUserSetting> cus = conversationUserSettingService.findByConversationId(conversationId);
        for(ConversationUserSetting cur: cus) {
            userRoles.put(cur.getUser().getId(), cur.getRole());
        }
        return userRoles;
    }

    public ConversationUserSetting setNotificationStatusForConversationUser(Long userId, Long conversationId, UpdateNotificationRequest request) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Conversation conversation = validateUserInConversation(user, conversationId);
        Optional<ConversationUserSetting> conversationUserPreference = conversationUserSettingService.findByUserIdAndConversationId(userId, conversationId);
        if(conversationUserPreference.isPresent()) {
            conversationUserPreference.get().setNotification(request.getNotification());
            return conversationUserSettingService.save(conversationUserPreference.get());
        }
        else {
            ConversationUserSetting conversationUserSetting1 = ConversationUserSetting.builder()
                    .user(user).conversation(conversation).dateJoined(Instant.now()).notification(request.getNotification()).build();
            return conversationUserSettingService.save(conversationUserSetting1);
        }
    }

    public Boolean getNotificationStatusForConversationUser(Long userId, Long conversationId) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        validateUserInConversation(user, conversationId);
        ConversationUserSetting conversationUserSetting = conversationUserSettingService.findByUserIdAndConversationId(userId, conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation id: " + conversationId + " not found for user id: " + userId));
        return conversationUserSetting.getNotification();
    }
}