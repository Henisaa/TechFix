package com.techfix.agenda.mapper;

import com.techfix.agenda.dto.CitaResponse;
import com.techfix.agenda.model.Cita;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T17:17:16-0400",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CitaMapperImpl implements CitaMapper {

    @Autowired
    private ClienteMapper clienteMapper;
    @Autowired
    private TecnicoMapper tecnicoMapper;

    @Override
    public CitaResponse toResponse(Cita cita) {
        if ( cita == null ) {
            return null;
        }

        CitaResponse citaResponse = new CitaResponse();

        citaResponse.setId( cita.getId() );
        citaResponse.setFechaHora( cita.getFechaHora() );
        citaResponse.setTipoServicio( cita.getTipoServicio() );
        citaResponse.setEstado( cita.getEstado() );
        citaResponse.setDescripcion( cita.getDescripcion() );
        citaResponse.setCliente( clienteMapper.toResponse( cita.getCliente() ) );
        citaResponse.setTecnico( tecnicoMapper.toResponse( cita.getTecnico() ) );
        citaResponse.setCreatedAt( cita.getCreatedAt() );
        citaResponse.setUpdatedAt( cita.getUpdatedAt() );

        return citaResponse;
    }
}
