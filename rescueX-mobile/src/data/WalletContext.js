import React, { createContext, useState } from 'react';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(1250.00);
  const [transactions, setTransactions] = useState([
    { id: '3', type: 'earning', title: 'Job: Battery Replacement', amount: '+₹1,400.00', date: '25 Jun 2026, 11:00 AM', status: 'Completed' },
    { id: '2', type: 'earning', title: 'Job: Flat Tyre / Puncture', amount: '+₹350.00', date: '28 Jun 2026, 02:15 PM', status: 'Completed' },
    { id: '1', type: 'withdrawal', title: 'Withdrawal to Bank', amount: '-₹500.00', date: '29 Jun 2026, 10:30 AM', status: 'Processing' },
  ]);

  const withdrawFunds = (amountString) => {
    const numAmount = parseFloat(amountString);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    
    // Check if enough balance
    if (numAmount > balance) return false;

    // Deduct balance
    setBalance(prev => prev - numAmount);

    // Create new transaction
    const now = new Date();
    // Format date like "29 Jun 2026, 10:30 AM"
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newTx = {
      id: Date.now().toString(),
      type: 'withdrawal',
      title: 'Withdrawal to Bank',
      amount: `-₹${numAmount.toFixed(2)}`,
      date: formattedDate,
      status: 'Processing'
    };

    setTransactions(prev => [newTx, ...prev]);
    return true;
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, withdrawFunds }}>
      {children}
    </WalletContext.Provider>
  );
};
