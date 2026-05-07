package com.userrol.modification.service;

import com.userrol.modification.model.Role;
import com.userrol.modification.model.User;

import java.util.List;

public interface UserService {
    User createUser(User user);
    User getUserById(Long id);
    User getUserByUsername(String username);
    List<User> getAllUsers();
    List<User> getUsersByRole(Role role);
    List<User> getActiveUsers();
    User updateUser(Long id, User userDetails);
    User assignRole(Long id, Role role);   
    User toggleUserStatus(Long id);
    void deleteUser(Long id);
}