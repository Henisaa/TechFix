package com.techfix.agenda.service.impl;

import com.techfix.agenda.dto.CitaRequest;
import com.techfix.agenda.dto.CitaResponse;
import com.techfix.agenda.dto.EstadoUpdateRequest;
import com.techfix.agenda.exception.BusinessException;
import com.techfix.agenda.exception.ResourceNotFoundException;
import com.techfix.agenda.mapper.CitaMapper;
import com.techfix.agenda.model.Cita;
import com.techfix.agenda.model.Cliente;
import com.techfix.agenda.model.EstadoCita;
import com.techfix.agenda.model.Tecnico;
import com.techfix.agenda.repository.CitaRepository;
import com.techfix.agenda.repository.ClienteRepository;
import com.techfix.agenda.repository.TecnicoRepository;
import com.techfix.agenda.service.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CitaServiceImpl implements CitaService {

    
    private static final int MAX_CITAS_POR_DIA = 6;

    private final CitaRepository citaRepository;
    private final ClienteRepository clienteRepository;
    private final TecnicoRepository tecnicoRepository;
    private final CitaMapper citaMapper;

    

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponse> findAll() {
        return citaRepository.findAll()
                .stream()
                .map(citaMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CitaResponse findById(Long id) {
        return citaMapper.toResponse(getOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponse> findByCliente(Long clienteId) {
        return citaRepository.findByClienteId(clienteId)
                .stream()
                .map(citaMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponse> findByTecnico(Long tecnicoId) {
        return citaRepository.findByTecnicoId(tecnicoId)
                .stream()
                .map(citaMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponse> findByEstado(EstadoCita estado) {
        return citaRepository.findByEstado(estado)
                .stream()
                .map(citaMapper::toResponse)
                .toList();
    }

    

    @Override
    public CitaResponse create(CitaRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", request.getClienteId()));

        Tecnico tecnico = tecnicoRepository.findById(request.getTecnicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Técnico", request.getTecnicoId()));

        if (!tecnico.getActivo()) {
            throw new BusinessException("El técnico con id " + tecnico.getId() + " no está activo.");
        }

        
        enforceMaxCitasPorDia(tecnico.getId(), request.getFechaHora());

        Cita cita = Cita.builder()
                .fechaHora(request.getFechaHora())
                .tipoServicio(request.getTipoServicio())
                .descripcion(request.getDescripcion())
                .cliente(cliente)
                .tecnico(tecnico)
                .build();

        return citaMapper.toResponse(citaRepository.save(cita));
    }

    @Override
    public CitaResponse updateEstado(Long id, EstadoUpdateRequest request) {
        Cita cita = getOrThrow(id);
        cita.setEstado(request.getEstado());
        return citaMapper.toResponse(citaRepository.save(cita));
    }

    @Override
    public void delete(Long id) {
        if (!citaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cita", id);
        }
        citaRepository.deleteById(id);
    }

    

    private void enforceMaxCitasPorDia(Long tecnicoId, LocalDateTime fechaHora) {
        LocalDate dia = fechaHora.toLocalDate();
        LocalDateTime startOfDay = dia.atStartOfDay();
        LocalDateTime endOfDay   = dia.plusDays(1).atStartOfDay();

        long count = citaRepository.countCitasActivasPorTecnicoYDia(tecnicoId, startOfDay, endOfDay);

        if (count >= MAX_CITAS_POR_DIA) {
            throw new BusinessException(
                    "El técnico ya tiene " + MAX_CITAS_POR_DIA +
                    " citas activas para el día " + dia +
                    ". No se pueden agendar más trabajos en esa fecha.");
        }
    }

    private Cita getOrThrow(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita", id));
    }
}
