import { queryAll, queryOne, run } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const User = {
  create: (username, email, password, role, approved = 0) => {
    const password_hash = bcrypt.hashSync(password, 10);
    const result = run(
      'INSERT INTO users (username, email, password_hash, role, approved) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, role, approved]
    );
    return { id: result.lastInsertRowid, username, email, role, approved };
  },

  findByEmail: (email) => {
    return queryOne('SELECT * FROM users WHERE email = ?', [email]);
  },

  findByUsername: (username) => {
    return queryOne('SELECT * FROM users WHERE username = ?', [username]);
  },

  findById: (id) => {
    return queryOne('SELECT id, username, email, role, approved, created_at FROM users WHERE id = ?', [id]);
  },

  findAll: () => {
    return queryAll('SELECT id, username, email, role, approved, created_at FROM users');
  },

  findAllSales: () => {
    return queryAll('SELECT id, username, email, role, approved, created_at FROM users WHERE role = ? AND approved = 1', ['sales']);
  },

  findPendingUsers: () => {
    return queryAll('SELECT id, username, email, role, created_at FROM users WHERE approved = 0 ORDER BY created_at DESC');
  },

  countPendingUsers: () => {
    const result = queryOne('SELECT COUNT(*) as count FROM users WHERE approved = 0');
    return result ? result.count : 0;
  },

  approveUser: (id) => {
    run('UPDATE users SET approved = 1 WHERE id = ?', [id]);
    return User.findById(id);
  },

  rejectUser: (id) => {
    return run('DELETE FROM users WHERE id = ? AND approved = 0', [id]);
  },

  validatePassword: (user, password) => {
    return bcrypt.compareSync(password, user.password_hash);
  }
};
