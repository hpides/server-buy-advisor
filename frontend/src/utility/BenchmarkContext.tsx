import { createContext, useState, useContext, ReactNode, useRef } from 'react';
import { WorkloadType, WORKLOAD_TYPES, WORKLOAD_MAPPING, ScalingType, SCALING_TYPES } from '../partials/BenchmarkSettings';
import { Country } from '../assets/grid_intensities';
import { CPU_LIST, HDD_CAPACITIES } from '../partials/Compare';
import { CapexType, OpexType, System } from './lifecycle_analysis/system';
import { generateSystemsComparison, ComparisonType } from './lifecycle_analysis/comparison';
import { GUPTA_MODEL } from './lifecycle_analysis/constants';
import CPU_DATA from '../assets/data';
import { lineIntersect } from '../charts/lineChart';
import { RAM_CAPACITIES, SSD_CAPACITIES } from '../partials/Compare';

export const NO_BREAK_EVEN_TIME_HORIZON = 3
export const FIRST_COUNTRY: Country = "Germany"

export const NEW_LABEL = "New Hardware";
export const OLD_LABEL = "Current Hardware";

// Assumptions
const timeHorizon = 1000;

// Shared specs
const lifetime = 20;
// const dramCapacity = 8 * 64; // in GB
// const ssdCapacity = 2 * 1600; // in GB
// const hddCapacity = 0; // in GB

export interface ServerType {
  cpu: keyof typeof CPU_DATA;
  ram: number;
  ssd: number;
  hdd: number;
  utilization: number;
}

interface BenchmarkContextType {
  currentServer: ServerType;
  setCurrentServer: (value: ServerType) => void;
  newServer: ServerType;
  setNewServer: (value: ServerType) => void;
  advancedSettings: boolean;
  setAdvancedSettings: (value: boolean) => void;
  advancedOptions: null | 'Mirror' | 'Scale';
  setAdvancedOptions: (value: null | 'Mirror' | 'Scale') => void;
  workload: WorkloadType;
  setWorkload: (value: WorkloadType) => void;
  scaling: ScalingType;
  setScaling: (value: ScalingType) => void;
  utilization: number;
  setUtilization: (value: number) => void;
  country: Country;
  setCountry: (value: Country) => void;
  getPerformanceIndicator: (cpu: keyof typeof CPU_DATA) => number;
  comparison: ComparisonType;
  oldSystemOpex: number[];
  newSystemOpex: number[];
  breakEven: number;
  intersect: { x:number, y:number } | false;
  singleComparison: boolean;
  setSingleComparison: (value: boolean) => void;
  oldPerformanceIndicator: number;
  newPerformanceIndicator: number;
  capexBreakdown: CapexType;
  opexBreakdown: OpexType;
  oldPowerConsumption: number;
  newPowerConsumption: number;
  updateServer: (server: ServerType, updates: Partial<ServerType>) => void;
}

const BenchmarkContext = createContext<BenchmarkContextType | undefined>(undefined);

interface BenchmarkProviderProps {
  children: ReactNode;
}

