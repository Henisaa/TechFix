package com.techfix.agenda.mapper;

import com.techfix.agenda.dto.TecnicoRequest;
import com.techfix.agenda.dto.TecnicoResponse;
import com.techfix.agenda.model.Tecnico;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TecnicoMapper {

    Tecnico toEntity(TecnicoRequest request);

    TecnicoResponse toResponse(Tecnico tecnico);

    void updateEntity(TecnicoRequest request, @MappingTarget Tecnico tecnico);
}
