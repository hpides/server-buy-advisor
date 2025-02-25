import React from "react";
import LineChart from "../charts/lineChart";
import { useBenchmarkContext } from "../utility/BenchmarkContext";
import { GCI_CONSTANTS } from "../utility/lifecycle_analysis/constants";
import { addCommaToNumber, sumArray } from "../utility/UtilityFunctions";
import CPU_DATA, { CPU_METRICS } from "../assets/data";
const BLANK_SPACE = "\u00A0";

// Reusable ListItem Component
interface ListItemProps {
  label: string;
  value?: string | number;
}

const ListItem: React.FC<ListItemProps> = ({ label, value }) => {
  return (
    <li className="border-2 border-[#D4722E] rounded-xl p-4 text-nowrap">
      <p className="text-lg">{label}</p>
      <p className="font-semibold text-2xl">{value ?? "--"}</p>
    </li>
  );
};

// Reusable TableHeader Component
interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return <th className="text-left w-1/4">{children}</th>;
};

function BenchmarkEvaluations() {

  const { currentHardware, newHardware, comparison, country, utilization } = useBenchmarkContext();

  const year = comparison.relativeSavings.findIndex((value) => value < 0);
  const intensity = GCI_CONSTANTS[country]
  const total = Number((sumArray(comparison.newSystemOpex) + sumArray(comparison.newSystemOpex)).toFixed(0))
  const currentData = CPU_DATA[currentHardware];
  const newData = CPU_DATA[newHardware];

  return (
    <div className="flex flex-col px-8 py-4 gap-8">
      <div className="flex gap-4">
        <ul className="flex flex-col gap-4">
          <ListItem label="Break Even Time" value={`${addCommaToNumber(year)} years`} />
          <ListItem label="Grid Carbon Intensity" value={`${addCommaToNumber(intensity)} gCO₂/kWh`} />
          <ListItem label="Total Carbon Footprint" value={`${addCommaToNumber(total)} kgCO₂`} />
        </ul>
        <div className="grow flex flex-col gap-4">
          <LineChart />
          <p className="text-center text-lg w-4/5 mx-auto">
            Figure: Projected CO2 accumulated emissions of current and new hardware for sorting workload, {utilization}% utilization with energy sourced from <span className="capitalize">{country}</span>.
          </p>
        </div>
      </div>
      <div>
        <table className="text-center w-full border-collapse text-xl">
          <thead>
            <tr>
              <TableHeader>Emissions</TableHeader>
              <th className="border-b-4 border-[#B4D8E7]">
                <p className="font-light">Current Hardware</p>
                <p className="font-medium">Xeon W-3365 Processor</p>
              </th>
              <th className="border-b-4 border-[#F1B16E]">
                <p className="font-light">New Hardware</p>
                <p className="font-medium">Xeon W-3365 Processor</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(CPU_METRICS).map(([key, { label, unit, tofixed }]) => {
              const curVal = currentData[label]?.toFixed(tofixed);
              const newVal = newData[label]?.toFixed(tofixed);
              const rowPadding = "py-2"
              return (
                <tr key={key} className="text-left align-top">
                  <th className={`font-medium flex flex-col py-2 ${rowPadding}`}>
                    <span>{key}</span>
                    <span className="text-sm text-slate-600">{unit || BLANK_SPACE}</span>
                  </th>
                  <td className={rowPadding + ' px-5'}>{curVal}</td> {/* Placeholder for Current Hardware Value */}
                  <td className={rowPadding + ' px-5'}>{newVal}</td> {/* Placeholder for New Hardware Value */}
                </tr>
              )})}
          </tbody>
          {/* 
          <tbody>
            <tr>
              <TableHeader>Manufacturing Footprint</TableHeader>
              <td></td>
            </tr>
            <tr>
              <TableHeader>Operating Footprint</TableHeader>
              <td></td>
            </tr>
            <tr>
              <TableHeader>Total Carbon Footprint</TableHeader>
              <td></td>
            </tr>
          </tbody>

          */}
        </table>
      </div>
    </div>
  );
}

export default BenchmarkEvaluations;
