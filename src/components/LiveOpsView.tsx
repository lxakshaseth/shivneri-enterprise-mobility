import React, { useState, useEffect, useRef, Fragment, useCallback } from 'react';
import { SmartDispatchLiveOpsPanel } from './dispatch';

// ─── TYPES ─────────────────────────────────────────────────────────────────
export interface PickupStop {
  id: string;
  name: string; // e.g. 'Fatima Nagar Chowk'
  employee: string; // e.g. 'Rahul Verma'
  coords: { x: number; y: number };
  time: string; // e.g. '08:05 AM'
  status: 'boarded' | 'next' | 'pending';
}

export interface LiveRide {
  id: string; // e.g. 'TRIP-10421'
  tripId: string; // e.g. 'TRIP-10421'
  employee: string; // Lead passenger e.g. 'Raj Kumar'
  employeePhone: string;
  company: string; // e.g. 'Infosys'
  driver: string; // e.g. 'Ajay Patil'
  driverPhone: string;
  vehicle: string; // Plate e.g. 'MH12AB1234'
  vehicleModel: string;
  passengers: number; // e.g. 4
  capacity: number; // e.g. 6
  currentLocation: string; // e.g. 'Baner'
  pickup: string; // e.g. 'Baner'
  pickupName: string;
  pickupCoords: { x: number; y: number };
  drop: string; // e.g. 'Infosys Phase 2'
  dropName: string;
  dropCoords: { x: number; y: number };
  waypoints?: { x: number; y: number }[];
  pickupStops?: PickupStop[]; // Where employees are to be picked up along the route
  eta: string; // e.g. '08 Minutes'
  status: 'On Route' | 'Delayed' | 'SOS' | 'Assigned';
  org: string;
  mapX: number; // percentage 0-100 on base map
  mapY: number; // percentage 0-100 on base map
  speed: number; // km/h
  heading: number; // degrees
  vehicleType: 'cab' | 'shuttle' | 'suv';
  progressStage: 'pickup' | 'on_route' | 'destination';
  progressPct: number;
}

export interface SosIncident {
  id: string;
  tripId: string;
  employee: string;
  employeePhone: string;
  company: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  vehicleModel: string;
  location: string;
  alertTime: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Resolved';
  coordinates: { x: number; y: number };
  notes: string;
  resolvedAt?: string;
}

export interface ActivityEvent {
  id: string;
  time: string;
  type: 'trip' | 'traffic' | 'sos' | 'system';
  color: string;
  bg: string;
  icon: string;
  msg: string;
  sub: string;
  tripId?: string;
  vehicle?: string;
}

// ─── WORLD DIMENSIONS (Locked 1:1 Pixel Coordinate Space) ──────────────────
const WORLD_WIDTH = 1200;
const WORLD_HEIGHT = 800;

