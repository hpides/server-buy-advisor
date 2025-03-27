import { createContext, useState, useContext, ReactNode } from 'react';
import { WorkloadType, WORKLOAD_TYPES, WORKLOAD_MAPPING } from '../partials/BenchmarkSettings';
import { Country } from '../assets/grid_intensities';
import { CPU_LIST, HDD_CAPACITIES } from '../partials/Compare';
import { CapexType, OpexType, System } from './lifecycle_analysis/system';
import { generateSystemsComparison, ComparisonType } from './lifecycle_analysis/comparison';
import { GUPTA_MODEL } from './lifecycle_analysis/constants';
import CPU_DATA from '../assets/data';
import { lineIntersect } from '../charts/lineChart';
import { RAM_CAPACITIES, SSD_CAPACITIES } from '../partials/Compare';

export const FIRST_COUNTRY: Country = "Germany"

// Assumptions
const timeHorizon = 1000;

// Shared specs
const lifetime = 20;
// const dramCapacity = 8 * 64; // in GB
// const ssdCapacity = 2 * 1600; // in GB
// const hddCapacity = 0; // in GB

interface BenchmarkContextType {
  currentCPU: string;
  currentRAM: number;
  currentSSD: number;
  currentHDD: number;
  newCPU: string;
  newRAM: number;
  newSSD: number;
  newHDD: number;
  workload: WorkloadType;
  utilization: number;
  country: Country;
  comparison: ComparisonType;
  oldSystemOpex: number[];
  newSystemOpex: number[];
  breakEven: number;
  intersect: { x:number, y:number } | false;
  singleComparison: boolean;
  oldPerformanceIndicator: number;
  newPerformanceIndicator: number;
  capexBreakdown: CapexType;
  opexBreakdown: OpexType;
  setCurrentCPU: (value: string) => void;
  setCurrentRAM: (value: number) => void;
  setCurrentSSD: (value: number) => void;
  setCurrentHDD: (value: number) => void;
  setNewCPU: (value: string) => void;
  setNewRAM: (value: number) => void;
  setNewSSD: (value: number) => void;
  setNewHDD: (value: number) => void;
  setWorkload: (value: WorkloadType) => void;
  setUtilization: (value: number) => void;
  setCountry: (value: Country) => void;
  setSingleComparison: (value: boolean) => void;
}

const BenchmarkContext = createContext<BenchmarkContextType | undefined>(undefined);

interface BenchmarkProviderProps {
  children: ReactNode;
}

export const BenchmarkProvider: React.FC<BenchmarkProviderProps> = ({ children }) => {
  // Compare section
  const [currentCPU, setCurrentCPU] = useState<string>(CPU_LIST[0]);
  const [currentRAM, setCurrentRAM] = useState<number>(RAM_CAPACITIES[0]);
  const [currentSSD, setCurrentSSD] = useState<number>(SSD_CAPACITIES[0]);
  const [currentHDD, setCurrentHDD] = useState<number>(HDD_CAPACITIES[0]);
  const [newCPU, setNewCPU] = useState<string>(CPU_LIST[0]);
  const [newRAM, setNewRAM] = useState<number>(RAM_CAPACITIES[0]);
  const [newSSD, setNewSSD] = useState<number>(SSD_CAPACITIES[0]);
  const [newHDD, setNewHDD] = useState<number>(HDD_CAPACITIES[0]);

  // Settings section
  const [workload, setWorkload] = useState<WorkloadType>(WORKLOAD_TYPES[0]);
  const [utilization, setUtilization] = useState<number>(40);
  const [country, setCountry] = useState<Country>(FIRST_COUNTRY);

  const [singleComparison, setSingleComparison] = useState<boolean>(true);

  const oldPerformanceIndicator = CPU_DATA[currentCPU][WORKLOAD_MAPPING[workload]] || 0;
  const newPerformanceIndicator = CPU_DATA[newCPU][WORKLOAD_MAPPING[workload]] || 0;
  const oldDieSize = CPU_DATA[currentCPU].DIE_SIZE;
  const newDieSize = CPU_DATA[newCPU].DIE_SIZE;

  // Old System
  const oldSystem = new System(
    oldDieSize / 100, // dieSize in cm^2
    oldPerformanceIndicator, // performanceIndicator
    lifetime, // lifetime in years
    currentRAM, // dramCapacity in GB
    currentSSD, // ssdCapacity in GB
    currentHDD, // hddCapacity in GB
    CPU_DATA[currentCPU].TDP // cpuTdp in Watts
  );

  // New System
  const newSystem = new System(
    newDieSize / 100, // dieSize in cm^2
    newPerformanceIndicator, // performanceIndicator
    lifetime, // lifetime in years
    newRAM, // dramCapacity in GB
    newSSD, // ssdCapacity in GB
    newHDD, // hddCapacity in GB
    CPU_DATA[newCPU].TDP// cpuTdp in Watts
  );

  const comparison :ComparisonType = generateSystemsComparison(
    (singleComparison ? oldSystem : newSystem), // new system object
    oldSystem, // old system object
    timeHorizon, // time horizon
    country, // country string
    utilization, // utilization percentage
    GUPTA_MODEL // OPEX calculation model
  );

  const calculateIntersect = (singleComparison: boolean, oldSystemOpex: number[], newSystemOpex: number[]): { x:number, y:number } | false => {
    const embodiedLine = newSystemOpex[0];
    const l = oldSystemOpex.length;

    let intersect: { x:number, y:number } | false  = false;
    if (singleComparison) {
      // calculate the intersect between oldSystemOpex line and embodied line
      intersect = lineIntersect(
        0, oldSystemOpex[0],
        l - 1, oldSystemOpex[l - 1],
        0, embodiedLine,
        l - 1, embodiedLine
      )
    } else {
      // calculate the intersect between oldSystemOpex line and newSystemOpex line
      intersect = lineIntersect(
        0, oldSystemOpex[0],
        l - 1, oldSystemOpex[l - 1],
        0, newSystemOpex[0],
        l - 1, newSystemOpex[l - 1]
      )
    }
    return intersect;
  }

  const intersect = calculateIntersect(singleComparison, comparison.oldSystemOpex, comparison.newSystemOpex)
  const breakEven = Math.ceil(intersect ? intersect.x + 2 : 3);

  const oldSystemOpex = comparison.oldSystemOpex.slice(0, breakEven);
  const newSystemOpex = comparison.newSystemOpex.slice(0, breakEven);
  const capexBreakdown = comparison.capexBreakdown;
  const opexBreakdown = comparison.opexBreakdown;

  return (
    <BenchmarkContext.Provider value={{ opexBreakdown, capexBreakdown, setSingleComparison, oldPerformanceIndicator, newPerformanceIndicator, comparison, oldSystemOpex, singleComparison, newSystemOpex, intersect, breakEven, workload, utilization, country, setWorkload, setUtilization, setCountry, currentCPU, setCurrentCPU, newCPU, setNewCPU, currentRAM, currentSSD, newRAM, newSSD, setNewRAM, setNewSSD, setCurrentRAM, setCurrentSSD, currentHDD, setCurrentHDD, newHDD, setNewHDD }}>
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
