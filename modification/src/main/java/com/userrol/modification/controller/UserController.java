package com.userrol.modification.controller;

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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestión de usuarios del sistema de techfix")
public class UserController {

    private final UserService userService;

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
    @Operation(summary = "Filtrar por rol", description = "Roles disponibles: USER, TECNICO, ADMIN")
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
    @Operation(summary = "Asignar rol manualmente", description = "Permite asignar el rol técnico o admin. Por cierto, solo puede existir un ADMIN.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rol asignado"),
        @ApiResponse(responseCode = "409", description = "Ya existe un ADMIN en el sistema")
    })
    public ResponseEntity<User> assignRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        return ResponseEntity.ok(userService.assignRole(id, role));
    }
─
    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Activar / desactivar usuario")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario", description = "El ADMIN no puede ser eliminado.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Eliminado"),
        @ApiResponse(responseCode = "409", description = "No se puede eliminar al ADMIN")
    })
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}