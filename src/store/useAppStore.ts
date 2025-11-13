import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  total_pages: number;
  current_page: number;
  cover_url?: string;
  genres?: string[];
  is_completed: boolean;
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressEntry {
  id: string;
  book_id: string;
  pages_read: number;
  time_spent_minutes: number;
  created_at: string;
}

export interface Note {
  id: string;
  book_id: string;
  content: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  achievement_type: string;
  metadata?: any;
  earned_at: string;
}

export interface DailyChallenge {
  id: string;
  challenge_type: string;
  target_value: number;
  current_progress: number;
  is_completed: boolean;
  challenge_date: string;
  expires_at: string;
  created_at: string;
}

export interface ReadingStats {
  id: string;
  week_start: string;
  total_minutes: number;
  total_pages: number;
  books_completed: number;
  created_at: string;
  updated_at: string;
}

interface AppState {
  books: Book[];
  progressEntries: ProgressEntry[];
  notes: Note[];
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  readingStats: ReadingStats[];
  lastSyncedAt: string | null;
  
  // Books actions
  addBook: (book: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;
  
  // Progress actions
  addProgressEntry: (entry: Omit<ProgressEntry, 'id' | 'created_at'>) => void;
  getProgressEntries: (bookId: string) => ProgressEntry[];
  
  // Notes actions
  addNote: (note: Omit<Note, 'id' | 'created_at'>) => void;
  getNotes: (bookId: string) => Note[];
  deleteNote: (id: string) => void;
  
  // Achievements actions
  addAchievement: (achievement: Omit<Achievement, 'id' | 'earned_at'>) => void;
  
  // Daily challenges actions
  setDailyChallenge: (challenge: DailyChallenge) => void;
  updateChallengeProgress: (id: string, progress: number) => void;
  getCurrentChallenge: () => DailyChallenge | undefined;
  
  // Reading stats actions
  updateReadingStats: (weekStart: string, updates: Partial<ReadingStats>) => void;
  getReadingStats: (weekStart: string) => ReadingStats | undefined;
  
  // Sync actions
  setLastSyncedAt: (timestamp: string) => void;
  hydrateFromSnapshot: (snapshot: any) => void;
  getSnapshot: () => any;
  clearAllData: () => void;
}

const generateId = () => crypto.randomUUID();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      books: [],
      progressEntries: [],
      notes: [],
      achievements: [],
      dailyChallenges: [],
      readingStats: [],
      lastSyncedAt: null,

      // Books
      addBook: (book) => set((state) => ({
        books: [...state.books, {
          ...book,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]
      })),

      updateBook: (id, updates) => set((state) => ({
        books: state.books.map(book =>
          book.id === id ? { ...book, ...updates, updated_at: new Date().toISOString() } : book
        )
      })),

      deleteBook: (id) => set((state) => ({
        books: state.books.filter(book => book.id !== id),
        progressEntries: state.progressEntries.filter(entry => entry.book_id !== id),
        notes: state.notes.filter(note => note.book_id !== id),
      })),

      getBook: (id) => get().books.find(book => book.id === id),

      // Progress
      addProgressEntry: (entry) => set((state) => ({
        progressEntries: [...state.progressEntries, {
          ...entry,
          id: generateId(),
          created_at: new Date().toISOString(),
        }]
      })),

      getProgressEntries: (bookId) =>
        get().progressEntries.filter(entry => entry.book_id === bookId),

      // Notes
      addNote: (note) => set((state) => ({
        notes: [...state.notes, {
          ...note,
          id: generateId(),
          created_at: new Date().toISOString(),
        }]
      })),

      getNotes: (bookId) =>
        get().notes.filter(note => note.book_id === bookId),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(note => note.id !== id)
      })),

      // Achievements
      addAchievement: (achievement) => set((state) => ({
        achievements: [...state.achievements, {
          ...achievement,
          id: generateId(),
          earned_at: new Date().toISOString(),
        }]
      })),

      // Daily challenges
      setDailyChallenge: (challenge) => set((state) => ({
        dailyChallenges: [challenge, ...state.dailyChallenges.filter(c => c.id !== challenge.id)]
      })),

      updateChallengeProgress: (id, progress) => set((state) => ({
        dailyChallenges: state.dailyChallenges.map(challenge =>
          challenge.id === id
            ? { ...challenge, current_progress: progress, is_completed: progress >= challenge.target_value }
            : challenge
        )
      })),

      getCurrentChallenge: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().dailyChallenges.find(c => c.challenge_date === today);
      },

      // Reading stats
      updateReadingStats: (weekStart, updates) => set((state) => {
        const existing = state.readingStats.find(s => s.week_start === weekStart);
        if (existing) {
          return {
            readingStats: state.readingStats.map(s =>
              s.week_start === weekStart
                ? { ...s, ...updates, updated_at: new Date().toISOString() }
                : s
            )
          };
        } else {
          return {
            readingStats: [...state.readingStats, {
              id: generateId(),
              week_start: weekStart,
              total_minutes: 0,
              total_pages: 0,
              books_completed: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...updates,
            }]
          };
        }
      }),

      getReadingStats: (weekStart) =>
        get().readingStats.find(s => s.week_start === weekStart),

      // Sync
      setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),

      hydrateFromSnapshot: (snapshot) => set({
        books: snapshot.books || [],
        progressEntries: snapshot.progressEntries || [],
        notes: snapshot.notes || [],
        achievements: snapshot.achievements || [],
        dailyChallenges: snapshot.dailyChallenges || [],
        readingStats: snapshot.readingStats || [],
        lastSyncedAt: snapshot.lastSyncedAt || null,
      }),

      getSnapshot: () => {
        const state = get();
        return {
          books: state.books,
          progressEntries: state.progressEntries,
          notes: state.notes,
          achievements: state.achievements,
          dailyChallenges: state.dailyChallenges,
          readingStats: state.readingStats,
          lastSyncedAt: new Date().toISOString(),
        };
      },

      clearAllData: () => set({
        books: [],
        progressEntries: [],
        notes: [],
        achievements: [],
        dailyChallenges: [],
        readingStats: [],
        lastSyncedAt: null,
      }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
