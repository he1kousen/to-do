'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useCategories, type Category } from '@/lib/hooks/use-categories';
import { useProjects, type Project } from '@/lib/hooks/use-projects';

interface AppContextType {
  categories: Category[];
  categoriesLoading: boolean;
  createCategory: (name: string) => Promise<Category | null>;
  updateCategory: (id: string, name: string) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;

  projects: Project[];
  projectsLoading: boolean;
  createProject: (categoryId: string, name: string, viewType: 'list' | 'kanban') => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'view_type' | 'category_id'>>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const categoriesHook = useCategories();
  const projectsHook = useProjects();

  return (
    <AppContext.Provider
      value={{
        categories: categoriesHook.categories,
        categoriesLoading: categoriesHook.loading,
        createCategory: categoriesHook.createCategory,
        updateCategory: categoriesHook.updateCategory,
        deleteCategory: categoriesHook.deleteCategory,

        projects: projectsHook.projects,
        projectsLoading: projectsHook.loading,
        createProject: projectsHook.createProject,
        updateProject: projectsHook.updateProject,
        deleteProject: projectsHook.deleteProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
