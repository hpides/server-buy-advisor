import React, { useState } from "react";
import intel_xeon_logo from "../assets/intel_xeon_logo.png";
import CPU_DATA, { CPUEntry } from "../assets/data.ts";
import UP_ARROW from "../assets/up_arrow.svg";
import logo2013 from "../assets/intel_logo/2013.svg";
import logo2015 from "../assets/intel_logo/2015.svg";
import logo2020 from "../assets/intel_logo/2020.svg";
import logo2024 from "../assets/intel_logo/2024.webp";

const YEAR_LOGOS: Record<number, string> = {
  2013: logo2013,
  2015: logo2015,
  2020: logo2020,
  2024: logo2024,
};

const getClosestLogo = (launchYear: number): string => {
  const availableYears = Object.keys(YEAR_LOGOS)
    .map(Number)
    .sort((a, b) => b - a); // Descending order

  const closestYear = availableYears.find(year => year <= launchYear);
  return closestYear ? YEAR_LOGOS[closestYear] : intel_xeon_logo;
};

const DISPLAY: Record<string, keyof CPUEntry> = {
  Threads: "CORE_COUNT",
  TDP: "TDP",
  Release: "LAUNCH_YEAR",
};

// Reusable Dropdown Component
interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  compareTo: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selected, compareTo, onChange }) => {
  const specs_selected :CPUEntry = CPU_DATA[selected];
  const specs_compareTo :CPUEntry = CPU_DATA[compareTo];

  const cpuLogo = getClosestLogo(specs_selected.LAUNCH_YEAR);

  return (
    <div className="w-1/2 flex flex-col gap-4 font-light">
      <p className="text-xl">{label}</p>
      <div className="relative">
        <select
          className="block appearance-none text-lg w-full bg-gray-100 border-2 border-gray-400 py-2 px-3 pr-8 rounded focus:outline-none focus:bg-white focus:border-gray-500"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <div className="flex gap-4">
        <img className="h-32 min-w-40" src={cpuLogo} />
        <table className="text-xl grow border-collapse">
          <tbody>
            {Object.entries(DISPLAY).map(([key, prop]) => {
              const selectedValue = specs_selected[prop];
              const compareValue = specs_compareTo?.[prop] ?? selectedValue;
              return (
                <tr key={key}>
                  <td className="w-0 pr-4 align-top">{key}:</td>
                  <td className="flex items-center gap-1">
                    <p>{selectedValue}</p>
                    {selectedValue > compareValue && (
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


const CPU_LIST = Object.keys(CPU_DATA) as Array<string>;

function Compare() {
  const [currentHardware, setCurrentHardware] = useState(CPU_LIST[0]);
  const [newHardware, setNewHardware] = useState(CPU_LIST[0]);

  return (
    <div className="flex px-8 py-4 gap-8">
      <Dropdown
        label="Current Hardware"
        options={CPU_LIST}
        selected={currentHardware}
        compareTo={newHardware}
        onChange={setCurrentHardware}
      />
      <Dropdown
        label="New Hardware"
        options={CPU_LIST}
        selected={newHardware}
        compareTo={currentHardware}
        onChange={setNewHardware}
      />
    </div>
  );
}

export default Compare;
