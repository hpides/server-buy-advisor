import numpy as np

from lifecycle_anslysis.constants import OPEX_PER_YEAR, DRAM_WATTS_PER_256GB, GCI_CONSTANTS


class System:

    def __init__(self, die_size: float, performance_indicator: float, lifetime: int, dram_capacity: int,
                 ssd_capacity: int, hdd_capacity: int, cpu_tdp: int) -> None:
        """
        :param die_size: in cm^2
        :param performance_indicator:
        :param lifetime: in years
        :param dram_capacity: in GB
        :param ssd_capacity: in GB
        :param hdd_capacity: in GB
        :param cpu_tdp: in Watt
        """
        self.packaging_size = die_size
        self.specint = performance_indicator
        self.lifetime = lifetime
        self.dram_capacity = dram_capacity
        self.ssd_capacity = ssd_capacity
        self.hdd_capacity = hdd_capacity
        self.cpu_tdp = cpu_tdp

    def calculate_capex_emissions(self):
        ####### Source of the constants: https://ugupta.com/files/Gupta_ISCA2022_ACT.pdf

        MPA = 0.5  ### Procure materials | kg co2 per cm2
        EPA = 2.15  ### 0.8-3.5 | Fab Energy | kWh per cm2
        CI_fab = 0.365  ### 30-700  | g co2 per kWh  --> converted to kg co2 per kWh
        GPA = 0.3  ### 0.1-0.5 | Kg CO2 per cm2
        _yield = 0.875  ### 0-1  | Fab yield
        E_DRAM = 0.3  ### 0 - 0.6 | Kg CO2/GB
        E_SDD = 0.015  ### 0 - 0.03 | Kg CO2/GB
        E_HDD = 0.06  ### 0 - 0.12 | Kg CO2/GB

        # Note assume package size == die size
        capex_cpu = ((CI_fab * EPA + GPA + MPA) * self.packaging_size) / _yield  #### Kg Co2
        capex_dram = self.dram_capacity * E_DRAM  #### Kg Co2
        capex_ssd = self.ssd_capacity * E_SDD  #### Kg Co2
        capex_hdd = self.hdd_capacity * E_HDD  #### Kg Co2

        capex_total = capex_cpu + capex_dram + capex_ssd + capex_hdd  #### Kg Co2

        return capex_total

    def generate_accumm_projected_opex_emissions(self, time_horizon: int, system_id: str, country: str,
                                                 utilization: float, lookup: bool):
        if lookup:
            opex_per_year = OPEX_PER_YEAR[country][utilization][system_id]
        else:
            opex_per_year = self.calculate_opex_emissions(utilization, country)
        projected_emissions = [i * opex_per_year for i in range(1, time_horizon + 1)]

        return np.array(projected_emissions)

    def calculate_opex_emissions(self, utilization: float, country: str):
        ######## Source of GCI: https://app.electricitymaps.com/zone/DE --> 2023 average for DE

        cpu_energy_consumption = (self.cpu_tdp * (utilization / 100)) / 1000  #### kW
        dram_energy_consumption = ((self.dram_capacity / 256) * DRAM_WATTS_PER_256GB) / 1000  #### kW

        # Watts according to https://www.ssstc.com/knowledge-detail/ssd-vs-hdd-power-efficiency/#:~:text=On%20average%2C%20SSDs%20consume%20around,may%20consume%203%2D4%20watts.
        ssd_energy_consumption = (3 if (self.ssd_capacity > 0) else 0) / 1000  ###kW
        hdd_energy_consumption = (7 if (self.hdd_capacity > 0) else 0) / 1000  ###kW

        total_watts = cpu_energy_consumption + dram_energy_consumption + ssd_energy_consumption + hdd_energy_consumption
        total_watts_per_year = 24 * 7 * 52 * total_watts  ### kWh
        GCI = GCI_CONSTANTS[country]

        OPEX = total_watts_per_year * GCI  ###### Kg co2 per year

        return OPEX
