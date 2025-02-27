import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Delete } from 'lucide-react';

interface DialpadProps {
  onCall: (number: string) => void;
  disabled?: boolean;
}

export const Dialpad = ({ onCall, disabled }: DialpadProps) => {
  const [number, setNumber] = useState('');

  const handleKeyPress = (key: string) => {
    if (disabled) return;
    setNumber(prev => prev + key);
  };

  const handleDelete = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (number && !disabled) {
      onCall(number);
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <div className="space-y-4">
      {/* Number display */}
      <div className="relative">
        <input
          type="text"
          value={number}
          readOnly
          className="w-full text-2xl text-center py-2 bg-gray-50 rounded-md"
          placeholder="Enter number"
        />
        {number && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleDelete}
          >
            <Delete className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            {row.map(key => (
              <Button
                key={key}
                variant="outline"
                className="aspect-square text-lg font-semibold"
                onClick={() => handleKeyPress(key)}
                disabled={disabled}
              >
                {key}
              </Button>
            ))}
          </div>
        ))}
      </div>

      {/* Call button */}
      <Button
        className="w-full"
        onClick={handleCall}
        disabled={!number || disabled}
      >
        <Phone className="h-4 w-4 mr-2" />
        Call
      </Button>
    </div>
  );
}; 