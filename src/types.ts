export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category: string;
  date: string;
}