// ─── SEED ACTIVE TRIPS WITH EMPLOYEE PICKUP STOPS ──────────────────────────
const SEED_RIDES: LiveRide[] = [
  // 1. INFOSYS - Baner to Hinjewadi Ph 2
  {
    id: 'TRIP-10421',
    tripId: 'TRIP-10421',
    employee: 'Raj Kumar',
    employeePhone: '+91 98220 10421',
    company: 'Infosys',
    driver: 'Ajay Patil',
    driverPhone: '+91 98765 43210',
    vehicle: 'MH12AB1234',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 4,
    capacity: 6,
    currentLocation: 'Baner High Street',
    pickup: 'Baner',
    pickupName: 'Baner High Street Gate',
    pickupCoords: { x: 370, y: 365 },
    drop: 'Infosys Ph2',
    dropName: 'Infosys Ph2 Gate 3',
    dropCoords: { x: 140, y: 320 },
    waypoints: [
      { x: 310, y: 320 },
      { x: 260, y: 290 },
      { x: 180, y: 280 },
    ],
    pickupStops: [
      { id: 'st-1-1', name: 'Balewadi Phata', employee: 'Pooja Sharma', coords: { x: 310, y: 320 }, time: '08:10 AM', status: 'boarded' },
      { id: 'st-1-2', name: 'Wakad Chowk', employee: 'Amit Verma', coords: { x: 260, y: 290 }, time: '08:22 AM', status: 'boarded' },
      { id: 'st-1-3', name: 'Hinjewadi Ph1', employee: 'Nitin Joshi', coords: { x: 180, y: 280 }, time: '08:35 AM', status: 'next' },
    ],
    eta: '08 Minutes',
    status: 'On Route',
    org: 'Infosys',
    mapX: 34,
    mapY: 36,
    speed: 42,
    heading: 300,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 65,
  },
  // 2. INFOSYS - Baner to Wipro Circle Ph2 (Delayed in Wakad Traffic)
  {
    id: 'TRIP-10422',
    tripId: 'TRIP-10422',
    employee: 'Sneha Rao',
    employeePhone: '+91 98111 22334',
    company: 'Infosys',
    driver: 'Suresh Yadav',
    driverPhone: '+91 98220 54321',
    vehicle: 'MH12CD5678',
    vehicleModel: 'Maruti Suzuki Ertiga (Silver)',
    passengers: 5,
    capacity: 6,
    currentLocation: 'Wakad Bridge Interchange',
    pickup: 'Baner Circle',
    pickupName: 'Baner Orchid Junction',
    pickupCoords: { x: 370, y: 365 },
    drop: 'Hinjewadi Ph2',
    dropName: 'Wipro Circle Ph2',
    dropCoords: { x: 140, y: 320 },
    waypoints: [
      { x: 320, y: 330 },
      { x: 260, y: 290 },
      { x: 190, y: 305 },
    ],
    pickupStops: [
      { id: 'st-2-1', name: 'Balewadi High St', employee: 'Kavita Nair', coords: { x: 320, y: 330 }, time: '08:15 AM', status: 'boarded' },
      { id: 'st-2-2', name: 'Wakad Bridge', employee: 'Siddharth Roy', coords: { x: 260, y: 290 }, time: '08:30 AM', status: 'next' },
      { id: 'st-2-3', name: 'Hinjewadi Ph1 Ridge', employee: 'Anil Mehta', coords: { x: 190, y: 305 }, time: '08:45 AM', status: 'pending' },
    ],
    eta: '22 Minutes',
    status: 'Delayed',
    org: 'Infosys',
    mapX: 38,
    mapY: 38,
    speed: 15,
    heading: 290,
    vehicleType: 'suv',
    progressStage: 'on_route',
    progressPct: 40,
  },
  // 3. WIPRO - Aundh to Magarpatta Cybercity
  {
    id: 'TRIP-10423',
    tripId: 'TRIP-10423',
    employee: 'Mohan Singh',
    employeePhone: '+91 98901 23456',
    company: 'Wipro',
    driver: 'Ramesh Kale',
    driverPhone: '+91 98234 56781',
    vehicle: 'MH12EF9012',
    vehicleModel: 'Toyota Etios (White)',
    passengers: 3,
    capacity: 4,
    currentLocation: 'University Flyover',
    pickup: 'Aundh',
    pickupName: 'Bremen Chowk Terminal',
    pickupCoords: { x: 420, y: 310 },
    drop: 'Magarpatta',
    dropName: 'Magarpatta Cybercity Tower 4',
    dropCoords: { x: 820, y: 560 },
    waypoints: [
      { x: 480, y: 370 },
      { x: 580, y: 410 },
      { x: 690, y: 460 },
      { x: 760, y: 520 },
    ],
    pickupStops: [
      { id: 'st-3-1', name: 'University Circle', employee: 'Rohan Kadam', coords: { x: 480, y: 370 }, time: '08:00 AM', status: 'boarded' },
      { id: 'st-3-2', name: 'Shivajinagar', employee: 'Divya Iyer', coords: { x: 580, y: 410 }, time: '08:15 AM', status: 'next' },
      { id: 'st-3-3', name: 'Koregaon Park Lane 1', employee: 'Mahesh Sen', coords: { x: 690, y: 460 }, time: '08:28 AM', status: 'pending' },
    ],
    eta: '14 Minutes',
    status: 'On Route',
    org: 'Wipro',
    mapX: 62,
    mapY: 62,
    speed: 44,
    heading: 135,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 55,
  },
  // 4. WNS - CRITICAL SOS EMERGENCY (Stationary at Hinjewadi Ph1 bypass)
  {
    id: 'TRIP-10438',
    tripId: 'TRIP-10438',
    employee: 'Priya Sharma',
    employeePhone: '+91 98224 89012',
    company: 'WNS',
    driver: 'Rakesh Patil',
    driverPhone: '+91 98901 23456',
    vehicle: 'MH12XY4567',
    vehicleModel: 'Mahindra Scorpio (Black)',
    passengers: 4,
    capacity: 6,
    currentLocation: 'Hinjewadi Phase 1 Bypass',
    pickup: 'Wakad',
    pickupName: 'Bhumkar Chowk Overpass',
    pickupCoords: { x: 260, y: 290 },
    drop: 'Hinjewadi Ph1',
    dropName: 'WNS Global Campus Gate 1',
    dropCoords: { x: 180, y: 280 },
    waypoints: [{ x: 215, y: 285 }],
    pickupStops: [
      { id: 'st-4-1', name: 'Hinjewadi Bypass (SOS Alert)', employee: 'Priya Sharma', coords: { x: 215, y: 285 }, time: '10:42 PM', status: 'next' },
    ],
    eta: 'SOS Alert',
    status: 'SOS',
    org: 'WNS',
    mapX: 19,
    mapY: 28,
    speed: 0,
    heading: 270,
    vehicleType: 'suv',
    progressStage: 'on_route',
    progressPct: 78,
  },
  // 5. TCS PUNE - Pimple Saudagar to Baner Hub (Assigned)
  {
    id: 'TRIP-10439',
    tripId: 'TRIP-10439',
    employee: 'Kavita Shinde',
    employeePhone: '+91 98567 89012',
    company: 'TCS Pune',
    driver: 'Deepak Patel',
    driverPhone: '+91 98456 78901',
    vehicle: 'MH12IJ7890',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 3,
    capacity: 4,
    currentLocation: 'Pimple Saudagar',
    pickup: 'Pimple Saudagar',
    pickupName: 'Govind Garden Chowk',
    pickupCoords: { x: 340, y: 240 },
    drop: 'Baner Rd',
    dropName: 'TCS Baner Delivery Hub',
    dropCoords: { x: 370, y: 365 },
    waypoints: [
      { x: 350, y: 280 },
      { x: 360, y: 320 },
    ],
    pickupStops: [
      { id: 'st-5-1', name: 'Aundh-Ravet Rd', employee: 'Sunil Patil', coords: { x: 350, y: 280 }, time: '08:20 AM', status: 'next' },
      { id: 'st-5-2', name: 'Baner Link Rd', employee: 'Preeti Desai', coords: { x: 360, y: 320 }, time: '08:35 AM', status: 'pending' },
    ],
    eta: '26 Minutes',
    status: 'Assigned',
    org: 'TCS Pune',
    mapX: 35,
    mapY: 26,
    speed: 28,
    heading: 215,
    vehicleType: 'cab',
    progressStage: 'pickup',
    progressPct: 20,
  },
  // 6. TCS PUNE - Koregaon Park to Hadapsar Magarpatta
  {
    id: 'TRIP-10440',
    tripId: 'TRIP-10440',
    employee: 'Vikram Sharma',
    employeePhone: '+91 98444 33221',
    company: 'TCS Pune',
    driver: 'Santosh Rao',
    driverPhone: '+91 98789 01234',
    vehicle: 'MH12KL2345',
    vehicleModel: 'Force Traveller Shuttle (White)',
    passengers: 6,
    capacity: 6,
    currentLocation: 'Bund Garden Bridge',
    pickup: 'Koregaon Park',
    pickupName: 'North Main Road Lane 5',
    pickupCoords: { x: 690, y: 460 },
    drop: 'Hadapsar',
    dropName: 'Magarpatta Tower 7',
    dropCoords: { x: 840, y: 640 },
    waypoints: [
      { x: 740, y: 510 },
      { x: 790, y: 570 },
    ],
    pickupStops: [
      { id: 'st-6-1', name: 'Kalyani Bridge', employee: 'Deepa Sen', coords: { x: 740, y: 510 }, time: '08:10 AM', status: 'boarded' },
      { id: 'st-6-2', name: 'Mundhwa Chowk', employee: 'Gaurav Bhatt', coords: { x: 790, y: 570 }, time: '08:25 AM', status: 'next' },
    ],
    eta: '11 Minutes',
    status: 'On Route',
    org: 'TCS Pune',
    mapX: 74,
    mapY: 52,
    speed: 38,
    heading: 120,
    vehicleType: 'shuttle',
    progressStage: 'on_route',
    progressPct: 70,
  },
  // 7. INFOSYS - Kothrud to Baner High Street
  {
    id: 'TRIP-10441',
    tripId: 'TRIP-10441',
    employee: 'Priya Das',
    employeePhone: '+91 98221 44321',
    company: 'Infosys',
    driver: 'Mahesh Gaikwad',
    driverPhone: '+91 98234 89012',
    vehicle: 'MH12MN6789',
    vehicleModel: 'Maruti Suzuki Dzire (Silver)',
    passengers: 3,
    capacity: 4,
    currentLocation: 'Chandani Chowk',
    pickup: 'Kothrud',
    pickupName: 'Kothrud Depot Gate 2',
    pickupCoords: { x: 430, y: 560 },
    drop: 'Baner',
    dropName: 'Baner High Street Infosys Hub',
    dropCoords: { x: 370, y: 365 },
    waypoints: [
      { x: 410, y: 490 },
      { x: 390, y: 430 },
    ],
    pickupStops: [
      { id: 'st-7-1', name: 'Chandani Chowk Bavdhan', employee: 'Abhishek Mane', coords: { x: 410, y: 490 }, time: '08:15 AM', status: 'boarded' },
      { id: 'st-7-2', name: 'Pashan Sus Rd Junction', employee: 'Swati Kulkarni', coords: { x: 390, y: 430 }, time: '08:28 AM', status: 'next' },
    ],
    eta: '06 Minutes',
    status: 'On Route',
    org: 'Infosys',
    mapX: 33,
    mapY: 50,
    speed: 45,
    heading: 340,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 65,
  },
  // 8. TCS PUNE - Pashan Sus to TCS Sahyadri Park Hinjewadi
  {
    id: 'TRIP-10444',
    tripId: 'TRIP-10444',
    employee: 'Akshat Seth',
    employeePhone: '+91 98765 10482',
    company: 'TCS Pune',
    driver: 'Sanjay Patil',
    driverPhone: '+91 98123 78901',
    vehicle: 'MH12ST9012',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 4,
    capacity: 4,
    currentLocation: 'Pashan Sus Road',
    pickup: 'Baner Rd',
    pickupName: 'Baner Orchid Hotel',
    pickupCoords: { x: 370, y: 365 },
    drop: 'Hinjewadi Ph1',
    dropName: 'TCS Sahyadri Park Main Gate',
    dropCoords: { x: 180, y: 280 },
    waypoints: [
      { x: 310, y: 330 },
      { x: 260, y: 290 },
    ],
    pickupStops: [
      { id: 'st-8-1', name: 'NH48 Balewadi Overpass', employee: 'Tanuja More', coords: { x: 310, y: 330 }, time: '08:15 AM', status: 'boarded' },
      { id: 'st-8-2', name: 'Wakad Chowk Flyover', employee: 'Sameer Dixit', coords: { x: 260, y: 290 }, time: '08:30 AM', status: 'next' },
    ],
    eta: '09 Minutes',
    status: 'On Route',
    org: 'TCS Pune',
    mapX: 29,
    mapY: 33,
    speed: 38,
    heading: 300,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 60,
  },
  // 9. COGNIZANT - Wakad to Hinjewadi Ph3 Megapolis
  {
    id: 'TRIP-10448',
    tripId: 'TRIP-10448',
    employee: 'Ananya Deshmukh',
    employeePhone: '+91 98902 44321',
    company: 'Cognizant',
    driver: 'Aniket Deshmukh',
    driverPhone: '+91 98451 90812',
    vehicle: 'MH12PQ3412',
    vehicleModel: 'Toyota Innova Crysta (Silver)',
    passengers: 5,
    capacity: 6,
    currentLocation: 'Hinjewadi Phase 2 Junction',
    pickup: 'Wakad',
    pickupName: 'Wakad Ginger Chowk',
    pickupCoords: { x: 260, y: 290 },
    drop: 'Cognizant Ph3',
    dropName: 'Cognizant Megapolis Ph3 Campus',
    dropCoords: { x: 100, y: 360 },
    waypoints: [
      { x: 180, y: 280 },
      { x: 140, y: 320 },
    ],
    pickupStops: [
      { id: 'st-9-1', name: 'Hinjewadi Ph1 Circle', employee: 'Kunal Roy', coords: { x: 180, y: 280 }, time: '08:20 AM', status: 'boarded' },
      { id: 'st-9-2', name: 'Wipro Ph2 Chowk', employee: 'Archana Shinde', coords: { x: 140, y: 320 }, time: '08:35 AM', status: 'next' },
    ],
    eta: '07 Minutes',
    status: 'On Route',
    org: 'Cognizant',
    mapX: 16,
    mapY: 33,
    speed: 46,
    heading: 235,
    vehicleType: 'suv',
    progressStage: 'on_route',
    progressPct: 72,
  },
  // 10. COGNIZANT - Shivajinagar to Kharadi EON
  {
    id: 'TRIP-10450',
    tripId: 'TRIP-10450',
    employee: 'Rohit Verma',
    employeePhone: '+91 98223 88712',
    company: 'Cognizant',
    driver: 'Nitin Shinde',
    driverPhone: '+91 98760 11234',
    vehicle: 'MH12UV5634',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 3,
    capacity: 4,
    currentLocation: 'Yerwada Bridge',
    pickup: 'Shivaji Nagar',
    pickupName: 'Shivaji Nagar Central Interchange',
    pickupCoords: { x: 580, y: 410 },
    drop: 'Kharadi',
    dropName: 'Kharadi EON Free Zone Gate 2',
    dropCoords: { x: 910, y: 410 },
    waypoints: [
      { x: 670, y: 410 },
      { x: 740, y: 410 },
      { x: 820, y: 410 },
    ],
    pickupStops: [
      { id: 'st-10-1', name: 'Sangam Bridge RTO', employee: 'Meera Nair', coords: { x: 670, y: 410 }, time: '08:05 AM', status: 'boarded' },
      { id: 'st-10-2', name: 'Kalyani Nagar Shastri Chowk', employee: 'Arjun Sengupta', coords: { x: 740, y: 410 }, time: '08:18 AM', status: 'next' },
      { id: 'st-10-3', name: 'Ramwadi Bypass', employee: 'Priya Pillai', coords: { x: 820, y: 410 }, time: '08:30 AM', status: 'pending' },
    ],
    eta: '13 Minutes',
    status: 'On Route',
    org: 'Cognizant',
    mapX: 68,
    mapY: 41,
    speed: 42,
    heading: 90,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 52,
  },
  // 11. CAPGEMINI - Aundh to Hinjewadi Ph3
  {
    id: 'TRIP-10452',
    tripId: 'TRIP-10452',
    employee: 'Pooja Kulkarni',
    employeePhone: '+91 98450 77123',
    company: 'Capgemini',
    driver: 'Sachin Jadhav',
    driverPhone: '+91 98230 45678',
    vehicle: 'MH12WX7819',
    vehicleModel: 'Maruti Suzuki Ertiga (White)',
    passengers: 4,
    capacity: 6,
    currentLocation: 'NH48 Wakad Bypass',
    pickup: 'Aundh',
    pickupName: 'Aundh DP Road Junction',
    pickupCoords: { x: 420, y: 310 },
    drop: 'Capgemini Ph3',
    dropName: 'Capgemini Tech Park Phase 3',
    dropCoords: { x: 100, y: 360 },
    waypoints: [
      { x: 330, y: 280 },
      { x: 260, y: 290 },
      { x: 170, y: 310 },
    ],
    pickupStops: [
      { id: 'st-11-1', name: 'Sangvi Phata', employee: 'Varun Saxena', coords: { x: 330, y: 280 }, time: '08:10 AM', status: 'boarded' },
      { id: 'st-11-2', name: 'Wakad Overpass', employee: 'Aditi Rao', coords: { x: 260, y: 290 }, time: '08:25 AM', status: 'next' },
      { id: 'st-11-3', name: 'Hinjewadi Ph2 Link', employee: 'Sandeep Varma', coords: { x: 170, y: 310 }, time: '08:40 AM', status: 'pending' },
    ],
    eta: '16 Minutes',
    status: 'On Route',
    org: 'Capgemini',
    mapX: 25,
    mapY: 30,
    speed: 48,
    heading: 250,
    vehicleType: 'suv',
    progressStage: 'on_route',
    progressPct: 48,
  },
  // 12. CAPGEMINI - Viman Nagar to Magarpatta City (Shuttle)
  {
    id: 'TRIP-10455',
    tripId: 'TRIP-10455',
    employee: 'Tanvi Mehta',
    employeePhone: '+91 98909 33211',
    company: 'Capgemini',
    driver: 'Ganesh More',
    driverPhone: '+91 98112 55667',
    vehicle: 'MH12ZA9021',
    vehicleModel: 'Force Traveller Shuttle (White)',
    passengers: 6,
    capacity: 6,
    currentLocation: 'Mundhwa Bridge',
    pickup: 'Viman Nagar',
    pickupName: 'Phoenix Mall North Gate',
    pickupCoords: { x: 770, y: 350 },
    drop: 'Magarpatta',
    dropName: 'Magarpatta City Tower 3',
    dropCoords: { x: 820, y: 560 },
    waypoints: [
      { x: 750, y: 420 },
      { x: 780, y: 490 },
    ],
    pickupStops: [
      { id: 'st-12-1', name: 'Ramwadi Underpass', employee: 'Naveen Jain', coords: { x: 750, y: 420 }, time: '08:15 AM', status: 'boarded' },
      { id: 'st-12-2', name: 'Mundhwa River Bridge', employee: 'Prachi Gore', coords: { x: 780, y: 490 }, time: '08:28 AM', status: 'next' },
    ],
    eta: '09 Minutes',
    status: 'On Route',
    org: 'Capgemini',
    mapX: 76,
    mapY: 46,
    speed: 36,
    heading: 160,
    vehicleType: 'shuttle',
    progressStage: 'on_route',
    progressPct: 68,
  },
  // 13. HCL TECHNOLOGIES - Senapati Bapat Rd to Blue Ridge Hinjewadi
  {
    id: 'TRIP-10458',
    tripId: 'TRIP-10458',
    employee: 'Siddharth Joshi',
    employeePhone: '+91 98811 22900',
    company: 'HCL Technologies',
    driver: 'Pradeep Kulkarni',
    driverPhone: '+91 98224 10099',
    vehicle: 'MH12BC4310',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 3,
    capacity: 4,
    currentLocation: 'Pune University Circle',
    pickup: 'Senapati Bapat Rd',
    pickupName: 'ICC Tech Towers Gate 1',
    pickupCoords: { x: 520, y: 430 },
    drop: 'HCL Hinjewadi',
    dropName: 'HCL Blue Ridge Ph1 Campus',
    dropCoords: { x: 180, y: 280 },
    waypoints: [
      { x: 480, y: 370 },
      { x: 420, y: 310 },
      { x: 310, y: 295 },
    ],
    pickupStops: [
      { id: 'st-13-1', name: 'University Gate', employee: 'Harish Salve', coords: { x: 480, y: 370 }, time: '08:05 AM', status: 'boarded' },
      { id: 'st-13-2', name: 'Bremen Chowk Aundh', employee: 'Rituja Bhise', coords: { x: 420, y: 310 }, time: '08:20 AM', status: 'next' },
      { id: 'st-13-3', name: 'Wakad Bypass', employee: 'Manish Jain', coords: { x: 310, y: 295 }, time: '08:35 AM', status: 'pending' },
    ],
    eta: '18 Minutes',
    status: 'On Route',
    org: 'HCL Technologies',
    mapX: 42,
    mapY: 33,
    speed: 40,
    heading: 305,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 42,
  },
  // 14. HCL TECHNOLOGIES - Pimpri MIDC to Kharadi WTC (Delayed in Khadki)
  {
    id: 'TRIP-10461',
    tripId: 'TRIP-10461',
    employee: 'Neha Kadam',
    employeePhone: '+91 98452 66789',
    company: 'HCL Technologies',
    driver: 'Vinod Pawar',
    driverPhone: '+91 98781 44556',
    vehicle: 'MH12DE6542',
    vehicleModel: 'Hyundai Aura (Silver)',
    passengers: 4,
    capacity: 4,
    currentLocation: 'Khadki Rail Underpass',
    pickup: 'Pimpri',
    pickupName: 'MIDC Auto Cluster Gate',
    pickupCoords: { x: 300, y: 160 },
    drop: 'Kharadi',
    dropName: 'World Trade Center Tower B',
    dropCoords: { x: 910, y: 410 },
    waypoints: [
      { x: 390, y: 210 },
      { x: 480, y: 260 },
      { x: 680, y: 310 },
      { x: 790, y: 360 },
    ],
    pickupStops: [
      { id: 'st-14-1', name: 'Kasarwadi Station', employee: 'Omkar Kadam', coords: { x: 390, y: 210 }, time: '08:10 AM', status: 'boarded' },
      { id: 'st-14-2', name: 'Khadki Underpass', employee: 'Poonam Datar', coords: { x: 480, y: 260 }, time: '08:30 AM', status: 'next' },
      { id: 'st-14-3', name: 'Viman Nagar Nagar Rd', employee: 'Suresh Pillai', coords: { x: 790, y: 360 }, time: '08:50 AM', status: 'pending' },
    ],
    eta: '25 Minutes',
    status: 'Delayed',
    org: 'HCL Technologies',
    mapX: 48,
    mapY: 26,
    speed: 16,
    heading: 125,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 35,
  },
  // 15. MPHASIS - Deccan Gymkhana to Magarpatta Cybercity
  {
    id: 'TRIP-10464',
    tripId: 'TRIP-10464',
    employee: 'Nikhil Tambe',
    employeePhone: '+91 98229 55432',
    company: 'Mphasis',
    driver: 'Kiran Salunke',
    driverPhone: '+91 98900 88776',
    vehicle: 'MH12FG8721',
    vehicleModel: 'Maruti Suzuki Dzire (Grey)',
    passengers: 4,
    capacity: 4,
    currentLocation: 'Shankarsheth Road',
    pickup: 'Deccan Gymkhana',
    pickupName: 'FC Road Goodluck Cafe',
    pickupCoords: { x: 560, y: 490 },
    drop: 'Magarpatta',
    dropName: 'Mphasis Cybercity Tower 6',
    dropCoords: { x: 820, y: 560 },
    waypoints: [
      { x: 620, y: 520 },
      { x: 710, y: 540 },
    ],
    pickupStops: [
      { id: 'st-15-1', name: 'Swargate Flyover', employee: 'Monika Baghel', coords: { x: 620, y: 520 }, time: '08:12 AM', status: 'boarded' },
      { id: 'st-15-2', name: 'Shankarsheth Road', employee: 'Ajit Ranade', coords: { x: 710, y: 540 }, time: '08:25 AM', status: 'next' },
    ],
    eta: '10 Minutes',
    status: 'On Route',
    org: 'Mphasis',
    mapX: 65,
    mapY: 53,
    speed: 39,
    heading: 105,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 62,
  },
  // 16. MPHASIS - Kalyani Nagar to Hinjewadi Ph2 Embassy
  {
    id: 'TRIP-10467',
    tripId: 'TRIP-10467',
    employee: 'Shruti Mane',
    employeePhone: '+91 98810 11987',
    company: 'Mphasis',
    driver: 'Sunil Thorat',
    driverPhone: '+91 98129 33445',
    vehicle: 'MH12HI1289',
    vehicleModel: 'Maruti Suzuki Ertiga (Silver)',
    passengers: 5,
    capacity: 6,
    currentLocation: 'Senapati Bapat Road',
    pickup: 'Kalyani Nagar',
    pickupName: 'East Riverbank Tech Hub',
    pickupCoords: { x: 730, y: 410 },
    drop: 'Hinjewadi Ph2',
    dropName: 'Embassy Tech Zone Phase 2',
    dropCoords: { x: 140, y: 320 },
    waypoints: [
      { x: 650, y: 410 },
      { x: 580, y: 410 },
      { x: 480, y: 370 },
      { x: 370, y: 365 },
      { x: 260, y: 290 },
    ],
    pickupStops: [
      { id: 'st-16-1', name: 'Shivajinagar Junction', employee: 'Hemant Godbole', coords: { x: 580, y: 410 }, time: '08:15 AM', status: 'boarded' },
      { id: 'st-16-2', name: 'Pune University Gate', employee: 'Shraddha More', coords: { x: 480, y: 370 }, time: '08:25 AM', status: 'boarded' },
      { id: 'st-16-3', name: 'Baner Orchid', employee: 'Nilesh Gaikwad', coords: { x: 370, y: 365 }, time: '08:38 AM', status: 'next' },
    ],
    eta: '20 Minutes',
    status: 'On Route',
    org: 'Mphasis',
    mapX: 45,
    mapY: 37,
    speed: 45,
    heading: 285,
    vehicleType: 'suv',
    progressStage: 'on_route',
    progressPct: 50,
  },
  // 17. ZENSAR - Kharadi to Viman Nagar Symbiosis
  {
    id: 'TRIP-10470',
    tripId: 'TRIP-10470',
    employee: 'Omkar Shirodkar',
    employeePhone: '+91 98905 66778',
    company: 'Zensar',
    driver: 'Amit Ghorpade',
    driverPhone: '+91 98762 99001',
    vehicle: 'MH12JK3490',
    vehicleModel: 'Toyota Innova Crysta (White)',
    passengers: 4,
    capacity: 6,
    currentLocation: 'Nagar Highway Checkpoint',
    pickup: 'Kharadi',
    pickupName: 'Zensar Knowledge Park',
    pickupCoords: { x: 910, y: 410 },
    drop: 'Viman Nagar',
    dropName: 'Symbiosis Campus Gate 1',
    dropCoords: { x: 770, y: 350 },
    waypoints: [
      { x: 840, y: 380 },
      { x: 800, y: 360 },
    ],
    pickupStops: [
      { id: 'st-17-1', name: 'Nagar Highway', employee: 'Shilpa Deshmukh', coords: { x: 840, y: 380 }, time: '08:10 AM', status: 'boarded' },
      { id: 'st-17-2', name: 'Ramwadi Metro', employee: 'Gaurav Karve', coords: { x: 800, y: 360 }, time: '08:22 AM', status: 'next' },
    ],
    eta: '05 Minutes',
    status: 'On Route',
    org: 'Zensar',
    mapX: 82,
    mapY: 37,
    speed: 43,
    heading: 300,
    vehicleType: 'suv',
    progressStage: 'on_route',
    progressPct: 82,
  },
  // 18. ZENSAR - Hadapsar Industrial to Baner High Street (Targeted in User Screenshot)
  {
    id: 'TRIP-10472',
    tripId: 'TRIP-10472',
    employee: 'Shweta Bhagat',
    employeePhone: '+91 98220 77665',
    company: 'Zensar',
    driver: 'Vikas Chavan',
    driverPhone: '+91 98450 11998',
    vehicle: 'MH12LM5612',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 4,
    capacity: 4,
    currentLocation: 'Camp Connector',
    pickup: 'Hadapsar',
    pickupName: 'Hadapsar Industrial Belt Gate',
    pickupCoords: { x: 840, y: 640 },
    drop: 'Baner',
    dropName: 'Baner High Street Zensar Desk',
    dropCoords: { x: 370, y: 365 },
    waypoints: [
      { x: 720, y: 550 },
      { x: 560, y: 490 },
      { x: 440, y: 530 },
      { x: 390, y: 430 },
    ],
    pickupStops: [
      { id: 'st-18-1', name: 'Fatima Nagar Chowk', employee: 'Rahul Verma', coords: { x: 720, y: 550 }, time: '07:55 AM', status: 'boarded' },
      { id: 'st-18-2', name: 'Deccan Gymkhana', employee: 'Sneha Kulkarni', coords: { x: 560, y: 490 }, time: '08:12 AM', status: 'boarded' },
      { id: 'st-18-3', name: 'Kothrud Paud Phata', employee: 'Rohan Patil', coords: { x: 440, y: 530 }, time: '08:26 AM', status: 'next' },
      { id: 'st-18-4', name: 'Pashan Sus Road', employee: 'Aditya Gadgil', coords: { x: 390, y: 430 }, time: '08:38 AM', status: 'pending' },
    ],
    eta: '24 Minutes',
    status: 'On Route',
    org: 'Zensar',
    mapX: 58,
    mapY: 50,
    speed: 41,
    heading: 300,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 45,
  },
  // 19. WIPRO - Pune Airport to Hinjewadi Ph2 (Shuttle)
  {
    id: 'TRIP-10475',
    tripId: 'TRIP-10475',
    employee: 'Devendra Rao',
    employeePhone: '+91 98118 44556',
    company: 'Wipro',
    driver: 'Pramod Jagtap',
    driverPhone: '+91 98233 77889',
    vehicle: 'MH12NO7834',
    vehicleModel: 'Force Traveller Shuttle (Silver)',
    passengers: 6,
    capacity: 6,
    currentLocation: 'Vishrantwadi Chowk',
    pickup: 'Airport (PNQ)',
    pickupName: 'Pune Airport Terminal 2 Apron',
    pickupCoords: { x: 790, y: 250 },
    drop: 'Wipro Ph2',
    dropName: 'Wipro Technologies Ph2 Campus',
    dropCoords: { x: 140, y: 320 },
    waypoints: [
      { x: 670, y: 270 },
      { x: 480, y: 320 },
      { x: 370, y: 320 },
      { x: 260, y: 290 },
    ],
    pickupStops: [
      { id: 'st-19-1', name: 'Vishrantwadi Chowk', employee: 'Pragya Mishra', coords: { x: 670, y: 270 }, time: '08:15 AM', status: 'boarded' },
      { id: 'st-19-2', name: 'Khadki Aundh Bridge', employee: 'Manish Agarwal', coords: { x: 480, y: 320 }, time: '08:30 AM', status: 'boarded' },
      { id: 'st-19-3', name: 'Sangvi Bypass', employee: 'Sheetal Joshi', coords: { x: 370, y: 320 }, time: '08:45 AM', status: 'next' },
    ],
    eta: '28 Minutes',
    status: 'On Route',
    org: 'Wipro',
    mapX: 54,
    mapY: 29,
    speed: 50,
    heading: 260,
    vehicleType: 'shuttle',
    progressStage: 'on_route',
    progressPct: 38,
  },
  // 20. TCS PUNE - Chandani Chowk Kothrud to TCS Sahyadri (Assigned)
  {
    id: 'TRIP-10478',
    tripId: 'TRIP-10478',
    employee: 'Mansi Khedekar',
    employeePhone: '+91 98906 11223',
    company: 'TCS Pune',
    driver: 'Rahul Jagdale',
    driverPhone: '+91 98440 88990',
    vehicle: 'MH12RS9145',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 4,
    capacity: 4,
    currentLocation: 'Bavdhan Flyover',
    pickup: 'Kothrud',
    pickupName: 'Chandani Chowk Kothrud',
    pickupCoords: { x: 430, y: 560 },
    drop: 'Hinjewadi Ph1',
    dropName: 'TCS Sahyadri Park Gate 2',
    dropCoords: { x: 180, y: 280 },
    waypoints: [
      { x: 370, y: 480 },
      { x: 310, y: 380 },
    ],
    pickupStops: [
      { id: 'st-20-1', name: 'Bavdhan Flyover', employee: 'Chinmay Apte', coords: { x: 370, y: 480 }, time: '08:25 AM', status: 'next' },
      { id: 'st-20-2', name: 'Pashan Sus Link', employee: 'Pallavi Chitale', coords: { x: 310, y: 380 }, time: '08:40 AM', status: 'pending' },
    ],
    eta: '19 Minutes',
    status: 'Assigned',
    org: 'TCS Pune',
    mapX: 36,
    mapY: 46,
    speed: 32,
    heading: 325,
    vehicleType: 'cab',
    progressStage: 'pickup',
    progressPct: 25,
  },
  // 21. WIPRO - Standby Fleet Hinjewadi Ph2
  {
    id: 'TRIP-10480',
    tripId: 'TRIP-10480',
    employee: 'Pooja Patil',
    employeePhone: '+91 98225 33441',
    company: 'Wipro',
    driver: 'Amol Deshpande',
    driverPhone: '+91 98761 22330',
    vehicle: 'MH12TU1098',
    vehicleModel: 'Toyota Innova Crysta (White)',
    passengers: 2,
    capacity: 6,
    currentLocation: 'Wipro Circle Ph2',
    pickup: 'Hinjewadi Ph2',
    pickupName: 'Wipro Gate 1 Staging',
    pickupCoords: { x: 140, y: 320 },
    drop: 'Hinjewadi Ph3',
    dropName: 'Megapolis Circle Drop',
    dropCoords: { x: 100, y: 360 },
    waypoints: [{ x: 120, y: 340 }],
    pickupStops: [
      { id: 'st-21-1', name: 'Phase 2/3 Connector', employee: 'Sanjay Kelkar', coords: { x: 120, y: 340 }, time: '08:30 AM', status: 'next' },
    ],
    eta: '04 Minutes',
    status: 'Assigned',
    org: 'Wipro',
    mapX: 13,
    mapY: 33,
    speed: 25,
    heading: 220,
    vehicleType: 'suv',
    progressStage: 'pickup',
    progressPct: 15,
  },
];

