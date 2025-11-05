import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { RegionDataService } from '../services/region-data.service';
import { SelectOption, Territory, SalesPoint } from '../models/region.model';

@Component({
  selector: 'app-sales-territory',
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    ChipModule,
    CardModule,
    TableModule
  ],
  templateUrl: './sales-territory.component.html',
  styleUrl: './sales-territory.component.css'
})
export class SalesTerritoryComponent implements OnInit {
  // Dropdown options
  regionOptions: SelectOption[] = [];
  areaOptions: SelectOption[] = [];
  territoryOptions: SelectOption[] = [];
  salesPointOptions: SelectOption[] = [];

  // Selected values
  selectedRegionIds: number[] = [];
  selectedAreaIds: number[] = [];
  selectedTerritoryIds: number[] = [];
  selectedSalesPointIds: number[] = [];

  // Loading states
  loadingRegions = false;
  loadingAreas = false;
  loadingTerritories = false;
  loadingSalesPoints = false;

  constructor(private regionDataService: RegionDataService) {}

  ngOnInit(): void {
    this.loadRegions();
  }

  /**
   * Load all regions on init
   */
  loadRegions(): void {
    this.loadingRegions = true;
    this.regionDataService.getRegionOptions().subscribe({
      next: (options) => {
        this.regionOptions = options;
        this.loadingRegions = false;
      },
      error: (err) => {
        console.error('Error loading regions:', err);
        this.loadingRegions = false;
      }
    });
  }

  /**
   * When region changes, load areas and clear selections
   */
  onRegionChange(): void {
    // Clear previous selections
    this.selectedAreaIds = [];
    this.selectedTerritoryIds = [];
    this.selectedSalesPointIds = [];
    this.areaOptions = [];
    this.territoryOptions = [];
    this.salesPointOptions = [];

    if (!this.selectedRegionIds || this.selectedRegionIds.length === 0) return;

    this.loadingAreas = true;
    this.regionDataService.getAreaOptionsByRegions(this.selectedRegionIds).subscribe({
      next: (options) => {
        this.areaOptions = options;
        this.loadingAreas = false;
      },
      error: (err) => {
        console.error('Error loading areas:', err);
        this.loadingAreas = false;
      }
    });
  }

  /**
   * When areas change, load territories for selected areas
   */
  onAreaChange(): void {
    // Clear territory and sales point selections
    this.selectedTerritoryIds = [];
    this.selectedSalesPointIds = [];
    this.territoryOptions = [];
    this.salesPointOptions = [];

    if (!this.selectedAreaIds || this.selectedAreaIds.length === 0) return;

    // Load territories
    this.loadingTerritories = true;
    this.regionDataService.getTerritoriesByAreas(this.selectedAreaIds).subscribe({
      next: (territories) => {
        this.territoryOptions = territories.map(t => ({
          label: `${t.code} - ${t.name}`,
          value: t.id
        }));
        this.loadingTerritories = false;
      },
      error: (err) => {
        console.error('Error loading territories:', err);
        this.loadingTerritories = false;
      }
    });
  }

  /**
   * When territories change, load sales points for selected territories
   */
  onTerritoryChange(): void {
    // Clear sales point selections
    this.selectedSalesPointIds = [];
    this.salesPointOptions = [];

    if (!this.selectedTerritoryIds || this.selectedTerritoryIds.length === 0) return;

    // Load sales points for selected territories
    this.loadingSalesPoints = true;
    this.regionDataService.getSalesPointsByTerritories(this.selectedTerritoryIds).subscribe({
      next: (salesPoints) => {
        this.salesPointOptions = salesPoints.map(sp => ({
          label: `${sp.code} - ${sp.name}`,
          value: sp.salesPointId
        }));
        this.loadingSalesPoints = false;
      },
      error: (err) => {
        console.error('Error loading sales points:', err);
        this.loadingSalesPoints = false;
      }
    });
  }

  /**
   * When sales points change (optional handler for future use)
   */
  onSalesPointChange(): void {
    // Can be used for additional logic when sales points are selected
    console.log('Selected sales points:', this.selectedSalesPointIds);
  }

  /**
   * Toggle select all areas
   */
  toggleAllAreas(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedAreaIds = this.areaOptions.map(a => a.value);
    } else {
      this.selectedAreaIds = [];
    }
    this.onAreaChange();
  }
}
