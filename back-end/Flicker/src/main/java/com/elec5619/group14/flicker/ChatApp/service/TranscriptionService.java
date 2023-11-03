package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.ChatApp.model.payload.TranscriptionRequest;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.speech.v1.*;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.cloud.StorageClient;
import com.google.protobuf.ByteString;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class TranscriptionService {
    @Value("${google.service.account.file}")
    private String serviceAccountFile;
    @Autowired
    private TranslationService translationService;

    public String transcribeAudio(TranscriptionRequest request) {
        String transcription = "";

        GoogleCredentials credentials;
        try {
            FileInputStream serviceAccount = new FileInputStream(new ClassPathResource(serviceAccountFile).getFile());
            credentials = GoogleCredentials.fromStream(serviceAccount);

            SpeechClient speechClient = SpeechClient.create(SpeechSettings.newBuilder().setCredentialsProvider(() -> credentials).build());

            //Blob blob = StorageClient.getInstance().bucket().get(audioFilePath);

            CloseableHttpClient httpClient = HttpClients.createDefault();
            HttpGet httpGet = new HttpGet(new URL(request.getAudioFilePath()).toURI());
            HttpResponse httpResponse = httpClient.execute(httpGet);

            if (httpResponse.getStatusLine().getStatusCode() == 200) {
                byte[] data = EntityUtils.toByteArray(httpResponse.getEntity());

                //FileInputStream file = new FileInputStream(new ClassPathResource("").getFile());

                //Path path = Paths.get(audioFilePath);

                //byte[] data = file.readAllBytes();
                //byte[] data = Files.readAllBytes(path);
                ByteString audioBytes = ByteString.copyFrom(data);

                RecognitionConfig.Builder configBuilder = RecognitionConfig.newBuilder()
                        .setEncoding(RecognitionConfig.AudioEncoding.WEBM_OPUS)
                        .setSampleRateHertz(48000)
                        .setLanguageCode("en-US");

                for(String languageCode: translationService.getSupportedLanguageCodes()) {
                    configBuilder.setLanguageCode(languageCode);
                }

                RecognitionConfig config = configBuilder.build();

                RecognitionAudio audio = RecognitionAudio.newBuilder()
                        .setContent(audioBytes)
                        .build();

                // Perform the transcription request
                RecognizeResponse response = speechClient.recognize(config, audio);
                // Print out the transcription results
                List<SpeechRecognitionResult> results = response.getResultsList();
                for (SpeechRecognitionResult result : results) {
                    // There can be several alternative transcriptions. Here we use the first (most likely).
                    SpeechRecognitionAlternative alternative = result.getAlternativesList().get(0);
                    transcription += alternative.getTranscript();
                }
            }
            else {
                System.err.println("Failed to fetch audio from URL: " + request.getAudioFilePath());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return transcription;
    }
}
