import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' or 'dark'
      soundEnabled: true,
      notificationsEnabled: true,

      // Toggle theme
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          
          // Update document class
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          return { theme: newTheme };
        });
      },

      // Set theme
      setTheme: (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ theme });
      },

      // Toggle sound
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      // Toggle notifications
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
    }),
    {
      name: 'chatflow-theme',
    }
  )
);

// Initialize theme on load
const theme = useThemeStore.getState().theme;
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
}

export default useThemeStore;
