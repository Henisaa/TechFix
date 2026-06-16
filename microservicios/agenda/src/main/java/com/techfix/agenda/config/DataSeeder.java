package com.techfix.agenda.config;

import com.techfix.agenda.model.Cita;
import com.techfix.agenda.model.Cliente;
import com.techfix.agenda.model.EstadoCita;
import com.techfix.agenda.model.TipoServicio;
import com.techfix.agenda.repository.CitaRepository;
import com.techfix.agenda.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

        private final CitaRepository citaRepository;
        private final ClienteRepository clienteRepository;

        @Override
        public void run(String... args) {
                if (citaRepository.count() > 0)
                        return;

                List<String> comunas = List.of(
                                "Independencia", "La Florida", "Las Condes", "Lo Barnechea",
                                "Macul", "Maipú", "Ñuñoa", "Peñalolén",
                                "Providencia", "Pudahuel", "Recoleta", "San Bernardo",
                                "San Miguel", "Santiago Centro", "Vitacura");

                List<EstadoCita> estados = List.of(
                                EstadoCita.PENDIENTE, EstadoCita.EN_PROCESO, EstadoCita.COMPLETADA,
                                EstadoCita.CANCELADA, EstadoCita.PENDIENTE, EstadoCita.EN_PROCESO,
                                EstadoCita.COMPLETADA, EstadoCita.PENDIENTE, EstadoCita.COMPLETADA,
                                EstadoCita.PENDIENTE, EstadoCita.EN_PROCESO, EstadoCita.COMPLETADA,
                                EstadoCita.CANCELADA, EstadoCita.PENDIENTE, EstadoCita.COMPLETADA);

                List<TipoServicio> tipos = List.of(
                                TipoServicio.REPARACION, TipoServicio.INSTALACION, TipoServicio.REPARACION,
                                TipoServicio.REPARACION, TipoServicio.INSTALACION, TipoServicio.REPARACION,
                                TipoServicio.INSTALACION, TipoServicio.REPARACION, TipoServicio.REPARACION,
                                TipoServicio.INSTALACION, TipoServicio.REPARACION, TipoServicio.INSTALACION,
                                TipoServicio.REPARACION, TipoServicio.INSTALACION, TipoServicio.REPARACION);

                List<String> nombres = List.of(
                                "Carlos", "Ana", "Pedro", "María", "Luis",
                                "Sofía", "Diego", "Valentina", "Felipe", "Camila",
                                "Andrés", "Gabriela", "Ricardo", "Paula", "Jorge");

                List<String> apellidos = List.of(
                                "González", "Martínez", "Rodríguez", "López", "Sánchez",
                                "Pérez", "García", "Hernández", "Díaz", "Torres",
                                "Vargas", "Castro", "Romero", "Silva", "Morales");

                List<String> descripciones = List.of(
                                "Laptop no enciende", "Instalar switch de red", "Pantalla rota",
                                "Virus y limpieza", "Configurar router WiFi", "Teclado dañado",
                                "Instalar cámaras", "Disco duro lento", "Impresora sin conexión",
                                "Actualizar sistema", "Batería no carga", "Instalar software empresarial",
                                "Falla en fuente de poder", "Red doméstica lenta", "Monitor sin imagen");

                Random rand = new Random(42);
                LocalDate base = LocalDate.now();

                for (int i = 0; i < 15; i++) {
                        final int idx = i;

                        String email = nombres.get(idx).toLowerCase() + "." + apellidos.get(idx).toLowerCase()
                                        + "@techfix.cl";

                        Cliente cliente = clienteRepository.findByEmail(email)
                                        .orElseGet(() -> clienteRepository.save(Cliente.builder()
                                                        .nombre(nombres.get(idx))
                                                        .apellido(apellidos.get(idx))
                                                        .email(email)
                                                        .telefono("+569" + (10000000 + rand.nextInt(89999999)))
                                                        .build()));

                        int dayOffset = rand.nextInt(28);
                        LocalDateTime fechaHora = base.withDayOfMonth(1).plusDays(dayOffset)
                                        .atTime(9 + rand.nextInt(9), 0);

                        int sufijo = 1000 + rand.nextInt(9000);
                        String numeroOrden = "TF-" + base.getYear() + "-" + sufijo;

                        Cita cita = Cita.builder()
                                        .fechaHora(fechaHora)
                                        .tipoServicio(tipos.get(idx))
                                        .descripcion(descripciones.get(idx))
                                        .comuna(comunas.get(idx))
                                        .estado(estados.get(idx))
                                        .cliente(cliente)
                                        .numeroOrden(numeroOrden)
                                        .build();

                        citaRepository.save(cita);
                }
        }
}
