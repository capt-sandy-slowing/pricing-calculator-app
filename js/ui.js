/**
 * UI Controller
 * Handles user interactions and UI updates for the pricing calculator
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the calculator
    initializeCalculator();
});

/**
 * Initialize the calculator UI and event listeners
 */
function initializeCalculator() {
    // Initialize business model inputs
    initializeBusinessModelInputs();
    
    // Initialize project info
    initializeProjectInfo();
    
    // Initialize project task management
    initializeTaskManagement();
    
    // Initialize factor management
    initializeFactorManagement();
    
    // Initialize currency settings
    initializeCurrencySettings();
    
    // Initialize export/import functionality
    initializeExportImport();
    
    // Calculate initial values
    updateAllCalculations();
}

/**
 * Set up business model input fields and event listeners
 */
function initializeBusinessModelInputs() {
    // Get references to all business model input elements
    const salaryBudgetInput = document.getElementById('salary-budget');
    const growthBudgetInput = document.getElementById('growth-budget');
    const workingWeeksInput = document.getElementById('working-weeks');
    const teamMembersInput = document.getElementById('team-members');
    const hoursPerWeekInput = document.getElementById('hours-per-week');
    const rateRoundingSelect = document.getElementById('rate-rounding');
    
    // Add event listeners to update model on input change
    [workingWeeksInput, teamMembersInput, hoursPerWeekInput].forEach(input => {
        input.addEventListener('input', updateBusinessModel);
    });
    
    // Format financial inputs with commas
    [salaryBudgetInput, growthBudgetInput].forEach(input => {
        // Remove type="number" to allow for formatted input
        input.type = "text";
        
        // Initial formatting if value exists
        if (input.value) {
            input.value = formatNumberInput(parseFloat(input.value));
        }
        
        // Add input event listener for formatting and updating
        input.addEventListener('input', (e) => {
            // Store cursor position
            const cursorPos = e.target.selectionStart;
            const originalLength = e.target.value.length;
            
            // Strip non-numeric characters for calculation
            const numericValue = e.target.value.replace(/[^0-9]/g, '');
            
            // Format for display
            if (numericValue.length > 0) {
                const formattedValue = formatNumberInput(parseInt(numericValue, 10));
                e.target.value = formattedValue;
                
                // Adjust cursor position based on change in length
                const newLength = e.target.value.length;
                const newPosition = cursorPos + (newLength - originalLength);
                e.target.setSelectionRange(newPosition, newPosition);
            }
            
            // Update the business model
            updateBusinessModel();
        });
    });
    
    // Add event listener for rounding dropdown
    rateRoundingSelect.addEventListener('change', () => {
        businessModel.setRounding(rateRoundingSelect.value);
        updateAllCalculations();
    });
    
    // Set initial values
    if (businessModel.salaryBudget > 0) {
        salaryBudgetInput.value = formatNumberInput(businessModel.salaryBudget);
    } else {
        salaryBudgetInput.value = '';
    }
    
    if (businessModel.growthBudget > 0) {
        growthBudgetInput.value = formatNumberInput(businessModel.growthBudget);
    } else {
        growthBudgetInput.value = '';
    }
    
    workingWeeksInput.value = businessModel.workingWeeks;
    teamMembersInput.value = businessModel.teamMembers;
    hoursPerWeekInput.value = businessModel.hoursPerWeek;
    rateRoundingSelect.value = businessModel.rounding || 'none';
}

/**
 * Set up project task management
 */
