package com.elec5619.group14.flicker.ChatApp.service;

import com.elec5619.group14.flicker.AuthApp.model.User;
import com.elec5619.group14.flicker.AuthApp.repository.UserRepository;
import com.elec5619.group14.flicker.ChatApp.model.Conversation;
import com.elec5619.group14.flicker.ChatApp.model.File;
import com.elec5619.group14.flicker.ChatApp.model.Message;
import com.elec5619.group14.flicker.ChatApp.repository.FileRepository;
import com.google.api.core.ApiFuture;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;


import com.google.cloud.storage.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class FileService {
    private static final String COLLECTION_NAME = "files";
    @Autowired
    private FileRepository fileRepository;

    public String addDocument(String fileName) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();

        ApiFuture<WriteResult> result = db.collection(COLLECTION_NAME).document(fileName).set(new File());

        return result.get().getUpdateTime().toString();
    }

    public Optional<File> findById(Long fileId) {
        return fileRepository.findById(fileId);
    }

    public File save(File file) {
        return fileRepository.save(file);
    }

    public File uploadFile(User user, MultipartFile file) throws Exception {
        try {
            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + "_" + originalFileName; // to prevent filename collisions

            Blob blob = StorageClient.getInstance().bucket().create(storedFileName, file.getInputStream(), file.getContentType());

            String DOWNLOAD_URL = "https://firebasestorage.googleapis.com/v0/b/flicker-2b72d.appspot.com/o/%s?alt=media";

            File fileInfo = File.builder().originalFileName(originalFileName)
                    .storedFileName(storedFileName).contentType(file.getContentType())
                    .user(user)
                    .url(String.format(DOWNLOAD_URL, URLEncoder.encode(storedFileName, StandardCharsets.UTF_8))).build();

             return fileRepository.save(fileInfo);
        } catch (Exception e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }

    public Set<File> uploadFiles(User user, List<MultipartFile> files) throws Exception {
            Set<File> filesInfo = new HashSet<>();
            for(MultipartFile file: files) {

                String originalFileName = file.getOriginalFilename();
                String storedFileName = UUID.randomUUID() + "_" + originalFileName; // to prevent filename collisions

                Blob blob = StorageClient.getInstance().bucket().create(storedFileName, file.getInputStream(), file.getContentType());

                String DOWNLOAD_URL = "https://firebasestorage.googleapis.com/v0/b/flicker-2b72d.appspot.com/o/%s?alt=media";

                File fileInfo = File.builder().originalFileName(originalFileName)
                        .storedFileName(storedFileName).contentType(file.getContentType())
                        .user(user)
                        .url(String.format(DOWNLOAD_URL, URLEncoder.encode(storedFileName, StandardCharsets.UTF_8))).build();

                filesInfo.add(fileRepository.save(fileInfo));
            }
            return filesInfo;

    }

    public Set<File> uploadFilesInConversation(User user, Conversation conversation, List<MultipartFile> files) throws Exception {
        Set<File> filesInfo = new HashSet<>();
        for(MultipartFile file: files) {
            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + "_" + originalFileName; // to prevent filename collisions
            Blob blob = StorageClient.getInstance().bucket().create(storedFileName, file.getInputStream(), file.getContentType());

            String DOWNLOAD_URL = "https://firebasestorage.googleapis.com/v0/b/flicker-2b72d.appspot.com/o/%s?alt=media";

            File fileInfo = File.builder().originalFileName(originalFileName)
                    .storedFileName(storedFileName).contentType(file.getContentType())
                    .user(user).conversation(conversation)
                    .url(String.format(DOWNLOAD_URL, URLEncoder.encode(storedFileName, StandardCharsets.UTF_8))).build();
            filesInfo.add(fileRepository.save(fileInfo));
        }

        return filesInfo;
    }

    public Page<File> getAllFilesInConversation(Long conversationId, Pageable pageable) throws Exception {
            Page<File> files = fileRepository.findAllInConversation(pageable, conversationId);
            return files;
    }

    public Page<File> getMediaInConversation(Long userId, Long conversationId, Pageable pageable) throws Exception {
        Page<File> files = fileRepository.findMediaInConversation(pageable, conversationId, userId);
        return files;
    }

    public Page<File> getDocsInConversation(Long userId, Long conversationId, Pageable pageable) throws Exception {
        Page<File> files = fileRepository.findDocsInConversation(pageable, conversationId, userId);
        return files;
    }

    public ByteArrayResource downloadFile(Long fileId) {
        try {
            Optional<File> file = fileRepository.findById(fileId);
            if (!file.isPresent()) {
                throw new IllegalArgumentException(("File not found"));
            }

            File fileInfo = file.get();

            Blob blob = StorageClient.getInstance().bucket().get(fileInfo.getStoredFileName());
            if (blob == null) {
                throw new IllegalArgumentException(("File not found"));
            }

            byte[] content = blob.getContent();

            return new ByteArrayResource(content);
        } catch (Exception e) {
            return null;
        }
    }

    public String deleteFileByUrl(String url) {
        Optional<File> file = fileRepository.findByUrl(url);
        if (!file.isPresent()) {
            throw new IllegalArgumentException(("File not found in the SQL database"));
        }
        File fileInfo = file.get();

        boolean deleted = StorageClient.getInstance().bucket().get(fileInfo.getStoredFileName()).delete();

        if (deleted) {
            fileRepository.delete(fileInfo);
            return "File successfully deleted.";
        } else {
            return "File not found on firebase or something went wrong";  // File not found or any other error.
        }
    }

    public String deleteFileByStoredFileName(String storedFileName) {
        Optional<File> file = fileRepository.findByStoredFileName(storedFileName);
        if (!file.isPresent()) {
            throw new IllegalArgumentException(("File not found in the SQL database"));
        }
        File fileInfo = file.get();

        boolean deleted = StorageClient.getInstance().bucket().get(fileInfo.getStoredFileName()).delete();

        if (deleted) {
            fileRepository.delete(fileInfo);
            return "File successfully deleted.";
        } else {
            return "File not found on firebase or something went wrong";  // File not found or any other error.
        }
    }

    public String deleteFileById(Long fileId) {
        Optional<File> file = fileRepository.findById(fileId);
        if (!file.isPresent()) {
            throw new IllegalArgumentException(("File not found in the SQL database"));
        }
        File fileInfo = file.get();

        boolean deleted = StorageClient.getInstance().bucket().get(fileInfo.getStoredFileName()).delete();

        if (deleted) {
            fileRepository.delete(fileInfo);
            return "File successfully deleted.";
        } else {
            return "File not found on firebase or something went wrong";  // File not found or any other error.
        }
    }
}
