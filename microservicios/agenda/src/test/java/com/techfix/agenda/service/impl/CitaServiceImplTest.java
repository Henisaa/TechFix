package com.techfix.agenda.service.impl;

import com.techfix.agenda.dto.CancelarCitaClienteRequest;
import com.techfix.agenda.dto.CitaRequest;
import com.techfix.agenda.dto.CitaResponse;
import com.techfix.agenda.dto.EstadoUpdateRequest;
import com.techfix.agenda.dto.GestionServicioRequest;
import com.techfix.agenda.dto.PrecioTicketRequest;
import com.techfix.agenda.exception.BusinessException;
import com.techfix.agenda.exception.ResourceNotFoundException;
import com.techfix.agenda.mapper.CitaMapper;
import com.techfix.agenda.model.Cita;
import com.techfix.agenda.model.Cliente;
import com.techfix.agenda.model.EstadoCita;
import com.techfix.agenda.model.Tecnico;
import com.techfix.agenda.model.TipoServicio;
import com.techfix.agenda.repository.CitaRepository;
import com.techfix.agenda.repository.ClienteRepository;
import com.techfix.agenda.repository.TecnicoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CitaServiceImpl — Unit Tests")
class CitaServiceImplTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private TecnicoRepository tecnicoRepository;

    @Mock
    private CitaMapper citaMapper;

    @InjectMocks
    private CitaServiceImpl citaService;

    // crearCita

    @Test
    @DisplayName("create: cliente no existe → ResourceNotFoundException")
    void create_clienteNoExiste_lanzaNotFound() {
        CitaRequest req = buildCitaRequest(99L, null);
        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> citaService.create(req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("create: técnico no existe → ResourceNotFoundException")
    void create_tecnicoNoExiste_lanzaNotFound() {
        CitaRequest req = buildCitaRequest(1L, 99L);
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(buildCliente(1L)));
        when(tecnicoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> citaService.create(req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("create: técnico inactivo → BusinessException")
    void create_tecnicoInactivo_lanzaBusiness() {
        CitaRequest req = buildCitaRequest(1L, 2L);
        Tecnico tecnicoInactivo = buildTecnico(2L, false);
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(buildCliente(1L)));
        when(tecnicoRepository.findById(2L)).thenReturn(Optional.of(tecnicoInactivo));

        assertThatThrownBy(() -> citaService.create(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("no está activo");
    }

    @Test
    @DisplayName("create: técnico con 6 citas ese día → BusinessException")
    void create_tecnicoConMaxCitas_lanzaBusiness() {
        CitaRequest req = buildCitaRequest(1L, 2L);
        Tecnico tecnicoActivo = buildTecnico(2L, true);
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(buildCliente(1L)));
        when(tecnicoRepository.findById(2L)).thenReturn(Optional.of(tecnicoActivo));
        when(citaRepository.countCitasActivasPorTecnicoYDia(eq(2L), any(), any())).thenReturn(6L);

        assertThatThrownBy(() -> citaService.create(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("6 citas activas");
    }

    @Test
    @DisplayName("create: cita válida sin técnico → se crea correctamente sin técnico asignado")
    void create_sinTecnico_creaCorrectamente() {
        CitaRequest req = buildCitaRequest(1L, null);
        Cita saved = buildCita(10L, EstadoCita.PENDIENTE);
        CitaResponse mockResponse = new CitaResponse();
        mockResponse.setId(10L);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(buildCliente(1L)));
        when(citaRepository.save(any(Cita.class))).thenReturn(saved);
        when(citaMapper.toResponse(saved)).thenReturn(mockResponse);

        CitaResponse response = citaService.create(req);

        assertThat(response.getId()).isEqualTo(10L);
        verify(tecnicoRepository, never()).findById(any());
    }

    @Test
    @DisplayName("create: cita válida con técnico → genera numeroOrden con formato TF-YYYY-NNNN")
    void create_conTecnicoActivo_generaNumeroOrden() {
        CitaRequest req = buildCitaRequest(1L, 2L);
        Tecnico tecnicoActivo = buildTecnico(2L, true);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(buildCliente(1L)));
        when(tecnicoRepository.findById(2L)).thenReturn(Optional.of(tecnicoActivo));
        when(citaRepository.countCitasActivasPorTecnicoYDia(eq(2L), any(), any())).thenReturn(2L);
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> {
            Cita c = inv.getArgument(0);
            c.setId(5L);
            return c;
        });
        when(citaMapper.toResponse(any(Cita.class))).thenAnswer(inv -> {
            Cita c = inv.getArgument(0);
            CitaResponse r = new CitaResponse();
            r.setId(c.getId());
            r.setNumeroOrden(c.getNumeroOrden());
            return r;
        });

        CitaResponse response = citaService.create(req);

        assertThat(response.getNumeroOrden()).matches("TF-\\d{4}-\\d{4}");
    }

    // updateEstado

    @Test
    @DisplayName("updateEstado: cita CANCELADA → BusinessException")
    void updateEstado_citaCancelada_lanzaBusiness() {
        Cita cita = buildCita(1L, EstadoCita.CANCELADA);
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));

        EstadoUpdateRequest req = new EstadoUpdateRequest();
        req.setEstado(EstadoCita.EN_PROCESO);

        assertThatThrownBy(() -> citaService.updateEstado(1L, req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cancelado");
    }

    @Test
    @DisplayName("updateEstado: cita activa → actualiza estado correctamente")
    void updateEstado_citaActiva_actualizaEstado() {
        Cita cita = buildCita(1L, EstadoCita.PENDIENTE);
        CitaResponse mockResponse = new CitaResponse();
        mockResponse.setEstado(EstadoCita.EN_PROCESO);
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));
        when(citaRepository.save(any())).thenReturn(cita);
        when(citaMapper.toResponse(any())).thenReturn(mockResponse);

        EstadoUpdateRequest req = new EstadoUpdateRequest();
        req.setEstado(EstadoCita.EN_PROCESO);

        CitaResponse response = citaService.updateEstado(1L, req);

        assertThat(cita.getEstado()).isEqualTo(EstadoCita.EN_PROCESO);
    }

    // asignarPrecio

    @Test
    @DisplayName("asignarPrecio: cita CANCELADA → BusinessException")
    void asignarPrecio_citaCancelada_lanzaBusiness() {
        Cita cita = buildCita(1L, EstadoCita.CANCELADA);
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));

        PrecioTicketRequest req = new PrecioTicketRequest();
        req.setPrecioCotizado(BigDecimal.valueOf(15000));

        assertThatThrownBy(() -> citaService.asignarPrecio(1L, req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cancelado");
    }

    @Test
    @DisplayName("asignarPrecio: cita activa → asigna precio y cambia estadoPago a PENDIENTE_PAGO")
    void asignarPrecio_citaActiva_asignaPrecioYCambia() {
        Cita cita = buildCita(1L, EstadoCita.PENDIENTE);
        CitaResponse mockResponse = new CitaResponse();
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));
        when(citaRepository.save(any())).thenReturn(cita);
        when(citaMapper.toResponse(any())).thenReturn(mockResponse);

        PrecioTicketRequest req = new PrecioTicketRequest();
        req.setPrecioCotizado(BigDecimal.valueOf(25000));

        citaService.asignarPrecio(1L, req);

        assertThat(cita.getPrecioCotizado()).isEqualByComparingTo("25000");
        assertThat(cita.getEstadoPagoTicket()).isEqualTo("PENDIENTE_PAGO");
    }


    // marcarPagado


    @Test
    @DisplayName("marcarPagado: estadoPagoTicket no es PENDIENTE_PAGO → BusinessException")
    void marcarPagado_sinPrecio_lanzaBusiness() {
        Cita cita = buildCita(1L, EstadoCita.EN_PROCESO);
        cita.setEstadoPagoTicket("SIN_PRECIO");
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));

        assertThatThrownBy(() -> citaService.marcarPagado(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("no tiene un precio asignado");
    }

    @Test
    @DisplayName("marcarPagado: estadoPagoTicket = PENDIENTE_PAGO → cambia a PAGADO y COMPLETADA")
    void marcarPagado_conPrecioPendiente_marcaCompletado() {
        Cita cita = buildCita(1L, EstadoCita.EN_PROCESO);
        cita.setEstadoPagoTicket("PENDIENTE_PAGO");
        CitaResponse mockResponse = new CitaResponse();
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));
        when(citaRepository.save(any())).thenReturn(cita);
        when(citaMapper.toResponse(any())).thenReturn(mockResponse);

        citaService.marcarPagado(1L);

        assertThat(cita.getEstadoPagoTicket()).isEqualTo("PAGADO");
        assertThat(cita.getEstado()).isEqualTo(EstadoCita.COMPLETADA);
    }

    // gestionarServicio

    @Test
    @DisplayName("gestionarServicio: acción COMPLETAR con precio <= 0 → BusinessException")
    void gestionarServicio_completarPrecioCero_lanzaBusiness() {
        Cita cita = buildCita(1L, EstadoCita.EN_PROCESO);
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));

        GestionServicioRequest req = new GestionServicioRequest();
        req.setAccion("COMPLETAR");
        req.setPrecio(BigDecimal.ZERO);
        req.setDescripcionRealizado("Se hizo algo");

        assertThatThrownBy(() -> citaService.gestionarServicio(1L, req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("precio debe ser mayor a 0");
    }

    @Test
    @DisplayName("gestionarServicio: acción COMPLETAR válida → estado COMPLETADA, PENDIENTE_PAGO")
    void gestionarServicio_completarValido_cambiaEstado() {
        Cita cita = buildCita(1L, EstadoCita.EN_PROCESO);
        CitaResponse mockResponse = new CitaResponse();
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));
        when(citaRepository.save(any())).thenReturn(cita);
        when(citaMapper.toResponse(any())).thenReturn(mockResponse);

        GestionServicioRequest req = new GestionServicioRequest();
        req.setAccion("COMPLETAR");
        req.setPrecio(BigDecimal.valueOf(30000));
        req.setDescripcionRealizado("Pantalla reemplazada");
        req.setMetodoPago("EFECTIVO");

        citaService.gestionarServicio(1L, req);

        assertThat(cita.getEstado()).isEqualTo(EstadoCita.COMPLETADA);
        assertThat(cita.getEstadoPagoTicket()).isEqualTo("PENDIENTE_PAGO");
        assertThat(cita.getPrecioCotizado()).isEqualByComparingTo("30000");
    }

    @Test
    @DisplayName("gestionarServicio: acción CANCELAR → estado CANCELADA, estadoPago CANCELADO")
    void gestionarServicio_cancelar_cancelaCita() {
        Cita cita = buildCita(1L, EstadoCita.EN_PROCESO);
        CitaResponse mockResponse = new CitaResponse();
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));
        when(citaRepository.save(any())).thenReturn(cita);
        when(citaMapper.toResponse(any())).thenReturn(mockResponse);

        GestionServicioRequest req = new GestionServicioRequest();
        req.setAccion("CANCELAR");
        req.setDescripcionRealizado("No se pudo reparar");

        citaService.gestionarServicio(1L, req);

        assertThat(cita.getEstado()).isEqualTo(EstadoCita.CANCELADA);
        assertThat(cita.getEstadoPagoTicket()).isEqualTo("CANCELADO");
    }

    @Test
    @DisplayName("gestionarServicio: acción inválida → BusinessException")
    void gestionarServicio_accionInvalida_lanzaBusiness() {
        Cita cita = buildCita(1L, EstadoCita.EN_PROCESO);
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));

        GestionServicioRequest req = new GestionServicioRequest();
        req.setAccion("INVENTAR");
        req.setPrecio(BigDecimal.valueOf(1000));
        req.setDescripcionRealizado("desc");

        assertThatThrownBy(() -> citaService.gestionarServicio(1L, req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Acción inválida");
    }

    // cancelarCliente


    @Test
    @DisplayName("cancelarCliente: cita ya COMPLETADA → BusinessException")
    void cancelarCliente_yaCompletada_lanzaBusiness() {
        Cita cita = buildCita(1L, EstadoCita.COMPLETADA);
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));

        CancelarCitaClienteRequest req = new CancelarCitaClienteRequest();
        req.setMotivo("Ya no necesito el servicio");

        assertThatThrownBy(() -> citaService.cancelarCliente(1L, req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("finalizado o cancelado");
    }

    @Test
    @DisplayName("cancelarCliente: cita PENDIENTE → cancela exitosamente")
    void cancelarCliente_citaPendiente_cancelaExitosamente() {
        Cita cita = buildCita(1L, EstadoCita.PENDIENTE);
        CitaResponse mockResponse = new CitaResponse();
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));
        when(citaRepository.save(any())).thenReturn(cita);
        when(citaMapper.toResponse(any())).thenReturn(mockResponse);

        CancelarCitaClienteRequest req = new CancelarCitaClienteRequest();
        req.setMotivo("Cambio de planes");

        citaService.cancelarCliente(1L, req);

        assertThat(cita.getEstado()).isEqualTo(EstadoCita.CANCELADA);
        assertThat(cita.getEstadoPagoTicket()).isEqualTo("CANCELADO");
        assertThat(cita.getDescripcionRealizado()).isEqualTo("Cambio de planes");
    }

    // delete()

    @Test
    @DisplayName("delete: cita no existe → ResourceNotFoundException")
    void delete_noExiste_lanzaNotFound() {
        when(citaRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> citaService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("delete: cita existente → elimina del repositorio")
    void delete_existente_eliminaCorrectamente() {
        when(citaRepository.existsById(1L)).thenReturn(true);

        citaService.delete(1L);

        verify(citaRepository).deleteById(1L);
    }

    // Helpers (enrique busque como se dice en google y salio asi)

    private CitaRequest buildCitaRequest(Long clienteId, Long tecnicoId) {
        CitaRequest req = new CitaRequest();
        req.setClienteId(clienteId);
        req.setTecnicoId(tecnicoId);
        req.setFechaHora(LocalDateTime.of(2025, 12, 10, 10, 0));
        req.setTipoServicio(TipoServicio.REPARACION);
        req.setComuna("Providencia");
        req.setDescripcion("Pantalla rota");
        return req;
    }

    private Cliente buildCliente(Long id) {
        Cliente c = new Cliente();
        c.setId(id);
        c.setNombre("Cliente" + id);
        c.setApellido("Test");
        c.setEmail("cliente" + id + "@test.cl");
        return c;
    }

    private Tecnico buildTecnico(Long id, boolean activo) {
        return Tecnico.builder()
                .id(id)
                .nombre("Tecnico")
                .apellido("Test")
                .activo(activo)
                .build();
    }

    private Cita buildCita(Long id, EstadoCita estado) {
        return Cita.builder()
                .id(id)
                .estado(estado)
                .estadoPagoTicket("SIN_PRECIO")
                .fechaHora(LocalDateTime.of(2025, 12, 10, 10, 0))
                .tipoServicio(TipoServicio.REPARACION)
                .comuna("Providencia")
                .build();
    }
}
