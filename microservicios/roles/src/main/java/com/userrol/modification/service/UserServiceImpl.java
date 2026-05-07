package com.userrol.modification.service;

import com.userrol.modification.exception.ConflictException;
import com.userrol.modification.exception.ResourceNotFoundException;
import com.userrol.modification.model.Role;
import com.userrol.modification.model.User;
import com.userrol.modification.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User createUser(User user) {
        log.info("Creating user: {}", user.getUsername());

        if (userRepository.existsByUsername(user.getUsername()))
            throw new ConflictException("Username already exists: " + user.getUsername());

        if (userRepository.existsByEmail(user.getEmail()))
            throw new ConflictException("Email already registered: " + user.getEmail());

        user.setRole(Role.USER);
        user.setActive(true);

        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        return userRepository.findByActive(true);
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);

        if (userDetails.getUsername() != null && !userDetails.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(userDetails.getUsername()))
                throw new ConflictException("El usuario ingresado ya existe: " + userDetails.getUsername());
            user.setUsername(userDetails.getUsername());
        }
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail()))
                throw new ConflictException("El email ingresado ya esta en uso: " + userDetails.getEmail());
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
        if (userDetails.getPassword() != null) user.setPassword(userDetails.getPassword());
        if (userDetails.getActive() != null)   user.setActive(userDetails.getActive());

        return userRepository.save(user);
    }

    @Override
    public User assignRole(Long id, Role role) {
        log.info("Assigning role {} to user ID {}", role, id);
        User user = getUserById(id);

        if (role == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount >= 1) {
                throw new ConflictException("SOLO PUEDE EXISTIR UN ADMIN EN EL SISTEMA");
            }
        }

        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setActive(!user.getActive());
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = getUserById(id);

        if (user.getRole() == Role.ADMIN) {
            throw new ConflictException("Tu no puedes eliminar al admin, el admin te elimina a ti");
        }

        userRepository.delete(user);
    }
}