import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { Driver, Vehicle } from './types';

type FleetData = {
  drivers: Driver[];
  vehicles: Vehicle[];
  setDrivers: Dispatch<SetStateAction<Driver[]>>;
  setVehicles: Dispatch<SetStateAction<Vehicle[]>>;
};

export const FleetContext = createContext<FleetData | null>(null);

export function useFleetData() {
  const value = useContext(FleetContext);
  if (!value) throw new Error('FleetDataProvider ausente.');
  return value;
}
