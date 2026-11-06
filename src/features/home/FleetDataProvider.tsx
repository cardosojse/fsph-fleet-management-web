import { useState, type ReactNode } from 'react';
import { initialDrivers, initialVehicles } from './demo-data';
import { FleetContext } from './fleet-data';

function useFleetState() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  return { drivers, setDrivers, vehicles, setVehicles };
}

export function FleetDataProvider({ children }: { children: ReactNode }) {
  const value = useFleetState();
  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}
