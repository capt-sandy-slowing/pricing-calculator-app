/**
 * Business Model Calculator
 * Handles calculations for determining required rates based on financial targets
 */

class BusinessModel {
    constructor() {
        // Default values
        this.salaryBudget = 0;
        this.growthBudget = 0;
        this.workingWeeks = 48;
        this.teamMembers = 1;
        this.hoursPerWeek = 35;
        this.rounding = 'none';
        
        // Calculated fields
        this.totalHours = 0;
        this.requiredHourlyRate = 0;
        this.requiredDayRate = 0;
        
        // Store raw values before rounding
        this._rawHourlyRate = 0;
        this._rawDayRate = 0;
    }

    /**
     * Update model parameters and recalculate rates
     * 
     * @param {Object} params - Business model parameters
     * @param {number} params.salaryBudget - Annual salary budget
     * @param {number} params.growthBudget - Annual growth budget
     * @param {number} params.workingWeeks - Working weeks per year
     * @param {number} params.teamMembers - Team members count
     * @param {number} params.hoursPerWeek - Hours per week
     */
    update(params) {
        // Update properties with provided values or keep current values
        this.salaryBudget = params.salaryBudget ?? this.salaryBudget;
        this.growthBudget = params.growthBudget ?? this.growthBudget;
        this.workingWeeks = params.workingWeeks ?? this.workingWeeks;
        this.teamMembers = params.teamMembers ?? this.teamMembers;
        this.hoursPerWeek = params.hoursPerWeek ?? this.hoursPerWeek;
        this.rounding = params.rounding ?? this.rounding;
        
        // Recalculate derived values
        this.calculate();
    }

    /**
     * Perform all model calculations
     */
    calculate() {
        // Calculate total available hours per year
        this.totalHours = this.calculateTotalHours();
        
        // Store the raw (unrounded) rates
        this._rawHourlyRate = this.calculateRequiredHourlyRate();
        this._rawDayRate = this.calculateRequiredDayRate();
        
        // Apply rounding if needed
        this.applyRounding();
    }

    /**
     * Calculate total available hours across the team per year
     * 
     * @returns {number} Total hours
     */
    calculateTotalHours() {
        return this.teamMembers * this.hoursPerWeek * this.workingWeeks;
    }

    /**
     * Calculate required hourly rate to meet financial targets
     * 
     * @returns {number} Required hourly rate
     */
    calculateRequiredHourlyRate() {
        if (this.totalHours === 0) {
            return 0;
        }
        return (this.salaryBudget + this.growthBudget) / this.totalHours;
    }

    /**
     * Calculate required day rate based on hourly rate
     * Assumes 8-hour workday
     * 
     * @returns {number} Required day rate
     */
    calculateRequiredDayRate() {
        return this.requiredHourlyRate * 8;
    }

    /**
     * Set the rounding option and update rates
     * 
     * @param {string} rounding - Rounding option: 'none', '5', '10', etc.
     */
    setRounding(rounding) {
        this.rounding = rounding;
        this.applyRounding();
    }
    
    /**
     * Apply rounding to rates based on the rounding setting
     */
    applyRounding() {
        if (this.rounding === 'none') {
            // Use raw values without rounding
            this.requiredHourlyRate = this._rawHourlyRate;
            this.requiredDayRate = this._rawDayRate;
        } else {
            // Round to the nearest increment
            const increment = parseInt(this.rounding);
            this.requiredHourlyRate = this.roundToNearest(this._rawHourlyRate, increment);
            this.requiredDayRate = this.roundToNearest(this._rawDayRate, increment);
        }
    }
    
    /**
     * Round a value to the nearest increment
     * 
     * @param {number} value - Value to round
     * @param {number} increment - Increment to round to
     * @returns {number} Rounded value
     */
    roundToNearest(value, increment) {
        return Math.ceil(value / increment) * increment;
    }
    
    /**
     * Get a summary of all model parameters and calculated values
     * 
     * @returns {Object} Model summary
     */
    getSummary() {
        return {
            salaryBudget: this.salaryBudget,
            growthBudget: this.growthBudget,
            workingWeeks: this.workingWeeks,
            teamMembers: this.teamMembers,
            hoursPerWeek: this.hoursPerWeek,
            rounding: this.rounding,
            totalHours: this.totalHours,
            requiredHourlyRate: this.requiredHourlyRate,
            requiredDayRate: this.requiredDayRate
        };
    }
}

// Create global instance of the business model
const businessModel = new BusinessModel();