import { CPUEntry } from "../partials/BenchmarkSettings";

export interface CPUs {
  [key: string]: CPUEntry;
}

export const INTEL = "Intel";
export const AMD = "AMD";

export interface CPUMetric {
  label: Exclude<keyof CPUEntry, "MAKE">;
  unit: string | null;
  tofixed: number;
  delimeter: boolean;
}

export const CPU_METRICS: Record<string, CPUMetric> = {
  "Launch Year": { label: "LAUNCH_YEAR", unit: null, tofixed: 0, delimeter: false },
  "Core Count": { label: "CORE_COUNT", unit: null, tofixed: 0, delimeter: true },
  "Thread Count": { label: "THREAD_COUNT", unit: null, tofixed: 0, delimeter: true },
  "TDP": { label: "TDP", unit: "Watts", tofixed: 0, delimeter: true },
  "TPC-H runs /hr": { label: "TPCH_RUNS_PER_H", unit: "Runs/hour", tofixed: 2, delimeter: true },
  "SPECrate": { label: "SPECINT_RATE", unit: null, tofixed: 2, delimeter: true },
  "SPECspeed": { label: "SPECINT", unit: null, tofixed: 2, delimeter: true },
  "Sorted Tuples per second": { label: "SORTED_TUPLES_PER_S", unit: "Tuples/second", tofixed: 0, delimeter: true },
  "Sorted Tuples per joule": { label: "SORTED_TUPLES_PER_JOULE", unit: "Tuples/Joule", tofixed: 0, delimeter: true },
  "TPCH runs": { label: "TPCH_RUNS_PER_KJOULE", unit: "Runs/KiloJoule", tofixed: 3, delimeter: true },
  "SPECspeed per TDP": { label: "SPECINT_PER_TDP", unit: "Score/Watt", tofixed: 2, delimeter: true },
  "SPECrate per TDP": { label: "SPECINTrate_PER_TDP", unit: "Score/Watt", tofixed: 2, delimeter: true }
};

