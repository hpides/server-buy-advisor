import { createContext, useState, useContext, ReactNode } from 'react';
import { TestType, Country, TEST_TYPES, COUNTRIES } from '../partials/BenchmarkSettings';
import { CPU_LIST } from '../partials/Compare';

interface BenchmarkContextType {
  testType: TestType;
  utilization: number;
  country: Country;
  currentHardware: string;
  newHardware: string;
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

  console.log(currentHardware, newHardware, testType, utilization, country);

  return (
    <BenchmarkContext.Provider value={{ testType, utilization, country, setTestType, setUtilization, setCountry, currentHardware, setCurrentHardware, newHardware,setNewHardware }}>
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
