import React, { useState, useEffect } from "react";
import intel_xeon_logo from "../assets/intel_xeon_logo.png";
import CPU_DATA from "../assets/data.ts";
import { AMD, CPUEntry, CPUMake } from "./BenchmarkSettings.tsx";
import { ServerType, useBenchmarkContext, NEW_LABEL, OLD_LABEL } from "../utility/BenchmarkContext.tsx";
import UP_ARROW from "../assets/up_arrow.svg";
import logo2013 from "../assets/intel_logo/2013.webp";
import logo2015 from "../assets/intel_logo/2015.jpg";
import logo2020 from "../assets/intel_logo/2020.png";
import logo2024 from "../assets/intel_logo/2024.jpg";
import amdLogo from "../assets/AMD_epyc_logo.svg";
import close from "../assets/close.png";
import ValueSelection from "../utility/ValueSelection.tsx";
import ServerPresetsComponent from "./ServerPresets.tsx";
import { ServerPresets } from "../assets/data.ts";

export const RAM_CAPACITIES :number[] = [128, 512];
export const SSD_CAPACITIES :number[] = [512, 2048];
export const HDD_CAPACITIES :number[] = [0, 4096];
export const CUSTOM = 'Custom' as const;

const YEAR_LOGOS: Record<number, string> = {
  2013: logo2013,
  2015: logo2015,
  2020: logo2020,
  2024: logo2024,
};

const getClosestLogo = (launchYear: number | null, make: CPUMake): string => {
  if (make == AMD) return amdLogo;
  if (launchYear == null) return logo2013;
  const availableYears = Object.keys(YEAR_LOGOS)
    .map(Number)
    .sort((a, b) => b - a); // Descending order

  const closestYear = availableYears.find(year => year <= launchYear);
  return closestYear ? YEAR_LOGOS[closestYear] : intel_xeon_logo;
};

const isOnlyCpu = (obj: Partial<ServerType>): obj is { cpu: string } => {
  return (
    Object.keys(obj).length === 1 &&
    "cpu" in obj
  );
}

const applyScaledUpdates = (
  updates: Partial<ServerType>,
  thisPerformanceIndicator: number,
  otherPerformanceIndicator: number,
): Partial<ServerType> => {

  const ratio = thisPerformanceIndicator / otherPerformanceIndicator;

  const scaleKeys: (keyof Pick<ServerType, 'ssd' | 'ram' | 'hdd'>)[] = ['ssd', 'ram', 'hdd'];
  const scaledUpdates: Partial<ServerType> = {};

  scaleKeys.forEach((key) => {
    const value = updates[key];
    if (value == undefined) return;
    scaledUpdates[key] = Math.floor(value * ratio);
  });

  return scaledUpdates;
};


const DISPLAY: Record<string, keyof CPUEntry> = {
  Cores: "CORE_COUNT",
  Threads: "THREAD_COUNT",
  TDP: "TDP",
  Release: "LAUNCH_YEAR",
};

// Reusable Dropdown Component
interface DropdownProps {
  label: string;
  thisServer: ServerType;
  otherServer: ServerType;
  showAdvanced: boolean;
  advancedOptions: null | 'Mirror' | 'Scale';
}

