import React from "react";
import LineChart from "../charts/lineChart";
import { useBenchmarkContext } from "../utility/BenchmarkContext";
import { GCI_CONSTANTS } from "../utility/lifecycle_analysis/constants";
import { addCommaToNumber, yearToYearAndMonth, BLANK_SPACE } from "../utility/UtilityFunctions";
import CPU_DATA, { CPU_METRICS } from "../assets/data";

// Reusable ListItem Component
interface ListItemProps {
  label: string;
  value?: string | number;
}

const ListItem: React.FC<ListItemProps> = ({ label, value }) => {
  return (
    <li className="border-2 border-[#D4722E] rounded-xl px-4 py-3 text-nowrap">
      <p className="text-base flex flex-col">
        {label.split("😀").map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </p>
      <p className="font-semibold text-xl">{value ?? "--"}</p>
    </li>
  );
};

function BenchmarkEvaluations() {
  const { currentHardware, newHardware, comparison, country, utilization, intersect } = useBenchmarkContext();

  const year = intersect ? Number(intersect.x.toFixed(1)) : null;
  const intensity = GCI_CONSTANTS[country]
  const total = intersect ? Number(intersect.y.toFixed(1)) : null;
  const currentData = CPU_DATA[currentHardware];
  const newData = CPU_DATA[newHardware];
  const embodiedCarbon = Number(comparison.newSystemOpex[0].toFixed(1));

  return (
    <div className="flex flex-col px-8 py-4 gap-12">
      <div className="flex gap-4">
        <ul className="flex flex-col gap-4">
          <ListItem label="Break-Even Time" value={`${yearToYearAndMonth(year)}`} />
          <ListItem label="New HW Embodied Carbon" value={`${addCommaToNumber(embodiedCarbon)} kgCO₂`} />
          <ListItem label="Grid Carbon Intensity" value={`${addCommaToNumber(intensity)} gCO₂/kWh`} />
          <ListItem label="Total Carbon Footprint 😀 until Break-Even" value={`${addCommaToNumber(total)} kgCO₂`} />
        </ul>
        <div className="grow flex flex-col gap-1">
          <LineChart />
          <p className="text-center text-sm w-4/5 mx-auto font-serif text-slate-700">
            Figure: Projected CO2 accumulated emissions of current and new hardware for sorting 
            workload, {utilization}% utilization with energy sourced from <span className="capitalize">{country}</span>.
          </p>
        </div>
      </div>
      <div>
        <table className="text-center w-full border-collapse text-lg">
          <thead>
            <tr>
              <th></th>
              <th className="border-b-4 border-[#B4D8E7]">
                <p className="font-light">Current Hardware</p>
                <p className="font-medium">{currentHardware}</p>
              </th>
              <th className="border-b-4 border-[#F1B16E]">
                <p className="font-light">New Hardware</p>
                <p className="font-medium">{newHardware}</p>
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
