import { Signal } from "@rvanbaalen/signals";

/**
 * PortalManager - A reusable system for rendering content above the normal DOM flow
 *
 * This manager creates and maintains portal containers that can be used to render
 * UI elements like dropdowns, tooltips, modals, etc. that need to appear above
 * other content regardless of stacking context.
 */
export class PortalManager {
  constructor() {
    // Signals for portal events
    this.signals = {
      portalCreated: new Signal(),
      elementAdded: new Signal(),
      elementRemoved: new Signal(),
    };

    // Portal containers by ID
    this.portals = {};

    // Main portal for general high z-index content (created by default)
    this._createPortal("main", 9999);
  }

  /**
   * Create a new portal container
   * @param {string} id - Unique identifier for the portal
   * @param {number} zIndex - Z-index for the portal (higher appears above lower)
   * @returns {HTMLElement} The portal container element
   */
  _createPortal(id, zIndex = 9999) {
    // Check if portal already exists
    if (this.portals[id]) {
      return this.portals[id];
    }

    // Create a new portal container
    const portal = document.createElement("div");
    portal.id = `portal-${id}`;
    portal.className = "ui-portal";

    // Create a style element for the portal
    const portalStyle = document.createElement("style");
    portalStyle.textContent = `
      #portal-${id} {
        z-index: ${zIndex} !important;
      }
    `;
    document.head.appendChild(portalStyle);

    // Set inline styles as well for redundancy
    portal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
      z-index: ${zIndex};
    `;

    // Add to DOM
    document.body.appendChild(portal);

    // Store reference
    this.portals[id] = portal;

    // Add a data attribute for debugging
    portal.setAttribute("data-portal-id", id);

    // Emit signal
    this.signals.portalCreated.emit(id, portal);

    return portal;
  }

  /**
   * Get a portal by ID (create if it doesn't exist)
   * @param {string} id - Portal identifier
   * @param {number} zIndex - Z-index for new portal if created
   * @returns {HTMLElement} The portal container
   */
  getPortal(id = "main", zIndex = 9999) {
    return this.portals[id] || this._createPortal(id, zIndex);
  }

  /**
   * Add an element to a portal
   * @param {HTMLElement} element - Element to add to the portal
   * @param {string} portalId - Portal identifier (default: 'main')
   * @returns {HTMLElement} The added element
   */
  addToPortal(element, portalId = "main") {
    const portal = this.getPortal(portalId);
    portal.appendChild(element);

    // Enable pointer events for the element
    element.style.pointerEvents = "auto";

    // Emit signal
    this.signals.elementAdded.emit(element, portalId);

    return element;
  }

  /**
   * Remove an element from a portal
   * @param {HTMLElement} element - Element to remove
   * @returns {boolean} True if the element was found and removed
   */
  removeFromPortal(element) {
    // Find which portal contains the element
    let foundPortal = null;
    let portalId = null;

    for (const [id, portal] of Object.entries(this.portals)) {
      if (portal.contains(element)) {
        foundPortal = portal;
        portalId = id;
        break;
      }
    }

    if (foundPortal && element.parentNode === foundPortal) {
      foundPortal.removeChild(element);
      this.signals.elementRemoved.emit(element, portalId);

      return true;
    }

    return false;
  }

  /**
   * Position an element in a portal
   * @param {HTMLElement} element - Element to position
   * @param {HTMLElement} referenceElement - Reference element for positioning
   * @param {object} options - Positioning options
   * @param {string} options.placement - Placement relative to reference (top, bottom, left, right)
   * @param {string} options.portalId - Portal identifier
   * @returns {HTMLElement} The positioned element
   */
  positionElement(element, referenceElement, options = {}) {
    const {
      placement = "bottom",
      portalId = "main",
      margin = 5,
    } = options;
    // Get reference element position
    const rect = referenceElement.getBoundingClientRect();
    // Calculate position based on placement
    let translateX, translateY;

    switch (placement) {
      case "top":
        translateX = rect.left + (rect.width / 2) - (element.offsetWidth / 2);
        translateY = rect.top - element.offsetHeight - margin;
        break;
      case "bottom":
        translateX = rect.left + (rect.width / 2) - (element.offsetWidth / 2);
        translateY = rect.bottom + margin;
        break;
      case "left":
        translateX = rect.left - element.offsetWidth - margin;
        translateY = rect.top + (rect.height / 2) - (element.offsetHeight / 2);
        break;
      case "right":
        translateX = rect.right + margin;
        translateY = rect.top + (rect.height / 2) - (element.offsetHeight / 2);
        break;
      case "bottom-left":
        translateX = rect.left;
        translateY = rect.bottom + margin;
        break;
      case "bottom-right":
        translateX = rect.right - element.offsetWidth;
        translateY = rect.bottom + margin;
        break;
      case "top-left":
        translateX = rect.left;
        translateY = rect.top - element.offsetHeight - margin;
        break;
      case "top-right":
        translateX = rect.right - element.offsetWidth;
        translateY = rect.top - element.offsetHeight - margin;
        break;
      default:
        translateX = rect.left;
        translateY = rect.bottom + margin;
    }

    // Adjust position to stay within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (translateX < 0) {
      translateX = 0;
    }

    if (translateY < 0) {
      translateY = 0;
    }

    if (translateX + element.offsetWidth > viewportWidth) {
      translateX = viewportWidth - element.offsetWidth;
    }

    if (translateY + element.offsetHeight > viewportHeight) {
      translateY = viewportHeight - element.offsetHeight;
    }

    // Set position using transforms
    element.style.position = "absolute";
    element.style.top = "0";
    element.style.left = "0";
    element.style.transform = `translate(${translateX}px, ${translateY}px)`;

    // Add to portal
    return this.addToPortal(element, portalId);
  }

  /**
   * Clean up all portals
   */
  destroy() {
    // Remove all portal elements
    for (const [id, portal] of Object.entries(this.portals)) {
      if (portal && portal.parentNode) {
        portal.parentNode.removeChild(portal);
      }
    }

    // Clear portals object
    this.portals = {};
  }
}

// Create a singleton instance
const portalManager = new PortalManager();

export default portalManager;
