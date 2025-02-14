import { createContext, useState, useContext, ReactNode } from 'react';
import { TestType, Country, TEST_TYPES, COUNTRIES } from '../partials/BenchmarkSettings';
import { CPU_LIST } from '../partials/Compare';
import { System } from './lifecycle_analysis/system';
import { generateSystemsComparison, ComparisonType } from './lifecycle_analysis/comparison';
import { GUPTA_MODEL } from './lifecycle_analysis/constants';
import CPU_DATA, { CPUEntry, CPUs } from '../assets/data';

// Assumptions
const timeHorizon = 20;

// Shared specs
const lifetime = 20;
const dramCapacity = 8 * 64; // in GB
const ssdCapacity = 2 * 1600; // in GB
const hddCapacity = 0; // in GB

// Call the generateSystemsComparison function

interface BenchmarkContextType {
  testType: TestType;
  utilization: number;
  country: Country;
  currentHardware: string;
  newHardware: string;
  comparison: ComparisonType;
  setCurrentHardware: (value: string) => void;
  setNewHardware: (value: string) => void;
  setTestType: (value: TestType) => void;
  setUtilization: (value: number) => void;
  setCountry: (value: Country) => void;
}

// Create the context with an undefined default value
const BenchmarkContext = createContext<BenchmarkContextType | undefined>(undefined);

interface BenchmarkProviderProps {
  children: ReactNode;
}

export const BenchmarkProvider: React.FC<BenchmarkProviderProps> = ({ children }) => {
  const [currentHardware, setCurrentHardware] = useState<string>(CPU_LIST[0]);
  const [newHardware, setNewHardware] = useState<string>(CPU_LIST[0]);
  const [testType, setTestType] = useState<TestType>(TEST_TYPES[0]);
  const [utilization, setUtilization] = useState<number>(40);
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);

  // Old System: Intel Xeon E7-4880, released 2014
  const oldSystem = new System(
    541 / 100, // dieSize in cm^2
    1, // performanceIndicator
    lifetime, // lifetime in years
    dramCapacity, // dramCapacity in GB
    ssdCapacity, // ssdCapacity in GB
    hddCapacity, // hddCapacity in GB
    CPU_DATA[currentHardware].TDP // cpuTdp in Watts
  );

  console.log(currentHardware)

  // New System: Intel Platinum 8480CL, released 2023
  const newSystem = new System(
    (4 * 477) / 100, // dieSize in cm^2
    3.55, // performanceIndicator
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

  return (
    <BenchmarkContext.Provider value={{ comparison, testType, utilization, country, setTestType, setUtilization, setCountry, currentHardware, setCurrentHardware, newHardware,setNewHardware }}>
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