// ─── INITIAL SOS EMERGENCY INCIDENT ────────────────────────────────────────
const INITIAL_SOS_INCIDENT: SosIncident = {
  id: 'SOS-9042',
  tripId: 'TRIP-10438',
  employee: 'Priya Sharma',
  employeePhone: '+91 98224 89012',
  company: 'WNS',
  driver: 'Rakesh Patil',
  driverPhone: '+91 98901 23456',
  vehicle: 'MH12XY4567',
  vehicleModel: 'Mahindra Scorpio (Black)',
  location: 'Hinjewadi Phase 1 Bypass',
  alertTime: '10:42 PM',
  severity: 'High',
  status: 'Active',
  coordinates: { x: 190, y: 285 },
  notes: 'Panic button triggered by passenger. Vehicle stationary on Hinjewadi Phase 1 bypass.',
};

// ─── REAL-TIME ACTIVITY FEED STREAM ────────────────────────────────────────
const INITIAL_ACTIVITY_FEED: ActivityEvent[] = [
  {
    id: 'act-1',
    time: '10:50 PM',
    type: 'sos',
    color: 'text-emerald-400',
    bg: 'rgba(34,197,94,0.12)',
    icon: '✓',
    msg: 'Incident Protocol Standing By',
    sub: 'Emergency desk ready for operator resolution',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-2',
    time: '10:46 PM',
    type: 'sos',
    color: 'text-cyan-400',
    bg: 'rgba(34,211,238,0.12)',
    icon: '📍',
    msg: 'Location Verified — Hinjewadi Phase 1',
    sub: 'GPS beacon locked at 18.5982° N, 73.7644° E',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-3',
    time: '10:44 PM',
    type: 'sos',
    color: 'text-amber-400',
    bg: 'rgba(245,158,11,0.12)',
    icon: '📞',
    msg: 'Driver Contacted — Rakesh Patil',
    sub: 'Operations center initiated direct comms bridge',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-4',
    time: '10:43 PM',
    type: 'sos',
    color: 'text-red-400',
    bg: 'rgba(239,68,68,0.14)',
    icon: '🚨',
    msg: 'Operations Team Notified',
    sub: 'Incident escalated to safety desk · Quick response team alerted',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-5',
    time: '10:42 PM',
    type: 'sos',
    color: 'text-red-500',
    bg: 'rgba(239,68,68,0.20)',
    icon: '🚨',
    msg: 'SOS Alert Triggered',
    sub: 'Employee: Priya Sharma (WNS) · Vehicle: MH12XY4567',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-6',
    time: '10:37 PM',
    type: 'trip',
    color: 'text-emerald-400',
    bg: 'rgba(34,197,94,0.10)',
    icon: '✓',
    msg: 'Trip completed successfully',
    sub: 'Infosys Phase 2 · 4 employees dropped at destination',
    tripId: 'TRIP-10421',
    vehicle: 'MH12AB1234',
  },
];

