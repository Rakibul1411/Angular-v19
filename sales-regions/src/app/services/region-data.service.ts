import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HierarchyNode, Region, Area, Territory, SalesPoint, SelectOption } from '../models/region.model';

@Injectable({
  providedIn: 'root'
})
export class RegionDataService {
  private readonly dataUrl = 'json/Region-Area-Territory-Salespoint.json';

  constructor(private http: HttpClient) { }

  /**
   * Load the entire JSON hierarchy
   */
  private loadData(): Observable<HierarchyNode[]> {
    return this.http.get<HierarchyNode[]>(this.dataUrl);
  }

  /**
   * Get all regions (top-level nodes under National)
   */
  getRegions(): Observable<Region[]> {
    return this.loadData().pipe(
      map(data => {
        if (!data || data.length === 0) return [];

        const national = data[0]; // The root "National" node
        if (!national.nodes || national.nodes.length === 0) return [];

        return national.nodes.map(regionNode => ({
          id: regionNode.node.id,
          nodeId: regionNode.node.nodeId,
          code: regionNode.node.code,
          name: regionNode.node.name
        }));
      })
    );
  }

  /**
   * Get all areas for a specific region
   */
  getAreasByRegion(regionId: number): Observable<Area[]> {
    return this.loadData().pipe(
      map(data => {
        if (!data || data.length === 0) return [];

        const national = data[0];
        if (!national.nodes) return [];

        const region = national.nodes.find(r => r.node.id === regionId);
        if (!region || !region.nodes) return [];

        return region.nodes.map(areaNode => ({
          id: areaNode.node.id,
          nodeId: areaNode.node.nodeId,
          code: areaNode.node.code,
          name: areaNode.node.name,
          regionId: regionId
        }));
      })
    );
  }

  /**
   * Get all territories for specific area IDs
   */
  getTerritoriesByAreas(areaIds: number[]): Observable<Territory[]> {
    return this.loadData().pipe(
      map(data => {
        if (!data || data.length === 0 || !areaIds || areaIds.length === 0) return [];

        const territories: Territory[] = [];
        const national = data[0];

        if (!national.nodes) return [];

        // Loop through all regions -> areas -> territories
        national.nodes.forEach(region => {
          if (!region.nodes) return;

          region.nodes.forEach(area => {
            // Only process areas that are in our selection
            if (areaIds.includes(area.node.id)) {
              if (area.nodes && area.nodes.length > 0) {
                area.nodes.forEach(territoryNode => {
                  territories.push({
                    id: territoryNode.node.id,
                    nodeId: territoryNode.node.nodeId,
                    code: territoryNode.node.code,
                    name: territoryNode.node.name,
                    areaId: area.node.id
                  });
                });
              }
            }
          });
        });

        return territories;
      })
    );
  }

  /**
   * Helper: Convert regions to PrimeNG dropdown options
   */
  getRegionOptions(): Observable<SelectOption[]> {
    return this.getRegions().pipe(
      map(regions => regions.map(r => ({
        label: `${r.code} - ${r.name}`,
        value: r.id
      })))
    );
  }

  /**
   * Helper: Convert areas to PrimeNG multiselect options
   */
  getAreaOptions(regionId: number): Observable<SelectOption[]> {
    return this.getAreasByRegion(regionId).pipe(
      map(areas => areas.map(a => ({
        label: `${a.code} - ${a.name}`,
        value: a.id
      })))
    );
  }

  /**
   * Get areas from multiple regions (aggregated)
   */
  getAreasByRegions(regionIds: number[]): Observable<Area[]> {
    return this.loadData().pipe(
      map(data => {
        if (!data || data.length === 0 || !regionIds || regionIds.length === 0) return [];

        const areas: Area[] = [];
        const national = data[0];

        if (!national.nodes) return [];

        // Loop through all selected regions and collect their areas
        national.nodes.forEach(region => {
          if (regionIds.includes(region.node.id)) {
            if (region.nodes && region.nodes.length > 0) {
              region.nodes.forEach(areaNode => {
                areas.push({
                  id: areaNode.node.id,
                  nodeId: areaNode.node.nodeId,
                  code: areaNode.node.code,
                  name: areaNode.node.name,
                  regionId: region.node.id
                });
              });
            }
          }
        });

        return areas;
      })
    );
  }

  /**
   * Helper: Convert areas from multiple regions to PrimeNG multiselect options
   */
  getAreaOptionsByRegions(regionIds: number[]): Observable<SelectOption[]> {
    return this.getAreasByRegions(regionIds).pipe(
      map(areas => areas.map(a => ({
        label: `${a.code} - ${a.name}`,
        value: a.id
      })))
    );
  }

  /**
   * Get all sales points for specific area IDs
   */
  getSalesPointsByAreas(areaIds: number[]): Observable<SalesPoint[]> {
    return this.loadData().pipe(
      map(data => {
        if (!data || data.length === 0 || !areaIds || areaIds.length === 0) return [];

        const salesPoints: SalesPoint[] = [];
        const national = data[0];

        if (!national.nodes) return [];

        // Loop through all regions -> areas -> territories -> sales points
        national.nodes.forEach(region => {
          if (!region.nodes) return;

          region.nodes.forEach(area => {
            // Only process areas that are in our selection
            if (areaIds.includes(area.node.id)) {
              if (area.nodes && area.nodes.length > 0) {
                area.nodes.forEach(territoryNode => {
                  // Check if territory has sales points
                  if (territoryNode.salesPoints && territoryNode.salesPoints.length > 0) {
                    territoryNode.salesPoints.forEach((sp: any) => {
                      salesPoints.push({
                        id: sp.id,
                        salesPointId: sp.salesPointId,
                        code: sp.code,
                        name: sp.name,
                        banglaName: sp.banglaName,
                        officeAddress: sp.officeAddress,
                        contactNo: sp.contactNo,
                        emailAddress: sp.emailAddress,
                        townName: sp.townName,
                        territoryId: territoryNode.node.id
                      });
                    });
                  }
                });
              }
            }
          });
        });

        return salesPoints;
      })
    );
  }

  /**
   * Get all sales points for specific territory IDs
   */
  getSalesPointsByTerritories(territoryIds: number[]): Observable<SalesPoint[]> {
    return this.loadData().pipe(
      map(data => {
        if (!data || data.length === 0 || !territoryIds || territoryIds.length === 0) return [];

        const salesPoints: SalesPoint[] = [];
        const national = data[0];

        if (!national.nodes) return [];

        // Loop through all regions -> areas -> territories -> sales points
        national.nodes.forEach(region => {
          if (!region.nodes) return;

          region.nodes.forEach(area => {
            if (area.nodes && area.nodes.length > 0) {
              area.nodes.forEach(territoryNode => {
                // Only process territories that are in our selection
                if (territoryIds.includes(territoryNode.node.id)) {
                  // Check if territory has sales points
                  if (territoryNode.salesPoints && territoryNode.salesPoints.length > 0) {
                    territoryNode.salesPoints.forEach((sp: any) => {
                      salesPoints.push({
                        id: sp.id,
                        salesPointId: sp.salesPointId,
                        code: sp.code,
                        name: sp.name,
                        banglaName: sp.banglaName,
                        officeAddress: sp.officeAddress,
                        contactNo: sp.contactNo,
                        emailAddress: sp.emailAddress,
                        townName: sp.townName,
                        territoryId: territoryNode.node.id
                      });
                    });
                  }
                }
              });
            }
          });
        });

        return salesPoints;
      })
    );
  }
}
