import { useState } from "react";

const TEST_TYPES :Array<string> = ['SPECrate', 'SPECspeed', 'Sorting', 'TPC-H'];
const COUNTRIES :Array<string> = ['Poland', 'Germany', 'Sweden'];

function BenchmarkSettings() {

  const [testType, setTestType] = useState(TEST_TYPES[0]);
  const [utilization, setUtilization] = useState(40);
  const [country, setCountry] = useState(COUNTRIES[0]);

  return (
    <div className="flex flex-col gap-4 py-4 text-xl font-medium px-8">
      <div className="flex gap-4 items-center">
        <p>Test:</p>
        {
          TEST_TYPES.map((type) => (
            <button
              key={type}
              onMouseDown={() => setTestType(type)}
              className={`px-3 py-0.5 cursor-pointer font-normal rounded-md ${testType === type ? "duration-150 bg-orange-400 text-white" : "bg-transparent text-black"}`}
            >
              {type}
            </button>
          ))
        }
      </div>
      <div className="flex gap-4 items-center">
        <label><p>Utilization %:</p></label>
        <input
          className="w-96 accent-orange-400"
          type="range"
          value={utilization}
          min={0}
          max={100}
          onChange={(e) => setUtilization(Number(e.target.value))}
        />
        <div className="flex">
        <input
          className="border rounded-md text-center"
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
              className={`px-3 py-0.5 cursor-pointer font-normal rounded-md ${country === type ? "duration-150 bg-orange-400 text-white" : "bg-transparent text-black"}`}
            >
              {type}
            </button>
          ))
        }
      </div>
    </div>
  )
}

export default BenchmarkSettings;
