import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { IndoorAirQuality } from '@/types/airQuality';

export function useIndoorAirQuality() {
  const [data, setData] = useState<IndoorAirQuality | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const airQualityRef = ref(database, 'airQuality');

    const unsubscribe = onValue(
      airQualityRef,
      (snapshot) => {
        setIsLoading(false);
        if (snapshot.exists()) {
          setData(snapshot.val());
          setError(null);
        } else {
          setError(new Error('No data available'));
        }
      },
      (err) => {
        setIsLoading(false);
        setError(err);
      }
    );

    return () => {
      off(airQualityRef);
      unsubscribe();
    };
  }, []);

  return { data, isLoading, error };
}
