package com.elec5619.group14.flicker.ChatApp.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class DataStructuresHandle {
    public <T> Page<T> setToPage(Set<T> set, Pageable pageable) {
        List<T> list = set.stream().collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        return new PageImpl<>(list.subList(start, end), pageable, list.size());
    }
}
