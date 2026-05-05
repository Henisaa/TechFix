package com.techfix.agenda.service.impl;

import com.techfix.agenda.dto.TecnicoRequest;
import com.techfix.agenda.dto.TecnicoResponse;
import com.techfix.agenda.exception.BusinessException;
import com.techfix.agenda.exception.ResourceNotFoundException;
import com.techfix.agenda.mapper.TecnicoMapper;
import com.techfix.agenda.model.Tecnico;
import com.techfix.agenda.repository.TecnicoRepository;
import com.techfix.agenda.service.TecnicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TecnicoServiceImpl implements TecnicoService {

    private final TecnicoRepository tecnicoRepository;
    private final TecnicoMapper tecnicoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TecnicoResponse> findAll() {
        return tecnicoRepository.findAll()
                .stream()
                .map(tecnicoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TecnicoResponse> findActivos() {
        return tecnicoRepository.findByActivoTrue()
                .stream()
                .map(tecnicoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TecnicoResponse findById(Long id) {
        return tecnicoMapper.toResponse(getOrThrow(id));
    }

    @Override
    public TecnicoResponse create(TecnicoRequest request) {
        if (request.getEmail() != null && tecnicoRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un técnico con el email: " + request.getEmail());
        }
        return tecnicoMapper.toResponse(tecnicoRepository.save(tecnicoMapper.toEntity(request)));
    }

    @Override
    public TecnicoResponse update(Long id, TecnicoRequest request) {
        Tecnico tecnico = getOrThrow(id);
        if (request.getEmail() != null
                && !request.getEmail().equals(tecnico.getEmail())
                && tecnicoRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un técnico con el email: " + request.getEmail());
        }
        tecnicoMapper.updateEntity(request, tecnico);
        return tecnicoMapper.toResponse(tecnicoRepository.save(tecnico));
    }

    @Override
    public void delete(Long id) {
        if (!tecnicoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Técnico", id);
        }
        tecnicoRepository.deleteById(id);
    }

    private Tecnico getOrThrow(Long id) {
        return tecnicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Técnico", id));
    }
}
