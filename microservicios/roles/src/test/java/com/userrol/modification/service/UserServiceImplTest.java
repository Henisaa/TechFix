package com.userrol.modification.service;

import com.userrol.modification.dto.LoginRequest;
import com.userrol.modification.dto.LoginResponse;
import com.userrol.modification.exception.ConflictException;
import com.userrol.modification.exception.ResourceNotFoundException;
import com.userrol.modification.exception.UnauthorizedException;
import com.userrol.modification.jwt.JwtUtil;
import com.userrol.modification.model.Role;
import com.userrol.modification.model.User;
import com.userrol.modification.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl — Unit Tests")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserServiceImpl userService;

    // login

    @Test
    @DisplayName("login: credenciales válidas y usuario activo → devuelve LoginResponse con token")
    void login_credencialesValidas_devuelveToken() {
        User user = buildUser(1L, "pepe", Role.CLIENTE, true);
        when(userRepository.findByUsername("pepe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = userService.login(new LoginRequest("pepe", "pass123"));

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUsername()).isEqualTo("pepe");
    }

    @Test
    @DisplayName("login: usuario no existe → UnauthorizedException")
    void login_usuarioNoExiste_lanzaUnauthorized() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login(new LoginRequest("nadie", "x")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Credenciales inválidas");
    }

    @Test
    @DisplayName("login: contraseña incorrecta → UnauthorizedException")
    void login_passwordIncorrecta_lanzaUnauthorized() {
        User user = buildUser(1L, "pepe", Role.CLIENTE, true);
        when(userRepository.findByUsername("pepe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> userService.login(new LoginRequest("pepe", "wrong")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Credenciales inválidas");
    }

    @Test
    @DisplayName("login: usuario inactivo → UnauthorizedException")
    void login_usuarioInactivo_lanzaUnauthorized() {
        User user = buildUser(1L, "pepe", Role.CLIENTE, false);
        when(userRepository.findByUsername("pepe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        assertThatThrownBy(() -> userService.login(new LoginRequest("pepe", "pass123")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inactiva");
    }

    // createUser

    @Test
    @DisplayName("createUser: username ya existe → ConflictException")
    void createUser_usernameExistente_lanzaConflict() {
        when(userRepository.existsByUsername("pepe")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(buildUser(null, "pepe", null, null)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Username already exists");
    }

    @Test
    @DisplayName("createUser: email ya existe → ConflictException")
    void createUser_emailExistente_lanzaConflict() {
        User newUser = buildUser(null, "pepe", null, null);
        newUser.setEmail("dupe@mail.com");
        when(userRepository.existsByUsername("pepe")).thenReturn(false);
        when(userRepository.existsByEmail("dupe@mail.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(newUser))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    @DisplayName("createUser: sin rol asignado → asigna CLIENTE y active=true, guarda")
    void createUser_sinRol_asignaClienteYActivo() {
        User newUser = buildUser(null, "pepe", null, null);
        newUser.setPassword("plainpass");
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User saved = userService.createUser(newUser);

        assertThat(saved.getRole()).isEqualTo(Role.CLIENTE);
        assertThat(saved.getActive()).isTrue();
        assertThat(saved.getPassword()).isEqualTo("hashed");
    }

    // registrarUser

    @Test
    @DisplayName("registerUser: auto-registro siempre fuerza rol CLIENTE")
    void registerUser_siempreFuerzaRolCliente() {
        User newUser = buildUser(null, "nuevo", Role.ADMIN, null); // tratamos de registrar como ADMIN
        newUser.setPassword("pass");
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User saved = userService.registerUser(newUser);

        assertThat(saved.getRole()).isEqualTo(Role.CLIENTE);
        assertThat(saved.getActive()).isTrue();
    }

    // cambiarEstadoUsuario

    @Test
    @DisplayName("toggleUserStatus: desactivar al único ADMIN activo → ConflictException")
    void toggleUserStatus_unicoAdmin_lanzaConflict() {
        User admin = buildUser(1L, "admin", Role.ADMIN, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.countByRoleAndActive(Role.ADMIN, true)).thenReturn(1L);

        assertThatThrownBy(() -> userService.toggleUserStatus(1L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("único administrador");
    }

    @Test
    @DisplayName("toggleUserStatus: usuario activo normal → lo desactiva")
    void toggleUserStatus_usuarioNormal_loDesactiva() {
        User cliente = buildUser(1L, "juan", Role.CLIENTE, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.toggleUserStatus(1L);

        assertThat(result.getActive()).isFalse();
    }

    // deleteUser

    @Test
    @DisplayName("deleteUser: eliminar al único ADMIN activo → ConflictException")
    void deleteUser_unicoAdmin_lanzaConflict() {
        User admin = buildUser(1L, "admin", Role.ADMIN, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.countByRoleAndActive(Role.ADMIN, true)).thenReturn(1L);

        assertThatThrownBy(() -> userService.deleteUser(1L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("único administrador");
    }

    @Test
    @DisplayName("deleteUser: usuario no existente → ResourceNotFoundException")
    void deleteUser_noExiste_lanzaNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // transferAdminRole (la logica que el profe nos dijo que estaba mala, pero mejorada)

    @Test
    @DisplayName("transferAdminRole: origen no es ADMIN → ConflictException")
    void transferAdmin_origenNoEsAdmin_lanzaConflict() {
        User from = buildUser(1L, "tecnico1", Role.TECNICO, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(from));

        assertThatThrownBy(() -> userService.transferAdminRole(1L, 2L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("no tiene el rol ADMIN");
    }

    @Test
    @DisplayName("transferAdminRole: destino inactivo → ConflictException")
    void transferAdmin_destinoInactivo_lanzaConflict() {
        User from = buildUser(1L, "admin", Role.ADMIN, true);
        User to   = buildUser(2L, "otro",  Role.TECNICO, false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(from));
        when(userRepository.findById(2L)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> userService.transferAdminRole(1L, 2L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("no está activo");
    }

    @Test
    @DisplayName("transferAdminRole: transferencia exitosa → origen pasa a TECNICO, destino a ADMIN")
    void transferAdmin_exito_cambiaRoles() {
        User from = buildUser(1L, "admin", Role.ADMIN, true);
        User to   = buildUser(2L, "nuevo", Role.TECNICO, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(from));
        when(userRepository.findById(2L)).thenReturn(Optional.of(to));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.transferAdminRole(1L, 2L);

        assertThat(from.getRole()).isEqualTo(Role.TECNICO);
        assertThat(result.getRole()).isEqualTo(Role.ADMIN);
    }

    // Helpers

    private User buildUser(Long id, String username, Role role, Boolean active) {
        User u = new User();
        u.setId(id);
        u.setUsername(username);
        u.setEmail(username != null ? username + "@test.cl" : "test@test.cl");
        u.setPassword("hashedPassword");
        u.setRole(role);
        u.setActive(active);
        return u;
    }
}
