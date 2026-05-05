package com.techfix.agenda.service.impl;

import com.techfix.agenda.dto.ClienteRequest;
import com.techfix.agenda.dto.ClienteResponse;
import com.techfix.agenda.exception.BusinessException;
import com.techfix.agenda.exception.ResourceNotFoundException;
import com.techfix.agenda.mapper.ClienteMapper;
import com.techfix.agenda.model.Cliente;
import com.techfix.agenda.repository.ClienteRepository;
import com.techfix.agenda.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponse> findAll() {
        return clienteRepository.findAll()
                .stream()
                .map(clienteMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponse findById(Long id) {
        return clienteMapper.toResponse(getOrThrow(id));
    }

    @Override
    public ClienteResponse create(ClienteRequest request) {
        if (request.getEmail() != null && clienteRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un cliente con el email: " + request.getEmail());
        }
        Cliente saved = clienteRepository.save(clienteMapper.toEntity(request));
        return clienteMapper.toResponse(saved);
    }

    @Override
    public ClienteResponse update(Long id, ClienteRequest request) {
        Cliente cliente = getOrThrow(id);
        if (request.getEmail() != null
                && !request.getEmail().equals(cliente.getEmail())
                && clienteRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un cliente con el email: " + request.getEmail());
        }
        clienteMapper.updateEntity(request, cliente);
        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    @Override
    public void delete(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente", id);
        }
        clienteRepository.deleteById(id);
    }

    private Cliente getOrThrow(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
    }
}
