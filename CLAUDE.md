# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a pricing calculator application for business project costing. The application is a simple HTML/JavaScript tool that helps calculate required rates based on annual financial targets and applies these to specific projects with adjustable factors.

## Architecture

The application follows a modular design with these core components:

1. **Business Model Calculator** (`model.js`): Calculates required hourly/day rates based on annual targets
2. **Project Pricing Calculator** (`project.js`): Applies rates to specific projects with task breakdowns 
3. **UI Controller** (`ui.js`): Handles user interactions and DOM updates

The application uses a two-panel UI layout:
- Left panel: Business model values and calculations
- Right panel: Project-specific variables and adjustments

## Technical Details

The application is built with:
- HTML5 for structure
- CSS3 for layout and styling
- Vanilla JavaScript (ES6+) for calculations and interactivity
- No external dependencies (no build process required)

## Development Workflow

Since this is a simple client-side application:

1. Edit the HTML, CSS, and JavaScript files directly
2. Open the HTML file in a browser to test changes
3. Refresh the browser to see updates

## Project Commands

To run the application:
```
open index.html
```

No build, compilation, or server is required. The application runs entirely in the browser.

## Key Implementation Requirements

1. **Real-time calculations** - Update values instantly as inputs change
2. **Validation for percentage allocations** - Ensure uplift/discount factors sum to 100%
3. **Rate comparison** - Show difference between required and actual rates
4. **Dynamic factor management** - Allow adding/removing/toggling pricing factors
5. **Editable factor percentages** - Allow modification of existing factor percentages
6. **Project export/import functionality** - Save and load project data in JSON format
7. **Client name tracking** - Associate each project with a client name

## File Organization

```
/
├── index.html         # Main application HTML
├── css/               # Stylesheets
│   └── style.css      # Main stylesheet
├── js/                # JavaScript files
│   ├── model.js       # Business model calculations
│   ├── project.js     # Project pricing logic 
│   └── ui.js          # UI interaction and display
├── README.md          # User documentation
├── CLAUDE.md          # Guidance for Claude Code
└── technical_specification.md # Technical documentation
```

## Calculator Logic

The calculator uses these key formulas:

```
totalHours = teamMembers * hoursPerWeek * workingWeeks;
requiredHourlyRate = (salaryBudget + growthBudget) / totalHours;
requiredDayRate = requiredHourlyRate * 8;

// Project pricing
baseProjectCost = sum(tasks.map(task => task.days * businessModel.requiredDayRate));
finalProjectCost = baseProjectCost + upliftAmount - discountAmount;

// Uplift and discount calculations
upliftAmount = baseProjectCost * (appliedUplift / 100);
discountAmount = baseProjectCost * (appliedDiscount / 100);

// Actual rate calculations
actualDayRate = finalProjectCost / totalDays;
actualHourlyRate = actualDayRate / 8;
```

## Data Persistence

The application uses a simple file-based export/import system:
- Project data is exported as JSON files
- Files include both business model and project-specific data
- Filenames follow the pattern: `clientname_pricing_yyyy-mm-dd.json`
- JSON schema version tracking ensures forward compatibility

## Debugging Tips

Common issues to check:
- Ensure factor percentages sum to 100% for proper calculations
- Verify tasks have valid day estimates (greater than 0)
- Check that financial inputs are non-negative
- If calculations appear incorrect, check console logs for errors
- Make sure all editable percentage fields display properly
- Verify export/import functionality with sample data