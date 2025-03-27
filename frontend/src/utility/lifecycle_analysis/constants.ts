// Workloads
export const SORTING = "sorting";
export const SPECINT = "specint";

// Countries
export const SWEDEN = "sweden";
export const GERMANY = "germany";
export const POLAND = "poland";

// Systems
export const OLD_SYSTEM = "old_system";
export const NEW_SYSTEM = "new_system";

// OPEX model
export const HPE_POWER_ADVISOR = "hpe_power_advisor";
export const GUPTA_MODEL = "gupta_model";

// Data from files in ./raw_data_no_image
// Generated using the HPE power advisor
export const OPEX_PER_YEAR: Record<
  string,
  Record<
    number,
    Record<string, number>
  >
> = {
  [POLAND]: {
    30: {
      [OLD_SYSTEM]: 2312 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 2047 / 4, // kg CO2e for 4 years of operation
    },
    60: {
      [OLD_SYSTEM]: 3276 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 3246 / 4, // kg CO2e for 4 years of operation
    },
    90: {
      [OLD_SYSTEM]: 4249 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 4459 / 4, // kg CO2e for 4 years of operation
    },
  },
  [GERMANY]: {
    30: {
      [OLD_SYSTEM]: 2312 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 2047 / 4, // kg CO2e for 4 years of operation
    },
    60: {
      [OLD_SYSTEM]: 3276 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 3246 / 4, // kg CO2e for 4 years of operation
    },
    90: {
      [OLD_SYSTEM]: 4249 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 4459 / 4, // kg CO2e for 4 years of operation
    },
  },
  [SWEDEN]: {
    30: {
      [OLD_SYSTEM]: 158 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 149 / 4, // kg CO2e for 4 years of operation
    },
    60: {
      [OLD_SYSTEM]: 227 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 236 / 4, // kg CO2e for 4 years of operation
    },
    90: {
      [OLD_SYSTEM]: 296 / 4, // kg CO2e for 4 years of operation
      [NEW_SYSTEM]: 324 / 4, // kg CO2e for 4 years of operation
    },
  },
};

// Electricity maps
export const GCI_CONSTANTS: Record<string, number> = {
  [SWEDEN]: 25 / 1000, // kg CO2 per kWh
  [GERMANY]: 344 / 1000, // kg CO2 per kWh
  [POLAND]: 652 / 1000, // kg CO2 per kWh
};

// According to https://dl.acm.org/doi/fullHtml/10.1145/3466752.3480089#tab1
export const DRAM_WATTS_PER_256GB = 25.9;
