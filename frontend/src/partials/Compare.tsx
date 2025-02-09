import React, { useState } from "react";
import intel_xeon_logo from "../assets/intel_xeon_logo.png";

const CPU_LIST = [
  "Xeon W-3365 Processor",
  "Xeon W-1270 Processor",
  "Xeon W-1350P Processor",
  "Xeon w7-2495X Processor",
  "Xeon W-2275 Processor",
  "Xeon w5-3435X Processor",
  "Xeon W-3265M Processor",
  "Xeon W-1250P Processor",
];

// Reusable Dropdown Component
interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selected, onChange }) => {
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
        <img className="h-28" src={intel_xeon_logo} />
        <ul className="text-xl flex flex-col justify-evenly">
          <li>
            <p>Cores:</p>
            <p></p>
          </li>
          <li>
            <p>Threads:</p>
            <p></p>
          </li>
          <li>
            <p>Base Frequency:</p>
            <p></p>
          </li>
          <li>
            <p>Release:</p>
            <p></p>
          </li>

        </ul>
      </div>
    </div>
  );
};

function Compare() {
  const [currentHardware, setCurrentHardware] = useState(CPU_LIST[0]);
  const [newHardware, setNewHardware] = useState(CPU_LIST[0]);

  return (
    <div className="flex px-8 py-4 gap-8">
      <Dropdown
        label="Current Hardware"
        options={CPU_LIST}
        selected={currentHardware}
        onChange={setCurrentHardware}
      />
      <Dropdown
        label="New Hardware"
        options={CPU_LIST}
        selected={newHardware}
        onChange={setNewHardware}
      />
    </div>
  );
}

export default Compare;