const CPU_DATA : CPUs= {
  "Intel Xeon E7-4880 v2": {
    "MAKE": INTEL,
    "LAUNCH_YEAR": 2014,
    "CORE_COUNT": 15,
    "THREAD_COUNT": 30,
    "TDP": 130,
    "SORTED_TUPLES_PER_S": 153846.153,
    "TPCH_RUNS_PER_H": 40.07,
    "SPECINT_RATE": 61.111111111111,
    "SPECINT": 6.02222222222222,
    "SORTED_TUPLES_PER_JOULE": 517082.8,
    "TPCH_RUNS_PER_KJOULE": 0.0603893453241102,
    "SPECINT_PER_TDP": 1.38974358974359,
    "SPECINTrate_PER_TDP": 0.470085470085469,
    "DIE_SIZE": 541
  },
  "Intel Xeon E7-4850 v4": {
    "MAKE": INTEL,
    "LAUNCH_YEAR": 2016,
    "CORE_COUNT": 32,
    "THREAD_COUNT": 16,
    "TDP": 115,
    "SORTED_TUPLES_PER_S": 157455.642777,
    "TPCH_RUNS_PER_H": 40.1731641924089,
    "SPECINT_RATE": 109.25,
    "SPECINT": 6.66666666666667,
    "SORTED_TUPLES_PER_JOULE": 780063.146,
    "TPCH_RUNS_PER_KJOULE": 0.0642346000400901,
    "SPECINT_PER_TDP": 1.85507246376811,
    "SPECINTrate_PER_TDP": 0.95,
    "DIE_SIZE": 456
  },
  "Intel Xeon Platinum 8180": {
    "MAKE": INTEL,
    "LAUNCH_YEAR": 2017,
    "CORE_COUNT": 56,
    "THREAD_COUNT": 28,
    "TDP": 205,
    "SORTED_TUPLES_PER_S": 255325.124631,
    "TPCH_RUNS_PER_H": 88.63,
    "SPECINT_RATE": 141,
    "SPECINT": 9.324,
    "SORTED_TUPLES_PER_JOULE": 447132.456,
    "TPCH_RUNS_PER_KJOULE": 0.133619191490173,
    "SPECINT_PER_TDP": 2.54704390243902,
    "SPECINTrate_PER_TDP": 0.673170731707317,
    "DIE_SIZE": 628
  },
  "Intel Xeon Platinum 8259CL": {
    "MAKE": INTEL,
    "LAUNCH_YEAR": 2019,
    "CORE_COUNT": 48,
    "THREAD_COUNT": 24,
    "TDP": 165,
    "SORTED_TUPLES_PER_S": 328031.52382944,
    "TPCH_RUNS_PER_H": 89.4327282049957,
    "SPECINT_RATE": 140,
    "SPECINT": 10.3,
    "SORTED_TUPLES_PER_JOULE": 901134.302803654,
    "TPCH_RUNS_PER_KJOULE": 0.101716459471903,
    "SPECINT_PER_TDP": 2.99636363636364,
    "SPECINTrate_PER_TDP": 0.848484848484848,
    "DIE_SIZE": 754
  },
  "Intel Xeon Platinum 8352Y": {
    "MAKE": INTEL,
    "LAUNCH_YEAR": 2021,
    "CORE_COUNT": 32,
    "THREAD_COUNT": 64,
    "TDP": 205,
    "SORTED_TUPLES_PER_S": 373634.831734,
    "TPCH_RUNS_PER_H": 117.173425457684,
    "SPECINT_RATE": 215,
    "SPECINT": 11.6777,
    "SORTED_TUPLES_PER_JOULE": 988856.82,
    "TPCH_RUNS_PER_KJOULE": 0.212240584737477,
    "SPECINT_PER_TDP": 3.64572097560976,
    "SPECINTrate_PER_TDP": 1.04878048780488,
    "DIE_SIZE": 660
  },
  "Intel Xeon Platinum 8480CL": {
    "MAKE": INTEL,
    "LAUNCH_YEAR": 2023,
    "CORE_COUNT": 56,
    "THREAD_COUNT": 112,
    "TDP": 350,
    "SORTED_TUPLES_PER_S": 466539.876,
    "TPCH_RUNS_PER_H": 177.949663971718,
    "SPECINT_RATE": 443.5,
    "SPECINT": 14.725,
    "SORTED_TUPLES_PER_JOULE": 934343.670288806,
    "TPCH_RUNS_PER_KJOULE": 0.671868755779442,
    "SPECINT_PER_TDP": 2.0256,
    "SPECINTrate_PER_TDP": 1.26714285714286,
    "DIE_SIZE": (4*477)
  },
  "AMD EPYC 7601": {
    "MAKE": AMD,
    "LAUNCH_YEAR": 2017,
    "CORE_COUNT": 32,
    "THREAD_COUNT": 64,
    "TDP": 180,
    "SORTED_TUPLES_PER_S": null,
    "TPCH_RUNS_PER_H": null,
    "SPECINT_RATE": 151,
    "SPECINT": 7.16,
    "SORTED_TUPLES_PER_JOULE": null,
    "TPCH_RUNS_PER_KJOULE": null,
    "SPECINT_PER_TDP": 0.03977777777,
    "SPECINTrate_PER_TDP": 0.83888888888,
    "DIE_SIZE": 213
  },
  "AMD EPYC 7402P": {
    "MAKE": AMD,
    "LAUNCH_YEAR": 2019,
    "CORE_COUNT": 24,
    "THREAD_COUNT": 48,
    "TDP": 180,
    "SORTED_TUPLES_PER_S": null,
    "TPCH_RUNS_PER_H": null,
    "SPECINT_RATE": 170,
    "SPECINT": 8.65,
    "SORTED_TUPLES_PER_JOULE": null,
    "TPCH_RUNS_PER_KJOULE": null,
    "SPECINT_PER_TDP": 0.04805555555,
    "SPECINTrate_PER_TDP": 0.94444444444,
    "DIE_SIZE": 74
  },
  "AMD EPYC 7302P": {
    "MAKE": AMD,
    "LAUNCH_YEAR": 2019,
    "CORE_COUNT": 16,
    "THREAD_COUNT": 32,
    "TDP": 155,
    "SORTED_TUPLES_PER_S": null,
    "TPCH_RUNS_PER_H": null,
    "SPECINT_RATE": 118,
    "SPECINT": 8.55,
    "SORTED_TUPLES_PER_JOULE": null,
    "TPCH_RUNS_PER_KJOULE": null,
    "SPECINT_PER_TDP": 0.05516129032,
    "SPECINTrate_PER_TDP": 0.76129032258,
    "DIE_SIZE": 74
  },
  "AMD EPYC 7513": {
    "MAKE": AMD,
    "LAUNCH_YEAR": 2021,
    "CORE_COUNT": 32,
    "THREAD_COUNT": 64,
    "TDP": 200,
    "SORTED_TUPLES_PER_S": null,
    "TPCH_RUNS_PER_H": null,
    "SPECINT_RATE": 252,
    "SPECINT": 12.3,
    "SORTED_TUPLES_PER_JOULE": null,
    "TPCH_RUNS_PER_KJOULE": null,
    "SPECINT_PER_TDP": 0.0615,
    "SPECINTrate_PER_TDP": 1.26,
    "DIE_SIZE": (8*81)
  },
  "AMD EPYC 7773X": {
    "MAKE": AMD,
    "LAUNCH_YEAR": 2021,
    "CORE_COUNT": 64,
    "THREAD_COUNT": 128,
    "TDP": 280,
    "SORTED_TUPLES_PER_S": null,
    "TPCH_RUNS_PER_H": null,
    "SPECINT_RATE": 406,
    "SPECINT": 12.3,
    "SORTED_TUPLES_PER_JOULE": null,
    "TPCH_RUNS_PER_KJOULE": null,
    "SPECINT_PER_TDP": 0.04392857142,
    "SPECINTrate_PER_TDP": 1.45,
    "DIE_SIZE": (8*81)
  },
  "AMD EPYC 9554": {
    "MAKE": AMD,
    "LAUNCH_YEAR": 2022,
    "CORE_COUNT": 64,
    "THREAD_COUNT": 128,
    "TDP": 360,
    "SORTED_TUPLES_PER_S": null,
    "TPCH_RUNS_PER_H": null,
    "SPECINT_RATE": 655,
    "SPECINT": 14.9,
    "SORTED_TUPLES_PER_JOULE": null,
    "TPCH_RUNS_PER_KJOULE": null,
    "SPECINT_PER_TDP": 0.04138888888,
    "SPECINTrate_PER_TDP": 1.81944444444,
    "DIE_SIZE": (8*72)
  }
}

export default CPU_DATA;