export const BenchmarkProvider: React.FC<BenchmarkProviderProps> = ({ children }) => {
  // Compare section
  const [currentServer, setCurrentServer] = useState<ServerType>({
    cpu: CPU_LIST[0],
    ram: RAM_CAPACITIES[0],
    ssd: SSD_CAPACITIES[0],
    hdd: HDD_CAPACITIES[0],
    utilization: 40,
  })

  const [newServer, setNewServer] = useState<ServerType>({
    cpu: CPU_LIST[0],
    ram: RAM_CAPACITIES[0],
    ssd: SSD_CAPACITIES[0],
    hdd: HDD_CAPACITIES[0],
    utilization: 40,
  })

  const lastUpdated = useRef<ServerType>(currentServer);

  const currentCPU = currentServer.cpu;
  const newCPU = newServer.cpu;

  const [singleComparison, setSingleComparison] = useState<boolean>(currentCPU === newCPU);
  // TODO: fix this naming and combine?
  const [advancedSettings, setAdvancedSettings] = useState<boolean>(false);
  const [advancedOptions, setAdvancedOptions] = useState<null | 'Mirror' | 'Scale'>(null);

  // Settings section
  const [workload, setWorkload] = useState<WorkloadType>(WORKLOAD_TYPES[0]);
  const [scaling, setScaling] = useState<ScalingType>(SCALING_TYPES[0]);
  const [utilization, setUtilization] = useState<number>(40);
  const [country, setCountry] = useState<Country>(FIRST_COUNTRY);

  const updateServer = (server: ServerType, updates: Partial<ServerType>) => {
    if (server === currentServer) {
      setCurrentServer(prev => ({ ...prev, ...updates }));
      lastUpdated.current = currentServer;
      return;
    }
    setNewServer(prev => ({ ...prev, ...updates }));
    lastUpdated.current = newServer;
  };

  const oldDieSize = CPU_DATA[currentCPU].DIE_SIZE;
  const newDieSize = CPU_DATA[newCPU].DIE_SIZE;

  const oldPerformanceIndicator = CPU_DATA[currentCPU][WORKLOAD_MAPPING[workload]] || 0;
  const newPerformanceIndicator = CPU_DATA[newCPU][WORKLOAD_MAPPING[workload]] || 0;

  const emissionsScaling = scaling == 'Emissions';

  // Old System
  const oldSystem = new System(
    oldDieSize / 100, // dieSize in cm^2
    oldPerformanceIndicator, // performanceIndicator
    lifetime, // lifetime in years
    currentServer.ram, // dramCapacity in GB
    currentServer.ssd, // ssdCapacity in GB
    currentServer.hdd, // hddCapacity in GB
    CPU_DATA[currentCPU].TDP // cpuTdp in Watts
  );

  // New System
  const newSystem = new System(
    newDieSize / 100, // dieSize in cm^2
    newPerformanceIndicator, // performanceIndicator
    lifetime, // lifetime in years
    newServer.ram, // dramCapacity in GB
    newServer.ssd, // ssdCapacity in GB
    newServer.hdd, // hddCapacity in GB
    CPU_DATA[newCPU].TDP// cpuTdp in Watts
  );

  const comparison :ComparisonType = generateSystemsComparison(
    (singleComparison ? oldSystem : newSystem), // new system object
    oldSystem, // old system object
    timeHorizon, // time horizon
    country, // country string
    currentServer.utilization, // old system utilization percentage
    newServer.utilization, // new system utilization percentage
    GUPTA_MODEL, // OPEX calculation model
    emissionsScaling
  );

  const getPerformanceIndicator = (cpu: keyof typeof CPU_DATA): number => {
    return CPU_DATA[cpu][WORKLOAD_MAPPING[workload]] || 0;
  }

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
  const breakEven = Math.ceil(intersect ? intersect.x + 1 : NO_BREAK_EVEN_TIME_HORIZON);

  const oldSystemOpex = comparison.oldSystemOpex.slice(0, breakEven);
  const newSystemOpex = comparison.newSystemOpex.slice(0, breakEven);
  const capexBreakdown = comparison.capexBreakdown;
  const opexBreakdown = comparison.opexBreakdown;
  const oldPowerConsumption = comparison.oldPowerConsumption;
  const newPowerConsumption = comparison.newPowerConsumption;

  return (
    <BenchmarkContext.Provider value={{ updateServer, currentServer, newServer, setCurrentServer, setNewServer, advancedSettings, setAdvancedSettings, advancedOptions, setAdvancedOptions, scaling, setScaling, oldPowerConsumption, newPowerConsumption, opexBreakdown, capexBreakdown, setSingleComparison, oldPerformanceIndicator, newPerformanceIndicator, getPerformanceIndicator, comparison, oldSystemOpex, singleComparison, newSystemOpex, intersect, breakEven, workload, utilization, country, setWorkload, setUtilization, setCountry}}>
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
