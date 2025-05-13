/**
 * Project Pricing Calculator
 * Handles calculations for specific project pricing based on tasks and adjustment factors
 */

class ProjectCalculator {
    constructor(businessModel) {
        this.businessModel = businessModel;
        
        // Project info
        this.clientName = "";
        
        // Project tasks
        this.tasks = [];
        
        // Uplift factors
        this.maxUplift = 20; // Default 20% max uplift
        this.upliftFactors = [];
        
        // Discount factors
        this.maxDiscount = 10; // Default 10% max discount
        this.discountFactors = [];
        
        // Calculated values
        this.baseProjectCost = 0;
        this.appliedUplift = 0;
        this.appliedDiscount = 0;
        this.finalProjectCost = 0;
        this.actualHourlyRate = 0;
        this.actualDayRate = 0;
        
        // Currency conversion
        this.baseCurrency = "NZD";
        this.currencies = {
            NZD: { 
                code: "NZD", 
                symbol: "$", 
                rate: 1.0,
                enabled: true,
                name: "New Zealand Dollar" 
            },
            USD: { 
                code: "USD", 
                symbol: "$", 
                rate: 0.62, 
                enabled: false,
                name: "US Dollar" 
            },
            AUD: { 
                code: "AUD", 
                symbol: "$", 
                rate: 0.94, 
                enabled: false,
                name: "Australian Dollar" 
            },
            GBP: { 
                code: "GBP", 
                symbol: "£", 
                rate: 0.48, 
                enabled: false,
                name: "British Pound" 
            },
            EUR: { 
                code: "EUR", 
                symbol: "€", 
                rate: 0.56, 
                enabled: false,
                name: "Euro"
            }
        };
    }
    
    /**
     * Set currency conversion rate
     * 
     * @param {string} currencyCode - Currency code (e.g., "USD")
     * @param {number} rate - Conversion rate from base currency (1 NZD = X USD)
     */
    setCurrencyRate(currencyCode, rate) {
        if (this.currencies[currencyCode]) {
            this.currencies[currencyCode].rate = rate;
        }
    }
    
    /**
     * Toggle currency display
     * 
     * @param {string} currencyCode - Currency code (e.g., "USD")
     * @param {boolean} enabled - Whether to display this currency
     */
    toggleCurrency(currencyCode, enabled) {
        if (this.currencies[currencyCode]) {
            this.currencies[currencyCode].enabled = enabled;
        }
    }
    
    /**
     * Convert amount from base currency to specified currency
     * 
     * @param {number} amount - Amount in base currency
     * @param {string} currencyCode - Target currency code
     * @returns {number} Amount in target currency
     */
    convertCurrency(amount, currencyCode) {
        if (this.currencies[currencyCode]) {
            return amount * this.currencies[currencyCode].rate;
        }
        return amount; // Default to original amount if currency not found
    }
    
    /**
     * Get enabled currencies
     * 
     * @returns {Array} Array of enabled currency objects
     */
    getEnabledCurrencies() {
        return Object.values(this.currencies).filter(currency => currency.enabled);
    }
    
    /**
     * Set client name
     * 
     * @param {string} name - Client name
     */
    setClientName(name) {
        this.clientName = name;
    }

    /**
     * Add a new task to the project
     * 
     * @param {Object} task - Task details
     * @param {string} task.id - Unique identifier
     * @param {string} task.name - Task name
     * @param {number} task.days - Estimated days required
     */
    addTask(task) {
        // Generate a unique ID if not provided
        if (!task.id) {
            task.id = this.generateId();
        }
        
        // Calculate task cost based on day rate
        task.cost = task.days * this.businessModel.requiredDayRate;
        
        this.tasks.push(task);
        this.calculate();
    }

