"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistanceAndFare = void 0;
const haversine_distance_1 = __importDefault(require("haversine-distance"));
const calculateDistanceAndFare = (pickup, destination, baseFarePerKm = 100) => {
    const [pickupLng, pickupLat] = pickup;
    const [destLng, destLat] = destination;
    const distanceInMeters = (0, haversine_distance_1.default)({ lat: pickupLat, lon: pickupLng }, { lat: destLat, lon: destLng });
    const distanceKm = parseFloat((distanceInMeters / 1000).toFixed(2));
    const fare = parseFloat((distanceKm * baseFarePerKm).toFixed(2));
    return { distanceKm, fare };
};
exports.calculateDistanceAndFare = calculateDistanceAndFare;
