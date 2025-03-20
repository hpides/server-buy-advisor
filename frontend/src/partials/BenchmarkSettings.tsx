import { useBenchmarkContext } from "../utility/BenchmarkContext";
import { addCommaToNumber } from "../utility/UtilityFunctions";

export type WorkloadType = 'SPECrate' | 'SPECspeed' | 'Sorting' | 'TPC-H';
export type Country = 'poland' | 'germany' | 'sweden';

export const WORKLOAD_TYPES: WorkloadType[] = ['SPECrate', 'SPECspeed', 'Sorting', 'TPC-H'];
export const COUNTRIES: Country[] = ['poland', 'germany', 'sweden'];

export type PerformanceType = number;

export interface CPUEntry {
  LAUNCH_YEAR: number;
  TDP: number;
  LAUNCH_QUARTER: number;
  SORTED_TUPLES_PER_S: PerformanceType;
  TPCH_RUNS_PER_H: PerformanceType;
  SPECINT_RATE: PerformanceType;
  SPECINT: PerformanceType;
  CORE_COUNT: number;
  SORTED_TUPLES_PER_JOULE: number | null;
  TPCH_RUNS_PER_KJOULE: number;
  SPECINT_PER_TDP: number;
  SPECINTrate_PER_TDP: number;
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

  const { workload, utilization, country, oldPerformanceIndicator, newPerformanceIndicator, singleComparison, setWorkload, setUtilization, setCountry } = useBenchmarkContext();

  const ratio = (newPerformanceIndicator / oldPerformanceIndicator).toFixed(3).replace(/\.000$/, '')
  let oldFormatted = oldPerformanceIndicator.toFixed(1).replace(/\.0$/, '');
  let newFormatted = newPerformanceIndicator.toFixed(1).replace(/\.0$/, '');

  oldFormatted = addCommaToNumber(Number(oldFormatted));
  newFormatted = addCommaToNumber(Number(newFormatted));

  return (
    <div className="flex text-lg font-medium py-4 px-8 gap-12 flex-wrap">
      <div className="w-3/5 flex flex-col gap-4">
        <div className="flex gap-4 items-center flex-wrap">
          <p>Workload:</p>
          {
            WORKLOAD_TYPES.map((type) => (
              <button
                key={type}
                onMouseDown={() => setWorkload(type)}
                className={`px-3 py-0.5 cursor-pointer font-normal rounded-md ${workload === type ? "duration-150 bg-orange-400 text-white" : "bg-transparent text-black"}`}
              >
                {type}
              </button>
            ))
          }
        </div>
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
        <div className="flex gap-4 items-center">
          <p>Location:</p>
          {
            COUNTRIES.map((type) => (
              <button
                key={type}
                onMouseDown={() => setCountry(type)}
                className={`px-3 py-0.5 cursor-pointer capitalize font-normal rounded-md ${country === type ? "duration-150 bg-orange-400 text-white" : "bg-transparent text-black"}`}
              >
                {type}
              </button>
            ))
          }
        </div>
      </div>
      <div className="flex flex-col border-2 border-[#D4722E] rounded-xl px-4 py-3 font-normal w-1/3">
        <p className="font-normap font-medium w-full text-wrap">Workload Performance indicator</p>
        <table>
          <tr>
            <td>Current Hardware:</td>
            <td>{oldFormatted}</td>
          </tr>
          {
            !singleComparison &&
              <>
                <tr>
                  <td>New Hardware:</td>
                  <td>{newFormatted}</td>
                </tr>
                <tr>
                  <td>Ratio:</td>
                  <td>{ratio}</td>
                </tr>
              </>
          }
        </table>
      </div>
    </div>
  )
}

export default BenchmarkSettings;
