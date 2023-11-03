package com.elec5619.group14.flicker.ChatApp.repository;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.ChatApp.model.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    Set<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequest.Status status);
    Set<FriendRequest> findBySenderAndStatus(User receiver, FriendRequest.Status status);
    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);
    Optional<FriendRequest> findByReceiverAndSender(User receiver, User sender);
    Optional<FriendRequest> findBySenderAndReceiverAndStatusOrReceiverAndSenderAndStatus(User sender, User receiver, FriendRequest.Status status, User sender2, User receiver2, FriendRequest.Status status2);
    Optional<FriendRequest> findBySenderAndReceiverOrReceiverAndSender(User sender, User receiver, User sender2, User receiver2);
}
