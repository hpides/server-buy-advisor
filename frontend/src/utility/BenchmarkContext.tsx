import { createContext, useState, useContext, ReactNode } from 'react';
import { WorkloadType, Country, WORKLOAD_TYPES, COUNTRIES, WORKLOAD_MAPPING } from '../partials/BenchmarkSettings';
import { CPU_LIST } from '../partials/Compare';
import { System } from './lifecycle_analysis/system';
import { generateSystemsComparison, ComparisonType } from './lifecycle_analysis/comparison';
import { GUPTA_MODEL } from './lifecycle_analysis/constants';
import CPU_DATA from '../assets/data';
import { lineIntersect } from '../charts/lineChart';

// Assumptions
const timeHorizon = 20;

// Shared specs
const lifetime = 20;
const dramCapacity = 8 * 64; // in GB
const ssdCapacity = 2 * 1600; // in GB
const hddCapacity = 0; // in GB

interface BenchmarkContextType {
  workload: WorkloadType;
  utilization: number;
  country: Country;
  currentHardware: string;
  newHardware: string;
  comparison: ComparisonType;
  oldSystemOpex: number[];
  newSystemOpex: number[];
  breakEven: number;
  intersect: { x:number, y:number } | false;
  setCurrentHardware: (value: string) => void;
  setNewHardware: (value: string) => void;
  setWorkload: (value: WorkloadType) => void;
  setUtilization: (value: number) => void;
  setCountry: (value: Country) => void;
}

const BenchmarkContext = createContext<BenchmarkContextType | undefined>(undefined);

interface BenchmarkProviderProps {
  children: ReactNode;
}

export const BenchmarkProvider: React.FC<BenchmarkProviderProps> = ({ children }) => {
  const [currentHardware, setCurrentHardware] = useState<string>(CPU_LIST[0]);
  const [newHardware, setNewHardware] = useState<string>(CPU_LIST[0]);
  const [workload, setWorkload] = useState<WorkloadType>(WORKLOAD_TYPES[0]);
  const [utilization, setUtilization] = useState<number>(40);
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);

  const oldPerformanceIndicator = CPU_DATA[currentHardware][WORKLOAD_MAPPING[workload]];
  const newPerformanceIndicator = CPU_DATA[newHardware][WORKLOAD_MAPPING[workload]];

  // Old System: Intel Xeon E7-4880, released 2014
  const oldSystem = new System(
    541 / 100, // dieSize in cm^2
    oldPerformanceIndicator, // performanceIndicator
    lifetime, // lifetime in years
    dramCapacity, // dramCapacity in GB
    ssdCapacity, // ssdCapacity in GB
    hddCapacity, // hddCapacity in GB
    CPU_DATA[currentHardware].TDP // cpuTdp in Watts
  );

  // New System: Intel Platinum 8480CL, released 2023
  const newSystem = new System(
    (4 * 477) / 100, // dieSize in cm^2
    newPerformanceIndicator, // performanceIndicator
    lifetime, // lifetime in years
    dramCapacity, // dramCapacity in GB
    ssdCapacity, // ssdCapacity in GB
    hddCapacity, // hddCapacity in GB
    CPU_DATA[newHardware].TDP // cpuTdp in Watts
  );

  const comparison :ComparisonType = generateSystemsComparison(
    newSystem, // new system object
    oldSystem, // old system object
    timeHorizon, // time horizon
    country, // country string
    utilization, // utilization percentage
    GUPTA_MODEL // OPEX calculation model
  );

  const breakEven = Math.min(comparison.relativeSavings.findIndex((value) => value < 0) + 3, 20);

  const oldSystemOpex = comparison.oldSystemOpex.slice(0, breakEven);
  const newSystemOpex = comparison.newSystemOpex.slice(0, breakEven);

  const intersect = lineIntersect(
    0, oldSystemOpex[0],
    breakEven - 1, oldSystemOpex[breakEven - 1],
    0, newSystemOpex[0],
    breakEven - 1, newSystemOpex[breakEven - 1],
  )

  return (
    <BenchmarkContext.Provider value={{ comparison, oldSystemOpex, newSystemOpex, intersect, breakEven, workload, utilization, country, setWorkload, setUtilization, setCountry, currentHardware, setCurrentHardware, newHardware,setNewHardware }}>
      {children}
    </BenchmarkContext.Provider>
  );
};

// Custom hook to use the BenchmarkContext
export const useBenchmarkContext = () => {
  const context = useContext(BenchmarkContext);
  if (!context) {
    throw new Error('useBenchmarkContext must be used within a BenchmarkProvider');
  }
  return context;
};
