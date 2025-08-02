import React from 'react';
// Update the import path to the correct location of ThemeContext
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggleButton = () => {
  const { toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
       Theme
    </button>
  );
};

export default ThemeToggleButton;