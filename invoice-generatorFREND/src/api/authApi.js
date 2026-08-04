import { fetchClient } from './fetchClient';

export const authApi = {
  /**
   * Register a new user
   * @param {Object} credentials - { username, email, password, roles }
   */
  register: (credentials) => {
    return fetchClient('/auth/register', {
      method: 'POST',
      body: credentials,
    });
  },

  /**
   * Authenticate an existing user
   * @param {Object} credentials - { username, password }
   */
  login: (credentials) => {
    return fetchClient('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },
};