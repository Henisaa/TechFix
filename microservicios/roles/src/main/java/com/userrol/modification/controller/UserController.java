package com.userrol.modification.controller;

import com.userrol.modification.exception.ResourceNotFoundException;
import com.userrol.modification.model.Role;
import com.userrol.modification.model.User;
import com.userrol.modification.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestión de usuarios del sistema de techfix")
public class UserController {

    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica con username y password.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Autenticado"),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas")
    })
    public ResponseEntity<User> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        try {
            User user = userService.getUserByUsername(username);
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.ok(user);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar usuario (alias)", description = "Alias de POST / para compatibilidad con el frontend.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario creado"),
            @ApiResponse(responseCode = "409", description = "Username o email ya existe")
    })
    public ResponseEntity<User> registerUser(@Valid @RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(user));
    }

    @PostMapping
    @Operation(summary = "Registrar usuario", description = "Crea una cuenta nueva.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario creado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "409", description = "Username o email ya existe")
    })
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(user));
    }

    @GetMapping
    @Operation(summary = "Listar todos los usuarios")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Obtener usuario por username")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Filtrar por rol", description = "Roles disponibles: CLIENTE, TECNICO, ADMIN")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @GetMapping("/active")
    @Operation(summary = "Listar usuarios activos")
    public ResponseEntity<List<User>> getActiveUsers() {
        return ResponseEntity.ok(userService.getActiveUsers());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos del usuario", description = "No modifica el rol. Usa /assign-role para eso.")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return ResponseEntity.ok(userService.updateUser(id, userDetails));
    }

    @PatchMapping("/{id}/assign-role")
    @Operation(summary = "Asignar rol manualmente", description = "Permite asignar cualquier rol.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rol asignado")
    })
    public ResponseEntity<User> assignRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        return ResponseEntity.ok(userService.assignRole(id, role));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Activar / desactivar usuario")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario", description = "No se puede eliminar al único admin activo.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Eliminado"),
            @ApiResponse(responseCode = "409", description = "No se puede eliminar al único admin activo")
    })
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{fromId}/transfer-admin/{toId}")
    @Operation(summary = "Transferir rol admin", description = "Transfiere el rol ADMIN del usuario origen al destino de forma atómica.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rol transferido"),
            @ApiResponse(responseCode = "409", description = "El usuario origen no es ADMIN o el destino no está activo")
    })
    public ResponseEntity<User> transferAdmin(
            @PathVariable Long fromId,
            @PathVariable Long toId) {
        return ResponseEntity.ok(userService.transferAdminRole(fromId, toId));
    }
}