function initializeTaskManagement() {
    // Get references to task input elements
    const taskNameInput = document.getElementById('task-name');
    const taskDaysInput = document.getElementById('task-days');
    const addTaskButton = document.getElementById('add-task');
    
    // Add event listener for adding tasks
    addTaskButton.addEventListener('click', () => {
        const taskName = taskNameInput.value.trim();
        const taskDays = parseFloat(taskDaysInput.value);
        
        // Validate inputs
        if (!taskName) {
            alert('Please enter a task name');
            return;
        }
        
        if (isNaN(taskDays) || taskDays <= 0) {
            alert('Please enter a valid number of days');
            return;
        }
        
        // Add task to project
        projectCalculator.addTask({
            name: taskName,
            days: taskDays
        });
        
        // Clear inputs
        taskNameInput.value = '';
        taskDaysInput.value = '1';
        
        // Update task list
        renderTaskList();
        
        // Update calculations
        updateAllCalculations();
    });
    
    // Initial render of task list
    renderTaskList();
}

/**
 * Set up uplift and discount factor management
 */
function initializeFactorManagement() {
    // Max uplift/discount inputs
    const maxUpliftInput = document.getElementById('max-uplift');
    const maxDiscountInput = document.getElementById('max-discount');
    
    // Uplift factor inputs
    const upliftFactorNameInput = document.getElementById('uplift-factor-name');
    const upliftFactorAllocationInput = document.getElementById('uplift-factor-allocation');
    const addUpliftFactorButton = document.getElementById('add-uplift-factor');
    
    // Discount factor inputs
    const discountFactorNameInput = document.getElementById('discount-factor-name');
    const discountFactorAllocationInput = document.getElementById('discount-factor-allocation');
    const addDiscountFactorButton = document.getElementById('add-discount-factor');
    
    // Set initial values
    maxUpliftInput.value = projectCalculator.maxUplift;
    maxDiscountInput.value = projectCalculator.maxDiscount;
    
    // Add event listeners for max values
    maxUpliftInput.addEventListener('input', () => {
        const value = parseFloat(maxUpliftInput.value);
        if (!isNaN(value) && value >= 0) {
            projectCalculator.setMaxUplift(value);
            updateAllCalculations();
        }
    });
    
    maxDiscountInput.addEventListener('input', () => {
        const value = parseFloat(maxDiscountInput.value);
        if (!isNaN(value) && value >= 0) {
            projectCalculator.setMaxDiscount(value);
            updateAllCalculations();
        }
    });
    
    // Add event listener for adding uplift factors
    addUpliftFactorButton.addEventListener('click', () => {
        const factorName = upliftFactorNameInput.value.trim();
        const factorAllocation = parseFloat(upliftFactorAllocationInput.value);
        
        // Validate inputs
        if (!factorName) {
            alert('Please enter a factor name');
            return;
        }
        
        if (isNaN(factorAllocation) || factorAllocation <= 0) {
            alert('Please enter a valid allocation percentage');
            return;
        }
        
        // Add uplift factor
        projectCalculator.addUpliftFactor({
            name: factorName,
            allocation: factorAllocation,
            selected: true
        });
        
        // Clear inputs
        upliftFactorNameInput.value = '';
        upliftFactorAllocationInput.value = '25';
        
        // Update UI
        renderUpliftFactors();
        updateAllCalculations();
    });
    
    // Add event listener for adding discount factors
    addDiscountFactorButton.addEventListener('click', () => {
        const factorName = discountFactorNameInput.value.trim();
        const factorAllocation = parseFloat(discountFactorAllocationInput.value);
        
        // Validate inputs
        if (!factorName) {
            alert('Please enter a factor name');
            return;
        }
        
        if (isNaN(factorAllocation) || factorAllocation <= 0) {
            alert('Please enter a valid allocation percentage');
            return;
        }
        
        // Add discount factor
        projectCalculator.addDiscountFactor({
            name: factorName,
            allocation: factorAllocation,
            selected: true
        });
        
        // Clear inputs
        discountFactorNameInput.value = '';
        discountFactorAllocationInput.value = '25';
        
        // Update UI
        renderDiscountFactors();
        updateAllCalculations();
    });
    
    // Initial render of factors
    renderUpliftFactors();
    renderDiscountFactors();
}

/**
 * Update business model based on input values
 */
