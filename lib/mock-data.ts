// Mock data for the service business management prototype

export interface Business {
  id: string
  name: string
  phone: string
  email: string
  address: string
  logo: string | null
  primaryColor: string
  invoiceFooter: string
  slug: string
}

export interface Staff {
  id: string
  name: string
  phone: string
  role: string
  status: "active" | "inactive"
  avatar: string | null
  jobsToday: number
}

export interface Job {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  address: string
  serviceType: string
  description: string
  scheduledDate: string
  scheduledTime: string
  assignedStaffId: string | null
  assignedStaffName: string | null
  status: "new" | "assigned" | "in-progress" | "completed"
  estimatedAmount: number
  notes: string
  proofPhotos: string[]
  createdAt: string
}

export interface BookingRequest {
  id: string
  customerName: string
  customerPhone: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  address: string
  notes: string
  source: string
  status: "new" | "contacted" | "converted" | "rejected"
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  jobId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  serviceType: string
  lineItems: { description: string; amount: number }[]
  totalAmount: number
  issueDate: string
  status: "draft" | "sent" | "paid"
}

export const business: Business = {
  id: "biz-001",
  name: "ProServe Solutions",
  phone: "(555) 123-4567",
  email: "contact@proserve.example",
  address: "123 Business Ave, Suite 100, Metro City, MC 12345",
  logo: null,
  primaryColor: "#0f172a",
  invoiceFooter: "Thank you for your business. Payment is due within 14 days.",
  slug: "proserve",
}

export const staff: Staff[] = [
  { id: "staff-001", name: "Marcus Johnson", phone: "(555) 234-5678", role: "Senior Technician", status: "active", avatar: null, jobsToday: 3 },
  { id: "staff-002", name: "Sarah Chen", phone: "(555) 345-6789", role: "Technician", status: "active", avatar: null, jobsToday: 2 },
  { id: "staff-003", name: "David Williams", phone: "(555) 456-7890", role: "Technician", status: "active", avatar: null, jobsToday: 2 },
  { id: "staff-004", name: "Emily Rodriguez", phone: "(555) 567-8901", role: "Junior Technician", status: "active", avatar: null, jobsToday: 1 },
  { id: "staff-005", name: "James Park", phone: "(555) 678-9012", role: "Technician", status: "inactive", avatar: null, jobsToday: 0 },
  { id: "staff-006", name: "Lisa Thompson", phone: "(555) 789-0123", role: "Senior Technician", status: "active", avatar: null, jobsToday: 2 },
]

