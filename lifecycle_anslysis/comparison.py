import numpy as np

from lifecycle_anslysis.constants import NEW_SYSTEM, OLD_SYSTEM, SPECINT, SORTING
from lifecycle_anslysis.system import System


def generate_systems_comparison(new_system: System, old_system: System, time_horizon: int, country: str,
                                utilization: int, performance_measure: str):
    if performance_measure == SPECINT:
        lookup = True
    elif performance_measure == SORTING:
        lookup = False
    else:
        raise NotImplementedError

    new_system_opex = new_system.generate_accumm_projected_opex_emissions(
        time_horizon, system_id=NEW_SYSTEM, country=country, utilization=utilization, lookup=lookup)
    new_system_capex = new_system.calculate_capex_emissions()
    old_system_opex = old_system.generate_accumm_projected_opex_emissions(
        time_horizon, system_id=OLD_SYSTEM, country=country, utilization=utilization, lookup=lookup)

    performance_factor = old_system.performance_indicator / new_system.performance_indicator  ##### --> Assumption: Better performance leads to lower utilization, hence less power draw.

    new_system_opex = new_system_opex * performance_factor

    # new_system_opex[0] = new_system_opex[0] + new_system_capex  ###### --> Add the CAPEX at time 0
    new_system_opex = np.array([opex + new_system_capex for opex in new_system_opex])

    abs_savings = new_system_opex - old_system_opex
    relative_savings = 1 - (old_system_opex / new_system_opex)
    ratio = new_system_opex / old_system_opex

    return new_system_opex, old_system_opex, abs_savings, relative_savings, ratio
