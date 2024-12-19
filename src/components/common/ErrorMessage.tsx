import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      Error: {message}
    </div>
  </div>
);