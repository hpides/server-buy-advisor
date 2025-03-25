import CPU_DATA from "../assets/data";
import { useBenchmarkContext } from "../utility/BenchmarkContext";
import ToggleSelection from "../utility/ToggleSelection";
// @tsignore
import GeoMap from "../partials/GeoMap";

export type WorkloadType = 'SPECrate' | 'SPECspeed' | 'Sorting' | 'TPC-H';

export const WORKLOAD_TYPES: WorkloadType[] = ['SPECrate', 'SPECspeed', 'Sorting', 'TPC-H'];

export type PerformanceType = number | null;

export const INTEL = "Intel";
export const AMD = "AMD";

export type CPUMake = typeof INTEL | typeof AMD;

export interface CPUEntry {
  MAKE: CPUMake;
  LAUNCH_YEAR: number;
  TDP: number;
  SORTED_TUPLES_PER_S: PerformanceType;
  TPCH_RUNS_PER_H: PerformanceType;
  SPECINT_RATE: PerformanceType;
  SPECINT: PerformanceType;
  CORE_COUNT: number;
  SORTED_TUPLES_PER_JOULE: number | null;
  TPCH_RUNS_PER_KJOULE: number | null;
  SPECINT_PER_TDP: number;
  SPECINTrate_PER_TDP: number;
  DIE_SIZE: number;
}

type PerformanceKeys = {
  [K in keyof CPUEntry]: CPUEntry[K] extends PerformanceType ? K : never;
}[keyof CPUEntry];

export interface WorkloadMappingType {
  SPECrate: PerformanceKeys;
  SPECspeed: PerformanceKeys;
  Sorting: PerformanceKeys;
  "TPC-H": PerformanceKeys;
}

export const WORKLOAD_MAPPING: WorkloadMappingType = {
  SPECrate: "SPECINT_RATE",
  SPECspeed: "SPECINT",
  Sorting: "SORTED_TUPLES_PER_S",
  "TPC-H": "TPCH_RUNS_PER_H",
};

function BenchmarkSettings() {

  const { country, currentCPU, newCPU, workload, utilization, setCountry, setWorkload, setUtilization } = useBenchmarkContext();

  let disabledWorkload: WorkloadType[] = [];

  WORKLOAD_TYPES.forEach(workload => {
    let push = false
    if (CPU_DATA[currentCPU][WORKLOAD_MAPPING[workload]] === null) push = true;
    if (CPU_DATA[newCPU][WORKLOAD_MAPPING[workload]] === null) push = true;

    // push only if it is not alreal in disableWorkload
    if (push && !disabledWorkload.includes(workload)) disabledWorkload.push(workload)
  })

  // need to reset workload if restriced cpu is selected after workload is set
  if (disabledWorkload.includes(workload)) setWorkload(WORKLOAD_TYPES[0])


  return (
    <div className="flex flex-col text-medium font-medium flex-wrap px-4 py-2 gap-2">
        <ToggleSelection<WorkloadType>
          label="Workload:"
          options={WORKLOAD_TYPES}
          currentState={workload}
          setState={setWorkload}
          disabled={disabledWorkload}
          flexGrow={false}
        />
        <div className="flex gap-4 items-center">
          <label><p>Utilization %:</p></label>
          <input
            className="w-96 accent-red-500"
            type="range"
            value={utilization}
            min={0}
            max={100}
            onChange={(e) => setUtilization(Number(e.target.value))}
          />
          <div className="flex">
            <input
              className="border rounded-md text-center bg-white"
              type="number"
              min={0}
              max={100}
              value={utilization}
              onChange={(e) => setUtilization(Number(e.target.value))}
            />
            <p>%</p>
          </div>

      </div>
      <GeoMap country={country} setCountry={setCountry} />
    </div>
  )
}

export default BenchmarkSettings;