function updateBusinessModel() {
    // Get input values, removing non-numeric characters from formatted inputs
    const salaryBudgetStr = document.getElementById('salary-budget').value.replace(/[^0-9.-]/g, '');
    const growthBudgetStr = document.getElementById('growth-budget').value.replace(/[^0-9.-]/g, '');
    
    const salaryBudget = parseFloat(salaryBudgetStr) || 0;
    const growthBudget = parseFloat(growthBudgetStr) || 0;
    const workingWeeks = parseFloat(document.getElementById('working-weeks').value) || 0;
    const teamMembers = parseFloat(document.getElementById('team-members').value) || 0;
    const hoursPerWeek = parseFloat(document.getElementById('hours-per-week').value) || 0;
    const rounding = document.getElementById('rate-rounding').value;
    
    // Update business model
    businessModel.update({
        salaryBudget,
        growthBudget,
        workingWeeks,
        teamMembers,
        hoursPerWeek,
        rounding
    });
    
    // Update UI
    updateBusinessModelDisplay();
    
    // Recalculate everything since day rate has changed
    projectCalculator.calculate();
    updateProjectDisplay();
}

/**
 * Update business model display with calculated values
 */
function updateBusinessModelDisplay() {
    // Update displayed values
    document.getElementById('total-hours').textContent = formatNumber(businessModel.totalHours);
    document.getElementById('total-workdays').textContent = formatNumber(businessModel.totalWorkdays);
    document.getElementById('required-hourly-rate').textContent = formatCurrency(businessModel.requiredHourlyRate);
    document.getElementById('required-day-rate').textContent = formatCurrency(businessModel.requiredDayRate);
    
    // If rounding is applied, show an indicator or tooltip
    const rateDisplays = document.querySelectorAll('#required-hourly-rate, #required-day-rate');
    
    if (businessModel.rounding !== 'none') {
        // Add a class to indicate rounding is applied
        rateDisplays.forEach(display => {
            display.classList.add('rounded-value');
            display.title = `Rounded up to nearest $${businessModel.rounding}`;
        });
    } else {
        // Remove the class if no rounding
        rateDisplays.forEach(display => {
            display.classList.remove('rounded-value');
            display.title = '';
        });
    }
}

/**
 * Render the task list table
 */
function renderTaskList() {
    const taskListBody = document.getElementById('task-list-body');
    const totalDaysElement = document.getElementById('total-days');
    const totalCostElement = document.getElementById('total-cost');
    
    // Clear existing rows
    taskListBody.innerHTML = '';
    
    // Add a row for each task
    projectCalculator.tasks.forEach(task => {
        const row = document.createElement('tr');
        
        // Task name column
        const nameCell = document.createElement('td');
        nameCell.textContent = task.name;
        row.appendChild(nameCell);
        
        // Days column
        const daysCell = document.createElement('td');
        daysCell.textContent = task.days.toFixed(2);
        row.appendChild(daysCell);
        
        // Cost column
        const costCell = document.createElement('td');
        costCell.textContent = formatCurrency(task.cost);
        row.appendChild(costCell);
        
        // Actions column
        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '×';
        deleteButton.className = 'factor-remove';
        deleteButton.addEventListener('click', () => {
            projectCalculator.removeTask(task.id);
            renderTaskList();
            updateAllCalculations();
        });
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        
        // Add row to table
        taskListBody.appendChild(row);
    });
    
    // Update totals
    const totalDays = projectCalculator.tasks.reduce((total, task) => total + task.days, 0);
    totalDaysElement.textContent = totalDays.toFixed(2);
    totalCostElement.textContent = formatCurrency(projectCalculator.baseProjectCost);
}

/**
 * Render uplift factors list
 */