// ─── OPERATIONS HEALTH SUMMARY METRICS ─────────────────────────────────────
const OPS_HEALTH_METRICS = {
  activeTrips: 18,
  onTimeTrips: 229,
  delayedTrips: 12,
  sosIncidents: 2,
  fleetUtilization: 91,
  etaAccuracy: 96,
};

// ─── PUNE GIS LANDMARKS & DISTRICT COORDINATES ─────────────────────────────
const PUNE_ZONES = [
  { id: 'hinjewadi-ph1', name: 'HINJEWADI PH 1', sub: 'TCS Sahyadri / Infosys', x: 180, y: 280, type: 'tech' },
  { id: 'hinjewadi-ph2', name: 'HINJEWADI PH 2', sub: 'Wipro / Tech M', x: 140, y: 320, type: 'tech' },
  { id: 'hinjewadi-ph3', name: 'HINJEWADI PH 3', sub: 'Cognizant / Megapolis', x: 100, y: 360, type: 'tech' },
  { id: 'wakad', name: 'WAKAD', sub: 'Bhumkar Chowk / NH48', x: 260, y: 290, type: 'residential' },
  { id: 'pimpri', name: 'PIMPRI - CHINCHWAD', sub: 'MIDC Auto Cluster', x: 300, y: 160, type: 'industrial' },
  { id: 'aundh', name: 'AUNDH', sub: 'Bremen Chowk / River', x: 420, y: 310, type: 'residential' },
  { id: 'baner', name: 'BANER', sub: 'High Street / Bypass', x: 370, y: 365, type: 'residential' },
  { id: 'univ', name: 'PUNE UNIVERSITY', sub: 'Ganeshkhind Reserve', x: 480, y: 370, type: 'park' },
  { id: 'sb-road', name: 'SENAPATI BAPAT RD', sub: 'ICC Tech Towers', x: 520, y: 430, type: 'commercial' },
  { id: 'shv-ngr', name: 'SHIVAJI NAGAR', sub: 'Central Transit Interchange', x: 580, y: 410, type: 'hub' },
  { id: 'deccan', name: 'DECCAN GYMKHANA', sub: 'FC Road / Mutha River', x: 560, y: 490, type: 'commercial' },
  { id: 'kothrud', name: 'KOTHRUD', sub: 'Chandani Chowk / Paud', x: 430, y: 560, type: 'residential' },
  { id: 'airport', name: 'PUNE AIRPORT (PNQ)', sub: 'Lohegaon Apron & Runway', x: 790, y: 250, type: 'airport' },
  { id: 'viman-ngr', name: 'VIMAN NAGAR', sub: 'Phoenix Mall / Symbiosis', x: 770, y: 350, type: 'commercial' },
  { id: 'kalyani', name: 'KALYANI NAGAR', sub: 'East Riverbank Tech', x: 730, y: 410, type: 'commercial' },
  { id: 'krg-park', name: 'KOREGAON PARK', sub: 'North Main Road', x: 690, y: 460, type: 'park' },
  { id: 'magarpatta', name: 'MAGARPATTA CITY', sub: 'Cybercity IT Campus', x: 820, y: 560, type: 'tech' },
  { id: 'kharadi', name: 'KHARADI EON', sub: 'World Trade Center', x: 910, y: 410, type: 'tech' },
  { id: 'hadapsar', name: 'HADAPSAR', sub: 'Industrial Belt', x: 840, y: 640, type: 'industrial' },
];

