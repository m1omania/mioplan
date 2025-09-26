import React, { createContext, useContext, useReducer } from 'react';

// Создаем контекст для управления историей
const HistoryContext = createContext();

// Типы действий
const ACTIONS = {
  SAVE_STATE: 'SAVE_STATE',
  UNDO: 'UNDO',
  REDO: 'REDO'
};

// Редьюсер для управления историей изменений
const historyReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SAVE_STATE:
      // Если мы находимся не в конце истории, удаляем "будущие" состояния
      const history = state.history.slice(0, state.currentIndex + 1);
      history.push(action.payload);
      
      return {
        ...state,
        history,
        currentIndex: history.length - 1
      };
      
    case ACTIONS.UNDO:
      if (state.currentIndex <= 0) return state;
      
      return {
        ...state,
        currentIndex: state.currentIndex - 1
      };
      
    case ACTIONS.REDO:
      if (state.currentIndex >= state.history.length - 1) return state;
      
      return {
        ...state,
        currentIndex: state.currentIndex + 1
      };
      
    default:
      return state;
  }
};

// Провайдер контекста истории
export const HistoryProvider = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(historyReducer, {
    history: [initialState],
    currentIndex: 0
  });
  
  const saveState = (newState) => {
    dispatch({ type: ACTIONS.SAVE_STATE, payload: newState });
  };
  
  const undo = () => {
    dispatch({ type: ACTIONS.UNDO });
  };
  
  const redo = () => {
    dispatch({ type: ACTIONS.REDO });
  };
  
  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;
  const currentState = state.history[state.currentIndex];
  
  return (
    <HistoryContext.Provider value={{
      currentState,
      saveState,
      undo,
      redo,
      canUndo,
      canRedo
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

// Хук для использования контекста истории
export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};