function renderUpliftFactors() {
    const factorsList = document.getElementById('uplift-factors-list');
    const allocationProgress = document.getElementById('uplift-allocation-progress');
    const allocationPercentage = document.getElementById('uplift-allocation-percentage');
    
    // Clear existing factors
    factorsList.innerHTML = '';
    
    // Add each factor
    projectCalculator.upliftFactors.forEach(factor => {
        const factorItem = createFactorItem(
            factor,
            (selected) => {
                projectCalculator.toggleUpliftFactor(factor.id, selected);
                updateAllCalculations();
            },
            () => {
                projectCalculator.removeUpliftFactor(factor.id);
                renderUpliftFactors();
                updateAllCalculations();
            }
        );
        factorsList.appendChild(factorItem);
    });
    
    // Update allocation bar
    const validation = projectCalculator.validateUpliftAllocations();
    allocationProgress.style.width = `${Math.min(100, validation.total)}%`;
    allocationProgress.style.backgroundColor = validation.valid ? '#4CAF50' : '#e74c3c';
    allocationPercentage.textContent = validation.total.toFixed(1);
}

/**
 * Render discount factors list
 */
function renderDiscountFactors() {
    const factorsList = document.getElementById('discount-factors-list');
    const allocationProgress = document.getElementById('discount-allocation-progress');
    const allocationPercentage = document.getElementById('discount-allocation-percentage');
    
    // Clear existing factors
    factorsList.innerHTML = '';
    
    // Add each factor
    projectCalculator.discountFactors.forEach(factor => {
        const factorItem = createFactorItem(
            factor,
            (selected) => {
                projectCalculator.toggleDiscountFactor(factor.id, selected);
                updateAllCalculations();
            },
            () => {
                projectCalculator.removeDiscountFactor(factor.id);
                renderDiscountFactors();
                updateAllCalculations();
            }
        );
        factorsList.appendChild(factorItem);
    });
    
    // Update allocation bar
    const validation = projectCalculator.validateDiscountAllocations();
    allocationProgress.style.width = `${Math.min(100, validation.total)}%`;
    allocationProgress.style.backgroundColor = validation.valid ? '#4CAF50' : '#e74c3c';
    allocationPercentage.textContent = validation.total.toFixed(1);
}

/**
 * Initialize project information
 */
function initializeProjectInfo() {
    const clientNameInput = document.getElementById('client-name');
    
    // Add event listener for client name
    clientNameInput.addEventListener('input', () => {
        projectCalculator.setClientName(clientNameInput.value);
    });
}

/**
 * Initialize export/import functionality
 */
function initializeExportImport() {
    const exportButton = document.getElementById('export-project');
    const importInput = document.getElementById('import-file');
    
    // Export button click handler
    exportButton.addEventListener('click', () => {
        // Get JSON data
        const jsonData = projectCalculator.exportProjectData();
        
        // Create file name with client name and date
        const clientName = projectCalculator.clientName || 'project';
        const sanitizedClientName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const date = new Date().toISOString().split('T')[0];
        const fileName = `${sanitizedClientName}_pricing_${date}.json`;
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    });
    
    // Import file input handler
    importInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonData = e.target.result;
            const success = projectCalculator.importProjectData(jsonData);
            
            if (success) {
                // Update UI with imported data
                document.getElementById('client-name').value = projectCalculator.clientName;
                
                // Update all displays with formatted values
                document.getElementById('salary-budget').value = formatNumberInput(projectCalculator.businessModel.salaryBudget);
                document.getElementById('growth-budget').value = formatNumberInput(projectCalculator.businessModel.growthBudget);
                document.getElementById('working-weeks').value = projectCalculator.businessModel.workingWeeks;
                document.getElementById('team-members').value = projectCalculator.businessModel.teamMembers;
                document.getElementById('hours-per-week').value = projectCalculator.businessModel.hoursPerWeek;
                
                document.getElementById('max-uplift').value = projectCalculator.maxUplift;
                document.getElementById('max-discount').value = projectCalculator.maxDiscount;
                
                // Update currency settings UI
                // Re-initialize the currency settings to ensure UI elements are recreated with updated values
                initializeCurrencySettings();
                
                // Re-render everything
                updateAllCalculations();
                renderTaskList();
                renderUpliftFactors();
                renderDiscountFactors();
                
                alert('Project imported successfully');
            } else {
                alert('Failed to import project. The file may be invalid or corrupted.');
            }
            
            // Reset the file input
            importInput.value = '';
        };
        reader.readAsText(file);
    });
}