export const jobs: Job[] = [
  {
    id: "JOB-001",
    customerId: "cust-001",
    customerName: "Robert Miller",
    customerPhone: "(555) 111-2222",
    address: "456 Oak Street, Apt 2B, Metro City",
    serviceType: "AC Servicing",
    description: "Annual AC maintenance and filter replacement",
    scheduledDate: "2026-03-19",
    scheduledTime: "09:00",
    assignedStaffId: "staff-001",
    assignedStaffName: "Marcus Johnson",
    status: "in-progress",
    estimatedAmount: 150,
    notes: "Customer prefers morning appointments",
    proofPhotos: ["/placeholder-proof-1.jpg", "/placeholder-proof-2.jpg"],
    createdAt: "2026-03-17",
  },
  {
    id: "JOB-002",
    customerId: "cust-002",
    customerName: "Jennifer Adams",
    customerPhone: "(555) 222-3333",
    address: "789 Pine Lane, Metro City",
    serviceType: "Deep Cleaning",
    description: "Full house deep cleaning including carpets",
    scheduledDate: "2026-03-19",
    scheduledTime: "10:30",
    assignedStaffId: "staff-002",
    assignedStaffName: "Sarah Chen",
    status: "assigned",
    estimatedAmount: 280,
    notes: "Has two dogs, will be secured during service",
    proofPhotos: [],
    createdAt: "2026-03-16",
  },
  {
    id: "JOB-003",
    customerId: "cust-003",
    customerName: "Michael Brown",
    customerPhone: "(555) 333-4444",
    address: "321 Maple Drive, Metro City",
    serviceType: "Plumbing Repair",
    description: "Fix leaking kitchen faucet and check water pressure",
    scheduledDate: "2026-03-19",
    scheduledTime: "14:00",
    assignedStaffId: "staff-003",
    assignedStaffName: "David Williams",
    status: "new",
    estimatedAmount: 120,
    notes: "",
    proofPhotos: [],
    createdAt: "2026-03-18",
  },
  {
    id: "JOB-004",
    customerId: "cust-004",
    customerName: "Amanda Wilson",
    customerPhone: "(555) 444-5555",
    address: "567 Cedar Court, Metro City",
    serviceType: "Electrical Maintenance",
    description: "Install new ceiling fan and check circuit breakers",
    scheduledDate: "2026-03-19",
    scheduledTime: "11:00",
    assignedStaffId: "staff-006",
    assignedStaffName: "Lisa Thompson",
    status: "assigned",
    estimatedAmount: 200,
    notes: "Bring 52-inch fan from inventory",
    proofPhotos: [],
    createdAt: "2026-03-15",
  },
  {
    id: "JOB-005",
    customerId: "cust-005",
    customerName: "Thomas Garcia",
    customerPhone: "(555) 555-6666",
    address: "890 Birch Avenue, Metro City",
    serviceType: "Office Cleaning",
    description: "Weekly office cleaning - 3000 sq ft",
    scheduledDate: "2026-03-20",
    scheduledTime: "18:00",
    assignedStaffId: "staff-002",
    assignedStaffName: "Sarah Chen",
    status: "assigned",
    estimatedAmount: 350,
    notes: "After business hours only",
    proofPhotos: [],
    createdAt: "2026-03-14",
  },
  {
    id: "JOB-006",
    customerId: "cust-006",
    customerName: "Rachel Kim",
    customerPhone: "(555) 666-7777",
    address: "234 Elm Street, Metro City",
    serviceType: "AC Installation",
    description: "Install new split AC unit in master bedroom",
    scheduledDate: "2026-03-20",
    scheduledTime: "09:00",
    assignedStaffId: "staff-001",
    assignedStaffName: "Marcus Johnson",
    status: "new",
    estimatedAmount: 450,
    notes: "Customer will provide the AC unit",
    proofPhotos: [],
    createdAt: "2026-03-17",
  },
  {
    id: "JOB-007",
    customerId: "cust-007",
    customerName: "Daniel Lee",
    customerPhone: "(555) 777-8888",
    address: "678 Willow Way, Metro City",
    serviceType: "Plumbing Repair",
    description: "Unclog bathroom drain and replace shower head",
    scheduledDate: "2026-03-18",
    scheduledTime: "15:00",
    assignedStaffId: "staff-003",
    assignedStaffName: "David Williams",
    status: "completed",
    estimatedAmount: 95,
    notes: "",
    proofPhotos: ["/placeholder-proof-3.jpg"],
    createdAt: "2026-03-16",
  },
  {
    id: "JOB-008",
    customerId: "cust-008",
    customerName: "Sophia Martinez",
    customerPhone: "(555) 888-9999",
    address: "901 Spruce Lane, Metro City",
    serviceType: "Deep Cleaning",
    description: "Move-out deep cleaning",
    scheduledDate: "2026-03-18",
    scheduledTime: "10:00",
    assignedStaffId: "staff-004",
    assignedStaffName: "Emily Rodriguez",
    status: "completed",
    estimatedAmount: 320,
    notes: "3BR apartment, needs to be spotless for inspection",
    proofPhotos: ["/placeholder-proof-4.jpg", "/placeholder-proof-5.jpg"],
    createdAt: "2026-03-15",
  },
  {
    id: "JOB-009",
    customerId: "cust-009",
    customerName: "Kevin Patel",
    customerPhone: "(555) 999-0000",
    address: "345 Ash Boulevard, Metro City",
    serviceType: "Electrical Maintenance",
    description: "Troubleshoot flickering lights in living room",
    scheduledDate: "2026-03-21",
    scheduledTime: "13:00",
    assignedStaffId: null,
    assignedStaffName: null,
    status: "new",
    estimatedAmount: 80,
    notes: "Issue started last week",
    proofPhotos: [],
    createdAt: "2026-03-18",
  },
  {
    id: "JOB-010",
    customerId: "cust-010",
    customerName: "Olivia Taylor",
    customerPhone: "(555) 000-1111",
    address: "123 Redwood Circle, Metro City",
    serviceType: "AC Servicing",
    description: "AC not cooling properly, needs diagnostic",
    scheduledDate: "2026-03-21",
    scheduledTime: "10:00",
    assignedStaffId: "staff-006",
    assignedStaffName: "Lisa Thompson",
    status: "assigned",
    estimatedAmount: 130,
    notes: "2-year old unit, still under warranty",
    proofPhotos: [],
    createdAt: "2026-03-18",
  },
  {
    id: "JOB-011",
    customerId: "cust-011",
    customerName: "Nathan Wright",
    customerPhone: "(555) 121-3434",
    address: "456 Sequoia Street, Metro City",
    serviceType: "Office Cleaning",
    description: "Post-construction cleanup",
    scheduledDate: "2026-03-22",
    scheduledTime: "08:00",
    assignedStaffId: "staff-002",
    assignedStaffName: "Sarah Chen",
    status: "new",
    estimatedAmount: 500,
    notes: "Large commercial space, bring extra supplies",
    proofPhotos: [],
    createdAt: "2026-03-19",
  },
  {
    id: "JOB-012",
    customerId: "cust-012",
    customerName: "Grace Cooper",
    customerPhone: "(555) 232-4545",
    address: "789 Magnolia Avenue, Metro City",
    serviceType: "Plumbing Repair",
    description: "Water heater inspection and maintenance",
    scheduledDate: "2026-03-17",
    scheduledTime: "11:00",
    assignedStaffId: "staff-003",
    assignedStaffName: "David Williams",
    status: "completed",
    estimatedAmount: 175,
    notes: "",
    proofPhotos: ["/placeholder-proof-6.jpg"],
    createdAt: "2026-03-14",
  },
]

