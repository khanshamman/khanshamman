import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Only allow sales registration through the API
    if (role !== 'sales') {
      return res.status(403).json({ error: 'Admin accounts cannot be created through registration' });
    }

    // Check if user already exists
    if (await User.findByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (await User.findByUsername(username)) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Create user with pending approval (approved = 0)
    const user = await User.create(username, email, password, role, 0);

    res.status(201).json({ 
      message: 'Registration submitted. Please wait for admin approval before logging in.',
      pending: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Try to find by email or username
    let user = await User.findByEmail(email);
    if (!user) {
      user = await User.findByUsername(email);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!User.validatePassword(user, password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is approved
    if (!user.approved) {
      return res.status(403).json({ error: 'Your account is pending approval. Please wait for admin to approve your registration.' });
    }

    // Check if user account is active
    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact the administrator.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getMe = (req, res) => {
  res.json({ user: req.user });
};

// Admin endpoints for user management
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findPendingUsers();
    res.json(users);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
};

export const getPendingUsersCount = async (req, res) => {
  try {
    const count = await User.countPendingUsers();
    res.json({ count });
  } catch (error) {
    console.error('Get pending users count error:', error);
    res.status(500).json({ error: 'Failed to get pending count' });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.approved) {
      return res.status(400).json({ error: 'User is already approved' });
    }

    const approvedUser = await User.approveUser(id);
    res.json({ message: 'User approved successfully', user: approvedUser });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.approved) {
      return res.status(400).json({ error: 'Cannot reject an approved user' });
    }

    await User.rejectUser(id);
    res.json({ message: 'User rejected and removed' });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
};

export const getApprovedUsers = async (req, res) => {
  try {
    const users = await User.findApprovedUsers();
    res.json(users || []);
  } catch (error) {
    console.error('Get approved users error:', error);
    // Return empty array instead of error to prevent frontend from breaking
    res.json([]);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }

    await User.deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deactivating admin users
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot modify admin accounts' });
    }

    await User.updateUserStatus(id, is_active);
    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};
