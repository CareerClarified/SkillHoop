import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ResumeData, PersonalInfo, FormattingSettings, ResumeSection, INITIAL_RESUME_STATE } from '../types/resume';

// Action types
type ResumeAction =
  | { type: 'SET_RESUME'; payload: ResumeData }
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<FormattingSettings> }
  | { type: 'ADD_SECTION'; payload: ResumeSection }
  | { type: 'REMOVE_SECTION'; payload: string } // section id
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<ResumeSection> } }
  | { type: 'ADD_SECTION_ITEM'; payload: { sectionId: string; item: ResumeSection['items'][0] } }
  | { type: 'REMOVE_SECTION_ITEM'; payload: { sectionId: string; itemId: string } }
  | { type: 'UPDATE_SECTION_ITEM'; payload: { sectionId: string; itemId: string; data: Partial<ResumeSection['items'][0]> } };

// Context state type
interface ResumeContextState {
  state: ResumeData;
  dispatch: React.Dispatch<ResumeAction>;
}

// Create context
const ResumeContext = createContext<ResumeContextState | undefined>(undefined);

// Reducer function
function resumeReducer(state: ResumeData, action: ResumeAction): ResumeData {
  switch (action.type) {
    case 'SET_RESUME':
      return action.payload;

    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          ...action.payload,
        },
        updatedAt: new Date().toISOString(),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
        updatedAt: new Date().toISOString(),
      };

    case 'ADD_SECTION':
      return {
        ...state,
        sections: [...state.sections, action.payload],
        updatedAt: new Date().toISOString(),
      };

    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections.filter((section) => section.id !== action.payload),
        updatedAt: new Date().toISOString(),
      };

    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.id
            ? { ...section, ...action.payload.updates }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };

    case 'ADD_SECTION_ITEM':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? { ...section, items: [...section.items, action.payload.item] }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };

    case 'REMOVE_SECTION_ITEM':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? { ...section, items: section.items.filter((item) => item.id !== action.payload.itemId) }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };

    case 'UPDATE_SECTION_ITEM':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === action.payload.itemId
                    ? { ...item, ...action.payload.data }
                    : item
                ),
              }
            : section
        ),
        updatedAt: new Date().toISOString(),
      };

    default:
      return state;
  }
}

// Provider component
interface ResumeProviderProps {
  children: ReactNode;
  initialData?: ResumeData;
}

export function ResumeProvider({ children, initialData }: ResumeProviderProps) {
  const [state, dispatch] = useReducer(resumeReducer, initialData || INITIAL_RESUME_STATE);

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook
export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}

