package com.elec5619.group14.flicker.ChatApp;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.dto.UserDTO;
import com.elec5619.group14.flicker.AuthApp.model.payload.LoginRequest;
import com.elec5619.group14.flicker.ChatApp.model.dto.PageDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(MockitoExtension.class)
public class FriendshipTest extends BaseTest {
    @Test
    public void testGetFriends() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        // Perform the POST request to create a conversation
        MvcResult mvcResult = mockMvc.perform(
                        MockMvcRequestBuilders
                                .get(BASE_URL + "/api/friendship/friends")
                                .header("Authorization", "Bearer " + token)  // Set the authorization header
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();

        PageDTO<UserDTO> friends = objectMapper.readValue(responseContent, PageDTO.class);

        assertEquals(2, friends.getContent().size());
        assertEquals(10, friends.getSize());
        assertEquals(2, friends.getTotalElements());
    }

    @Test
    public void testGetNumOfFriends() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        // Perform the POST request to create a conversation
        MvcResult mvcResult = mockMvc.perform(
                        MockMvcRequestBuilders
                                .get(BASE_URL + "/api/friendship/numOfFriends/1")
                                .header("Authorization", "Bearer " + token)  // Set the authorization header
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();

        Integer numOfFriends = objectMapper.readValue(responseContent, Integer.class);

        assertEquals(2, numOfFriends);

    }

    @Test
    public void testSearchFriends() throws Exception {
        User user1 = getOrCreateUser("HCN", "");
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user1.getEmail());
        loginRequest.setPassword("123456");
        loginRequest.setDeviceInfo(getDeviceInfo());

        String token = loginAndGetToken(loginRequest);

        // Perform the POST request to create a conversation
        MvcResult mvcResult = mockMvc.perform(
                        MockMvcRequestBuilders
                                .get(BASE_URL + "/api/friendship/friends/search?searchTerm=h")
                                .header("Authorization", "Bearer " + token)  // Set the authorization header
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        String responseContent = mvcResult.getResponse().getContentAsString();

        PageDTO<UserDTO> friends = objectMapper.readValue(responseContent, PageDTO.class);

        assertEquals(1, friends.getContent().size());
        assertEquals(10, friends.getSize());
        assertEquals(1, friends.getTotalElements());
    }
}
