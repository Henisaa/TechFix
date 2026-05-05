package com.techfix.agenda.mapper;

import com.techfix.agenda.dto.TecnicoRequest;
import com.techfix.agenda.dto.TecnicoResponse;
import com.techfix.agenda.model.Tecnico;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T17:16:34-0400",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class TecnicoMapperImpl implements TecnicoMapper {

    @Override
    public Tecnico toEntity(TecnicoRequest request) {
        if ( request == null ) {
            return null;
        }

        Tecnico.TecnicoBuilder tecnico = Tecnico.builder();

        tecnico.nombre( request.getNombre() );
        tecnico.apellido( request.getApellido() );
        tecnico.email( request.getEmail() );
        tecnico.telefono( request.getTelefono() );
        tecnico.especialidad( request.getEspecialidad() );
        tecnico.activo( request.getActivo() );

        return tecnico.build();
    }

    @Override
    public TecnicoResponse toResponse(Tecnico tecnico) {
        if ( tecnico == null ) {
            return null;
        }

        TecnicoResponse tecnicoResponse = new TecnicoResponse();

        tecnicoResponse.setId( tecnico.getId() );
        tecnicoResponse.setNombre( tecnico.getNombre() );
        tecnicoResponse.setApellido( tecnico.getApellido() );
        tecnicoResponse.setEmail( tecnico.getEmail() );
        tecnicoResponse.setTelefono( tecnico.getTelefono() );
        tecnicoResponse.setEspecialidad( tecnico.getEspecialidad() );
        tecnicoResponse.setActivo( tecnico.getActivo() );
        tecnicoResponse.setCreatedAt( tecnico.getCreatedAt() );

        return tecnicoResponse;
    }

    @Override
    public void updateEntity(TecnicoRequest request, Tecnico tecnico) {
        if ( request == null ) {
            return;
        }

        tecnico.setNombre( request.getNombre() );
        tecnico.setApellido( request.getApellido() );
        tecnico.setEmail( request.getEmail() );
        tecnico.setTelefono( request.getTelefono() );
        tecnico.setEspecialidad( request.getEspecialidad() );
        tecnico.setActivo( request.getActivo() );
    }
}