export const bookingRequests: BookingRequest[] = [
  {
    id: "REQ-001",
    customerName: "William Harris",
    customerPhone: "(555) 343-5656",
    serviceType: "AC Servicing",
    preferredDate: "2026-03-23",
    preferredTime: "Morning",
    address: "111 Palm Street, Metro City",
    notes: "AC making unusual noise",
    source: "Public Page",
    status: "new",
    createdAt: "2026-03-19T08:30:00",
  },
  {
    id: "REQ-002",
    customerName: "Isabella Moore",
    customerPhone: "(555) 454-6767",
    serviceType: "Deep Cleaning",
    preferredDate: "2026-03-24",
    preferredTime: "Afternoon",
    address: "222 Coconut Lane, Metro City",
    notes: "Pre-party cleaning needed",
    source: "QR Code",
    status: "new",
    createdAt: "2026-03-19T07:15:00",
  },
  {
    id: "REQ-003",
    customerName: "Ethan Jackson",
    customerPhone: "(555) 565-7878",
    serviceType: "Plumbing Repair",
    preferredDate: "2026-03-22",
    preferredTime: "Flexible",
    address: "333 Bamboo Drive, Metro City",
    notes: "Toilet running constantly",
    source: "Public Page",
    status: "contacted",
    createdAt: "2026-03-18T16:45:00",
  },
  {
    id: "REQ-004",
    customerName: "Ava Robinson",
    customerPhone: "(555) 676-8989",
    serviceType: "Electrical Maintenance",
    preferredDate: "2026-03-25",
    preferredTime: "Morning",
    address: "444 Fern Avenue, Metro City",
    notes: "Need additional outlets installed in home office",
    source: "Public Page",
    status: "converted",
    createdAt: "2026-03-17T10:20:00",
  },
  {
    id: "REQ-005",
    customerName: "Mason Clark",
    customerPhone: "(555) 787-9090",
    serviceType: "AC Installation",
    preferredDate: "2026-03-26",
    preferredTime: "Afternoon",
    address: "555 Ivy Court, Metro City",
    notes: "New construction, need 3 units installed",
    source: "QR Code",
    status: "contacted",
    createdAt: "2026-03-17T14:30:00",
  },
  {
    id: "REQ-006",
    customerName: "Charlotte Lewis",
    customerPhone: "(555) 898-0101",
    serviceType: "Office Cleaning",
    preferredDate: "2026-03-23",
    preferredTime: "Evening",
    address: "666 Orchid Boulevard, Metro City",
    notes: "Weekly cleaning contract inquiry",
    source: "Public Page",
    status: "new",
    createdAt: "2026-03-18T09:00:00",
  },
  {
    id: "REQ-007",
    customerName: "Liam Walker",
    customerPhone: "(555) 909-1212",
    serviceType: "Plumbing Repair",
    preferredDate: "2026-03-20",
    preferredTime: "ASAP",
    address: "777 Jasmine Way, Metro City",
    notes: "Urgent: pipe burst in basement",
    source: "Phone Call",
    status: "rejected",
    createdAt: "2026-03-16T20:15:00",
  },
  {
    id: "REQ-008",
    customerName: "Emma Hall",
    customerPhone: "(555) 010-2323",
    serviceType: "Deep Cleaning",
    preferredDate: "2026-03-27",
    preferredTime: "Morning",
    address: "888 Tulip Road, Metro City",
    notes: "Move-in cleaning for new apartment",
    source: "Public Page",
    status: "new",
    createdAt: "2026-03-19T06:45:00",
  },
]

