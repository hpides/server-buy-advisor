import { System, CapexType, OpexType } from "./system";
import { NEW_SYSTEM, OLD_SYSTEM } from "./constants";
import { Country } from "../../assets/grid_intensities";

export interface ComparisonType {
  newSystemOpex: number[];
  oldSystemOpex: number[];
  absSavings: number[];
  relativeSavings: number[];
  ratio: number[];
  capexBreakdown: CapexType;
  opexBreakdown: OpexType;
  oldPowerConsumption: number;
  newPowerConsumption: number;
}

// Function to generate a systems comparison
export function generateSystemsComparison(
  newSystem: System,
  oldSystem: System,
  timeHorizon: number,
  country: Country,
  utilization: number,
  opexCalculation: string
): ComparisonType {
  // Generate OPEX and CAPEX for the new system

  // we want to extract the opex breakdown from the new system, so need to add 
  // extra step for newSystemOpex compared to oldSysemOpex
  const newSystemEmissions = newSystem.generateAccumProjectedOpexEmissions( timeHorizon,
    NEW_SYSTEM,
    country,
    utilization,
    opexCalculation
  );
  let newSystemOpex = newSystemEmissions.projected

  const newSystemCapexBreakdown = newSystem.calculateCapexEmissions();
  const newSystemCapex = newSystemCapexBreakdown.TOTAL;

  // Generate OPEX for the old system

  const oldSystemEmissions = oldSystem.generateAccumProjectedOpexEmissions(
    timeHorizon,
    OLD_SYSTEM,
    country,
    utilization,
    opexCalculation
  );

  let oldSystemOpex = oldSystemEmissions.projected

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
    capexBreakdown: newSystemCapexBreakdown,
    opexBreakdown: newSystemEmissions.opexBreakdown,
    oldPowerConsumption: oldSystemEmissions.opexBreakdown.TOTAL,
    newPowerConsumption: newSystemEmissions.opexBreakdown.TOTAL,
  };
}
