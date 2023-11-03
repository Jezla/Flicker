package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.dto.UserDTO;
import com.elec5619.group14.flicker.AuthApp.repository.UserRepository;
import com.elec5619.group14.flicker.ChatApp.model.FriendRequest;
import com.elec5619.group14.flicker.ChatApp.repository.FriendRequestRepository;
import com.elec5619.group14.flicker.ChatApp.util.DataStructuresHandle;
import org.apache.commons.lang3.StringUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FriendshipService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FriendRequestRepository friendRequestRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ConversationService conversationService;

    private DataStructuresHandle handle = new DataStructuresHandle();

    public FriendRequest sendFriendRequest(Long senderId, Long receiverId) {
        if(senderId == receiverId) {
            throw new IllegalArgumentException("Cannot send request to yourself");
        }
        FriendRequest frReq = getOrInitiateRequest(senderId, receiverId);
        if(frReq.getStatus() != null) {
            if(frReq.getStatus() == FriendRequest.Status.PENDING || frReq.getStatus() == FriendRequest.Status.ACCEPTED) {
                throw new IllegalArgumentException("Already a friend or request already initiated. Please check your friend list or pending requests list");
            }
            else {
                User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
                User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("User not found"));

                frReq.setSender(sender);
                frReq.setReceiver(receiver);
                frReq.setStatus(FriendRequest.Status.PENDING);
                return friendRequestRepository.save(frReq);
            }
        }
        else {
            User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("User not found"));

            frReq.setSender(sender);
            frReq.setReceiver(receiver);
            frReq.setStatus(FriendRequest.Status.PENDING);

            return friendRequestRepository.save(frReq);
        }
    }

    public FriendRequest acceptFriendRequest(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        FriendRequest request = friendRequestRepository.findBySenderAndReceiver(sender, receiver).orElseThrow(() -> new IllegalArgumentException("Request not found"));
        request.setStatus(FriendRequest.Status.ACCEPTED);
        conversationService.createPrivateChat(senderId, receiverId);

        return friendRequestRepository.save(request);
    }

    public FriendRequest declineFriendRequest(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        FriendRequest request = friendRequestRepository.findBySenderAndReceiver(sender, receiver).orElseThrow(() -> new IllegalArgumentException("Request not found"));
        request.setStatus(FriendRequest.Status.DECLINED);
        return friendRequestRepository.save(request);
    }

    public void removeSentFriendRequest(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        FriendRequest request = friendRequestRepository.findBySenderAndReceiver(sender, receiver).orElseThrow(() -> new IllegalArgumentException("Request not found"));
        friendRequestRepository.delete(request);
    }

    public Set<User> listRawDeclinedSentRequestsUsers(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Set<FriendRequest> declinedRequests = friendRequestRepository.findBySenderAndStatus(user, FriendRequest.Status.DECLINED);
        Set<User> declinedRequestsUsers = new HashSet<>();
        for(FriendRequest request: declinedRequests) {
            declinedRequestsUsers.add(request.getReceiver());
        }
        return declinedRequestsUsers;
    }

    public Set<UserDTO> listDeclinedSentRequestsUsers(Long userId) {
        Set<UserDTO> declinedRequestsDTO = listRawDeclinedSentRequestsUsers(userId).stream().map(request -> modelMapper.map(request, UserDTO.class))
                .collect(Collectors.toSet());
        return declinedRequestsDTO;
    }

    public Integer numOfDeclinedSentRequestsUsers(Long userId) {
        return listRawDeclinedSentRequestsUsers(userId).size();
    }

    public Set<User> listRawPendingSentRequestsUsers(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Set<FriendRequest> pendingSentRequests = friendRequestRepository.findBySenderAndStatus(user, FriendRequest.Status.PENDING);
        Set<User> pendingSentRequestsUsers = new HashSet<>();
        for(FriendRequest request: pendingSentRequests) {
            pendingSentRequestsUsers.add(request.getReceiver());
        }
        return pendingSentRequestsUsers;
    }

    public Set<UserDTO> listPendingSentRequestsUsers(Long userId) {
        Set<UserDTO> pendingSentRequestsDTO = listRawPendingSentRequestsUsers(userId).stream().map(request -> modelMapper.map(request, UserDTO.class))
                .collect(Collectors.toSet());
        return pendingSentRequestsDTO;
    }

    public Integer numOfPendingSentRequestsUsers(Long userId) {
        return listRawPendingSentRequestsUsers(userId).size();
    }

    public Set<User> listRawPendingReceivedRequestsUsers(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Set<FriendRequest> pendingReceivedRequests = friendRequestRepository.findByReceiverAndStatus(user, FriendRequest.Status.PENDING);
        Set<User> pendingReceivedRequestsUsers = new HashSet<>();
        for(FriendRequest request: pendingReceivedRequests) {
            pendingReceivedRequestsUsers.add(request.getSender());
        }
        return pendingReceivedRequestsUsers;
    }
    public Set<UserDTO> listPendingReceivedRequestsUsers(Long userId) {
        Set<UserDTO> pendingReceivedRequestsDTO = listRawPendingReceivedRequestsUsers(userId).stream().map(request -> modelMapper.map(request, UserDTO.class))
                .collect(Collectors.toSet());
        return pendingReceivedRequestsDTO;
    }

    public Integer numOfPendingReceivedRequestsUsers(Long userId) {
        return listRawPendingReceivedRequestsUsers(userId).size();
    }

    public FriendRequest unfriend(Long senderId, Long receiverId) {
        User user1 = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        User user2 = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Optional<FriendRequest> request = friendRequestRepository.findBySenderAndReceiverAndStatusOrReceiverAndSenderAndStatus(user1, user2, FriendRequest.Status.ACCEPTED, user1, user2, FriendRequest.Status.ACCEPTED);
        if(!request.isPresent())
           throw new IllegalArgumentException("Request not found");
        else {
            FriendRequest frReq = request.get();
            frReq.setStatus(FriendRequest.Status.NOT_FRIEND);
            return friendRequestRepository.save(frReq);
        }
    }

    public FriendRequest getOrInitiateRequest (Long senderId, Long receiverId) {
        User user1 = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        User user2 = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<FriendRequest> request = friendRequestRepository.findBySenderAndReceiverOrReceiverAndSender(user1, user2, user1, user2);
        if(request.isPresent())
            return request.get();
        else
            return new FriendRequest();
    }

    public FriendRequest.Status getRequestStatus(Long senderId, Long receiverId) {
        if(senderId == receiverId) {
            throw new IllegalArgumentException("Cannot check request status against yourself");
        }
        User user1 = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        User user2 = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<FriendRequest> optionalRequest = friendRequestRepository.findBySenderAndReceiverOrReceiverAndSender(user1, user2, user1, user2);

        return optionalRequest.map(request -> {
            switch (request.getStatus()) {
                case PENDING:
                    return FriendRequest.Status.PENDING;
                case ACCEPTED:
                    return FriendRequest.Status.ACCEPTED;
                case DECLINED:
                    return FriendRequest.Status.DECLINED;
                default:
                    return FriendRequest.Status.NOT_FRIEND;
            }
        }).orElse(FriendRequest.Status.NOT_FRIEND);
    }

    public Set<User> getRawFriends(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found")); // Handle not found
        Set<User> friends = new HashSet<>();

        // friends added by sending requests
        for (FriendRequest sentRequest : user.getSentRequests()) {
            if (sentRequest.getStatus() == FriendRequest.Status.ACCEPTED) {
                friends.add(sentRequest.getReceiver());
            }
        }

        // friends added by accepting requests
        for (FriendRequest receivedRequest : user.getReceivedRequests()) {
            if (receivedRequest.getStatus() == FriendRequest.Status.ACCEPTED) {
                friends.add(receivedRequest.getSender());
            }
        }
        return friends;
    }

    public Set<UserDTO> getFriends(Long userId) {
        Set<UserDTO> friendsDTO = getRawFriends(userId).stream().map(friend -> modelMapper.map(friend, UserDTO.class))
                .collect(Collectors.toSet());
        return friendsDTO;
    }

    public Set<UserDTO> getFilteredFriends(Long userId, String searchTerm, Pageable pageable) {
        Set<UserDTO> friends = getFriends(userId);
        // Filter and convert the set to a list
        Set<UserDTO> filteredFriends = friends.stream()
                .filter(friend ->
                        StringUtils.containsIgnoreCase(friend.getDisplayName(), searchTerm) ||
                                StringUtils.containsIgnoreCase(friend.getEmail(), searchTerm) ||
                                StringUtils.containsIgnoreCase(friend.getPhoneNumber(), searchTerm) ||
                                StringUtils.containsIgnoreCase(friend.getUsername(), searchTerm))
                .collect(Collectors.toSet());

        return filteredFriends;
    }

    public Page<UserDTO> getPagesOfFriends(Set<UserDTO> users, Pageable pageable) {
        return handle.setToPage(users, pageable);
    }

    public Integer getNumOfFriends(Long userId) {
        return getFriends(userId).size();
    }

    public HashMap<Long, String> searchUsersWithStatus(Long userId, String query, Pageable pageable) {
        Page<User> users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(query, query, query, query, pageable);
        HashMap<Long, String> result = new HashMap<>();
        Set<User> receivedFriendRequests = listRawPendingReceivedRequestsUsers(userId);
        Set<User> sentFriendRequests = listRawPendingSentRequestsUsers(userId);
        Set<User> declinedFriendRequests = listRawDeclinedSentRequestsUsers(userId);
        Set<User> friends = getRawFriends(userId);

        users.forEach((user) -> {
            if(user.getId() == userId) {}
            else if(receivedFriendRequests.contains(user)) {
                result.put(user.getId(), "PENDING_R");
            }
            else if(sentFriendRequests.contains(user)) {
                result.put(user.getId(), "PENDING_S");
            }
            else if(declinedFriendRequests.contains(user)) {
                result.put(user.getId(), "DECLINED");
            }
            else if(friends.contains(user)){
                result.put(user.getId(), "FRIEND");
            }
            else {
                result.put(user.getId(), "NOT_FRIEND");
            }
        });

        return result;
    }
}
