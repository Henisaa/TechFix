package com.techfix.agenda.service;

import com.techfix.agenda.dto.CitaRequest;
import com.techfix.agenda.dto.CitaResponse;
import com.techfix.agenda.dto.EstadoUpdateRequest;
import com.techfix.agenda.dto.GestionServicioRequest;
import com.techfix.agenda.dto.PrecioTicketRequest;
import com.techfix.agenda.dto.ResumenComunaDto;
import com.techfix.agenda.model.EstadoCita;

import java.util.List;

public interface CitaService {

    List<CitaResponse> findAll();

    CitaResponse findById(Long id);

    List<CitaResponse> findByCliente(Long clienteId);

    List<CitaResponse> findByTecnico(Long tecnicoId);

    List<CitaResponse> findByEstado(EstadoCita estado);

    CitaResponse create(CitaRequest request);

    CitaResponse updateEstado(Long id, EstadoUpdateRequest request);

    CitaResponse asignarPrecio(Long id, PrecioTicketRequest request);

    CitaResponse marcarPagado(Long id);

    CitaResponse gestionarServicio(Long id, GestionServicioRequest request);

    CitaResponse cancelarCliente(Long id, com.techfix.agenda.dto.CancelarCitaClienteRequest request);

    void delete(Long id);

    List<ResumenComunaDto> resumenPorComuna();
}
