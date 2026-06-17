package com.techfix.agenda.repository;

import com.techfix.agenda.model.Tecnico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TecnicoRepository extends JpaRepository<Tecnico, Long> {

    Optional<Tecnico> findByEmail(String email);

    List<Tecnico> findByActivoTrue();

    boolean existsByEmail(String email);
}
