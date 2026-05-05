package com.techfix.agenda.repository;

import com.techfix.agenda.model.Cita;
import com.techfix.agenda.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByClienteId(Long clienteId);

    List<Cita> findByTecnicoId(Long tecnicoId);

    List<Cita> findByEstado(EstadoCita estado);

    /**
     * Counts non-cancelled appointments for a technician within a calendar-day window.
     * This enforces the business rule: max 6 active jobs per technician per day.
     */
    @Query("SELECT COUNT(c) FROM Cita c " +
           "WHERE c.tecnico.id = :tecnicoId " +
           "AND c.fechaHora >= :startOfDay " +
           "AND c.fechaHora < :endOfDay " +
           "AND c.estado <> com.techfix.agenda.model.EstadoCita.CANCELADA")
    long countCitasActivasPorTecnicoYDia(
            @Param("tecnicoId") Long tecnicoId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);
}
