export type MemberStatus = "Active" | "Inactive" | "Pending";
export type PaymentMode = "UPI" | "Cash" | "Bank Transfer" | "Cheque";
export type PaymentStatus = "Paid" | "Pending" | "Failed";

export interface Member {
  id: string;
  sno: number;
  name: string;
  initials: string;
  avatarColor: string;
  hometown: string;
  phone: string;
  status: MemberStatus;
  joinDate: string;
  outstandingAmount: number;
  lastPaymentDate: string;
  email: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  date: string;
  amount: number;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  receiptId: string;
  description: string;
}

export const avatarColors = [
  "#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626",
  "#0891B2", "#4F46E5", "#BE185D", "#16A34A", "#B45309",
];

export const members: Member[] = [
  { id: "MF-2401", sno: 1, name: "Arjun Mehta", initials: "AM", avatarColor: "#2563EB", hometown: "Mumbai", phone: "+91 98201 34567", status: "Active", joinDate: "12 Apr 2022", outstandingAmount: 0, lastPaymentDate: "15 Apr 2026", email: "arjun.mehta@email.com" },
  { id: "MF-2402", sno: 2, name: "Priya Sharma", initials: "PS", avatarColor: "#7C3AED", hometown: "Delhi", phone: "+91 99112 56789", status: "Active", joinDate: "18 Jun 2022", outstandingAmount: 2500, lastPaymentDate: "18 Nov 2025", email: "priya.sharma@email.com" },
  { id: "MF-2403", sno: 3, name: "Rahul Verma", initials: "RV", avatarColor: "#059669", hometown: "Bangalore", phone: "+91 87654 32109", status: "Pending", joinDate: "03 Aug 2022", outstandingAmount: 5000, lastPaymentDate: "10 Apr 2026", email: "rahul.verma@email.com" },
  { id: "MF-2404", sno: 4, name: "Sneha Patel", initials: "SP", avatarColor: "#D97706", hometown: "Ahmedabad", phone: "+91 76543 21098", status: "Active", joinDate: "22 Sep 2022", outstandingAmount: 0, lastPaymentDate: "05 May 2026", email: "sneha.patel@email.com" },
  { id: "MF-2405", sno: 5, name: "Vikram Singh", initials: "VS", avatarColor: "#DC2626", hometown: "Jaipur", phone: "+91 98765 43210", status: "Inactive", joinDate: "15 Nov 2022", outstandingAmount: 7500, lastPaymentDate: "22 Jun 2025", email: "vikram.singh@email.com" },
  { id: "MF-2406", sno: 6, name: "Ananya Rao", initials: "AR", avatarColor: "#0891B2", hometown: "Hyderabad", phone: "+91 91234 56789", status: "Active", joinDate: "08 Jan 2023", outstandingAmount: 0, lastPaymentDate: "02 Mar 2026", email: "ananya.rao@email.com" },
  { id: "MF-2407", sno: 7, name: "Kiran Kumar", initials: "KK", avatarColor: "#4F46E5", hometown: "Chennai", phone: "+91 88901 23456", status: "Active", joinDate: "25 Feb 2023", outstandingAmount: 1500, lastPaymentDate: "14 Jan 2026", email: "kiran.kumar@email.com" },
  { id: "MF-2408", sno: 8, name: "Divya Nair", initials: "DN", avatarColor: "#BE185D", hometown: "Kochi", phone: "+91 97890 12345", status: "Pending", joinDate: "14 Mar 2023", outstandingAmount: 3000, lastPaymentDate: "09 Dec 2025", email: "divya.nair@email.com" },
  { id: "MF-2409", sno: 9, name: "Sanjay Gupta", initials: "SG", avatarColor: "#16A34A", hometown: "Pune", phone: "+91 90123 45678", status: "Active", joinDate: "02 May 2023", outstandingAmount: 0, lastPaymentDate: "28 Mar 2026", email: "sanjay.gupta@email.com" },
  { id: "MF-2410", sno: 10, name: "Meera Iyer", initials: "MI", avatarColor: "#B45309", hometown: "Coimbatore", phone: "+91 85678 90123", status: "Active", joinDate: "19 Jun 2023", outstandingAmount: 0, lastPaymentDate: "11 Apr 2026", email: "meera.iyer@email.com" },
  { id: "MF-2411", sno: 11, name: "Aditya Khanna", initials: "AK", avatarColor: "#2563EB", hometown: "Noida", phone: "+91 96789 01234", status: "Inactive", joinDate: "07 Aug 2023", outstandingAmount: 4500, lastPaymentDate: "19 Aug 2025", email: "aditya.khanna@email.com" },
  { id: "MF-2412", sno: 12, name: "Pooja Desai", initials: "PD", avatarColor: "#7C3AED", hometown: "Surat", phone: "+91 82345 67890", status: "Active", joinDate: "30 Sep 2023", outstandingAmount: 0, lastPaymentDate: "06 Feb 2026", email: "pooja.desai@email.com" },
  { id: "MF-2413", sno: 13, name: "Ravi Teja", initials: "RT", avatarColor: "#059669", hometown: "Visakhapatnam", phone: "+91 99234 56780", status: "Active", joinDate: "11 Nov 2023", outstandingAmount: 800, lastPaymentDate: "23 Mar 2026", email: "ravi.teja@email.com" },
  { id: "MF-2414", sno: 14, name: "Kavya Reddy", initials: "KR", avatarColor: "#D97706", hometown: "Bengaluru", phone: "+91 77890 12340", status: "Pending", joinDate: "05 Jan 2024", outstandingAmount: 6000, lastPaymentDate: "17 Oct 2025", email: "kavya.reddy@email.com" },
  { id: "MF-2415", sno: 15, name: "Nikhil Joshi", initials: "NJ", avatarColor: "#DC2626", hometown: "Nagpur", phone: "+91 93456 78901", status: "Active", joinDate: "28 Feb 2024", outstandingAmount: 0, lastPaymentDate: "30 Apr 2026", email: "nikhil.joshi@email.com" },
];

