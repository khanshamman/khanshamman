import { queryAll, queryOne, run } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const User = {
  create: async (username, email, password, role, approved = 0) => {
    const password_hash = bcrypt.hashSync(password, 10);
    const result = await run(
      'INSERT INTO users (username, email, password_hash, role, approved) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, role, approved]
    );
    return { id: result.lastInsertRowid, username, email, role, approved };
  },

  findByEmail: async (email) => {
    return await queryOne('SELECT * FROM users WHERE email = ?', [email]);
  },

  findByUsername: async (username) => {
    return await queryOne('SELECT * FROM users WHERE username = ?', [username]);
  },

  findById: async (id) => {
    return await queryOne('SELECT id, username, email, role, approved, created_at FROM users WHERE id = ?', [id]);
  },

  findAll: async () => {
    return await queryAll('SELECT id, username, email, role, approved, created_at FROM users');
  },

  findAllSales: async () => {
    return await queryAll('SELECT id, username, email, role, approved, created_at FROM users WHERE role = ? AND approved = 1', ['sales']);
  },

  findPendingUsers: async () => {
    return await queryAll('SELECT id, username, email, role, created_at FROM users WHERE approved = 0 ORDER BY created_at DESC');
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

  validatePassword: (user, password) => {
    return bcrypt.compareSync(password, user.password_hash);
  }
};
