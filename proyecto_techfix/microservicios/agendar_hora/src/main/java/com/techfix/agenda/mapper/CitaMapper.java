package com.techfix.agenda.mapper;

import com.techfix.agenda.dto.CitaResponse;
import com.techfix.agenda.model.Cita;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ClienteMapper.class, TecnicoMapper.class})
public interface CitaMapper {

    CitaResponse toResponse(Cita cita);
}
