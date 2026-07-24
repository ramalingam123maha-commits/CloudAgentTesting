import { useState, useEffect } from 'react';

const STORAGE_KEY = 'expense_tracker_v1';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let idCounter = Date.now();
function genId() { return String(++idCounter); }

// Seed demo data so the app looks interesting on first load
function seedDemoData() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const pm = String(now.getMonth()).padStart(2, '0');
  const pmy = now.getMonth() === 0 ? y - 1 : y;

  const entries = [
    // Current month
    { type:'income',  description:'Monthly Salary',     amount:4500, category:'salary',     date:`${y}-${m}-01`, note:'' },
    { type:'income',  description:'Freelance Project',  amount:800,  category:'freelance',  date:`${y}-${m}-05`, note:'Design work' },
    { type:'expense', description:'Apartment Rent',     amount:1200, category:'housing',    date:`${y}-${m}-02`, note:'' },
    { type:'expense', description:'Grocery Shopping',   amount:185,  category:'food',       date:`${y}-${m}-08`, note:'Weekly groceries' },
    { type:'expense', description:'Netflix & Spotify',  amount:28,   category:'entertain',  date:`${y}-${m}-03`, note:'' },
    { type:'expense', description:'Electricity Bill',   amount:92,   category:'utilities',  date:`${y}-${m}-10`, note:'' },
    { type:'expense', description:'Gas Station',        amount:65,   category:'transport',  date:`${y}-${m}-07`, note:'' },
    { type:'expense', description:'Gym Membership',     amount:45,   category:'health',     date:`${y}-${m}-01`, note:'' },
    { type:'expense', description:'Amazon Order',       amount:112,  category:'shopping',   date:`${y}-${m}-12`, note:'Books & gadgets' },
    { type:'expense', description:'Restaurant Dinner',  amount:74,   category:'food',       date:`${y}-${m}-09`, note:'Date night' },
    // Previous month
    { type:'income',  description:'Monthly Salary',     amount:4500, category:'salary',     date:`${pmy}-${pm}-01`, note:'' },
    { type:'expense', description:'Apartment Rent',     amount:1200, category:'housing',    date:`${pmy}-${pm}-02`, note:'' },
    { type:'expense', description:'Groceries',          amount:160,  category:'food',       date:`${pmy}-${pm}-10`, note:'' },
    { type:'expense', description:'Weekend Trip',       amount:340,  category:'travel',     date:`${pmy}-${pm}-15`, note:'City getaway' },
    { type:'expense', description:'Phone Bill',         amount:55,   category:'utilities',  date:`${pmy}-${pm}-05`, note:'' },
    { type:'income',  description:'Stock Dividends',    amount:230,  category:'investment', date:`${pmy}-${pm}-20`, note:'' },
    { type:'expense', description:'New Shoes',          amount:95,   category:'shopping',   date:`${pmy}-${pm}-22`, note:'' },
    { type:'expense', description:'Doctor Visit',       amount:120,  category:'health',     date:`${pmy}-${pm}-18`, note:'' },
  ].map(e => ({ ...e, id: genId() }));

  return entries;
}

export function useTransactions() {
  // Initialise from localStorage; seed demo data when the store is empty
  const [transactions, setTransactions] = useState(() => {
    const stored = loadFromStorage();
    if (stored.length === 0) {
      const demo = seedDemoData();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demo)); } catch {}
      return demo;
    }
    return stored;
  });

  // Persist every state update back to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch {}
  }, [transactions]);

  // Prepend a new transaction with a generated ID to keep the list in reverse-chronological order
  function addTransaction(data) {
    setTransactions(prev => [{ ...data, id: genId() }, ...prev]);
  }

  // Remove a single transaction by its ID
  function deleteTransaction(id) {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  return { transactions, addTransaction, deleteTransaction };
}
