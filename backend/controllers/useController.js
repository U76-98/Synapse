import xlsx from "xlsx";

export const getEmployeeData = (req, res) => {
  try {
    // read CSV file
    const workbook = xlsx.readFile("./data.csv");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // extract Employee_ID and Date
    const filteredData = jsonData.map((row) => ({
      Employee_ID: row.Employee_ID,
      Date: row.Date,
    }));

    res.json(filteredData);
  } catch (error) {
    console.error("❌ Error reading CSV:", error);
    res.status(500).json({ message: "Failed to read data" });
  }
};
