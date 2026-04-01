import numpy as np
from scipy.optimize import curve_fit

from lifecycle_anslysis.constants import NEW_SYSTEM, OLD_SYSTEM
from lifecycle_anslysis.system import System

# Define an exponential decay function for fitting
def exponential_decay(x, A, k):
    return A * np.exp(-k * x)

def generate_systems_comparison(new_system: System, old_system: System, time_horizon: int, country: str,
                                utilization: int, opex_calculation: str):
    new_system_opex = new_system.generate_accumm_projected_opex_emissions(
        time_horizon, system_id=NEW_SYSTEM, country=country, utilization=utilization, opex_calculation=opex_calculation)
    new_system_capex = new_system.calculate_capex_emissions()
    old_system_opex = old_system.generate_accumm_projected_opex_emissions(
        time_horizon, system_id=OLD_SYSTEM, country=country, utilization=utilization, opex_calculation=opex_calculation)

    performance_factor = old_system.performance_indicator / new_system.performance_indicator  ##### --> Assumption: Better performance leads to lower utilization, hence less power draw.

    new_system_opex = new_system_opex * performance_factor

    # new_system_opex[0] = new_system_opex[0] + new_system_capex  ###### --> Add the CAPEX at time 0
    new_system_opex = np.array([opex + new_system_capex for opex in new_system_opex])

    abs_savings = new_system_opex - old_system_opex
    relative_savings = 1 - (old_system_opex / new_system_opex)
    ratio = new_system_opex / old_system_opex

    if not np.any(ratio < 1):
        stop = False
        # x_target = ratio.shape[0]
        ###### Estimate when we will hit the break-even point with an exponential decay model

        # Create an x array as the index of y
        x = np.arange(ratio.shape[0])

        # Fit the curve to get optimal A and k values
        params, covariance = curve_fit(exponential_decay, x, ratio, p0=(ratio[0], 0.1))

        # Extract parameters
        A_fit, k_fit = params

        # Calculate the x-value where y is approximately 1 --> Break-even
        target_y = 1
        x_target = int(np.ceil(-np.log(target_y / A_fit) / k_fit))
        if x_target == ratio.shape[0]:
            x_target += 1
        while not stop:
        
            new_system_opex = new_system.generate_accumm_projected_opex_emissions(
                x_target, system_id=NEW_SYSTEM, country=country, utilization=utilization, opex_calculation=opex_calculation)
            new_system_capex = new_system.calculate_capex_emissions()
            old_system_opex = old_system.generate_accumm_projected_opex_emissions(
                x_target, system_id=OLD_SYSTEM, country=country, utilization=utilization, opex_calculation=opex_calculation)

            performance_factor = old_system.performance_indicator / new_system.performance_indicator  ##### --> Assumption: Better performance leads to lower utilization, hence less power draw.

            new_system_opex = new_system_opex * performance_factor

            # new_system_opex[0] = new_system_opex[0] + new_system_capex  ###### --> Add the CAPEX at time 0
            new_system_opex = np.array([opex + new_system_capex for opex in new_system_opex])

            abs_savings = new_system_opex - old_system_opex
            relative_savings = 1 - (old_system_opex / new_system_opex)
            ratio = new_system_opex / old_system_opex

            x_target += 1

            if np.any(np.round(ratio, 1) <= 1):
                stop = True

    return new_system_opex, old_system_opex, abs_savings, relative_savings, ratio