/**
 * Create a factor item element
 * 
 * @param {Object} factor - Factor data
 * @param {Function} onToggle - Toggle callback
 * @param {Function} onRemove - Remove callback
 * @returns {HTMLElement} The factor item element
 */
function createFactorItem(factor, onToggle, onRemove) {
    const item = document.createElement('div');
    item.className = 'factor-item';
    
    // Factor name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'factor-name';
    nameSpan.textContent = factor.name;
    item.appendChild(nameSpan);
    
    // Details container
    const details = document.createElement('div');
    details.className = 'factor-details';
    
    // Editable allocation input
    const allocationContainer = document.createElement('div');
    allocationContainer.className = 'allocation-edit';
    
    const allocationInput = document.createElement('input');
    allocationInput.type = 'number';
    allocationInput.className = 'allocation-input';
    allocationInput.min = 1;
    allocationInput.max = 100;
    allocationInput.value = factor.allocation;
    allocationInput.size = 3;
    
    // Use input event for real-time updates as user types
    allocationInput.addEventListener('input', () => {
        const newValue = Math.max(1, Math.min(100, parseFloat(allocationInput.value) || 0));
        
        // Update the factor allocation using the appropriate method
        if (item.closest('#uplift-factors-list')) {
            projectCalculator.updateUpliftFactorAllocation(factor.id, newValue);
            // Update just the allocation bar for uplift factors
            updateUpliftAllocationBar();
        } else if (item.closest('#discount-factors-list')) {
            projectCalculator.updateDiscountFactorAllocation(factor.id, newValue);
            // Update just the allocation bar for discount factors
            updateDiscountAllocationBar();
        }
        
        // Update calculations
        updateAllCalculations();
    });
    
    // Also keep the change event for when user leaves the field
    allocationInput.addEventListener('change', () => {
        // Ensure value is set correctly when focus leaves
        const newValue = Math.max(1, Math.min(100, parseFloat(allocationInput.value) || 0));
        allocationInput.value = newValue;
    });
    
    allocationContainer.appendChild(allocationInput);
    
    const percentSymbol = document.createElement('span');
    percentSymbol.textContent = '%';
    percentSymbol.className = 'allocation-percent';
    allocationContainer.appendChild(percentSymbol);
    
    details.appendChild(allocationContainer);
    
    // Toggle switch
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'factor-toggle';
    toggle.checked = factor.selected;
    toggle.addEventListener('change', () => onToggle(toggle.checked));
    details.appendChild(toggle);
    
    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.className = 'factor-remove';
    deleteButton.addEventListener('click', onRemove);
    details.appendChild(deleteButton);
    
    item.appendChild(details);
    return item;
}

/**
 * Update project display with calculated values
 */
function updateProjectDisplay() {
    // Update cost displays
    document.getElementById('base-project-cost').textContent = formatCurrency(projectCalculator.baseProjectCost);
    
    // Update uplift/discount displays
    const upliftAmount = projectCalculator.baseProjectCost * (projectCalculator.appliedUplift / 100);
    const discountAmount = projectCalculator.baseProjectCost * (projectCalculator.appliedDiscount / 100);
    
    document.getElementById('applied-uplift-percentage').textContent = projectCalculator.appliedUplift.toFixed(2);
    document.getElementById('applied-uplift-amount').textContent = formatCurrency(upliftAmount);
    
    document.getElementById('applied-discount-percentage').textContent = projectCalculator.appliedDiscount.toFixed(2);
    document.getElementById('applied-discount-amount').textContent = formatCurrency(discountAmount);
    
    // Update final cost
    document.getElementById('final-project-cost').textContent = formatCurrency(projectCalculator.finalProjectCost);
    
    // Update rate comparison
    const comparison = projectCalculator.getRateComparison();
    document.getElementById('comparison-required-day-rate').textContent = formatCurrency(comparison.requiredDayRate);
    document.getElementById('actual-day-rate').textContent = formatCurrency(comparison.actualDayRate);
    
    // Update diff display
    const diffElement = document.getElementById('day-rate-diff');
    diffElement.textContent = `(${comparison.diffPercentage > 0 ? '+' : ''}${comparison.diffPercentage.toFixed(1)}%)`;
    diffElement.className = comparison.isSufficient ? 'comparison-diff diff-positive' : 'comparison-diff diff-negative';
}

