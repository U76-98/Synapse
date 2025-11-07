import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for employee data to avoid re-reading CSV on every request
let employeeCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 300000; // Cache for 5 minutes (CSV doesn't change often)

// Pre-load data on module load for faster first request
let preloadPromise = null;

// Helper to generate employee name from ID
const generateEmployeeName = (employeeId) => {
  // Extract number from employee ID (e.g., "E001" -> 1, "E050" -> 50)
  const match = employeeId.match(/E(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    // Generate name based on employee number
    const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 
                        'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tina',
                        'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zach', 'Amy', 'Ben', 'Cara', 'Dan',
                        'Eva', 'Finn', 'Gina', 'Hank', 'Iris', 'Jake', 'Kelly', 'Luke', 'Maya', 'Nick',
                        'Omar', 'Penny', 'Quincy', 'Rose', 'Sean', 'Tara', 'Uma', 'Vince', 'Willa', 'Xander'];
    const lastNames = ['Williams', 'Johnson', 'Martinez', 'Lee', 'Wilson', 'Brown', 'Davis', 'Taylor', 'Anderson', 'Miller',
                       'Moore', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark',
                       'Rodriguez', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill',
                       'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner',
                       'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers'];
    
    const firstName = firstNames[(num - 1) % firstNames.length];
    const lastName = lastNames[(num - 1) % lastNames.length];
    return `${firstName} ${lastName}`;
  }
  return `${employeeId} Employee`;
};

// Helper to generate email from ID
const generateEmail = (employeeId) => {
  return `${employeeId.toLowerCase()}@company.com`;
};

// Helper to map Role_Level to Position title
const mapRoleToPosition = (roleLevel) => {
  const roleMap = {
    'Junior': 'Junior Developer',
    'Mid': 'Mid-Level Developer',
    'Senior': 'Senior Developer',
    'Lead': 'Tech Lead',
    'Manager': 'Engineering Manager'
  };
  return roleMap[roleLevel] || roleLevel || 'Team Member';
};

/**
 * Load and process employee data from CSV
 * This function is optimized for speed
 * Exported for pre-loading on server startup
 */
export const loadEmployeeData = async () => {
  const csvPath = path.join(__dirname, '..', 'data.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  console.log('📖 Reading and processing CSV file...');
  const startTime = Date.now();
  
  // Read CSV file
  const workbook = xlsx.readFile(csvPath, { type: 'file' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { 
    defval: null,
    raw: false
  });

  if (!jsonData || jsonData.length === 0) {
    return [];
  }

  // Group by Employee_ID using string date comparison (faster)
  const employeeMap = new Map();

  for (const row of jsonData) {
    const employeeId = row.Employee_ID;
    if (!employeeId) continue;
    
    const dateStr = row.Date || '1970-01-01';
    
    if (!employeeMap.has(employeeId) || dateStr > employeeMap.get(employeeId).dateStr) {
      employeeMap.set(employeeId, { employeeId, dateStr, row });
    }
  }

  console.log(`📊 Found ${employeeMap.size} unique employees (processed ${jsonData.length} rows in ${Date.now() - startTime}ms)`);

  // Convert to array and format
  const employees = Array.from(employeeMap.values())
    .sort((a, b) => {
      const numA = parseInt(a.employeeId.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.employeeId.match(/\d+/)?.[0] || '0');
      return numA - numB;
    })
    .map(({ row }) => {
      const employeeId = row.Employee_ID;
      
      return {
        Employee_ID: employeeId,
        Name: generateEmployeeName(employeeId),
        Email: generateEmail(employeeId),
        Department: row.Project_Type || 'Engineering',
        Position: mapRoleToPosition(row.Role_Level),
        Team_ID: row.Team_ID || '',
        performance_metrics: {
          Claimed_Hours: parseFloat(row.Claimed_Hours) || 0,
          Active_Hours: parseFloat(row.Active_Hours) || 0,
          Claimed_Minus_Active: parseFloat(row.Claimed_Minus_Active) || 0,
          Utilization_Rate: parseFloat(row.Utilization_Rate) || 0,
          Commits: parseInt(row.Commits) || 0,
          PRs_Opened: parseInt(row.PRs_Opened) || 0,
          Tasks_Done: parseInt(row.Tasks_Done) || 0,
          Performance_Score: parseFloat(row.Performance_Score) || 0,
          Meetings_Hours: parseFloat(row.Meetings_Hours) || 0,
          Recent_HR_Flag: parseInt(row.Recent_HR_Flag) || 0,
          Project_Type: row.Project_Type || '',
          Role_Level: row.Role_Level || '',
          Team_ID: row.Team_ID || '',
          Productivity_Level: row.Productivity_Level || 'Medium',
          Date: row.Date
        }
      };
    });

  // Update cache
  employeeCache = employees;
  cacheTimestamp = Date.now();
  
  return employees;
};

/**
 * Fetch all employees with their latest performance metrics from CSV
 * Returns the most recent record for each employee
 * Uses caching to speed up repeated requests
 */
export const getUsers = async (req, res) => {
  console.log('GET /api/employees request received');
  
  try {
    // Check cache first
    const now = Date.now();
    if (employeeCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('📦 Returning cached employee data (instant response)');
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
      return res.json(employeeCache);
    }

    // If cache is stale or empty, reload data
    // If there's already a load in progress, wait for it
    if (preloadPromise) {
      console.log('⏳ Waiting for data load in progress...');
      await preloadPromise;
      if (employeeCache) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
        return res.json(employeeCache);
      }
    }

    // Load fresh data (this function already updates the cache)
    preloadPromise = loadEmployeeData();
    const employees = await preloadPromise;
    preloadPromise = null;
    
    console.log(`✅ Returning ${employees.length} employees (cached for ${CACHE_DURATION/1000}s)`);
    
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    
    res.json(employees);
  } catch (error) {
    console.error('❌ Error reading employee data from CSV:', error);
    
    // Fallback to empty array on error
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Failed to load employee data',
      message: error.message 
    });
  }
};

