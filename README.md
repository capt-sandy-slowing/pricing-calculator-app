# Pricing Calculator

A simple HTML/JavaScript calculator for project pricing based on business budget requirements. This tool helps determine required rates and calculate project costs with adjustable factors for uplifts and discounts.

## Features

- Calculate required hourly and day rates based on annual budget targets
- Manage project tasks with estimated durations
- Apply customizable uplift and discount factors to project pricing
- Validate percentage allocations for factors
- Compare actual vs. required rates for financial decision making
- No installation required - works in any modern browser

## Getting Started

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. No server or build process required

## How to Use

### Business Model Configuration (Left Panel)

1. **Financial Targets**
   - Enter your annual salary budget (total amount needed to cover all salaries)
   - Enter your annual growth budget (amount needed for future growth)

2. **Team Capacity**
   - Set working weeks per year (typically 48-50)
   - Enter number of team members available
   - Set hours per week per team member (e.g., 35)

3. **Calculated Rates**
   - View total available hours per year
   - See required hourly rate to meet financial targets
   - See required day rate (based on 8-hour days)

### Project Pricing (Right Panel)

1. **Project Tasks**
   - Add tasks with names and estimated days
   - View task list with cost breakdown
   - See total project days and base cost

2. **Uplift Factors**
   - Set maximum uplift percentage
   - Add factors that contribute to uplift (e.g., "Legal complexity", "Timezone challenges")
   - Specify percentage allocation for each factor
   - Monitor allocation bar to ensure factors sum to 100%
   - Toggle factors on/off as needed

3. **Discount Factors**
   - Set maximum discount percentage
   - Add factors that contribute to discount (e.g., "Portfolio value", "Brand exposure")
   - Specify percentage allocation for each factor
   - Monitor allocation bar to ensure factors sum to 100%
   - Toggle factors on/off as needed

4. **Project Summary**
   - View base project cost before adjustments
   - See applied uplift amount and percentage
   - See applied discount amount and percentage
   - View final project cost after all adjustments
   - Compare required vs. actual day rates
   - Monitor rate difference percentage (colored indicator shows if rates are sufficient)

## Calculation Logic

### Business Model

The calculator determines required rates as follows:

```
Total Annual Hours = Team Members × Hours Per Week × Working Weeks
Required Hourly Rate = (Salary Budget + Growth Budget) ÷ Total Annual Hours
Required Day Rate = Required Hourly Rate × 8
```

### Project Pricing

Project costs are calculated as:

```
Base Project Cost = Sum of (Task Days × Required Day Rate)
Uplift Amount = Base Project Cost × (Applied Uplift Percentage ÷ 100)
Discount Amount = Base Project Cost × (Applied Discount Percentage ÷ 100)
Final Project Cost = Base Project Cost + Uplift Amount - Discount Amount
Actual Day Rate = Final Project Cost ÷ Total Project Days
```

### Uplift/Discount System

The calculator allows dynamic factor management:

1. Set maximum percentages for uplift and discount
2. Create factors with percentage allocations (should sum to 100%)
3. Each selected factor contributes its allocation percentage of the maximum
4. For example:
   - Max Uplift: 30%
   - Factor "Legal Complexity": 40% allocation
   - When selected, this factor adds 12% uplift (40% of 30%)

## Tips for Effective Use

- Regularly update your financial targets to maintain accurate rates
- Create standardized factors that you can reuse across projects
- Use the rate comparison to identify projects that might be underpriced
- Adjust task estimates if the actual day rate is significantly below the required rate
- Save different project scenarios by using browser bookmarks

## Browser Compatibility

- Works with all modern browsers (Chrome, Firefox, Safari, Edge)
- No internet connection required after initial download

## License

This project is open source, free to use and modify.