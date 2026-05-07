package com.techfix.agenda.service;

import com.techfix.agenda.dto.ClienteRequest;
import com.techfix.agenda.dto.ClienteResponse;

import java.util.List;

public interface ClienteService {

    List<ClienteResponse> findAll();

    ClienteResponse findById(Long id);

    ClienteResponse create(ClienteRequest request);

    ClienteResponse update(Long id, ClienteRequest request);

    void delete(Long id);
}
