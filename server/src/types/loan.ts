export interface LoanApplication {
  userId: string;
  amount: number;
  purpose: string;
  term: number;
}

export interface Loan extends LoanApplication {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
} 