/**
 * Update just the uplift allocation bar without redrawing the entire list
 */
function updateUpliftAllocationBar() {
    const allocationProgress = document.getElementById('uplift-allocation-progress');
    const allocationPercentage = document.getElementById('uplift-allocation-percentage');
    
    // Get validation results
    const validation = projectCalculator.validateUpliftAllocations();
    
    // Update allocation bar
    allocationProgress.style.width = `${Math.min(100, validation.total)}%`;
    allocationProgress.style.backgroundColor = validation.valid ? '#4CAF50' : '#e74c3c';
    allocationPercentage.textContent = validation.total.toFixed(1);
}

/**
 * Update just the discount allocation bar without redrawing the entire list
 */
function updateDiscountAllocationBar() {
    const allocationProgress = document.getElementById('discount-allocation-progress');
    const allocationPercentage = document.getElementById('discount-allocation-percentage');
    
    // Get validation results
    const validation = projectCalculator.validateDiscountAllocations();
    
    // Update allocation bar
    allocationProgress.style.width = `${Math.min(100, validation.total)}%`;
    allocationProgress.style.backgroundColor = validation.valid ? '#4CAF50' : '#e74c3c';
    allocationPercentage.textContent = validation.total.toFixed(1);
}

/**
 * Update all calculations and displays
 */
function updateAllCalculations() {
    // Update tasks with current day rate
    // Important: This needs to use the current day rate including any rounding
    projectCalculator.tasks.forEach(task => {
        task.cost = task.days * businessModel.requiredDayRate;
    });
    
    // Update all displays
    updateBusinessModelDisplay();
    renderTaskList();
    updateProjectDisplay();
    
    // Update currency displays
    updateCurrencyDisplay();
}

/**
 * Initialize currency settings
 */
function initializeCurrencySettings() {
    const currencyListContainer = document.getElementById('currency-list');
    
    // Clear any existing content
    currencyListContainer.innerHTML = '';
    
    // Create currency rows
    Object.entries(projectCalculator.currencies).forEach(([code, currency]) => {
        if (code !== projectCalculator.baseCurrency) {
            // Create a row for each non-base currency
            const currencyRow = document.createElement('div');
            currencyRow.className = 'currency-row';
            
            // Currency code label
            const currencyLabel = document.createElement('div');
            currencyLabel.className = 'currency-label';
            currencyLabel.textContent = code;
            currencyRow.appendChild(currencyLabel);
            
            // Toggle container
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'currency-toggle';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `currency-toggle-${code}`;
            checkbox.checked = currency.enabled;
            checkbox.addEventListener('change', () => {
                projectCalculator.toggleCurrency(code, checkbox.checked);
                updateCurrencyDisplay();
                updateAllCalculations();
            });
            
            const label = document.createElement('label');
            label.htmlFor = `currency-toggle-${code}`;
            label.textContent = 'Enable';
            
            toggleContainer.appendChild(checkbox);
            toggleContainer.appendChild(label);
            currencyRow.appendChild(toggleContainer);
            
            // Rate input container
            const rateInputContainer = document.createElement('div');
            rateInputContainer.className = 'currency-rate-input';
            
            const rateLabel = document.createElement('span');
            rateLabel.className = 'currency-rate-label';
            rateLabel.textContent = 'Rate:';
            
            const rateInput = document.createElement('input');
            rateInput.type = 'number';
            rateInput.id = `currency-rate-${code}`;
            rateInput.min = 0.01;
            rateInput.step = 0.01;
            rateInput.value = currency.rate;
            rateInput.addEventListener('input', () => {
                const rate = parseFloat(rateInput.value);
                if (!isNaN(rate) && rate > 0) {
                    projectCalculator.setCurrencyRate(code, rate);
                    updateCurrencyDisplay();
                    updateAllCalculations();
                }
            });
            
            rateInputContainer.appendChild(rateLabel);
            rateInputContainer.appendChild(rateInput);
            currencyRow.appendChild(rateInputContainer);
            
            // Add the row to the container
            currencyListContainer.appendChild(currencyRow);
        }
    });
}

