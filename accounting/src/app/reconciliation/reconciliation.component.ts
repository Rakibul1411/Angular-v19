import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MonthlyData {
  income: number;
  cumulativeIncome: number;
  cost: number;
  cumulativeCost: number;
  result: number;
}

interface ReconciliationItem {
  [key: string]: number;
}

@Component({
  selector: 'app-reconciliation',
  imports: [CommonModule, FormsModule],
  templateUrl: './reconciliation.component.html',
  styleUrl: './reconciliation.component.css'
})
export class ReconciliationComponent {
  yearFrom: number = 2019;
  yearTo: number = 2020;

  months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Hardcoded income and cost data for 2019
  incomeData: number[] = [100, 50, 150, 0, 800, 50, 100, 0, 0, 0, 0, 0];
  costData: number[] = [200, 70, 120, 200, 300, 50, 50, 0, 0, 0, 0, 0];

  // Monthly calculated data
  monthlyData: MonthlyData[] = [];

  // Reconciliation data
  incomeTypes: string[] = ['Type1', 'Type2', 'Type3'];
  expenseTypes: string[] = ['Type1', 'Type2', 'Type4'];

  incomeReconciliation: { [type: string]: number[] } = {
    'Type1': [2000, 0, 0, 52, 0, 0, 0, 0, 0, 0, 0, 0],
    'Type2': [250, 0, 152, 0, 522, 0, 0, 0, 0, 0, 0, 0],
    'Type3': [200, 0, 0, 225, 0, 0, 0, 0, 0, 0, 0, 0]
  };

  expenseReconciliation: { [type: string]: number[] } = {
    'Type1': [0, 0, 0, 300, 0, 0, 0, 100, 0, 0, 0, 0],
    'Type2': [200, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0],
    'Type4': [0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };

  reconciliationResult: number[] = [];
  finalResult: number[] = [];
  cumulativeFinalResult: number[] = [];

  constructor() {
    this.calculateMonthlyData();
    this.calculateReconciliation();
  }

  calculateMonthlyData(): void {
    this.monthlyData = [];
    let cumulativeIncome = 0;
    let cumulativeCost = 0;

    for (let i = 0; i < 12; i++) {
      cumulativeIncome += this.incomeData[i];
      cumulativeCost += this.costData[i];
      const result = this.incomeData[i] - this.costData[i];

      this.monthlyData.push({
        income: this.incomeData[i],
        cumulativeIncome: cumulativeIncome,
        cost: this.costData[i],
        cumulativeCost: cumulativeCost,
        result: result
      });
    }
  }

  calculateReconciliation(): void {
    this.reconciliationResult = [];
    this.finalResult = [];
    this.cumulativeFinalResult = [];

    for (let i = 0; i < 12; i++) {
      // Calculate total income reconciliation for the month
      let totalIncome = 0;
      this.incomeTypes.forEach(type => {
        totalIncome += this.incomeReconciliation[type][i];
      });

      // Calculate total expense reconciliation for the month
      let totalExpense = 0;
      this.expenseTypes.forEach(type => {
        totalExpense += this.expenseReconciliation[type][i];
      });

      // Reconciliation result = total income - total expense
      const reconResult = totalIncome - totalExpense;
      this.reconciliationResult.push(reconResult);

      // Final result = monthly result + reconciliation result
      const finalRes = this.monthlyData[i].result + reconResult;
      this.finalResult.push(finalRes);
    }

    // Calculate cumulative final result
    let cumulative = 0;
    for (let i = 0; i < 12; i++) {
      cumulative += this.finalResult[i];
      this.cumulativeFinalResult.push(cumulative);
    }
  }

  onReconciliationChange(): void {
    this.calculateReconciliation();
  }

  onSubmit(): void {
    const data = {
      year: this.yearFrom,
      yearRange: {
        from: this.yearFrom,
        to: this.yearTo
      },
      monthlyData: this.monthlyData,
      reconciliation: {
        income: this.incomeReconciliation,
        expense: this.expenseReconciliation,
        result: this.reconciliationResult
      },
      finalResult: this.finalResult,
      cumulativeFinalResult: this.cumulativeFinalResult,
      submittedAt: new Date().toISOString()
    };

    // Save to localStorage (simulating backend storage)
    const savedData = localStorage.getItem('reconciliationData');
    let allData = savedData ? JSON.parse(savedData) : [];
    allData.push(data);
    localStorage.setItem('reconciliationData', JSON.stringify(allData));

    // Log the JSON data
    console.log('Submitted Data:', JSON.stringify(data, null, 2));

    // Download as JSON file
    this.downloadJSON(data);

    alert('Data saved successfully! Check console for JSON output.');
  }

  downloadJSON(data: any): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation_${this.yearFrom}_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
