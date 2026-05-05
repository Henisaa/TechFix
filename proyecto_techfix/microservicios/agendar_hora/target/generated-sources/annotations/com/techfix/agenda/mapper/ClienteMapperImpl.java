package com.techfix.agenda.mapper;

import com.techfix.agenda.dto.ClienteRequest;
import com.techfix.agenda.dto.ClienteResponse;
import com.techfix.agenda.model.Cliente;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T17:17:16-0400",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ClienteMapperImpl implements ClienteMapper {

    @Override
    public Cliente toEntity(ClienteRequest request) {
        if ( request == null ) {
            return null;
        }

        Cliente.ClienteBuilder cliente = Cliente.builder();

        cliente.nombre( request.getNombre() );
        cliente.apellido( request.getApellido() );
        cliente.email( request.getEmail() );
        cliente.telefono( request.getTelefono() );

        return cliente.build();
    }

    @Override
    public ClienteResponse toResponse(Cliente cliente) {
        if ( cliente == null ) {
            return null;
        }

        ClienteResponse clienteResponse = new ClienteResponse();

        clienteResponse.setId( cliente.getId() );
        clienteResponse.setNombre( cliente.getNombre() );
        clienteResponse.setApellido( cliente.getApellido() );
        clienteResponse.setEmail( cliente.getEmail() );
        clienteResponse.setTelefono( cliente.getTelefono() );
        clienteResponse.setCreatedAt( cliente.getCreatedAt() );

        return clienteResponse;
    }

    @Override
    public void updateEntity(ClienteRequest request, Cliente cliente) {
        if ( request == null ) {
            return;
        }

        cliente.setNombre( request.getNombre() );
        cliente.setApellido( request.getApellido() );
        cliente.setEmail( request.getEmail() );
        cliente.setTelefono( request.getTelefono() );
    }
}