const Dropdown: React.FC<DropdownProps> = ({ label, thisServer, otherServer, showAdvanced, advancedOptions}) => {

  const { singleComparison, workload, updateServer, setSingleComparison, setAdvancedOptions, setAdvancedSettings, getPerformanceIndicator} = useBenchmarkContext();

  const specs_selected :CPUEntry = CPU_DATA[thisServer.cpu];
  const specs_compareTo :CPUEntry = CPU_DATA[otherServer.cpu];
  const canToggle = label == NEW_LABEL;

  const [showDropdown, setShowDropdown] = useState<boolean>(canToggle ? false : true);
  const [presetValue, setPresetValue] = useState<keyof ServerPresets | typeof CUSTOM>(CUSTOM)

  // This is when new hardware is hidden, we set it equal to current hardware
  if (canToggle && !showDropdown) {
    // thisServer.setCPU(otherServer.cpu)
    // thisServer.setRAM(otherServer.ram)
    // thisServer.setHDD(otherServer.hdd)
  }

  const toggleShow = () => {
    if (!canToggle) return;
    setSingleComparison(!singleComparison);
    setShowDropdown(!showDropdown);
  }

  const updateComponent = (updates: Partial<ServerType>, preset: false | string = false) => {
    // Always update the current server
    updateServer(thisServer, updates);
    setPresetValue(preset ? preset : CUSTOM);

    // if a new preset is picked, we dont want to scale anything.
    // advancedOptions state is set before this, but react doesn't update
    // in time for it to be detected here :(
    if (preset) return;

    const onlyCPU = isOnlyCpu(updates);

    if (onlyCPU) {
      updates = {
        cpu: updates.cpu,
        ram: otherServer.ram,
        ssd: otherServer.ssd,
        hdd: otherServer.hdd,
      }
    }

    if (advancedOptions === 'Mirror') {
      const { cpu, ...updatesWithoutCPU } = updates;
      updateServer(otherServer, updatesWithoutCPU);
      return;
    }

    // the lower two if statements are the same, except the servers are swapped
    // depending on what should be scaled when the CPU or the hardware is changed

    // if the CPU is changed, we want to update the changed CPU's server hardware,
    // not the other one
    if (advancedOptions === 'Scale' && onlyCPU) {
      const scaledUpdates = applyScaledUpdates(
        updates,
        getPerformanceIndicator(updates.cpu || thisServer.cpu),
        getPerformanceIndicator(otherServer.cpu),
      );
      updateServer(thisServer, scaledUpdates);
      return;
    }

    // if the hardware is changed, we want to scale the other server's hardware
    if (advancedOptions === 'Scale' && !onlyCPU) {
      const scaledUpdates = applyScaledUpdates(
        updates,
        getPerformanceIndicator(otherServer.cpu),
        getPerformanceIndicator(updates.cpu || thisServer.cpu),
      );
      updateServer(otherServer, scaledUpdates);
      return;
    }
  };

  const cpuLogo = getClosestLogo(specs_selected.LAUNCH_YEAR, specs_selected.MAKE);

  useEffect(() => {
    if (label !== NEW_LABEL) return; // only update new cpu

    if (advancedOptions === 'Scale') {
      const scaledUpdates = applyScaledUpdates(
        otherServer,
        getPerformanceIndicator(thisServer.cpu),
        getPerformanceIndicator(otherServer.cpu),
      );
      updateServer(thisServer, scaledUpdates);
      return;
    }

    if (advancedOptions === 'Mirror') {
      const { cpu, ...updatesWithoutCPU } = otherServer;
      updateServer(thisServer, updatesWithoutCPU);
      return;
    }

  }, [advancedOptions, workload])

  return (
    <div className="col-span-1 flex flex-col gap-2 font-light relative">
      <div
        onClick={toggleShow}
        className={`${showDropdown ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'} z-20 cursor-pointer duration-150 absolute top-0 left-0 w-full h-full bg-white border-2 border-slate-400 rounded-xl flex items-center justify-center group hover:border-slate-300`}>
        <p className="text-6xl text-slate-500 group-hover:text-slate-400 duration-150">+</p>
      </div>
      <div className="flex justify-between">
        <p className="text-medium font-medium">{label}</p>
        <button
          hidden={!canToggle}
          onClick={toggleShow}
          className="w-fit px-2 cursor-pointer hover:text-red-600 duration-200 scale-110 hover:scale-125"
        >
          <img 
            src={close} 
            className="h-5" />
        </button>
      </div>
      <ServerPresetsComponent {...{ presetValue, updateComponent, setAdvancedOptions, setAdvancedSettings }} />
      <div className={`${showDropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'} relative duration-150`}>
        <select
          className="block appearance-none text-base w-full bg-gray-100 border-2 border-gray-400 py-1 px-2 pr-8 rounded focus:outline-none focus:bg-white focus:border-gray-500"
          value={thisServer.cpu}
          onChange={(e) => updateComponent({cpu: (e.target.value)})}
        >
          {CPU_LIST.map((option) => {
            const year = CPU_DATA[option].LAUNCH_YEAR;
            return ( 
              <option key={option} value={option}>
                {`${year} - ${option}`}
              </option>
            )
          }
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg 
            className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <div 
        className={`${showAdvanced ? 'h-28' : 'h-0 pointer-events-none' } overflow-hidden duration-300 justify-center ease-in-out flex flex-col gap-2 px-2`}>
        <ValueSelection
          label="RAM(GB):"
          currentState={thisServer.ram}
          setState={(val) => updateComponent({ ram: val })}
        />
        <ValueSelection
          label="SSD(GB):"
          currentState={thisServer.ssd}
          setState={(val) => updateComponent({ ssd: val })}
        />
        <ValueSelection
          label="HDD(GB):"
          currentState={thisServer.hdd}
          setState={(val) => updateComponent({ hdd: val })}
        />
      </div>
      <div className="flex gap-4 mt-0">
        <div className="h-28">
          <img className={`${singleComparison && canToggle ? 'opacity-0' : 'opacity-100'} duration-150 h-full w-auto max-w-32 mx-auto`} src={cpuLogo} />
        </div>
        <table className="text-base grow border-collapse">
          <tbody>
            {Object.entries(DISPLAY).map(([key, prop]) => {
              let selectedValue = specs_selected[prop] || 0;
              const compareValue = (specs_compareTo?.[prop] ?? selectedValue) || 0;
              if (key == 'TDP') selectedValue = selectedValue + ' W';
              return (
                <tr key={key}>
                  <td className="w-0 pr-4 align-top text-left">{key}:</td>
                  <td className="flex items-center gap-1">
                    <p>{selectedValue}</p>
                    {selectedValue > compareValue && !singleComparison && (
                      <img src={UP_ARROW} className="h-full" alt="up" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CPU_LIST = Object.keys(CPU_DATA) as Array<string>;

function Compare() {
  const { currentServer, newServer, advancedSettings, setAdvancedSettings, advancedOptions, setAdvancedOptions } = useBenchmarkContext();

  return (
    <>
      <div className="grid grid-cols-2 px-4 py-2 gap-5">
        <Dropdown
          label={OLD_LABEL}
          showAdvanced={advancedSettings}
          thisServer={currentServer}
          otherServer={newServer}
          advancedOptions={advancedOptions}
        />
        <Dropdown
          label={NEW_LABEL}
          showAdvanced={advancedSettings}
          thisServer={newServer}
          otherServer={currentServer}
          advancedOptions={advancedOptions}
        />
      </div>

      <div className={`w-11/12 mx-auto overflow-hidden rounded-md duration-300 border-2 
        ${advancedSettings ? 'mt-4 border-blue px-4 py-2' : 'h-0 pointer-events-none border-transparent'}
      `}>
        {advancedSettings && (
          <form className="flex justify-evenly items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scalingOption"
                checked={advancedOptions === null}
                onChange={() => setAdvancedOptions(null)}
              />
              <span>None</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scalingOption"
                checked={advancedOptions === 'Mirror'}
                onChange={() => setAdvancedOptions('Mirror')}
              />
              <span>Mirror Resources</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scalingOption"
                checked={advancedOptions === 'Scale'}
                onChange={() => setAdvancedOptions('Scale')}
              />
              <span>Scale Resources</span>
            </label>
          </form>
        )}
      </div>

      <div
        className={`mx-auto cursor-pointer text-center hover:opacity-60 duration-0 px-3 py-2 text-medium border-blue border-2 mt-4 rounded-xl ease-in-out w-fit
          ${advancedSettings ? 'border-transparent font-medium' : 'font-semibold'}`}
        onMouseDown={() => setAdvancedSettings(!advancedSettings)}
      >
        <p>{advancedSettings ? 'Hide Advanced Options' : 'Show Advanced Options'}</p>
      </div>
    </>
  );
}

export default Compare;
