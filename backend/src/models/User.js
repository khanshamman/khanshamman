import { queryAll, queryOne, run } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const User = {
  create: async (username, email, password, role, approved = 0) => {
    const password_hash = bcrypt.hashSync(password, 10);
    const result = await run(
      'INSERT INTO users (username, email, password_hash, role, approved, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, role, approved, 1]
    );
    return { id: result.lastInsertRowid, username, email, role, approved, is_active: 1 };
  },

  findByEmail: async (email) => {
    return await queryOne('SELECT * FROM users WHERE email = ?', [email]);
  },

  findByUsername: async (username) => {
    return await queryOne('SELECT * FROM users WHERE username = ?', [username]);
  },

  findById: async (id) => {
    return await queryOne('SELECT id, username, email, role, approved, COALESCE(is_active, 1) as is_active, created_at FROM users WHERE id = ?', [id]);
  },

  findAll: async () => {
    return await queryAll('SELECT id, username, email, role, approved, COALESCE(is_active, 1) as is_active, created_at FROM users');
  },

  findAllSales: async () => {
    return await queryAll('SELECT id, username, email, role, approved, COALESCE(is_active, 1) as is_active, created_at FROM users WHERE role = ? AND approved = 1', ['sales']);
  },

  findPendingUsers: async () => {
    return await queryAll('SELECT id, username, email, role, created_at FROM users WHERE approved = 0 ORDER BY created_at DESC');
  },

  findApprovedUsers: async () => {
    try {
      // First try with is_active column
      const users = await queryAll(
        'SELECT id, username, email, role, COALESCE(is_active, 1) as is_active, created_at FROM users WHERE approved = 1 AND role = ? ORDER BY created_at DESC', 
        ['sales']
      );
      console.log('Found approved users:', users?.length || 0);
      return users || [];
    } catch (error) {
      console.log('Query with is_active failed, trying fallback:', error.message);
      try {
        // Fallback without is_active
        const users = await queryAll(
          'SELECT id, username, email, role, created_at FROM users WHERE approved = 1 AND role = ? ORDER BY created_at DESC', 
          ['sales']
        );
        console.log('Fallback found users:', users?.length || 0);
        return (users || []).map(u => ({ ...u, is_active: 1 }));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError.message);
        return [];
      }
    }
  },

  countPendingUsers: async () => {
    const result = await queryOne('SELECT COUNT(*) as count FROM users WHERE approved = 0');
    return result ? parseInt(result.count) : 0;
  },

  approveUser: async (id) => {
    await run('UPDATE users SET approved = 1 WHERE id = ?', [id]);
    return await User.findById(id);
  },

  rejectUser: async (id) => {
    return await run('DELETE FROM users WHERE id = ? AND approved = 0', [id]);
  },

  deleteUser: async (id) => {
    return await run('DELETE FROM users WHERE id = ? AND role != ?', [id, 'admin']);
  },

  updateUserStatus: async (id, isActive) => {
    await run('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
    return await User.findById(id);
  },

  validatePassword: (user, password) => {
    return bcrypt.compareSync(password, user.password_hash);
  }
};
