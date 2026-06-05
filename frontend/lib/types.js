/**
 * @typedef {'customer' | 'staff' | 'owner'} UserRole
 * @typedef {'available' | 'occupied' | 'reserved' | 'cleaning'} TableStatus
 * @typedef {'new' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'} OrderStatus
 * @typedef {'confirmed' | 'completed' | 'cancelled'} ReservationStatus
 * @typedef {'card' | 'mobile_money' | 'wallet'} PaymentMethod
 *
 * @typedef {Object} Restaurant
 * @property {string} _id
 * @property {string} name
 * @property {string} description
 * @property {string} coverImage
 * @property {number} rating
 * @property {string[]} cuisines
 * @property {string} address
 * @property {Object} settings
 *
 * @typedef {Object} Table
 * @property {string} _id
 * @property {number} tableNumber
 * @property {number} capacity
 * @property {number} x
 * @property {number} y
 * @property {TableStatus} status
 * @property {string} [restaurantId]
 *
 * @typedef {Object} MenuItem
 * @property {string} _id
 * @property {string} restaurantId
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {string[]} tags
 * @property {string} image
 *
 * @typedef {Object} Order
 * @property {string} _id
 * @property {OrderStatus} status
 * @property {number} total
 * @property {number} [tableNumber]
 *
 * @typedef {Object} AnalyticsSummary
 * @property {number} revenue
 * @property {number} orders
 * @property {number} reservations
 */

export {};
