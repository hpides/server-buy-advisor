import React from "react";
import LineChart from "../charts/lineChart";
import { useBenchmarkContext } from "../utility/BenchmarkContext";
import { addCommaToNumber, yearToYearAndMonth } from "../utility/UtilityFunctions";
import CPU_DATA, { CPU_METRICS, CPUMetric } from "../assets/data";
import { GRID_INTENSITY } from "../assets/grid_intensities";

// Reusable ListItem Component
interface ListItemProps {
  label: string;
  value?: string | number;
  borderColor: string;
}

const ListItem: React.FC<ListItemProps> = ({ label, value, borderColor }) => {
  return (
    <li className={`border-2 ${borderColor} rounded-xl flex flex-col items-start justify-start px-3 py-2`}>
      <p className="text-base flex flex-col">
        {label.split("😀").map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </p>
      <p className="font-semibold text-lg">{value ?? "--"}</p>
    </li>
  );
};

interface TableRowProps {
  name: string;
  isSingleComparison: boolean;
  currentCPU: string | undefined;
  newCPU: string | undefined;
  CPUMetric: CPUMetric;
}

interface PercentageBarProps {
  value: number;
}

const PercentageBar: React.FC<PercentageBarProps> = ({ value }) => {
  return (
    <div className="w-1/2 pl-3 flex items-center text-sm text-green-600 font-medium opacity-70 gap-1">
      <p>{value}%</p>
      <span className="h-1 bg-green-600" style={{ width: `${Math.min(value / 2, 100)}%` }}></span>
    </div>
  )
}

const TableRow: React.FC<TableRowProps> = ({ name, isSingleComparison, currentCPU, newCPU, CPUMetric }) => {
  let curVal: any = Number(currentCPU);
  let newVal: any = Number(newCPU);

  let percentageChange = null;
  let higherValue = null;

  if (!isNaN(curVal) && !isNaN(newVal) && curVal !== newVal) {
    const baseValue = Math.min(curVal, newVal);
    const increase = ((Math.max(curVal, newVal) - baseValue) / baseValue) * 100;

    percentageChange = Number(increase.toFixed(1)) || null // if change = 0 then weird behaviour
    higherValue = curVal > newVal ? "curVal" : "newVal";
    // if infinite increase we break
    // if (Number.isFinite(increase)) {
    // }
  }

  if (CPUMetric.delimeter) {
    curVal = addCommaToNumber(curVal);
    newVal = addCommaToNumber(newVal);
  }

  const rowPadding = "py-2";

  return (
    <tr key={name} className="text-center align-middle border-b border-slate-200">
      <th className={`font-medium flex flex-col text-right pr-10 min-h-16 justify-center ${rowPadding}`}>
        <span>{name}</span>
        <span className="text-sm text-slate-600">{CPUMetric.unit}</span>
      </th>
      <td className={rowPadding + " px-5"}>
        <div className="flex relative">
          <p className={`${isSingleComparison ? 'w-full text-center' : 'w-1/2 text-right'}`}>{curVal}</p>
          {higherValue === "curVal" && percentageChange && <PercentageBar value={percentageChange} />}
        </div>
      </td>
      {!isSingleComparison && (
        <td className={rowPadding + " px-5"}>
          <div className="flex relative">
            <p className="w-1/2 text-right">{newVal}</p>
            {higherValue === "newVal" && percentageChange && <PercentageBar value={percentageChange} />}
          </div>
        </td>
      )}
    </tr>
  );
};

function BenchmarkEvaluations() {
  const { currentCPU, newCPU, comparison, country, utilization, intersect, workload, singleComparison, oldPerformanceIndicator, newPerformanceIndicator } = useBenchmarkContext();

  const year = intersect ? yearToYearAndMonth(Number(intersect.x.toFixed(1))) : "No Break-Even";
  const intensity = GRID_INTENSITY[country]
  const total = intersect ? addCommaToNumber(Number(intersect.y.toFixed(1))) + "kgCO₂" : "No Break-even";
  const currentData = CPU_DATA[currentCPU];
  const newData = CPU_DATA[newCPU];
  const embodiedCarbon = Number(comparison.newSystemOpex[0].toFixed(1));


  const ratio = (newPerformanceIndicator / oldPerformanceIndicator).toFixed(3).replace(/\.000$/, '')
  let oldFormatted = oldPerformanceIndicator.toFixed(1).replace(/\.0$/, '');
  let newFormatted = newPerformanceIndicator.toFixed(1).replace(/\.0$/, '');
  newFormatted = addCommaToNumber(Number(newFormatted));
  oldFormatted = addCommaToNumber(Number(oldFormatted));

  return (
    <div className="flex flex-col px-8 py-4 gap-10">
      <div className="flex flex-col gap-1 w-full">
        <LineChart />
        <p className="text-center text-sm w-full mx-auto font-serif text-slate-700">
          Figure: Projected CO2 accumulated emissions of current (blue) and new (orange) hardware for a {workload} workload, {utilization}% utilization with energy sourced from <span className="capitalize">{country}</span>.
        </p>
      </div>
      <div className="flex gap-4">
        {/* Left Side - 2x2 Grid */}
        <ul className="grid grid-cols-2 gap-4">
          <ListItem label="Break-Even Time" value={`${year}`} borderColor="border-[#A1223D]" />
          <ListItem label="Grid Carbon Intensity" value={`${addCommaToNumber(intensity)} gCO₂/kWh`} borderColor="border-[#A1223D]" />
          <ListItem label="New HW Embodied Carbon" value={`${addCommaToNumber(embodiedCarbon)} kgCO₂`} borderColor="border-[#CE682A]" />
          <ListItem label="Total Carbon Footprint 😀 until Break-Even" value={`${total}`} borderColor="border-[#CE682A]" />
        </ul>
        <div className="flex flex-col border-2 border-[#D4722E] rounded-xl gap-2 px-3 py-2 font-normal w-2/5">
            <p>Workload Performance indicator ({workload})</p>
          <table className="text-medium font-bold">
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
      <div>
        <table className="text-center w-7/8 mx-auto border-collapse text-base">
          <thead>
            <tr>
              <th className="w-1/5"></th>
              <th className="w-2/5 border-b-4 border-[#B4D8E7]">
                <p className="font-light">Current Hardware</p>
                <p className="font-medium">{currentCPU}</p>
              </th>
              <th className="border-b-4 border-[#F1B16E]" hidden={singleComparison}>
                <p className="font-light">New Hardware</p>
                <p className="font-medium">{newCPU}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(CPU_METRICS).map(([key, CPUMetric]) => {
              //TODO: Need to fix NaN displaying when data is null
              let curVal = currentData[CPUMetric.label]?.toFixed(CPUMetric.tofixed);
              let newVal = newData[CPUMetric.label]?.toFixed(CPUMetric.tofixed);

              return (
                <TableRow
                  name={key}
                  isSingleComparison={singleComparison}
                  currentCPU={curVal}
                  newCPU={newVal}
                  CPUMetric={CPUMetric}
                />
              )
            })}
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