// ─── REAL-WORLD PUNE GIS MAP TILES ─────────────────────────────────────────
const PUNE_MAP_TILES = [
  { x: 2886, y: 1832 }, { x: 2887, y: 1832 }, { x: 2888, y: 1832 }, { x: 2889, y: 1832 },
  { x: 2886, y: 1833 }, { x: 2887, y: 1833 }, { x: 2888, y: 1833 }, { x: 2889, y: 1833 },
  { x: 2886, y: 1834 }, { x: 2887, y: 1834 }, { x: 2888, y: 1834 }, { x: 2889, y: 1834 },
];

// ─── HELPER: BUILD SVG POLYLINE PATH ──────────────────────────────────────
function buildPolylinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  return `M ${points[0].x},${points[0].y} ` + points.slice(1).map((p) => `L ${p.x},${p.y}`).join(' ');
}

export default function LiveOpsView() {
  // Selected ride (Defaults to Hadapsar -> Baner TRIP-10472 or Kothrud -> Baner)
  const [selectedId, setSelectedId] = useState<string | null>('TRIP-10472');
  const [tracking, setTracking] = useState<string | null>('TRIP-10472');
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'trips' | 'feed'>('trips');
  const [feedFilter, setFeedFilter] = useState<'all' | 'trip' | 'traffic' | 'sos'>('all');
  const [showSmartDispatchModal, setShowSmartDispatchModal] = useState(false);

  // SOS Incident state
  const [sosIncident, setSosIncident] = useState<SosIncident>(INITIAL_SOS_INCIDENT);
  const [showSosIncident, setShowSosIncident] = useState(false);
  const [sosNotification, setSosNotification] = useState<{
    open: boolean;
    title: string;
    desc: string;
    time: string;
    vehicle: string;
    location: string;
  } | null>(null);
  const [callModal, setCallModal] = useState<{ open: boolean; type: 'driver' | 'employee'; name: string; phone: string; title: string } | null>(null);

  // Audio alert chime using Web Audio API
  const playSosChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Browser audio restriction fallback
    }
  };

  // Handler triggered ONLY when Active SOS is clicked
  const handleOpenActiveSos = (source = 'Active SOS Click') => {
    playSosChime();
    setShowSosIncident(true);
    setSelectedId('TRIP-10438');
    setTracking('TRIP-10438');
    setZoomLevel(1.6);
    setPanOffset({ x: 260, y: 110 });
    setSosNotification({
      open: true,
      title: 'Active SOS Emergency Notification',
      desc: `${sosIncident.employee} (${sosIncident.company}) reported an emergency on ${sosIncident.vehicleModel} (${sosIncident.vehicle})`,
      time: sosIncident.alertTime,
      vehicle: sosIncident.vehicle,
      location: sosIncident.location,
    });
    showToast(`🚨 Active SOS Notification: Priya Sharma at Hinjewadi Phase 1`);
  };

  // Activity Feed state
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_FEED);

  // Filters & Dropdowns
  const [filterOrg, setFilterOrg] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Overlay Panels Visibility (DEFAULT FALSE so the map view is wide open and unobstructed!)
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  // Map Navigation & Layers State (Smooth Zoom & Zero-Lag Pan)
  const [zoomLevel, setZoomLevel] = useState(1.15);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Map Feature Layer Toggles
  const [showTraffic, setShowTraffic] = useState(true);
  const [showTechHubs, setShowTechHubs] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [mapStyle, setMapStyle] = useState<'dark-ops' | 'satellite-contrast'>('dark-ops');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3400);
  };

  // Simulation loop for live vehicle movement (Smooth 800ms heartbeat)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(id);
  }, []);

  // Filtered vehicles
  const ALL_VEHICLES = SEED_RIDES;
  const ORG_OPTIONS = [
    'All',
    'Infosys',
    'TCS Pune',
    'Wipro',
    'Cognizant',
    'Capgemini',
    'HCL Technologies',
    'Mphasis',
    'Zensar',
    'WNS',
  ];

  const filteredVehicles = ALL_VEHICLES.filter((r) => {
    const matchOrg = filterOrg === 'All' || r.org === filterOrg || r.company === filterOrg;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchOrg && matchStatus;
  });

  const selectedRide = ALL_VEHICLES.find((r) => r.id === selectedId);

  // Status color mapper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SOS':
        return '#ef4444';
      case 'Delayed':
        return '#f59e0b';
      case 'Assigned':
        return '#60a5fa';
      default:
        return '#22c55e';
    }
  };

  // ─── MATHEMATICALLY ACCURATE ROUTE-LOCKED VEHICLE POSITIONING ─────────────
  // Calculates exact (x, y) coordinates along the vehicle's road polyline
  const getVehiclePosition = useCallback((ride: LiveRide) => {
    // SOS vehicle is stationary at its incident coordinates
    if (ride.status === 'SOS') {
      const sx = ride.pickupCoords.x * 0.3 + ride.dropCoords.x * 0.7;
      const sy = ride.pickupCoords.y * 0.3 + ride.dropCoords.y * 0.7;
      return {
        x: sx,
        y: sy,
        progressPct: ride.progressPct,
        speed: 0,
        heading: ride.heading,
        eta: 'SOS Alert',
        currentLocation: ride.currentLocation,
        routePoints: [ride.pickupCoords, { x: sx, y: sy }, ride.dropCoords],
        completedPoints: [ride.pickupCoords, { x: sx, y: sy }],
        remainingPoints: [{ x: sx, y: sy }, ride.dropCoords],
      };
    }

    // Build route polyline: pickup -> waypoints -> drop
    const routePoints: { x: number; y: number }[] = [
      ride.pickupCoords,
      ...(ride.waypoints && ride.waypoints.length > 0
        ? ride.waypoints
        : [
            {
              x: (ride.pickupCoords.x + ride.dropCoords.x) / 2,
              y: (ride.pickupCoords.y + ride.dropCoords.y) / 2 - 20,
            },
          ]),
      ride.dropCoords,
    ];

    // Compute segment lengths
    const segmentLengths: number[] = [];
    let totalLength = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      const dx = routePoints[i + 1].x - routePoints[i].x;
      const dy = routePoints[i + 1].y - routePoints[i].y;
      const len = Math.hypot(dx, dy);
      segmentLengths.push(len);
      totalLength += len;
    }

    if (totalLength === 0) totalLength = 1;

    // Movement progress along the polyline
    const speedFactor = ride.status === 'Delayed' ? 0.16 : ride.status === 'Assigned' ? 0.22 : 0.45;
    const initialOffset = (ride.progressPct / 100) * totalLength;
    const currentDistance = (initialOffset + tick * speedFactor * 3.6) % totalLength;
    const currentPct = Math.round((currentDistance / totalLength) * 100);

    // Locate current segment and exact position
    let accumulated = 0;
    let currX = routePoints[0].x;
    let currY = routePoints[0].y;
    let heading = ride.heading;
    const completedPoints: { x: number; y: number }[] = [routePoints[0]];
    let remainingPoints: { x: number; y: number }[] = [];

    for (let i = 0; i < segmentLengths.length; i++) {
      const len = segmentLengths[i];
      if (accumulated + len >= currentDistance) {
        const segProgress = len > 0 ? (currentDistance - accumulated) / len : 0;
        const p0 = routePoints[i];
        const p1 = routePoints[i + 1];
        currX = p0.x + (p1.x - p0.x) * segProgress;
        currY = p0.y + (p1.y - p0.y) * segProgress;
        const angle = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;
        heading = Math.round((angle + 360) % 360);

        completedPoints.push({ x: currX, y: currY });
        remainingPoints = [{ x: currX, y: currY }, ...routePoints.slice(i + 1)];
        break;
      }
      accumulated += len;
      completedPoints.push(routePoints[i + 1]);
    }

    // Dynamic remaining minutes countdown
    const remainingDistance = Math.max(0, totalLength - currentDistance);
    const nominalTripMins = ride.status === 'Delayed' ? 24 : 18;
    const remainingMins = Math.max(1, Math.round((remainingDistance / totalLength) * nominalTripMins));
    const dynamicEta = `${remainingMins < 10 ? '0' : ''}${remainingMins} Minutes`;

    // Realistic live speed fluctuation
    const baseSpeed = ride.status === 'Delayed' ? 14 : ride.speed || 38;
    const jitter = Math.sin(tick * 0.15 + (ride.tripId.charCodeAt(6) || 0)) * 3;
    const liveSpeed = Math.max(8, Math.round(baseSpeed + jitter));

    return {
      x: currX,
      y: currY,
      progressPct: currentPct,
      speed: liveSpeed,
      heading,
      eta: dynamicEta,
      currentLocation: ride.currentLocation,
      routePoints,
      completedPoints,
      remainingPoints,
    };
  }, [tick]);

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(3.0, Math.max(0.65, +(prev + delta).toFixed(2))));
  };

  const handleResetView = () => {
    setZoomLevel(1.15);
    setPanOffset({ x: 0, y: 0 });
    setSelectedId(null);
    setTracking(null);
    showToast('Reset map to default overview');
  };

  // Center on Selected Cab
  const handleCenterOnSelected = () => {
    if (!selectedRide) return;
    const vPos = getVehiclePosition(selectedRide);
    const targetPanX = -(vPos.x - WORLD_WIDTH / 2) * zoomLevel * 0.7;
    const targetPanY = -(vPos.y - WORLD_HEIGHT / 2) * zoomLevel * 0.7;
    setPanOffset({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
    setZoomLevel(1.4);
    showToast(`Centered on ${selectedRide.vehicle} (${selectedRide.pickup} → ${selectedRide.drop})`);
  };

  // Mouse Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoomLevel((prev) => Math.min(3.0, Math.max(0.65, +(prev + delta).toFixed(2))));
  };

  // Drag Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.pointer-events-auto')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Glass style generator
  const glassPanel = (opacity = 0.88): React.CSSProperties => ({
    background: `rgba(9, 18, 36, ${opacity})`,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
  });

  return (
    <div
      className="flex flex-col h-full w-full select-none overflow-hidden relative"
      style={{ background: '#040914' }}>

      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 dialog-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {toast}
        </div>
      )}

      {/* ─── SMART DYNAMIC DISPATCH CENTER MODAL ─── */}
      {showSmartDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-6xl h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center text-lg border border-blue-500/40">
                  ⚡
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Smart Dynamic Dispatch & Reassignment Center</h2>
                  <p className="text-xs text-slate-400">Integrated Live Operations Command & Autonomous SLA Protection</p>
                </div>
              </div>
              <button
                onClick={() => setShowSmartDispatchModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
              <SmartDispatchLiveOpsPanel />
            </div>
          </div>
        </div>
      )}

      {/* ─── TOP KPI DISPATCH BAR ─────── */}
      <header
        className="flex items-center gap-3 px-5 py-2.5 z-30 flex-shrink-0"
        style={glassPanel(0.95)}>
        <div className="flex items-center gap-2.5 border-r border-white/10 pr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <h1 className="text-xs font-bold text-white tracking-wide uppercase">
              Live Operations Control
            </h1>
            <p className="text-[10px] text-slate-400">Shivneri Pune Metropolitan Hub</p>
          </div>
        </div>

        {/* KPI Metric Cards */}
        <div className="flex items-center gap-4 text-xs overflow-x-auto py-0.5">
          {[
            { label: 'Active Trips', val: '18', color: '#38bdf8', icon: '🚘', action: 'all' },
            { label: 'On-Time Trips', val: '229', color: '#22c55e', icon: '⏱️', action: 'on-time' },
            { label: 'Delayed Trips', val: '12', color: '#f59e0b', icon: '⚠️', action: 'delayed' },
            {
              label: 'SOS Incidents',
              val: sosIncident.status === 'Active' ? '1 Active' : '0 Active (1 Solved)',
              color: sosIncident.status === 'Active' ? '#ef4444' : '#22c55e',
              icon: '🚨',
              pulse: sosIncident.status === 'Active',
              isSos: true,
            },
            { label: 'Fleet Utilization', val: '91%', color: '#38bdf8', icon: '📊', action: 'utilization' },
            { label: 'ETA Accuracy', val: '96%', color: '#22c55e', icon: '🎯', action: 'accuracy' },
          ].map((kpi) => {
            const isSosCard = (kpi as { isSos?: boolean }).isSos;
            return (
              <div
                key={kpi.label}
                onClick={() => {
                  if (isSosCard) {
                    handleOpenActiveSos('Active SOS KPI Card');
                  } else if (kpi.action === 'all') {
                    setFilterStatus('All');
                    setFilterOrg('All');
                    showToast('Showing all Active Commute Trips across Pune');
                  } else if (kpi.action === 'on-time') {
                    setFilterStatus('On Route');
                    showToast('Filtered for On-Time Trips on route');
                  } else if (kpi.action === 'delayed') {
                    setFilterStatus('Delayed');
                    showToast('Filtered for Delayed Trips with bottlenecks');
                  } else if (kpi.action === 'utilization') {
                    showToast('📊 Fleet Utilization: 91% (18 of 21 vehicles actively on transit)');
                  } else if (kpi.action === 'accuracy') {
                    showToast('🎯 ETA Accuracy: 96% across Hinjewadi and Hadapsar routes');
                  }
                }}
                title={isSosCard ? 'Click to view SOS Emergency' : 'Click to filter'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border flex-shrink-0 transition-all cursor-pointer ${
                  isSosCard
                    ? sosIncident.status === 'Active'
                      ? 'bg-red-950/40 border-red-500/50 hover:bg-red-900/50 hover:border-red-400 shadow-lg shadow-red-950/50 ring-1 ring-red-500/40 hover:scale-105 active:scale-95'
                      : 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-900/30'
                    : 'bg-white/4 border-white/5 hover:bg-white/10 hover:border-slate-600'
                }`}>
                <span className="text-sm">{kpi.icon}</span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold font-mono" style={{ color: kpi.color }}>
                      {kpi.val}
                    </span>
                    {kpi.pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">{kpi.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Status Filter */}
          <div
            className="flex gap-1 rounded-xl p-0.5 border"
            style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            {['All', 'On Route', 'Delayed', 'Assigned', 'SOS'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilterStatus(s);
                  if (s === 'SOS') {
                    handleOpenActiveSos('Status Filter: SOS');
                  } else if (s === 'Assigned') {
                    showToast('Showing Assigned & Standby vehicles');
                  }
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer"
                style={
                  filterStatus === s
                    ? {
                        background:
                          s === 'SOS'
                            ? '#dc2626'
                            : s === 'Delayed'
                            ? '#d97706'
                            : s === 'On Route'
                            ? '#16a34a'
                            : s === 'Assigned'
                            ? '#2563eb'
                            : '#0284c7',
                        color: '#ffffff',
                      }
                    : { color: '#94a3b8' }
                }>
                {s}
              </button>
            ))}
          </div>

          {/* Org Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-xl border transition-all text-slate-200 cursor-pointer"
              style={{ background: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              <span>🏢 {filterOrg === 'All' ? 'All Companies' : filterOrg}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>
            {isOrgDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-44 rounded-xl shadow-2xl border border-slate-700 py-1 z-50 bg-slate-900 text-xs max-h-72 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                {ORG_OPTIONS.map((orgName) => (
                  <button
                    key={orgName}
                    onClick={() => {
                      setFilterOrg(orgName);
                      setIsOrgDropdownOpen(false);
                      showToast(`Filter applied: ${orgName}`);
                    }}
                    className={`w-full text-left px-3 py-1.5 transition-colors flex items-center justify-between cursor-pointer ${
                      filterOrg === orgName ? 'bg-blue-600/30 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}>
                    <span>{orgName}</span>
                    {filterOrg === orgName && <span className="text-cyan-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Smart Dynamic Dispatch Button */}
          <button
            onClick={() => setShowSmartDispatchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md cursor-pointer border border-blue-400/40">
            <span>⚡</span>
            <span>Smart Dispatch</span>
            <span className="text-[9px] bg-emerald-400 text-slate-900 px-1.5 py-0.2 rounded font-black font-mono">
              SLA
            </span>
          </button>
        </div>
      </header>

      {/* ─── MAIN WORKSPACE: MAP VIEWPORT + PANELS ───────────────────────── */}
      <div
        id="map-canvas-container"
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}>

        {/* ─── LOCKED WORLD CONTAINER (1200x800 1:1 Pixel Lock) ─────────────── */}
        <div
          id="map-world-container"
          style={{
            width: `${WORLD_WIDTH}px`,
            height: `${WORLD_HEIGHT}px`,
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: `-${WORLD_WIDTH / 2}px`,
            marginTop: `-${WORLD_HEIGHT / 2}px`,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '50% 50%',
            transition: isDragging ? 'none' : 'transform 0.22s ease-out',
          }}>

          {/* 1. Real-World Pune Base Map Tiles */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 select-none pointer-events-none w-[1200px] h-[800px] overflow-hidden">
            {PUNE_MAP_TILES.map((t) => (
              <div key={`${t.x}-${t.y}`} className="relative w-full h-full bg-slate-950 overflow-hidden">
                <img
                  src={`https://tile.openstreetmap.org/12/${t.x}/${t.y}.png`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://tile.openstreetmap.org/12/${t.x}/${t.y}.png`;
                  }}
                  alt={`OpenStreetMap Pune ${t.x},${t.y}`}
                  className="w-full h-full object-cover transition-opacity duration-500 pointer-events-none"
                  style={{
                    filter:
                      mapStyle === 'satellite-contrast'
                        ? 'contrast(1.15) brightness(0.85)'
                        : 'contrast(1.08) brightness(0.92)',
                    opacity: mapStyle === 'satellite-contrast' ? 0.85 : 0.88,
                  }}
                  loading="eager"
                />
              </div>
            ))}
          </div>

          {/* 2. SVG Vector Cartography Layer (River, Traffic, Corridors & Stops) */}
          <svg
            className="w-[1200px] h-[800px] absolute inset-0 z-10 overflow-visible pointer-events-none"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none">
            <defs>
              <linearGradient id="mulaMuthaRiverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="45%" stopColor="#0e7490" />
                <stop offset="65%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              <radialGradient id="puneNightGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0d2342" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#081426" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#040914" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="selectedRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              <filter id="highwayGlow">
                <feGaussianBlur stdDeviation="2.5" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Translucent Layer */}
            <rect width="1200" height="800" fill="rgba(4, 9, 20, 0.42)" />

            {/* Metro Center Ambient Light */}
            <circle cx="560" cy="440" r="420" fill="url(#puneNightGlow)" />

            {/* ─── REAL MULA-MUTHA RIVER NETWORK ─── */}
            <g id="pune-rivers">
              <path d="M 160,80 Q 240,110 320,130 Q 380,150 430,220" fill="none" stroke="url(#mulaMuthaRiverGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
              <path d="M 120,290 Q 180,270 240,310 Q 300,350 380,310 Q 430,270 490,320 Q 530,360 580,390" fill="none" stroke="url(#mulaMuthaRiverGrad)" strokeWidth="11" strokeLinecap="round" opacity="0.85" />
              <path d="M 380,680 Q 460,590 520,530 Q 560,480 580,390" fill="none" stroke="url(#mulaMuthaRiverGrad)" strokeWidth="9" strokeLinecap="round" opacity="0.8" />
              <path d="M 580,390 Q 640,380 700,430 Q 760,460 840,410 Q 920,380 1060,390" fill="none" stroke="url(#mulaMuthaRiverGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.9" />
            </g>

            {/* ─── LIVE TRAFFIC HEATMAP OVERLAY ─── */}
            {showTraffic && (
              <g id="traffic-overlay">
                <path d="M 215,250 Q 230,270 245,290" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" opacity="0.9" filter="url(#highwayGlow)" />
                <circle cx="230" cy="270" r="14" fill="#ef4444" opacity="0.25" className="pulse-dot" />
                <path d="M 395,480 Q 410,500 425,525" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
                <path d="M 570,400 Q 580,410 595,420" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
                <path d="M 800,550 Q 820,560 835,570" fill="none" stroke="#f59e0b" strokeWidth="4" opacity="0.8" />
              </g>
            )}

            {/* ─── ROUTE CORRIDORS, PICKUP STOPS & DESTINATION DROP ─────────── */}
            {showRoutes &&
              filteredVehicles.map((ride) => {
                const isSelected = selectedId === ride.id;
                const vPos = getVehiclePosition(ride);
                const pickupPt = ride.pickupCoords;
                const dropPt = ride.dropCoords;

                if (!isSelected) {
                  // Non-selected subtle ambient corridor
                  return (
                    <path
                      key={ride.id + '-ambient-route'}
                      d={buildPolylinePath(vPos.routePoints)}
                      fill="none"
                      stroke="rgba(56, 189, 248, 0.22)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                }

                // ─── ACTIVE SELECTED TRIP: ROUTE + ALL EMPLOYEE PICKUP STOPS + DROP ───
                return (
                  <Fragment key={ride.id + '-highlight-route'}>
                    {/* 1. Road corridor casing */}
                    <path
                      d={buildPolylinePath(vPos.routePoints)}
                      fill="none"
                      stroke="#071529"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />

                    {/* 2. Completed Segment (Traveled up to moving cab) */}
                    <path
                      d={buildPolylinePath(vPos.completedPoints)}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />

                    {/* 3. Upcoming Segment (Cab to Destination Drop) */}
                    <path
                      d={buildPolylinePath(vPos.remainingPoints)}
                      fill="none"
                      stroke="url(#selectedRouteGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="8 5"
                      filter="url(#highwayGlow)"
                    />

                    {/* 4. INITIAL START / PICKUP POINT NODE */}
                    <g transform={`translate(${pickupPt.x}, ${pickupPt.y})`}>
                      <circle r="14" fill="#22c55e" opacity="0.3" className="pulse-dot" />
                      <circle r="7" fill="#22c55e" stroke="#ffffff" strokeWidth="2.5" />
                      <g transform="translate(0, -18)">
                        <rect x="-65" y="-12" width="130" height="20" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="#22c55e" strokeWidth="1" />
                        <text textAnchor="middle" dy="2" fill="#22c55e" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          📍 Start: {ride.pickup} ({ride.employee})
                        </text>
                      </g>
                    </g>

                    {/* 5. INTERMEDIATE EMPLOYEE PICKUP STOPS (Kaha Kaha se pick krna h employee ko) */}
                    {ride.pickupStops &&
                      ride.pickupStops.map((stop, sIdx) => {
                        const isBoarded = stop.status === 'boarded';
                        const isNext = stop.status === 'next';
                        const stopColor = isBoarded ? '#10b981' : isNext ? '#38bdf8' : '#f59e0b';
                        return (
                          <g key={stop.id} transform={`translate(${stop.coords.x}, ${stop.coords.y})`}>
                            {isNext && <circle r="15" fill={stopColor} opacity="0.35" className="pulse-dot" />}
                            <circle r="7" fill={stopColor} stroke="#ffffff" strokeWidth="2" />
                            {/* Employee Pickup Stop Label Badge */}
                            <g transform="translate(0, -19)">
                              <rect
                                x="-70"
                                y="-12"
                                width="140"
                                height="20"
                                rx="6"
                                fill="rgba(15, 23, 42, 0.95)"
                                stroke={stopColor}
                                strokeWidth="1"
                              />
                              <text textAnchor="middle" dy="2" fill={stopColor} fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">
                                👤 Stop {sIdx + 2}: {stop.name} · {stop.employee}
                              </text>
                            </g>
                          </g>
                        );
                      })}

                    {/* 6. FINAL OFFICE DROP DESTINATION NODE */}
                    <g transform={`translate(${dropPt.x}, ${dropPt.y})`}>
                      <circle r="16" fill="#3b82f6" opacity="0.3" className="pulse-dot" />
                      <circle r="8" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />
                      <g transform="translate(0, -20)">
                        <rect x="-70" y="-12" width="140" height="20" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="1" />
                        <text textAnchor="middle" dy="2" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          🏢 Drop: {ride.drop}
                        </text>
                      </g>
                    </g>
                  </Fragment>
                );
              })}

            {/* ─── PUNE DISTRICT & HUB LABELS ─── */}
            <g id="district-labels">
              {PUNE_ZONES.map((zone) => {
                const isTech = zone.type === 'tech';
                return (
                  <g key={zone.id} transform={`translate(${zone.x}, ${zone.y})`}>
                    <circle r={isTech ? 4.5 : 2.5} fill={isTech ? '#0284c7' : '#334155'} stroke={isTech ? '#38bdf8' : '#64748b'} strokeWidth="1" />
                    <text y="-8" fill={isTech ? '#e0f2fe' : '#94a3b8'} fontSize={isTech ? 9.5 : 8} fontWeight={isTech ? '800' : '600'} fontFamily="monospace" textAnchor="middle">
                      {zone.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* 3. Vehicle Markers Layer (Strictly 1:1 Pixel Locked to Route Polyline) */}
          <div className="absolute inset-0 w-[1200px] h-[800px] pointer-events-none z-20">
            {filteredVehicles.map((ride) => {
              const vPos = getVehiclePosition(ride);
              const isSel = selectedId === ride.id;
              const isSos = ride.status === 'SOS';
              const color = getStatusColor(ride.status);

              return (
                <div
                  key={ride.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSos) {
                      handleOpenActiveSos('Map SOS Marker');
                    } else {
                      setShowSosIncident(false);
                      // Tapping cab selects the cab and shows route + employee pickup stops (NO POPUP!)
                      setSelectedId(isSel ? null : ride.id);
                      if (!isSel) {
                        setTracking(ride.id);
                        showToast(`Route: ${ride.pickup} → ${ride.drop} (${ride.passengers} Employee Pickups)`);
                      }
                    }
                  }}
                  className="absolute pointer-events-auto cursor-pointer group"
                  style={{
                    left: `${vPos.x}px`,
                    top: `${vPos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSos ? 40 : isSel ? 35 : 25,
                    transition: 'left 800ms linear, top 800ms linear',
                  }}>
                  {/* Radar pulse for moving or SOS vehicle */}
                  {(isSos || isSel) && (
                    <div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: isSos ? 48 : 36,
                        height: isSos ? 48 : 36,
                        top: isSos ? -14 : -8,
                        left: isSos ? -14 : -8,
                        border: `2px solid ${isSos ? '#ef4444' : '#38bdf8'}`,
                        animation: 'ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite',
                        opacity: 0.6,
                      }}
                    />
                  )}

                  {/* Vehicle Badge Icon */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold shadow-2xl transition-transform ${
                      isSel ? 'scale-115 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                    style={{
                      background:
                        isSos
                          ? 'linear-gradient(135deg, #ef4444, #991b1b)'
                          : isSel
                          ? 'linear-gradient(135deg, #0284c7, #2563eb)'
                          : 'linear-gradient(135deg, #1e293b, #0f172a)',
                      border: `1.5px solid ${color}`,
                      boxShadow: `0 0 16px ${color}88`,
                    }}>
                    {isSos ? '🚨' : ride.vehicleType === 'shuttle' ? '🚐' : ride.vehicleType === 'suv' ? '🚙' : '🚗'}

                    {/* Compass heading arrow */}
                    {!isSos && (
                      <div
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center text-[7px] text-cyan-300 font-bold transition-transform duration-300 pointer-events-none"
                        style={{ transform: `rotate(${vPos.heading}deg)` }}>
                        ▲
                      </div>
                    )}
                  </div>

                  {/* Tooltip HUD on Hover */}
                  <div
                    className={`absolute left-10 -top-2 px-2.5 py-1.5 rounded-xl border whitespace-nowrap z-50 transition-opacity pointer-events-none ${
                      isSel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={glassPanel(0.95)}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      <span className="font-mono font-bold text-white text-[11px]">{ride.vehicle}</span>
                      <span className="text-[10px] text-slate-400">· {ride.driver} ({ride.company})</span>
                    </div>
                    <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-2">
                      <span>{ride.pickup} → {ride.drop}</span>
                      <span className="font-mono text-cyan-300">{vPos.speed} km/h</span>
                      <strong className="text-emerald-400 font-mono">{vPos.eta}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── TOP ROUTE PROGRESS HUD (COMPACT STEPPER WITH EMPLOYEE PICKUP STOPS) ─ */}
        {selectedRide && (() => {
          const vPos = getVehiclePosition(selectedRide);
          return (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-2xl flex items-center gap-3.5 text-xs shadow-2xl border animate-in fade-in slide-in-from-top-2 max-w-[85vw] overflow-x-auto"
              style={glassPanel(0.96)}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-sm font-bold text-white font-mono">{selectedRide.vehicle}</span>
                <span className="text-[11px] text-slate-300 font-medium">({selectedRide.driver} · {selectedRide.company})</span>
              </div>

              <div className="h-4 w-px bg-white/20 flex-shrink-0" />

              {/* Sequential Employee Pickup Stops Chain */}
              <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto text-[11px]">
                {/* Initial Boarding */}
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>📍 {selectedRide.pickup} ({selectedRide.employee})</span>
                </div>

                {/* Intermediate Employee Pickups */}
                {selectedRide.pickupStops &&
                  selectedRide.pickupStops.map((stop) => (
                    <Fragment key={stop.id}>
                      <span className="text-slate-600 font-mono">→</span>
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                          stop.status === 'boarded'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                            : stop.status === 'next'
                            ? 'bg-cyan-950/70 text-cyan-300 border-cyan-400/60 font-bold ring-1 ring-cyan-400/40'
                            : 'bg-slate-900/60 text-slate-400 border-slate-700/40'
                        }`}>
                        <span>{stop.status === 'boarded' ? '✓' : stop.status === 'next' ? '📍' : '⏳'}</span>
                        <span>👤 {stop.employee} ({stop.name})</span>
                      </div>
                    </Fragment>
                  ))}

                <span className="text-slate-600 font-mono">→</span>

                {/* Final Destination Drop */}
                <div className="flex items-center gap-1 text-blue-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>🏢 {selectedRide.drop}</span>
                </div>
              </div>

              <div className="h-4 w-px bg-white/20 flex-shrink-0" />

              <div className="font-mono text-emerald-400 font-bold text-xs flex-shrink-0">
                ETA: {vPos.eta}
              </div>

              {/* Close / Deselect Button */}
              <button
                onClick={() => setSelectedId(null)}
                className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer flex-shrink-0"
                title="Deselect Cab">
                ✕
              </button>
            </div>
          );
        })()}

        {/* ─── FLOATING ZOOM & MAP CONTROLS ───────────────────────────────── */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20 transition-all duration-300">
          <button
            onClick={() => handleZoom(0.25)}
            title="Zoom In (+)"
            className="w-8 h-8 rounded-xl text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            style={glassPanel(0.85)}>
            +
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            title="Zoom Out (−)"
            className="w-8 h-8 rounded-xl text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            style={glassPanel(0.85)}>
            −
          </button>
          <button
            onClick={handleResetView}
            title="Reset Centered Overview (⊙)"
            className="w-8 h-8 rounded-xl text-slate-300 hover:text-cyan-400 flex items-center justify-center text-xs transition-colors cursor-pointer"
            style={glassPanel(0.85)}>
            ⊙
          </button>
          {selectedRide && (
            <button
              onClick={handleCenterOnSelected}
              title="Center on Selected Cab (🎯)"
              className="w-8 h-8 rounded-xl text-cyan-300 hover:text-white ring-1 ring-cyan-400/60 bg-blue-600/30 flex items-center justify-center text-xs transition-colors cursor-pointer"
              style={glassPanel(0.85)}>
              🎯
            </button>
          )}
          <button
            onClick={() => setShowTraffic((t) => !t)}
            title="Toggle Live Traffic Heatmap"
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors cursor-pointer ${
              showTraffic ? 'text-amber-400 ring-1 ring-amber-400/50' : 'text-slate-400'
            }`}
            style={glassPanel(0.85)}>
            🚦
          </button>
          <button
            onClick={() => setMapStyle((s) => (s === 'dark-ops' ? 'satellite-contrast' : 'dark-ops'))}
            title={mapStyle === 'dark-ops' ? 'Switch to Real-World Satellite' : 'Switch to Real-World Dark GIS'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors cursor-pointer ${
              mapStyle === 'satellite-contrast' ? 'text-cyan-400 ring-1 ring-cyan-400/50' : 'text-slate-400 hover:text-white'
            }`}
            style={glassPanel(0.85)}>
            {mapStyle === 'satellite-contrast' ? '🛰️' : '🗺️'}
          </button>
          {/* Optional Right Drawer Toggle (Only opened if user explicitly clicks here) */}
          <button
            onClick={() => setShowRightPanel((prev) => !prev)}
            title={showRightPanel ? 'Hide Details Panel' : 'Open Trip Details & Stats Panel'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors cursor-pointer ${
              showRightPanel ? 'text-cyan-400 ring-1 ring-cyan-400/60 bg-blue-600/20' : 'text-slate-300 hover:text-white'
            }`}
            style={glassPanel(0.85)}>
            📊
          </button>
          <button
            onClick={() => setShowLeftPanel((prev) => !prev)}
            title={showLeftPanel ? 'Hide Dispatch Stream' : 'Open Dispatch Stream'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors cursor-pointer ${
              showLeftPanel ? 'text-emerald-400 ring-1 ring-emerald-400/60 bg-emerald-500/20' : 'text-slate-300 hover:text-white'
            }`}
            style={glassPanel(0.85)}>
            📋
          </button>
        </div>

        {/* Mapbox Live GIS Attribution */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg pointer-events-auto select-none">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-white tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-mono tracking-tight font-extrabold">OpenStreetMap</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">© OpenStreetMap contributors</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-800/40">
            OSM Live Active
          </span>
        </div>

        {/* ─── OPTIONAL LEFT PANEL: ACTIVE TRIPS & DISPATCH STREAM ─────────── */}
        {showLeftPanel && (
          <div
            className="absolute left-4 top-4 bottom-4 w-80 flex flex-col overflow-hidden rounded-2xl z-20 animate-in slide-in-from-left duration-200"
            style={glassPanel(0.95)}>
            <div className="p-3.5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Dispatch Stream
                  </h3>
                </div>
                <button
                  onClick={() => setShowLeftPanel(false)}
                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Close Stream">
                  ✕
                </button>
              </div>

              <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('trips')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'trips'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}>
                  Active Trips ({filteredVehicles.length})
                </button>
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'feed'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}>
                  Activity Feed ({activityFeed.length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {activeTab === 'trips' ? (
                filteredVehicles.map((ride) => {
                  const isSel = selectedId === ride.id;
                  const color = getStatusColor(ride.status);
                  const vPos = getVehiclePosition(ride);
                  return (
                    <div
                      key={ride.id}
                      onClick={() => {
                        if (ride.status === 'SOS') {
                          handleOpenActiveSos('Active Trips Stream');
                        } else {
                          setShowSosIncident(false);
                          setSelectedId(isSel ? null : ride.id);
                          if (!isSel) setTracking(ride.id);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-blue-600/25 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                          : 'bg-white/3 border-white/5 hover:border-slate-600 hover:bg-white/5'
                      }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-white tracking-wide">
                          {ride.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                          />
                          <span className="text-[10px] font-bold" style={{ color }}>
                            {ride.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-200 font-semibold">
                        {ride.driver} · <span className="text-cyan-300 font-mono font-normal">{ride.vehicle}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Employee: <strong className="text-white">{ride.employee}</strong> ({ride.company})
                      </div>

                      <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5 mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <span>📍 {ride.pickup}</span>
                          <span className="text-slate-500">→</span>
                          <span>🏢 {ride.drop}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-700"
                            style={{ width: `${vPos.progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          ETA: {vPos.eta}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          👥 {ride.passengers} / {ride.capacity} Passengers · {vPos.speed} km/h
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 pb-2 border-b border-white/5 overflow-x-auto text-[10px]">
                    {(['all', 'trip', 'traffic', 'sos'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFeedFilter(cat)}
                        className={`px-2 py-0.5 rounded-md font-semibold capitalize transition-colors cursor-pointer ${
                          feedFilter === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>

                  {activityFeed.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl border border-white/5 transition-all"
                      style={{ background: evt.bg }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-bold flex items-center gap-1.5 ${evt.color}`}>
                          <span>{evt.icon}</span>
                          <span>{evt.msg}</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{evt.time}</span>
                      </div>
                      <div className="text-[10px] text-slate-300 pl-4">{evt.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── OPTIONAL RIGHT PANEL: DETAILS (Only shown if user explicitly clicks 📊 button) ─ */}
        {showRightPanel && (
          <div
            className="absolute right-4 top-4 bottom-4 w-80 flex flex-col gap-3 overflow-y-auto pr-1 z-20 animate-in slide-in-from-right duration-200"
            style={{ scrollbarWidth: 'none' }}>

            {selectedRide && (() => {
              const liveSelected = getVehiclePosition(selectedRide);
              return (
                <div
                  className="rounded-2xl p-4 border border-cyan-500/40 shadow-2xl flex-shrink-0 dialog-in"
                  style={glassPanel(0.96)}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        Active Trip Telemetry
                      </span>
                      <h3 className="text-sm font-bold text-white font-mono mt-0.5">
                        {selectedRide.tripId}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowRightPanel(false)}
                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Close Panel">
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Vehicle Plate', val: selectedRide.vehicle, isMono: true, highlight: true },
                      { label: 'Vehicle Model', val: selectedRide.vehicleModel },
                      { label: 'Driver', val: selectedRide.driver },
                      { label: 'Lead Employee', val: selectedRide.employee },
                      { label: 'Organization', val: selectedRide.company },
                      { label: 'Passengers', val: `${selectedRide.passengers} / ${selectedRide.capacity}` },
                      { label: 'Live Speed', val: `${liveSelected.speed} km/h (Cruising)`, isMono: true },
                      { label: 'Destination', val: selectedRide.drop },
                      { label: 'Live ETA', val: liveSelected.eta, isMono: true, isGreen: true },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400 text-[11px]">{row.label}:</span>
                        <span
                          className={`text-[11px] font-semibold ${
                            row.isMono ? 'font-mono' : ''
                          } ${row.isGreen ? 'text-emerald-400' : row.highlight ? 'text-cyan-300' : 'text-white'}`}>
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <button
                      onClick={() =>
                        setCallModal({
                          open: true,
                          type: 'driver',
                          name: selectedRide.driver,
                          phone: selectedRide.driverPhone,
                          title: `Driver Call — ${selectedRide.vehicle}`,
                        })
                      }
                      className="py-2 px-3 text-xs font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs text-center cursor-pointer">
                      📞 Call Driver
                    </button>
                    <button
                      onClick={() =>
                        setCallModal({
                          open: true,
                          type: 'employee',
                          name: selectedRide.employee,
                          phone: selectedRide.employeePhone,
                          title: `Employee Comms — ${selectedRide.company}`,
                        })
                      }
                      className="py-2 px-3 text-xs font-semibold text-cyan-200 hover:text-white rounded-xl border border-cyan-500/30 hover:bg-cyan-600/20 transition-colors text-center cursor-pointer">
                      📱 Passenger
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Operations Health Summary */}
            <div className="rounded-2xl p-4 flex-shrink-0" style={glassPanel(0.90)}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Operations Summary
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  DAILY
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                  <span className="text-slate-300">Active Trips</span>
                  <span className="text-white font-mono font-bold">{OPS_HEALTH_METRICS.activeTrips}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                  <span className="text-slate-300">On-Time Trips</span>
                  <span className="text-emerald-400 font-mono font-bold">{OPS_HEALTH_METRICS.onTimeTrips}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                  <span className="text-slate-300">Delayed Trips</span>
                  <span className="text-amber-400 font-mono font-bold">{OPS_HEALTH_METRICS.delayedTrips}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                  <span className="text-slate-300">Fleet Utilization</span>
                  <span className="text-cyan-300 font-mono font-bold">{OPS_HEALTH_METRICS.fleetUtilization}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MAP BOTTOM LEGEND ─────────────────────────────────────────── */}
        {!selectedRide && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-5 px-5 py-2 rounded-full z-20"
            style={glassPanel(0.85)}>
            {[
              ['#22c55e', 'On Route'],
              ['#f59e0b', 'Delayed (+10m)'],
              ['#ef4444', 'Emergency SOS'],
              ['#60a5fa', 'Assigned / Standby'],
            ].map(([col, title]) => (
              <div key={title} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0"
                  style={{ background: col, boxShadow: `0 0 6px ${col}` }}
                />
                <span className="text-[11px] text-slate-300 font-medium">{title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── INTERACTIVE CALL MODAL (DIALER SIMULATOR) ───────────────────── */}
      {callModal && callModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md dialog-in"
          onClick={() => setCallModal(null)}>
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/40 p-6"
            style={{ background: '#091122' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-600/30 border-2 border-cyan-400 mx-auto flex items-center justify-center text-2xl animate-pulse">
                📞
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{callModal.title}</h3>
                <p className="text-xs text-cyan-300 font-semibold mt-1">{callModal.name}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{callModal.phone}</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/5 text-[11px] text-slate-300 text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch Desk:</span>
                  <span className="text-white font-mono">Pune Central Ops</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Audio Codec:</span>
                  <span className="text-emerald-400 font-mono">Encrypted VoIP (HD)</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <a
                  href={`tel:${callModal.phone}`}
                  onClick={() => showToast(`Calling ${callModal.name} at ${callModal.phone}…`)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center shadow-md transition-colors cursor-pointer">
                  Direct Dial
                </a>
                <button
                  onClick={() => setCallModal(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer">
                  End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