    /**
     * Remove a task from the project
     * 
     * @param {string} taskId - ID of task to remove
     */
    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.calculate();
    }

    /**
     * Update max uplift percentage
     * 
     * @param {number} percentage - Max uplift percentage (0-100)
     */
    setMaxUplift(percentage) {
        this.maxUplift = Math.max(0, Math.min(100, percentage));
        this.calculate();
    }

    /**
     * Update max discount percentage
     * 
     * @param {number} percentage - Max discount percentage (0-100)
     */
    setMaxDiscount(percentage) {
        this.maxDiscount = Math.max(0, Math.min(100, percentage));
        this.calculate();
    }

    /**
     * Add a new uplift factor
     * 
     * @param {Object} factor - Uplift factor details
     * @param {string} factor.id - Unique identifier
     * @param {string} factor.name - Factor name
     * @param {number} factor.allocation - Percentage allocation (0-100)
     * @param {boolean} factor.selected - Whether factor is applied
     */
    addUpliftFactor(factor) {
        // Generate a unique ID if not provided
        if (!factor.id) {
            factor.id = this.generateId();
        }
        
        // Default to selected if not specified
        if (factor.selected === undefined) {
            factor.selected = true;
        }
        
        this.upliftFactors.push(factor);
        this.calculate();
    }

    /**
     * Remove an uplift factor
     * 
     * @param {string} factorId - ID of factor to remove
     */
    removeUpliftFactor(factorId) {
        this.upliftFactors = this.upliftFactors.filter(factor => factor.id !== factorId);
        this.calculate();
    }

    /**
     * Update an uplift factor's allocation
     * 
     * @param {string} factorId - ID of factor to update
     * @param {number} allocation - New allocation percentage
     */
    updateUpliftFactorAllocation(factorId, allocation) {
        const factor = this.upliftFactors.find(f => f.id === factorId);
        if (factor) {
            factor.allocation = allocation;
            this.calculate();
        }
    }

    /**
     * Toggle selection state of an uplift factor
     * 
     * @param {string} factorId - ID of factor to toggle
     * @param {boolean} selected - New selection state
     */
    toggleUpliftFactor(factorId, selected) {
        const factor = this.upliftFactors.find(f => f.id === factorId);
        if (factor) {
            factor.selected = selected;
            this.calculate();
        }
    }

    /**
     * Add a new discount factor
     * 
     * @param {Object} factor - Discount factor details
     * @param {string} factor.id - Unique identifier
     * @param {string} factor.name - Factor name
     * @param {number} factor.allocation - Percentage allocation (0-100)
     * @param {boolean} factor.selected - Whether factor is applied
     */
    addDiscountFactor(factor) {
        // Generate a unique ID if not provided
        if (!factor.id) {
            factor.id = this.generateId();
        }
        
        // Default to selected if not specified
        if (factor.selected === undefined) {
            factor.selected = true;
        }
        
        this.discountFactors.push(factor);
        this.calculate();
    }

    /**
     * Remove a discount factor
     * 
     * @param {string} factorId - ID of factor to remove
     */
    removeDiscountFactor(factorId) {
        this.discountFactors = this.discountFactors.filter(factor => factor.id !== factorId);
        this.calculate();
    }

    /**
     * Update a discount factor's allocation
     * 
     * @param {string} factorId - ID of factor to update
     * @param {number} allocation - New allocation percentage
     */
    updateDiscountFactorAllocation(factorId, allocation) {
        const factor = this.discountFactors.find(f => f.id === factorId);
        if (factor) {
            factor.allocation = allocation;
            this.calculate();
        }
    }

    /**
     * Toggle selection state of a discount factor
     * 
     * @param {string} factorId - ID of factor to toggle
     * @param {boolean} selected - New selection state
     */
    toggleDiscountFactor(factorId, selected) {
        const factor = this.discountFactors.find(f => f.id === factorId);
        if (factor) {
            factor.selected = selected;
            this.calculate();
        }
    }

    /**
     * Perform all project calculations
     */
    calculate() {
        // Calculate base project cost
        this.baseProjectCost = this.calculateBaseProjectCost();
        
        // Calculate applied uplift percentage and amount
        this.appliedUplift = this.calculateAppliedUplift();
        
        // Calculate applied discount percentage and amount
        this.appliedDiscount = this.calculateAppliedDiscount();
        
        // Calculate final project cost
        this.finalProjectCost = this.calculateFinalProjectCost();
        
        // Calculate actual rates
        this.calculateActualRates();
    }

    /**
     * Calculate base project cost (before adjustments)
     * 
     * @returns {number} Base project cost
     */
    calculateBaseProjectCost() {
        return this.tasks.reduce((total, task) => total + task.cost, 0);
    }

    /**
     * Calculate total applied uplift percentage
     * 
     * @returns {number} Applied uplift percentage
     */
    calculateAppliedUplift() {
        const selectedFactors = this.upliftFactors.filter(factor => factor.selected);
        
        // If no factors selected, return 0
        if (selectedFactors.length === 0) {
            return 0;
        }
        
        // Sum the contributions of selected factors
        return selectedFactors.reduce((total, factor) => {
            // Each factor contributes its allocation percentage of the max uplift
            return total + (factor.allocation / 100 * this.maxUplift);
        }, 0);
    }

    /**
     * Calculate total applied discount percentage
     * 
     * @returns {number} Applied discount percentage
     */
    calculateAppliedDiscount() {
        const selectedFactors = this.discountFactors.filter(factor => factor.selected);
        
        // If no factors selected, return 0
        if (selectedFactors.length === 0) {
            return 0;
        }
        
        // Sum the contributions of selected factors
        return selectedFactors.reduce((total, factor) => {
            // Each factor contributes its allocation percentage of the max discount
            return total + (factor.allocation / 100 * this.maxDiscount);
        }, 0);
    }

    /**
     * Calculate final project cost with adjustments applied
     * 
     * @returns {number} Final project cost
     */
    calculateFinalProjectCost() {
        // Apply uplift
        const upliftAmount = this.baseProjectCost * (this.appliedUplift / 100);
        
        // Apply discount
        const discountAmount = this.baseProjectCost * (this.appliedDiscount / 100);
        
        // Calculate final cost
        return this.baseProjectCost + upliftAmount - discountAmount;
    }

    /**
     * Calculate actual hourly and day rates based on final cost
     */
    calculateActualRates() {
        const totalDays = this.tasks.reduce((total, task) => total + task.days, 0);
        
        // If no tasks, rates are 0
        if (totalDays === 0) {
            this.actualDayRate = 0;
            this.actualHourlyRate = 0;
            return;
        }
        
        // Calculate actual day rate
        this.actualDayRate = this.finalProjectCost / totalDays;
        
        // Calculate actual hourly rate (assuming 8-hour day)
        this.actualHourlyRate = this.actualDayRate / 8;
    }

    /**
     * Check if uplift factor allocations sum to 100%
     * 
     * @returns {Object} Validation result
     */
    validateUpliftAllocations() {
        const totalAllocation = this.upliftFactors.reduce((sum, factor) => sum + factor.allocation, 0);
        
        return {
            valid: Math.abs(totalAllocation - 100) < 0.01, // Allow small floating point differences
            total: totalAllocation,
            remaining: 100 - totalAllocation
        };
    }

    /**
     * Check if discount factor allocations sum to 100%
     * 
     * @returns {Object} Validation result
     */
    validateDiscountAllocations() {
        const totalAllocation = this.discountFactors.reduce((sum, factor) => sum + factor.allocation, 0);
        
        return {
            valid: Math.abs(totalAllocation - 100) < 0.01, // Allow small floating point differences
            total: totalAllocation,
            remaining: 100 - totalAllocation
        };
    }

    /**
     * Get project rate comparison details
     * 
     * @returns {Object} Rate comparison
     */
    getRateComparison() {
        const requiredDayRate = this.businessModel.requiredDayRate;
        const actualDayRate = this.actualDayRate;
        
        // Calculate difference as percentage
        let diffPercentage = 0;
        if (requiredDayRate > 0) {
            diffPercentage = ((actualDayRate - requiredDayRate) / requiredDayRate) * 100;
        }
        
        return {
            requiredDayRate,
            actualDayRate,
            diffPercentage,
            isSufficient: actualDayRate >= requiredDayRate
        };
    }

    /**
     * Get a summary of all project calculations
     * 
     * @returns {Object} Project summary
     */
    getSummary() {
        const upliftAmount = this.baseProjectCost * (this.appliedUplift / 100);
        const discountAmount = this.baseProjectCost * (this.appliedDiscount / 100);
        
        return {
            clientName: this.clientName,
            tasks: this.tasks,
            totalDays: this.tasks.reduce((total, task) => total + task.days, 0),
            
            maxUplift: this.maxUplift,
            upliftFactors: this.upliftFactors,
            upliftValidation: this.validateUpliftAllocations(),
            
            maxDiscount: this.maxDiscount,
            discountFactors: this.discountFactors,
            discountValidation: this.validateDiscountAllocations(),
            
            baseProjectCost: this.baseProjectCost,
            appliedUplift: this.appliedUplift,
            upliftAmount,
            appliedDiscount: this.appliedDiscount,
            discountAmount,
            finalProjectCost: this.finalProjectCost,
            
            actualDayRate: this.actualDayRate,
            actualHourlyRate: this.actualHourlyRate,
            rateComparison: this.getRateComparison()
        };
    }
    
    /**
     * Export project data as JSON
     * 
     * @returns {string} JSON string of project data
     */
    exportProjectData() {
        // Create data object with project info and business model parameters
        const exportData = {
            version: "1.1", // Increment version for currency support
            timestamp: new Date().toISOString(),
            businessModel: {
                salaryBudget: this.businessModel.salaryBudget,
                growthBudget: this.businessModel.growthBudget,
                workingWeeks: this.businessModel.workingWeeks,
                teamMembers: this.businessModel.teamMembers,
                hoursPerWeek: this.businessModel.hoursPerWeek,
            },
            project: {
                clientName: this.clientName,
                tasks: this.tasks,
                maxUplift: this.maxUplift,
                upliftFactors: this.upliftFactors,
                maxDiscount: this.maxDiscount,
                discountFactors: this.discountFactors,
            },
            currencies: {
                baseCurrency: this.baseCurrency,
                rates: Object.fromEntries(
                    Object.entries(this.currencies).map(([code, currency]) => 
                        [code, { 
                            rate: currency.rate, 
                            enabled: currency.enabled 
                        }]
                    )
                )
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * Import project data from JSON
     * 
     * @param {string} jsonData - JSON string of project data
     * @returns {boolean} Success indicator
     */
    importProjectData(jsonData) {
        try {
            // Parse JSON data
            const importData = JSON.parse(jsonData);
            
            // Check version compatibility
            if (!importData.version) {
                console.error("Import error: Invalid data format");
                return false;
            }
            
            // Update business model
            if (importData.businessModel) {
                this.businessModel.update({
                    salaryBudget: importData.businessModel.salaryBudget,
                    growthBudget: importData.businessModel.growthBudget,
                    workingWeeks: importData.businessModel.workingWeeks,
                    teamMembers: importData.businessModel.teamMembers,
                    hoursPerWeek: importData.businessModel.hoursPerWeek,
                });
            }
            
            // Update project data
            if (importData.project) {
                // Set client name
                this.clientName = importData.project.clientName || "";
                
                // Clear existing tasks and add imported ones
                this.tasks = [];
                if (importData.project.tasks) {
                    importData.project.tasks.forEach(task => {
                        this.tasks.push({
                            id: task.id || this.generateId(),
                            name: task.name,
                            days: task.days,
                            cost: task.days * this.businessModel.requiredDayRate
                        });
                    });
                }
                
                // Set uplift/discount max percentages
                this.maxUplift = importData.project.maxUplift || 20;
                this.maxDiscount = importData.project.maxDiscount || 10;
                
                // Clear existing factors and add imported ones
                this.upliftFactors = [];
                if (importData.project.upliftFactors) {
                    importData.project.upliftFactors.forEach(factor => {
                        this.upliftFactors.push({
                            id: factor.id || this.generateId(),
                            name: factor.name,
                            allocation: factor.allocation,
                            selected: factor.selected
                        });
                    });
                }
                
                this.discountFactors = [];
                if (importData.project.discountFactors) {
                    importData.project.discountFactors.forEach(factor => {
                        this.discountFactors.push({
                            id: factor.id || this.generateId(),
                            name: factor.name,
                            allocation: factor.allocation,
                            selected: factor.selected
                        });
                    });
                }
            }
            
            // Import currency settings (if available in v1.1+)
            if (importData.currencies) {
                if (importData.currencies.baseCurrency) {
                    this.baseCurrency = importData.currencies.baseCurrency;
                }
                
                if (importData.currencies.rates) {
                    Object.entries(importData.currencies.rates).forEach(([code, currencyData]) => {
                        if (this.currencies[code]) {
                            // Only update rate and enabled status, preserve other properties
                            if (typeof currencyData.rate === 'number') {
                                this.currencies[code].rate = currencyData.rate;
                            }
                            if (typeof currencyData.enabled === 'boolean') {
                                this.currencies[code].enabled = currencyData.enabled;
                            }
                        }
                    });
                }
            }
            
            // Recalculate everything
            this.calculate();
            
            return true;
        } catch (error) {
            console.error("Import error:", error);
            return false;
        }
    }

    /**
     * Generate a unique identifier
     * 
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}

// Create global instance of the project calculator
const projectCalculator = new ProjectCalculator(businessModel);