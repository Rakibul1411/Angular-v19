import { Routes } from '@angular/router';
import { ReconciliationComponent } from './reconciliation/reconciliation.component';

export const routes: Routes = [
  { path: '', component: ReconciliationComponent },
  { path: 'reconciliation', component: ReconciliationComponent }
];
