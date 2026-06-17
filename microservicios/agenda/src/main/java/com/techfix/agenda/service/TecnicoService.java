package com.techfix.agenda.service;

import com.techfix.agenda.dto.TecnicoRequest;
import com.techfix.agenda.dto.TecnicoResponse;

import java.util.List;

public interface TecnicoService {

    List<TecnicoResponse> findAll();

    List<TecnicoResponse> findActivos();

    TecnicoResponse findById(Long id);

    TecnicoResponse create(TecnicoRequest request);

    TecnicoResponse update(Long id, TecnicoRequest request);

    void delete(Long id);
}
