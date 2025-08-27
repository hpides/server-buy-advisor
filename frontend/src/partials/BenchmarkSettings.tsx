import CPU_DATA from "../assets/data";
import { GRID_INTENSITY } from "../assets/grid_intensities";
import { ServerType, useBenchmarkContext, NEW_LABEL, OLD_LABEL } from "../utility/BenchmarkContext";
import ToggleSelection from "../utility/ToggleSelection";
import { addCommaToNumber, clamp } from "../utility/UtilityFunctions";
import { getCountryColor } from "../partials/GeoMap";
// @tsignore
import GeoMap from "../partials/GeoMap";
// @ts-ignore
import { COUNTRY_NAMES } from '../assets/countries.js';
import { ListItem, ListItemWithSearch } from "../utility/ListItems";
import { WORKLOAD_EXPLANATIONS, SCALING_EXPLANATIONS } from "../utility/descriptions";
import UtilizationInput from "../utility/UtilizationInput.js";
import { useEffect } from "react";

export const WORKLOAD_TYPES = ['SPECrate', 'SPECspeed', 'Sorting', 'TPC-H'] as const;
export type WorkloadType = typeof WORKLOAD_TYPES[number];

export const SCALING_TYPES = ['None', 'Utilization', 'Emissions'] as const;
export type ScalingType = typeof SCALING_TYPES[number];

export type PerformanceType = number | null;

export const INTEL = "Intel";
export const AMD = "AMD";

export type CPUMake = typeof INTEL | typeof AMD;

export interface CPUEntry {
  MAKE: CPUMake;
  LAUNCH_YEAR: number;
  CORE_COUNT: number;
  THREAD_COUNT: number;
  TDP: number;
  SORTED_TUPLES_PER_S: PerformanceType;
  TPCH_RUNS_PER_H: PerformanceType;
  SPECINT_RATE: PerformanceType;
  SPECINT: PerformanceType;
  SORTED_TUPLES_PER_JOULE: number | null;
  TPCH_RUNS_PER_KJOULE: number | null;
  SPECINT_PER_TDP: number | null;
  SPECINTrate_PER_TDP: number | null;
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

  const { country, currentServer, newServer, workload, scaling, singleComparison, advancedSettings, oldPerformanceIndicator, newPerformanceIndicator, setCountry, setWorkload, setScaling, updateServer } = useBenchmarkContext();

  const intensity = GRID_INTENSITY[country];
  let disabledWorkload: WorkloadType[] = [];

  WORKLOAD_TYPES.forEach(workload => {
    let push = false
    if (CPU_DATA[currentServer.cpu][WORKLOAD_MAPPING[workload]] === null) push = true;
    if (!singleComparison && CPU_DATA[newServer.cpu][WORKLOAD_MAPPING[workload]] === null) push = true;

    // push only if it is not alreal in disableWorkload
    if (push && !disabledWorkload.includes(workload)) disabledWorkload.push(workload)
  })

  // need to reset workload if restriced cpu is selected after workload is set
  if (disabledWorkload.includes(workload)) setWorkload(WORKLOAD_TYPES[0])

  const updateUtilization = (server: String, updates: Partial<ServerType>) => {
    const thisServer = server == NEW_LABEL ? newServer : currentServer;
    const otherServer = server == NEW_LABEL ? currentServer : newServer;

    updateServer(thisServer, updates);

    if (singleComparison) return;

    if (scaling == 'Utilization') {
      const isNew = server === NEW_LABEL;
      console.log(isNew)
      const base = isNew ? oldPerformanceIndicator : newPerformanceIndicator;
      const target = isNew ? newPerformanceIndicator : oldPerformanceIndicator;

      const ratio = target / base;
      const scaledUtilization = clamp( updates.utilization as number * ratio, 0, 100);

      updateServer(otherServer, { utilization: scaledUtilization });
    }
  }

  useEffect(() => {
    if (scaling === "Utilization") {
      const ratio = oldPerformanceIndicator / newPerformanceIndicator;
      const scaledUtilization = clamp( currentServer.utilization as number * ratio, 0, 100);
      updateServer(newServer, { utilization: scaledUtilization });
    }

    if (scaling === "Emissions") {
      updateServer(newServer, { utilization: currentServer.utilization });
    }

    if (scaling === "None") {
      updateServer(newServer, { utilization: currentServer.utilization });
    }

  }, [scaling, currentServer, newServer])

return (
  <div className="flex z-30 flex-col text-medium font-medium flex-wrap px-4 py-2 gap-4">
    <div className="grid grid-cols-7 space-x-4">
      <div className="flex flex-col col-span-5 gap-5">
        <ToggleSelection<WorkloadType>
          label="Workload:"
          options={[...WORKLOAD_TYPES]}
          optionsTooltip={WORKLOAD_EXPLANATIONS}
          currentState={workload}
          setState={setWorkload}
          zIndex="z-30"
          disabled={disabledWorkload}
          flexGrow={false}
        />
        <ToggleSelection<ScalingType>
          label="Scaling:"
          options={[...SCALING_TYPES]}
          optionsTooltip={SCALING_EXPLANATIONS}
          currentState={scaling}
          setState={setScaling}
          zIndex="z-30"
          disabled={[]}
          flexGrow={false}
        />
        <UtilizationInput
          label={advancedSettings ? 'Current HW Utilization %:' : 'Utilization %:'}
          accent="accent-orange-600"
          utilization={currentServer.utilization}
          setUtilization={(x) => updateUtilization(OLD_LABEL, {utilization: (x)} )}
        />
          {
            singleComparison ? null :
              <UtilizationInput
                label="New HW Utilization %:"
                accent="accent-blue-500"
                utilization={newServer.utilization}
                setUtilization={(x) => updateUtilization(NEW_LABEL, {utilization: (x)} )}
                hidden={!advancedSettings}
              />
          }
      </div>
      <div className="flex font-normal gap-2 flex-col col-span-2">
        <ListItemWithSearch
          label="Location"
          value={country}
          options={COUNTRY_NAMES}
          onChange={setCountry}
          borderColor={getCountryColor(intensity)}
        />
        <ListItem
          label="Grid Carbon Intensity"
          value={`${addCommaToNumber(intensity)} gCO₂/kWh`}
          borderColor={getCountryColor(intensity)}
        />
      </div>
    </div>
    <div className={`duration-300 ease-in-out overflow-hidden relative`}>
      <GeoMap country={country} setCountry={setCountry} />
    </div>
  </div>
)
}

export default BenchmarkSettings;