/**
 * Update currency display for all calculated values
 */
function updateCurrencyDisplay() {
    // Get enabled currencies
    const enabledCurrencies = projectCalculator.getEnabledCurrencies()
        .filter(currency => currency.code !== projectCalculator.baseCurrency);
    
    // If no other currencies are enabled, clear displays and return
    if (enabledCurrencies.length === 0) {
        const currencyDisplays = document.querySelectorAll('.multi-currency');
        currencyDisplays.forEach(display => display.innerHTML = '');
        return;
    }
    
    // Update model rate displays
    updateCurrencyValueDisplay('hourly-rate-currencies', businessModel.requiredHourlyRate, enabledCurrencies);
    updateCurrencyValueDisplay('day-rate-currencies', businessModel.requiredDayRate, enabledCurrencies);
    
    // Update project cost displays
    updateCurrencyValueDisplay('base-cost-currencies', projectCalculator.baseProjectCost, enabledCurrencies);
    updateCurrencyValueDisplay('uplift-amount-currencies', projectCalculator.baseProjectCost * (projectCalculator.appliedUplift / 100), enabledCurrencies);
    updateCurrencyValueDisplay('discount-amount-currencies', projectCalculator.baseProjectCost * (projectCalculator.appliedDiscount / 100), enabledCurrencies);
    updateCurrencyValueDisplay('final-cost-currencies', projectCalculator.finalProjectCost, enabledCurrencies);
    
    // Update rate comparison displays
    updateCurrencyValueDisplay('comparison-day-rate-currencies', businessModel.requiredDayRate, enabledCurrencies);
    updateCurrencyValueDisplay('actual-day-rate-currencies', projectCalculator.actualDayRate, enabledCurrencies);
}

/**
 * Update currency display for a specific value
 * 
 * @param {string} elementId - ID of element to update
 * @param {number} value - Value in base currency
 * @param {Array} currencies - Array of currency objects to display
 */
function updateCurrencyValueDisplay(elementId, value, currencies) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Create container for currency conversions
    const currencyConversions = document.createElement('div');
    currencyConversions.className = 'currency-conversions';
    
    currencies.forEach(currency => {
        const convertedValue = projectCalculator.convertCurrency(value, currency.code);
        const currencyItem = document.createElement('div');
        currencyItem.className = 'currency-item';
        currencyItem.textContent = `${currency.code}: ${currency.symbol}${formatCurrency(convertedValue)}`;
        currencyConversions.appendChild(currencyItem);
    });
    
    // Clear previous content and add the new currency conversions
    element.innerHTML = '';
    element.appendChild(currencyConversions);
}

/**
 * Format a number with thousand separators
 * 
 * @param {number} value - Value to format
 * @returns {string} Formatted number
 */
function formatNumber(value) {
    return value.toLocaleString('en-US');
}

/**
 * Format a number with commas for input fields
 * 
 * @param {number} value - Value to format
 * @returns {string} Formatted number with commas
 */
function formatNumberInput(value) {
    return value.toLocaleString('en-US', {
        maximumFractionDigits: 0,
        useGrouping: true
    });
}

/**
 * Format a value as currency
 * 
 * @param {number} value - Value to format
 * @returns {string} Formatted currency
 */
function formatCurrency(value) {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}