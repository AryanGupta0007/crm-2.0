import React, { createContext, useState, useCallback } from 'react';
import type { User } from '../types';

interface UsersContextType {
  users: User[];
  fetchUsers: () => Promise<void>;
}

export const UsersContext = createContext<UsersContextType>({
  users: [],
  fetchUsers: async () => {},
});

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      // handle error
    }
  }, []);

  return (
    <UsersContext.Provider value={{ users, fetchUsers }}>
      {children}
    </UsersContext.Provider>
  );
}; 