package com.userrol.modification;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Requiere base de datos PostgreSQL activa (Docker). Tests unitarios están en service/")
@SpringBootTest
class ModificationApplicationTests {

	@Test
	void contextLoads() {
	}

}

