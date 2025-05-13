# Technical Specification: Pricing Calculator Application

## 1. Overview

The Pricing Calculator is a web-based application that helps businesses calculate project pricing based on annual budget requirements, available resources, and project-specific factors. It replaces an existing spreadsheet model with an interactive HTML/JavaScript application that provides real-time feedback on pricing decisions.

The calculator has two main components:
1. **Business Model Calculator**: Calculates required hourly/day rates based on annual financial targets
2. **Project Pricing Calculator**: Applies the business model rates to specific projects with task breakdowns and adjustments via an uplift/discount system

## 2. Core Functionality

### 2.1 Business Model Calculator
- Calculate required hourly and day rates based on:
  - Annual salary budget
  - Annual growth budget
  - Working weeks per year
  - Team member count
  - Expected hours per week
- Calculate total available hours across working year
- Determine minimum hourly and day rates required to meet financial targets

### 2.2 Project Pricing Calculator
- Create and manage project tasks with estimated durations
- Apply customizable uplift and discount factors to project pricing
- Calculate final project price with adjustments
- Compare actual rates to required rates from business model
- Validate user inputs for percentage allocations

### 2.3 Uplift/Discount System
- Define maximum uplift and discount percentages
- Create boolean factors contributing to uplift or discount
- Assign percentage weights to each factor
- Validate total percentage allocation equals 100%
- Calculate actual uplift/discount based on selected factors

## 3. UI Design

### 3.1 Layout
- Two-panel design with Business Model parameters on left, Project parameters on right
- Responsive layout for various screen sizes
- Clear visual separation between input and output fields

### 3.2 Business Model Panel
- Input fields for financial targets and team capacity
- Output display for calculated rates
- Instructional text explaining each parameter

### 3.3 Project Panel
- Task management interface with add/edit/delete functionality
- Uplift/discount factor management interface
- Project summary with calculated pricing
- Comparison of actual vs. required rates with visual feedback

### 3.4 User Experience
- Real-time calculations as inputs change
- Clear validation feedback for invalid inputs
- Tooltips/help text for complex concepts
- Collapsible sections for better organization

## 4. Component Structure

### 4.1 Business Model Component
```
BusinessModelCalculator
├── InputSection
│   ├── SalaryBudgetInput
│   ├── GrowthBudgetInput
│   ├── WorkingWeeksInput
│   ├── TeamMemberCountInput
│   └── HoursPerWeekInput
└── OutputSection
    ├── TotalHoursDisplay
    ├── RequiredHourlyRateDisplay
    └── RequiredDayRateDisplay
```

### 4.2 Project Pricing Component
```
ProjectPricingCalculator
├── TaskManagementSection
│   ├── TaskInput
│   ├── TaskList
│   └── TaskSummary
├── AdjustmentSection
│   ├── UpliftFactorsManager
│   │   ├── MaxUpliftInput
│   │   └── UpliftFactorsList
│   └── DiscountFactorsManager
│       ├── MaxDiscountInput
│       └── DiscountFactorsList
└── ProjectSummarySection
    ├── BaseProjectCostDisplay
    ├── AdjustedProjectCostDisplay
    ├── ActualRateComparisonDisplay
    └── ValidationMessages
```

### 4.3 Shared Components
```
SharedComponents
├── FactorManager
│   ├── FactorInput
│   ├── FactorList
│   └── AllocationValidator
├── CurrencyInput
├── PercentageInput
└── TimeInput
```

## 5. Data Model

### 5.1 Business Model Data
```javascript
{
  salaryBudget: Number,        // Annual amount needed for salaries
  growthBudget: Number,        // Annual amount needed for growth
  workingWeeks: Number,        // Weeks per year to work
  teamMembers: Number,         // Available team members
  hoursPerWeek: Number,        // Hours per week per team member
  
  // Calculated fields
  totalHours: Number,          // Total available hours per year
  requiredHourlyRate: Number,  // Hourly rate needed to meet budget
  requiredDayRate: Number      // Day rate needed to meet budget
}
```

### 5.2 Project Data
```javascript
{
  name: String,                // Project name
  
  // Tasks
  tasks: [
    {
      id: String,              // Unique identifier
      name: String,            // Task name
      days: Number,            // Estimated days required
      cost: Number             // Calculated cost based on day rate
    }
  ],
  
  // Uplift factors
  maxUplift: Number,           // Maximum possible uplift percentage
  upliftFactors: [
    {
      id: String,              // Unique identifier
      name: String,            // Factor name
      allocation: Number,      // Percentage of maxUplift (0-100)
      selected: Boolean        // Whether factor is applied
    }
  ],
  
  // Discount factors
  maxDiscount: Number,         // Maximum possible discount percentage
  discountFactors: [
    {
      id: String,              // Unique identifier
      name: String,            // Factor name
      allocation: Number,      // Percentage of maxDiscount (0-100)
      selected: Boolean        // Whether factor is applied
    }
  ],
  
  // Calculated fields
  baseProjectCost: Number,     // Cost before adjustments
  appliedUplift: Number,       // Actual uplift percentage applied
  appliedDiscount: Number,     // Actual discount percentage applied
  finalProjectCost: Number,    // Cost after adjustments
  actualHourlyRate: Number,    // Effective hourly rate
  actualDayRate: Number        // Effective day rate
}
```