export const invoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2026-0042",
    jobId: "JOB-007",
    customerName: "Daniel Lee",
    customerPhone: "(555) 777-8888",
    customerAddress: "678 Willow Way, Metro City",
    serviceType: "Plumbing Repair",
    lineItems: [
      { description: "Drain unclogging service", amount: 65 },
      { description: "Shower head replacement", amount: 30 },
    ],
    totalAmount: 95,
    issueDate: "2026-03-18",
    status: "sent",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2026-0041",
    jobId: "JOB-008",
    customerName: "Sophia Martinez",
    customerPhone: "(555) 888-9999",
    customerAddress: "901 Spruce Lane, Metro City",
    serviceType: "Deep Cleaning",
    lineItems: [
      { description: "Move-out deep cleaning (3BR)", amount: 280 },
      { description: "Carpet shampooing", amount: 40 },
    ],
    totalAmount: 320,
    issueDate: "2026-03-18",
    status: "paid",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2026-0040",
    jobId: "JOB-012",
    customerName: "Grace Cooper",
    customerPhone: "(555) 232-4545",
    customerAddress: "789 Magnolia Avenue, Metro City",
    serviceType: "Plumbing Repair",
    lineItems: [
      { description: "Water heater inspection", amount: 75 },
      { description: "Maintenance and flush", amount: 80 },
      { description: "Anode rod replacement", amount: 20 },
    ],
    totalAmount: 175,
    issueDate: "2026-03-17",
    status: "sent",
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2026-0039",
    jobId: "JOB-013",
    customerName: "Henry Scott",
    customerPhone: "(555) 121-4343",
    customerAddress: "234 Cypress Lane, Metro City",
    serviceType: "AC Servicing",
    lineItems: [
      { description: "AC tune-up and inspection", amount: 100 },
      { description: "Filter replacement", amount: 25 },
      { description: "Refrigerant top-up", amount: 45 },
    ],
    totalAmount: 170,
    issueDate: "2026-03-16",
    status: "paid",
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2026-0038",
    jobId: "JOB-014",
    customerName: "Victoria Young",
    customerPhone: "(555) 232-5454",
    customerAddress: "567 Poplar Street, Metro City",
    serviceType: "Electrical Maintenance",
    lineItems: [
      { description: "Outlet installation (4 units)", amount: 160 },
      { description: "Wiring inspection", amount: 50 },
    ],
    totalAmount: 210,
    issueDate: "2026-03-15",
    status: "draft",
  },
]

export const serviceTypes = [
  "AC Servicing",
  "AC Installation",
  "Deep Cleaning",
  "Office Cleaning",
  "Plumbing Repair",
  "Electrical Maintenance",
  "General Maintenance",
]
