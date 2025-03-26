import * as constants from './constants.ts';
import { GRID_INTENSITY } from '../../assets/grid_intensities.ts';
import { Country } from '../../assets/grid_intensities.ts';

export const CPU = 'CPU';
export const RAM = 'RAM';
export const SSD = 'SSD';
export const HDD = 'HDD';
export type Components = typeof CPU | typeof RAM | typeof SSD | typeof HDD;

export interface CapexType extends Record<Components, number> {
  TOTAL: number;
}

export interface OpexType extends Record<Components, number> {
  TOTAL: number;
  opexPerYear: number;
}

export interface ProjectedOpexEmissionsType {
  projected: number[];
  opexBreakdown: OpexType;
}

export class System {
  packagingSize: number;
  performanceIndicator: number;
  lifetime: number;
  dramCapacity: number;
  ssdCapacity: number;
  hddCapacity: number;
  cpuTdp: number;

  constructor(
    dieSize: number,
    performanceIndicator: number,
    lifetime: number,
    dramCapacity: number,
    ssdCapacity: number,
    hddCapacity: number,
    cpuTdp: number
  ) {
    /**
     * @param dieSize in cm^2
     * @param performanceIndicator
     * @param lifetime in years
     * @param dramCapacity in GB
     * @param ssdCapacity in GB
     * @param hddCapacity in GB
     * @param cpuTdp in Watts
     */
    this.packagingSize = dieSize;
    this.performanceIndicator = performanceIndicator;
    this.lifetime = lifetime;
    this.dramCapacity = dramCapacity;
    this.ssdCapacity = ssdCapacity;
    this.hddCapacity = hddCapacity;
    this.cpuTdp = cpuTdp;
  }

  calculateCapexEmissions(): CapexType {
    // Constants
    const MPA = 0.5; // Procure materials | kg CO2 per cm^2
    const EPA = 2.15; // Fab Energy | kWh per cm^2
    const CI_FAB = 0.365; // g CO2 per kWh converted to kg CO2 per kWh
    const GPA = 0.3; // Kg CO2 per cm^2
    const FAB_YIELD = 0.875; // Fab yield
    const E_DRAM = 0.3; // Kg CO2/GB
    const E_SSD = 0.015; // Kg CO2/GB
    const E_HDD = 0.06; // Kg CO2/GB

    // Calculate emissions
    const capexCpu =
      ((CI_FAB * EPA + GPA + MPA) * this.packagingSize) / FAB_YIELD;
    const capexDram = this.dramCapacity * E_DRAM;
    const capexSsd = this.ssdCapacity * E_SSD;
    const capexHdd = this.hddCapacity * E_HDD;

    return {
      CPU: capexCpu,
      RAM: capexDram,
      SSD: capexSsd,
      HDD: capexHdd,
      TOTAL: capexCpu + capexDram + capexSsd + capexHdd
    }
  }

  generateAccumProjectedOpexEmissions(
    timeHorizon: number,
    systemId: string,
    country: Country,
    utilization: number,
    opexCalculation: string
  ): ProjectedOpexEmissionsType {
    let opexPerYear: number;

    let opexBreakdown: OpexType;

    // never reaching this if statement, want to delete but too much refactoring
    // TODO: later
    if (opexCalculation === constants.HPE_POWER_ADVISOR) {
      opexPerYear = constants.OPEX_PER_YEAR[country][utilization][systemId];
    };

    opexBreakdown = this.calculateOpexEmissions(utilization, country);
    opexPerYear = opexBreakdown.opexPerYear;

    const projected =  Array.from({ length: timeHorizon }, (_, i) =>
      i * opexPerYear
    );

    return {
      projected,
      opexBreakdown
    }
  }

  generateNormalizedPowerUsage(utilization: number): number {
    // Constants
    const powerSlope = (100 - 50) / (100 - 0);
    const intercept = 50;

    return (intercept + utilization * powerSlope) / 100;
  }

  calculateOpexEmissions(utilization: number, country: Country): OpexType {
    const normalizedPowerUsage = this.generateNormalizedPowerUsage(utilization);

    // Energy consumption calculations
    const cpuEnergyConsumption = (this.cpuTdp * normalizedPowerUsage) / 1000; // kW
    const dramEnergyConsumption =
      ((this.dramCapacity / 256) * constants.DRAM_WATTS_PER_256GB) / 1000; // kW
    const ssdEnergyConsumption =
      (this.ssdCapacity > 0 ? 3 : 0) / 1000; // kW
    const hddEnergyConsumption =
      (this.hddCapacity > 0 ? 7 : 0) / 1000; // kW

    const totalWatts =
      cpuEnergyConsumption +
      dramEnergyConsumption +
      ssdEnergyConsumption +
      hddEnergyConsumption;
    const totalWattsPerYear = 24 * 7 * 52 * totalWatts; // kWh
    const GCI = (GRID_INTENSITY[country] || 0) / 1000;

    return {
      CPU: cpuEnergyConsumption,
      RAM: dramEnergyConsumption,
      SSD: ssdEnergyConsumption,
      HDD: hddEnergyConsumption,
      TOTAL: totalWatts,
      opexPerYear: totalWattsPerYear * GCI
    }
}
}