## 6. Calculation Logic

### 6.1 Business Model Calculations

```javascript
// Total available hours per year
totalHours = teamMembers * hoursPerWeek * workingWeeks;

// Required hourly rate
requiredHourlyRate = (salaryBudget + growthBudget) / totalHours;

// Required day rate (assuming 8-hour days)
requiredDayRate = requiredHourlyRate * 8;
```

### 6.2 Project Pricing Calculations

```javascript
// Base project cost
baseProjectCost = sum(tasks.map(task => task.days * businessModel.requiredDayRate));

// Calculate actual uplift percentage
actualUpliftPercentage = upliftFactors
  .filter(factor => factor.selected)
  .reduce((sum, factor) => sum + (factor.allocation / 100 * maxUplift), 0);

// Calculate actual discount percentage
actualDiscountPercentage = discountFactors
  .filter(factor => factor.selected)
  .reduce((sum, factor) => sum + (factor.allocation / 100 * maxDiscount), 0);

// Final project cost with adjustments
upliftAmount = baseProjectCost * (actualUpliftPercentage / 100);
discountAmount = baseProjectCost * (actualDiscountPercentage / 100);
finalProjectCost = baseProjectCost + upliftAmount - discountAmount;

// Actual rates
totalProjectDays = sum(tasks.map(task => task.days));
actualDayRate = finalProjectCost / totalProjectDays;
actualHourlyRate = actualDayRate / 8;
```

### 6.3 Validation Logic

```javascript
// Validate uplift allocations
upliftAllocationSum = upliftFactors.reduce((sum, factor) => sum + factor.allocation, 0);
upliftAllocationValid = Math.abs(upliftAllocationSum - 100) < 0.01;
upliftAllocationRemaining = 100 - upliftAllocationSum;

// Validate discount allocations
discountAllocationSum = discountFactors.reduce((sum, factor) => sum + factor.allocation, 0);
discountAllocationValid = Math.abs(discountAllocationSum - 100) < 0.01;
discountAllocationRemaining = 100 - discountAllocationSum;
```

## 7. Implementation Plan

### 7.1 Development Phases

#### Phase 1: Core Business Model Calculator
- Implement basic HTML structure
- Create business model calculation logic
- Develop real-time calculation updates
- Add input validation

#### Phase 2: Project Task Management
- Implement task input interface
- Create task list management
- Develop task cost calculations
- Connect task system to business model

#### Phase 3: Uplift/Discount System
- Implement factor management interfaces
- Create allocation validation logic
- Develop factor selection mechanism
- Implement adjustment calculations

#### Phase 4: Project Summary and Comparisons
- Create project summary displays
- Implement rate comparison logic
- Add visual feedback for rate differences
- Create validation and status messages

#### Phase 5: Refinement and Testing
- Enhance UI/UX based on testing
- Optimize calculations and performance
- Improve help text and instructions
- Add data persistence (local storage)

### 7.2 Technical Requirements

- **Frontend Technologies**:
  - HTML5
  - CSS3 (with Flexbox/Grid for layout)
  - JavaScript (ES6+)
  - No external dependencies required for MVP

- **Browser Compatibility**:
  - All modern browsers (Chrome, Firefox, Safari, Edge)
  - No IE11 support required

- **Responsiveness**:
  - Desktop-first design
  - Basic support for tablet views

- **Accessibility**:
  - Semantic HTML
  - ARIA attributes where appropriate
  - Keyboard navigation support

### 7.3 Extensibility Considerations

- Modular code structure to allow for future enhancements
- Clear separation between calculation logic and UI components
- Easy addition of new adjustment factors
- Potential for future server integration (API endpoints defined but not implemented)

## 8. Testing Strategy

### 8.1 Unit Testing
- Test calculation functions with various input scenarios
- Validate business logic correctness
- Test edge cases and error handling

### 8.2 Integration Testing
- Verify component interactions
- Test data flow between business model and project calculator
- Validate state updates after user interactions

### 8.3 UI Testing
- Test responsive layout at different viewport sizes
- Verify form validation feedback
- Ensure proper display of calculated values