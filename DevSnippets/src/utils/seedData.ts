import { getDb } from '../database/SQLiteService';

const SEED_SNIPPETS = [
  {
    title: 'useLocalStorage Hook',
    language: 'TypeScript',
    tags: 'react,hooks,storage',
    favorite: 1,
    code: `import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
  },
  {
    title: 'Debounce Function',
    language: 'JavaScript',
    tags: 'utility,performance',
    favorite: 0,
    code: `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const debouncedSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);`,
  },
  {
    title: 'Binary Search Algorithm',
    language: 'Python',
    tags: 'algorithm,search',
    favorite: 0,
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example
arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(arr, 7))  # Output: 3`,
  },
  {
    title: 'JWT Authentication',
    language: 'Node.js',
    tags: 'auth,jwt,security',
    favorite: 0,
    code: `const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});`,
  },
  {
    title: 'React Context Example',
    language: 'TypeScript',
    tags: 'react,context,state',
    favorite: 0,
    code: `import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}`,
  },
];

export async function seedDemoData(): Promise<void> {
  try {
    const db = await getDb();
    const existing = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM snippets`
    );
    if (existing && existing.count > 0) return; // Already seeded

    for (const s of SEED_SNIPPETS) {
      await db.runAsync(
        `INSERT INTO snippets (title, language, code, tags, favorite) VALUES (?, ?, ?, ?, ?)`,
        [s.title, s.language, s.code, s.tags, s.favorite]
      );
    }
    console.log('Demo snippets seeded.');
  } catch (e) {
    console.error('Seed failed:', e);
  }
}
