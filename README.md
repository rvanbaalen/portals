[&larr; See my other Open Source projects](https://robinvanbaalen.nl)

# @rvanbaalen/portals
![NPM Downloads](https://img.shields.io/npm/dm/@rvanbaalen/portals)
![GitHub License](https://img.shields.io/github/license/rvanbaalen/portals)
![NPM Version](https://img.shields.io/npm/v/@rvanbaalen/portals)

## Description

A reusable system for rendering content above the normal DOM flow. This library helps create and manage portal containers for UI elements like dropdowns, tooltips, modals, etc. that need to appear above other content regardless of stacking context.

## Installation

Install the package via npm:

```bash
npm install @rvanbaalen/portals
```

## Usage

### Basic Example

```javascript
import portalManager from '@rvanbaalen/portals';

// Create a dropdown element
const dropdown = document.createElement('div');
dropdown.className = 'dropdown';
dropdown.textContent = 'Dropdown Content';

// Add it to a portal
portalManager.addToPortal(dropdown);

// Position it relative to a button
const button = document.getElementById('dropdown-button');
portalManager.positionElement(dropdown, button, {
  placement: 'bottom-left',
  margin: 8
});

// Remove when no longer needed
portalManager.removeFromPortal(dropdown);
```

### API Reference

#### PortalManager

The core class that manages portals in the DOM.

##### Constructor

```javascript
constructor()
```

Creates a new PortalManager instance and initializes the main portal.

##### Properties

###### signals

```javascript
manager.signals.portalCreated // Signal for when a portal is created
manager.signals.elementAdded // Signal for when an element is added to a portal
manager.signals.elementRemoved // Signal for when an element is removed from a portal
```

Signals that can be subscribed to for various portal events.

###### portals

```javascript
manager.portals // Object containing references to all portal containers
```

Object containing references to all portal containers, indexed by their ID.

##### Methods

###### _createPortal

```javascript
_createPortal(id, zIndex = 9999)
```

**Internal method.** Creates a new portal container.

Parameters:
- `id` (string): Unique identifier for the portal
- `zIndex` (number, optional): Z-index for the portal (higher appears above lower). Default: 9999

Returns: The portal container element (HTMLElement)

###### getPortal

```javascript
getPortal(id = 'main', zIndex = 9999)
```

Gets a portal by ID (creates if it doesn't exist).

Parameters:
- `id` (string, optional): Portal identifier. Default: 'main'
- `zIndex` (number, optional): Z-index for new portal if created. Default: 9999

Returns: The portal container (HTMLElement)

###### addToPortal

```javascript
addToPortal(element, portalId = 'main')
```

Adds an element to a portal.

Parameters:
- `element` (HTMLElement): Element to add to the portal
- `portalId` (string, optional): Portal identifier. Default: 'main'

Returns: The added element (HTMLElement)

###### removeFromPortal

```javascript
removeFromPortal(element)
```

Removes an element from a portal.

Parameters:
- `element` (HTMLElement): Element to remove

Returns: True if the element was found and removed, false otherwise (boolean)

###### positionElement

```javascript
positionElement(element, referenceElement, options = {})
```

Positions an element in a portal relative to another element.

Parameters:
- `element` (HTMLElement): Element to position
- `referenceElement` (HTMLElement): Reference element for positioning
- `options` (Object, optional): Positioning options
  - `placement` (string, optional): Placement relative to reference. Default: 'bottom'
    - Possible values: 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  - `portalId` (string, optional): Portal identifier. Default: 'main'
  - `margin` (number, optional): Margin from reference element in pixels. Default: 5

Returns: The positioned element (HTMLElement)

###### destroy

```javascript
destroy()
```

Cleans up all portals.

Returns: void

### Event System

The PortalManager exposes signals that you can subscribe to:

```javascript
// Listen for new portals being created
portalManager.signals.portalCreated.add((id, portal) => {
  console.log(`Portal created: ${id}`);
});

// Listen for elements being added to portals
portalManager.signals.elementAdded.add((element, portalId) => {
  console.log(`Element added to portal: ${portalId}`);
});

// Listen for elements being removed from portals
portalManager.signals.elementRemoved.add((element, portalId) => {
  console.log(`Element removed from portal: ${portalId}`);
});
```

### Advanced Examples

#### Dropdown Example

```javascript
import portalManager from '@rvanbaalen/portals';

// Create a simple dropdown component
function createDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown-content';
  dropdown.style.cssText = `
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 10px;
    width: 200px;
  `;
  
  // Add some dropdown items
  const items = ['Profile', 'Settings', 'Help', 'Logout'];
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.textContent = item;
    itemElement.style.cssText = `
      padding: 8px 10px;
      cursor: pointer;
    `;
    itemElement.addEventListener('click', () => {
      console.log(`Clicked: ${item}`);
      portalManager.removeFromPortal(dropdown);
    });
    itemElement.addEventListener('mouseover', () => {
      itemElement.style.backgroundColor = '#f5f5f5';
    });
    itemElement.addEventListener('mouseout', () => {
      itemElement.style.backgroundColor = 'transparent';
    });
    dropdown.appendChild(itemElement);
  });
  
  return dropdown;
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
  // Create a dropdown toggle button
  const button = document.createElement('button');
  button.textContent = 'Open Dropdown';
  button.style.cssText = `
    padding: 10px 15px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin: 20px;
  `;
  document.body.appendChild(button);
  
  // Handle button click
  let isOpen = false;
  let dropdown = null;
  
  button.addEventListener('click', () => {
    if (!isOpen) {
      // Create and show dropdown
      dropdown = createDropdown();
      portalManager.positionElement(dropdown, button, {
        placement: 'bottom-left',
        margin: 5
      });
      isOpen = true;
    } else {
      // Hide dropdown
      portalManager.removeFromPortal(dropdown);
      isOpen = false;
    }
  });
  
  // Add a click listener to close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (isOpen && event.target !== button && !dropdown.contains(event.target)) {
      portalManager.removeFromPortal(dropdown);
      isOpen = false;
    }
  });
});
```

#### Tooltip Example

```javascript
import portalManager from '@rvanbaalen/portals';

// Create a reusable tooltip factory
function createTooltipSystem() {
  // Create a dedicated portal for tooltips
  const tooltipPortal = portalManager.getPortal('tooltips', 10000);
  
  // Keep track of active tooltip
  let activeTooltip = null;
  
  // Create a tooltip element
  function createTooltip(text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      max-width: 200px;
      pointer-events: none;
    `;
    return tooltip;
  }
  
  // Show tooltip
  function showTooltip(element, text, placement = 'top') {
    // Remove any existing tooltip
    hideTooltip();
    
    // Create new tooltip
    activeTooltip = createTooltip(text);
    
    // Position relative to target element
    portalManager.positionElement(activeTooltip, element, {
      placement,
      portalId: 'tooltips',
      margin: 8
    });
  }
  
  // Hide tooltip
  function hideTooltip() {
    if (activeTooltip) {
      portalManager.removeFromPortal(activeTooltip);
      activeTooltip = null;
    }
  }
  
  // Apply tooltip behavior to an element
  function applyTooltip(element, text, placement = 'top') {
    element.addEventListener('mouseenter', () => showTooltip(element, text, placement));
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('focus', () => showTooltip(element, text, placement));
    element.addEventListener('blur', hideTooltip);
  }
  
  return {
    applyTooltip,
    showTooltip,
    hideTooltip
  };
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
  const tooltipSystem = createTooltipSystem();
  
  // Create some example elements
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    gap: 20px;
    margin: 100px;
  `;
  document.body.appendChild(container);
  
  // Create buttons with different tooltip placements
  const placements = [
    { label: 'Top Tooltip', placement: 'top', text: 'This tooltip appears above the button' },
    { label: 'Right Tooltip', placement: 'right', text: 'This tooltip appears to the right of the button' },
    { label: 'Bottom Tooltip', placement: 'bottom', text: 'This tooltip appears below the button' },
    { label: 'Left Tooltip', placement: 'left', text: 'This tooltip appears to the left of the button' }
  ];
  
  placements.forEach(({ label, placement, text }) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = `
      padding: 10px 15px;
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    container.appendChild(button);
    
    // Apply tooltip
    tooltipSystem.applyTooltip(button, text, placement);
  });
});
```

## Development

To modify or extend this library:

1. Clone the repository:
   ```bash
   git clone https://github.com/rvanbaalen/portals.git
   cd portals
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make your changes to the source code in `index.js`

4. Test your changes in your project by using npm link:
   ```bash
   # In the portals directory
   npm link
   
   # In your project directory
   npm link @rvanbaalen/portals
   ```

## Contributing

Contributions are welcome! If you have any suggestions, improvements, or bug fixes, please [open an issue](https://github.com/rvanbaalen/portals/issues/new) or [submit a pull request](https://github.com/rvanbaalen/portals/pulls).

## License

Distributed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---