/**
 * Fetch user by ID - returns the most recent record for a specific employee
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'data.csv');
    
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`);
      return res.status(500).json({ 
        error: 'Data file not found',
        message: 'Employee data file is missing' 
      });
    }

    // Read CSV file using xlsx (it supports CSV format)
    const workbook = xlsx.readFile(csvPath, { type: 'file' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { 
      defval: null, // Use null for empty cells
      raw: false // Convert numbers and dates to strings first
    });

    // Filter by Employee_ID and get the latest record
    const employeeRecords = jsonData
      .filter(row => row.Employee_ID === id)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date));

    if (employeeRecords.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const latestRecord = employeeRecords[0];
    
    const employee = {
      Employee_ID: latestRecord.Employee_ID,
      Name: generateEmployeeName(latestRecord.Employee_ID),
      Email: generateEmail(latestRecord.Employee_ID),
      Department: latestRecord.Project_Type || 'Engineering',
      Position: mapRoleToPosition(latestRecord.Role_Level),
      Team_ID: latestRecord.Team_ID || '',
      performance_metrics: {
        Claimed_Hours: parseFloat(latestRecord.Claimed_Hours) || 0,
        Active_Hours: parseFloat(latestRecord.Active_Hours) || 0,
        Claimed_Minus_Active: parseFloat(latestRecord.Claimed_Minus_Active) || 0,
        Utilization_Rate: parseFloat(latestRecord.Utilization_Rate) || 0,
        Commits: parseInt(latestRecord.Commits) || 0,
        PRs_Opened: parseInt(latestRecord.PRs_Opened) || 0,
        Tasks_Done: parseInt(latestRecord.Tasks_Done) || 0,
        Performance_Score: parseFloat(latestRecord.Performance_Score) || 0,
        Meetings_Hours: parseFloat(latestRecord.Meetings_Hours) || 0,
        Recent_HR_Flag: parseInt(latestRecord.Recent_HR_Flag) || 0,
        Project_Type: latestRecord.Project_Type || '',
        Role_Level: latestRecord.Role_Level || '',
        Team_ID: latestRecord.Team_ID || '',
        Productivity_Level: latestRecord.Productivity_Level || 'Medium',
        Date: latestRecord.Date
      }
    };

    res.header('Access-Control-Allow-Origin', '*');
    res.json(employee);
  } catch (error) {
    console.error(`❌ Error fetching employee ${id}:`, error);
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Failed to load employee data',
      message: error.message 
    });
  }
};