export const transactions: Transaction[] = [
  { id: "TXN-8801", memberId: "MF-2401", date: "15 Apr 2026", amount: 12000, paymentMode: "UPI", status: "Paid", receiptId: "RCP-2026-001", description: "Annual Membership Fee" },
  { id: "TXN-8802", memberId: "MF-2401", date: "12 Jan 2026", amount: 5000, paymentMode: "Bank Transfer", status: "Paid", receiptId: "RCP-2026-002", description: "Event Contribution" },
  { id: "TXN-8803", memberId: "MF-2401", date: "20 Sep 2025", amount: 12000, paymentMode: "UPI", status: "Paid", receiptId: "RCP-2025-001", description: "Annual Membership Fee" },
  { id: "TXN-8804", memberId: "MF-2401", date: "08 Jun 2025", amount: 3500, paymentMode: "Cash", status: "Paid", receiptId: "RCP-2025-002", description: "Sports Committee" },
  { id: "TXN-8805", memberId: "MF-2402", date: "22 Apr 2026", amount: 12000, paymentMode: "Cheque", status: "Pending", receiptId: "RCP-2026-003", description: "Annual Membership Fee" },
  { id: "TXN-8806", memberId: "MF-2402", date: "18 Nov 2025", amount: 2500, paymentMode: "UPI", status: "Paid", receiptId: "RCP-2025-003", description: "Cultural Event" },
  { id: "TXN-8807", memberId: "MF-2403", date: "10 Apr 2026", amount: 12000, paymentMode: "Bank Transfer", status: "Pending", receiptId: "RCP-2026-004", description: "Annual Membership Fee" },
  { id: "TXN-8808", memberId: "MF-2404", date: "05 May 2026", amount: 12000, paymentMode: "UPI", status: "Paid", receiptId: "RCP-2026-005", description: "Annual Membership Fee" },
  { id: "TXN-8809", memberId: "MF-2404", date: "30 Jul 2025", amount: 4000, paymentMode: "Cash", status: "Paid", receiptId: "RCP-2025-004", description: "Charity Donation" },
  { id: "TXN-8810", memberId: "MF-2404", date: "14 Feb 2025", amount: 12000, paymentMode: "UPI", status: "Paid", receiptId: "RCP-2025-005", description: "Annual Membership Fee" },
];

export const kpiData = {
  totalMembers: 1284,
  totalMembersGrowth: 8.2,
  totalCollection: 2468500,
  totalCollectionGrowth: 12.4,
  pendingPayments: 342000,
  pendingPaymentsChange: -3.1,
  yearlyGrowth: 18.6,
  yearlyGrowthChange: 4.2,
};

export const monthlyCollectionData = [
  { month: "Apr", amount: 184000 },
  { month: "May", amount: 210000 },
  { month: "Jun", amount: 196000 },
  { month: "Jul", amount: 225000 },
  { month: "Aug", amount: 198000 },
  { month: "Sep", amount: 242000 },
  { month: "Oct", amount: 215000 },
  { month: "Nov", amount: 268000 },
  { month: "Dec", amount: 190000 },
  { month: "Jan", amount: 245000 },
  { month: "Feb", amount: 228000 },
  { month: "Mar", amount: 267500 },
];

export const yearComparisonData = [
  { month: "Apr", fy24: 148000, fy25: 165000, fy26: 184000 },
  { month: "May", fy24: 172000, fy25: 185000, fy26: 210000 },
  { month: "Jun", fy24: 160000, fy25: 175000, fy26: 196000 },
  { month: "Jul", fy24: 190000, fy25: 205000, fy26: 225000 },
  { month: "Aug", fy24: 168000, fy25: 180000, fy26: 198000 },
  { month: "Sep", fy24: 205000, fy25: 220000, fy26: 242000 },
  { month: "Oct", fy24: 182000, fy25: 198000, fy26: 215000 },
  { month: "Nov", fy24: 225000, fy25: 245000, fy26: 268000 },
  { month: "Dec", fy24: 158000, fy25: 172000, fy26: 190000 },
  { month: "Jan", fy24: 210000, fy25: 228000, fy26: 245000 },
  { month: "Feb", fy24: 195000, fy25: 210000, fy26: 228000 },
  { month: "Mar", fy24: 228000, fy25: 248000, fy26: 267500 },
];

export const paymentMethodData = [
  { method: "UPI", amount: 1085400, percentage: 44, color: "#2563EB" },
  { method: "Bank Transfer", amount: 617125, percentage: 25, color: "#7C3AED" },
  { method: "Cash", amount: 493700, percentage: 20, color: "#059669" },
  { method: "Cheque", amount: 272275, percentage: 11, color: "#D97706" },
];
