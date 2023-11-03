package com.elec5619.group14.flicker.ChatApp;

import com.elec5619.group14.flicker.AuthApp.model.DeviceType;
import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.model.payload.DeviceInfo;
import com.elec5619.group14.flicker.AuthApp.model.payload.LogOutRequest;
import com.elec5619.group14.flicker.AuthApp.model.payload.LoginRequest;
import com.elec5619.group14.flicker.AuthApp.model.payload.RegistrationRequest;
import com.elec5619.group14.flicker.AuthApp.repository.UserRepository;
import com.elec5619.group14.flicker.AuthApp.service.AuthService;
import com.elec5619.group14.flicker.AuthApp.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Optional;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(MockitoExtension.class)
public class BaseTest {
    public static final String BASE_URL = "http://localhost:9014";
    private ApplicationContext context;
    @Autowired
    public MockMvc mockMvc;
    @Autowired
    public UserRepository userRepository;
    @Autowired
    public UserService userService;
    @Autowired
    public AuthService authService;
    @Autowired
    public ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        //context = SpringApplication.run(FlickerApplication.class); // Literally just run our application.
    }

    public DeviceInfo getDeviceInfo() {
        DeviceInfo deviceInfo = new DeviceInfo();
        deviceInfo.setDeviceId("D2");
        deviceInfo.setDeviceType(DeviceType.DEVICE_TYPE_MACOS);
        deviceInfo.setNotificationToken("notification_token");
        return deviceInfo;
    }

    /*@AfterEach // Need to stop the server or else port will remain in use next test
    public void serverStop() {
        SpringApplication.exit(context);
    }*/

    public User getOrCreateUser(String username, String email) throws Exception {
        Optional<User> optionalUser = userService.findByUsername(username);
        if(optionalUser.isPresent())
            return optionalUser.get();
        else {
            RegistrationRequest request = new RegistrationRequest();
            request.setUsername(username);
            request.setEmail(email);
            request.setPassword("12345");
            request.setPhoneNumber("123456789");
            request.setRegisterAsAdmin(false);

            Optional<User> registeredUser = authService.registerUser(request);

            User newUser = registeredUser.get();
            newUser.setActive(true);
            newUser.setIsEmailVerified(true);
            newUser.setOnline(true);

            return userService.save(newUser);
        }
    }

    public String loginAndGetToken(LoginRequest loginRequest) throws Exception {
        DeviceInfo deviceInfo = getDeviceInfo();

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String jsonOutput = gson.toJson(loginRequest);

        // Perform the POST request to login and get the token
        ResultActions result = mockMvc.perform(
                MockMvcRequestBuilders
                        .post(BASE_URL + "/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonOutput)
        );

        // Verify the response
        MvcResult mvcResult = result.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn();  // Get the MvcResult

        String responseContent = mvcResult.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);
        String token = responseJson.get("accessToken").asText();  // Extract the "token" field

        return token;
    }

    public String logout(String token) throws Exception {
        // Define the login request body
        DeviceInfo deviceInfo = getDeviceInfo();

        LogOutRequest logoutRequest = new LogOutRequest();
        logoutRequest.setDeviceInfo(deviceInfo);

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String jsonOutput = ((Gson) gson).toJson(logoutRequest);

        // Perform the POST request to login and get the token
        ResultActions result = mockMvc.perform(
                MockMvcRequestBuilders
                        .post(BASE_URL + "/api/user/logout")
                        .header("Authorization", "Bearer " + token)  // Set the authorization header
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonOutput)
        );

        // Verify the response
        MvcResult mvcResult = result.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn();  // Get the MvcResult


        String responseContent = mvcResult.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);
        String data = responseJson.get("data").asText();

        return data;

    }
}
