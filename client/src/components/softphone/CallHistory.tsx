import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { format } from 'date-fns';

interface CallRecord {
  id: string;
  phoneNumber: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  duration: number | null;
  startTime: string;
  endTime: string | null;
}

interface CallHistoryProps {
  onCallNumber: (number: string) => void;
}

export const CallHistory = ({ onCallNumber }: CallHistoryProps) => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const response = await fetch('/api/calls/history');
        if (response.ok) {
          const data = await response.json();
          setCalls(data);
        }
      } catch (error) {
        console.error('Error fetching call history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (calls.length === 0) {
    return <div className="text-center py-4 text-gray-500">No call history</div>;
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {calls.map((call) => (
        <div
          key={call.id}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{call.phoneNumber}</span>
              <span className="text-xs text-gray-500">
                {call.direction === 'INBOUND' ? 'Incoming' : 'Outgoing'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(call.startTime), 'MMM d, h:mm a')}
              {' • '}
              {formatDuration(call.duration)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCallNumber(call.phoneNumber)}
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}; 