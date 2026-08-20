// Helper to get formatted date string (YYYY-MM-DD)
export const getOffsetDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Available Team Members for assignment
export const teamMembers = [
  "Sales TL",
  "John (Sales TL)",
  "Sanjay Srivastava",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra",
  "Ankit Patel"
];

// Time Options for time picker dropdown
export const timeOptions = [
  "09:00 am",
  "09:30 am",
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "11:30 am",
  "12:00 pm",
  "12:30 pm",
  "02:00 pm",
  "02:30 pm",
  "03:00 pm",
  "03:30 pm",
  "04:00 pm",
  "04:30 pm",
  "05:00 pm",
  "05:30 pm",
  "06:00 pm"
];

// Filter Dropdown Options
export const leadTypeOptions = ["Lead Type", "FRESH", "EXISTING CLIENT", "RENEWAL", "REPEAT"];
export const leadSourceOptions = ["Lead Source", "WHATSAPP", "JUSTDIAL", "EMAIL", "FACEBOOK", "DIRECT INBOUND", "WEBSITE"];
export const leadStatusOptions = ["Lead Status", "INTERESTED", "LOST", "REASSIGNED (LOST)", "CONVERTED", "FOLLOW UP"];
export const leadLabelOptions = ["Lead Label", "HOT", "WARM", "COLD", "UNTOUCHED"];
export const timeRangeOptions = ["All Time", "Today", "Tomorrow", "This Week", "Overdue", "This Month"];

// Initial dataset matching scheduled leads
export const initialScheduledLeads = [
  {
    id: "LD-SCH-01",
    concernPersonName: "Aarav Sharma",
    phoneNumber: "9876544434",
    emailAddress: "aarav.sharma@codecrafter.in",
    nextFollowupDate: "22 Aug 2026",
    nextFollowupDateRaw: getOffsetDateString(-2),
    nextFollowupTime: "12:00 pm",
    channelType: "Call",
    followupRemarksCount: 2,
    followupHistory: [
      { date: "22 Aug 2026", time: "12:00 pm", notes: "Sent quotation and design blueprint for P3 indoor display.", rep: "Sales TL", status: "Overdue" },
      { date: "16 Aug 2026", time: "05:37 pm", notes: "Initial requirement discussion on phone.", rep: "Sales TL", status: "Completed" }
    ],
    createdDate: "16 Aug 2026",
    createdTime: "05:37 pm",
    leadAge: "10 Days",
    status: "INTERESTED",
    leadLabel: "HOT",
    leadType: "FRESH",
    requirement: "P3 Indoor Interactive LED Video Wall 12x8 ft",
    expectedBusiness: "245000",
    pincode: "273001",
    leadSource: "JUSTDIAL",
    leadBy: "Sales TL",
    assignTo: "John (Sales TL)",
    address: "Park Road, Golghar, Gorakhpur",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-02",
    concernPersonName: "Pooja Verma",
    phoneNumber: "9876559088",
    emailAddress: "pooja@vermajewellers.com",
    nextFollowupDate: "25 Aug 2026",
    nextFollowupDateRaw: getOffsetDateString(-1),
    nextFollowupTime: "05:35 pm",
    channelType: "Meeting",
    followupRemarksCount: 2,
    followupHistory: [
      { date: "25 Aug 2026", time: "05:35 pm", notes: "Follow-up regarding golden acrylic letter thickness and power supply.", rep: "Pooja Verma", status: "Overdue" },
      { date: "18 Aug 2026", time: "06:35 pm", notes: "Client requested quotation for 2 outdoor boards.", rep: "Pooja Verma", status: "Completed" }
    ],
    createdDate: "16 Aug 2026",
    createdTime: "06:35 pm",
    leadAge: "10 Days",
    status: "INTERESTED",
    leadLabel: "HOT",
    leadType: "FRESH",
    requirement: "Outdoor Golden Acrylic LED Backlit Glow Signboard",
    expectedBusiness: "380000",
    pincode: "226001",
    leadSource: "WHATSAPP",
    leadBy: "Pooja Verma",
    assignTo: "Pooja Verma",
    address: "Hazratganj Main Market, Lucknow",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-03",
    concernPersonName: "Rajesh Singhania",
    phoneNumber: "9988888989",
    emailAddress: "singhania.finance@gmail.com",
    nextFollowupDate: "Today",
    nextFollowupDateRaw: getOffsetDateString(0),
    nextFollowupTime: "06:30 pm",
    channelType: "Call",
    followupRemarksCount: 2,
    followupHistory: [
      { date: "Today", time: "06:30 pm", notes: "Site inspection scheduled for SMPS & panel replacement.", rep: "Sales TL", status: "Today" }
    ],
    createdDate: "23 Jul 2026",
    createdTime: "06:30 pm",
    leadAge: "28 Days",
    status: "INTERESTED",
    leadLabel: "HOT",
    leadType: "REPEAT",
    requirement: "Facade P10 LED Display Repair & SMPS Replacement",
    expectedBusiness: "150000",
    pincode: "221002",
    leadSource: "JUSTDIAL",
    leadBy: "Sales TL",
    assignTo: "John (Sales TL)",
    address: "Rathyatra Crossing, Varanasi",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-04",
    concernPersonName: "Dr. Sunita Tripathi",
    phoneNumber: "9839090889",
    emailAddress: "contact@citycarehospital.org",
    nextFollowupDate: "Today",
    nextFollowupDateRaw: getOffsetDateString(0),
    nextFollowupTime: "02:20 pm",
    channelType: "Meeting",
    followupRemarksCount: 1,
    followupHistory: [
      { date: "Today", time: "02:20 pm", notes: "Hospital lobby demonstration of interactive kiosk software.", rep: "Sanjay Srivastava", status: "Today" }
    ],
    createdDate: "10 Jul 2026",
    createdTime: "02:19 pm",
    leadAge: "40 Days",
    status: "INTERESTED",
    leadLabel: "HOT",
    leadType: "FRESH",
    requirement: "55-inch Touchscreen Reception Info Kiosk (2 Units)",
    expectedBusiness: "285000",
    pincode: "273004",
    leadSource: "DIRECT INBOUND",
    leadBy: "Sanjay Srivastava",
    assignTo: "Sanjay Srivastava",
    address: "Medical College Road, Asuran, Gorakhpur",
    reminder: true,
    reminderHours: 24
  }
];
