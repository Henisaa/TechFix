package com.userrol.modification;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Deshabilitado pq test de integración que requiere PostgreSQL + JWT config activos (Docker).
// Para ejecutarlo es con docker compose up, luego correr esta clase individualmente.
@Disabled("Requiere base de datos PostgreSQL activa (Docker). Tests unitarios están en service/")
@SpringBootTest
class ModificationApplicationTests {

	@Test
	void contextLoads() {
	}

}

