/**
 * Project Pricing Calculator
 * Handles calculations for specific project pricing based on tasks and adjustment factors
 */

class ProjectCalculator {
    constructor(businessModel) {
        this.businessModel = businessModel;
        
        // Project info
        this.clientName = "";
        this.preparerName = "";
        
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
     * Set preparer name
     * 
     * @param {string} name - Name of the person preparing the quote
     */
    setPreparerName(name) {
        this.preparerName = name;
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
        
        // Calculate task cost based on uplifted day rate if available, otherwise use required day rate
        const dayRate = this.businessModel.upliftedDayRate > 0 ? 
            this.businessModel.upliftedDayRate : this.businessModel.requiredDayRate;
        task.cost = task.days * dayRate;
        
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
        // Calculate applied uplift percentage
        this.appliedUplift = this.calculateAppliedUplift();
        
        // Apply uplift to business model day rate
        this.businessModel.applyUplift(this.appliedUplift);
        
        // Update task costs to use uplifted day rate
        this.updateTaskCosts();
        
        // Calculate base project cost (now includes uplift in the day rate)
        this.baseProjectCost = this.calculateBaseProjectCost();
        
        // Calculate applied discount percentage 
        this.appliedDiscount = this.calculateAppliedDiscount();
        
        // Calculate final project cost
        this.finalProjectCost = this.calculateFinalProjectCost();
        
        // Calculate actual rates
        this.calculateActualRates();
    }

    /**
     * Update all task costs based on the current uplifted day rate
     */
    updateTaskCosts() {
        const dayRate = this.businessModel.upliftedDayRate;
        
        this.tasks.forEach(task => {
            task.cost = task.days * dayRate;
        });
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
        // Discount is applied to the base cost (which already includes the uplift in the day rate)
        const discountAmount = this.baseProjectCost * (this.appliedDiscount / 100);
        
        // Calculate final cost (base cost minus discount)
        return this.baseProjectCost - discountAmount;
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
        // Calculate what the costs would be without the uplift (for display purposes only)
        const nonUpliftedCost = this.tasks.reduce((total, task) => 
            total + (task.days * this.businessModel.requiredDayRate), 0);
        
        // Calculate effective uplift amount and percentage based on the difference
        const effectiveUpliftAmount = this.baseProjectCost - nonUpliftedCost;
        const effectiveUpliftPercentage = nonUpliftedCost > 0 ? 
            (effectiveUpliftAmount / nonUpliftedCost) * 100 : 0;
        
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
            effectiveUpliftPercentage,
            effectiveUpliftAmount,
            appliedDiscount: this.appliedDiscount,
            discountAmount,
            finalProjectCost: this.finalProjectCost,
            
            // Day rates
            upliftedDayRate: this.businessModel.upliftedDayRate,
            requiredDayRate: this.businessModel.requiredDayRate,
            actualDayRate: this.actualDayRate,
            actualHourlyRate: this.actualHourlyRate,
            rateComparison: this.getRateComparison()
        };
    }
    
    /**
     * Prepare client quote data that hides internal factors
     * 
     * @returns {Object} Client-friendly quote data
     */
    prepareClientQuote() {
        // We only show the client the uplifted day rate (without mentioning the uplift)
        const clientDayRate = this.businessModel.upliftedDayRate;
        
        // Calculate the discounted project cost 
        const finalCost = this.finalProjectCost;
        
        // Prepare client-facing task list with costs based on uplifted day rate
        const clientTasks = this.tasks.map(task => ({
            name: task.name,
            days: task.days,
            cost: task.cost, // This cost already includes the uplift in the day rate
            dayRate: clientDayRate
        }));
        
        // Calculate the project metrics
        const totalDays = clientTasks.reduce((total, task) => total + task.days, 0);
        const baseProjectCost = this.baseProjectCost; // This already includes the uplifted day rate
        
        // Return a client-friendly quote object
        return {
            clientName: this.clientName,
            preparerName: this.preparerName,
            prepared: new Date().toISOString(),
            dayRate: clientDayRate,
            tasks: clientTasks,
            totalDays,
            baseProjectCost,
            discountPercentage: this.appliedDiscount,
            discountAmount: baseProjectCost * (this.appliedDiscount / 100),
            finalCost,
            currencies: Object.entries(this.currencies)
                .filter(([_, currency]) => currency.enabled)
                .map(([code, currency]) => ({
                    code,
                    symbol: currency.symbol,
                    name: currency.name,
                    rate: currency.rate,
                    baseCost: this.convertCurrency(baseProjectCost, code),
                    finalCost: this.convertCurrency(finalCost, code)
                }))
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
            version: "1.3", // Increment version for uplifted day rate support
            timestamp: new Date().toISOString(),
            businessModel: {
                salaryBudget: this.businessModel.salaryBudget,
                growthBudget: this.businessModel.growthBudget,
                workingWeeks: this.businessModel.workingWeeks,
                teamMembers: this.businessModel.teamMembers,
                hoursPerWeek: this.businessModel.hoursPerWeek,
                rounding: this.businessModel.rounding || 'none',
                upliftedDayRate: this.businessModel.upliftedDayRate,
            },
            project: {
                clientName: this.clientName,
                preparerName: this.preparerName,
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
                    rounding: importData.businessModel.rounding || 'none',
                });
            }
            
            // Update project data
            if (importData.project) {
                // Set client and preparer names
                this.clientName = importData.project.clientName || "";
                this.preparerName = importData.project.preparerName || "";
                
                // Clear existing tasks and add imported ones
                this.tasks = [];
                if (importData.project.tasks) {
                    importData.project.tasks.forEach(task => {
                        // When importing, we'll initially use the required day rate
                        // The uplifted day rate will be recalculated when we call calculate() below
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