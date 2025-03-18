import { System } from "./system";
import { NEW_SYSTEM, OLD_SYSTEM } from "./constants";

export interface ComparisonType {
  newSystemOpex: number[];
  oldSystemOpex: number[];
  absSavings: number[];
  relativeSavings: number[];
  ratio: number[];
}

// Function to generate a systems comparison
export function generateSystemsComparison(
  newSystem: System,
  oldSystem: System,
  timeHorizon: number,
  country: string,
  utilization: number,
  opexCalculation: string
): ComparisonType {
  // Generate OPEX and CAPEX for the new system
  let newSystemOpex = newSystem.generateAccumProjectedOpexEmissions(
    timeHorizon,
    NEW_SYSTEM,
    country,
    utilization,
    opexCalculation
  );
  const newSystemCapex = newSystem.calculateCapexEmissions();

  // Generate OPEX for the old system
  let oldSystemOpex = oldSystem.generateAccumProjectedOpexEmissions(
    timeHorizon,
    OLD_SYSTEM,
    country,
    utilization,
    opexCalculation
  );

  // Calculate performance factor
  const performanceFactor =
    oldSystem.performanceIndicator / newSystem.performanceIndicator;

  // Adjust new system OPEX based on performance factor
  newSystemOpex = newSystemOpex.map((opex) => opex * performanceFactor);

  // Add CAPEX to OPEX for the new system at each time step
  newSystemOpex = newSystemOpex.map((opex) => opex + newSystemCapex);

  // Calculate absolute savings
  const absSavings = newSystemOpex.map(
    (newOpex, index) => newOpex - oldSystemOpex[index]
  );

  // Calculate relative savings
  const relativeSavings = newSystemOpex.map(
    (newOpex, index) => 1 - oldSystemOpex[index] / newOpex
  );

  // Calculate OPEX ratio
  const ratio = newSystemOpex.map(
    (newOpex, index) => newOpex / oldSystemOpex[index]
  );

  return {
    newSystemOpex,
    oldSystemOpex,
    absSavings,
    relativeSavings,
    ratio,
  };
}
