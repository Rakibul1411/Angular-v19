import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AVCommunicationService } from '../../../core/services/av-communication.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  AVCommunication,
  AVCommunicationFilter
} from '../../../core/models/av-communication.model';

@Component({
  selector: 'app-av-communication-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './av-communication-list.component.html',
  styleUrl: './av-communication-list.component.css'
})
export class AVCommunicationListComponent implements OnInit {
  private avService = inject(AVCommunicationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Signals
  avCommunications = signal<AVCommunication[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);
  currentUser = this.authService.currentUser;

  // Pagination
  first = signal<number>(0);
  rows = signal<number>(10);
  currentPage = computed(() => Math.floor(this.first() / this.rows()) + 1);

  rowsPerPageOptions = [10, 25, 50];
  searchQuery = signal<string>('');
  showSuccessToast = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAVCommunications();
  }

  loadAVCommunications(): void {
    this.loading.set(true);

    const filter: AVCommunicationFilter = {
      page: this.currentPage(),
      limit: this.rows()
    };

    this.avService.getAllAVCommunications(filter).subscribe({
      next: (response) => {
        this.avCommunications.set(response.data);
        this.totalRecords.set(response.pagination?.total || response.data.length);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to load AV Communications'
        });
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: any): void {
    this.first.set(event.first);
    this.rows.set(event.rows);
    this.loadAVCommunications();
  }

  viewDetails(id: string): void {
    this.router.navigate(['/app/av-communications', id]);
  }

  editAVCommunication(id: string): void {
    this.router.navigate(['/app/av-communications/edit', id]);
  }

  deleteAVCommunication(av: AVCommunication): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${av.fileName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.avService.deleteAVCommunication(av._id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'AV Communication deleted successfully'
            });
            this.loadAVCommunications();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to delete AV Communication'
            });
          }
        });
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/app/av-communications/create']);
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('video/')) return 'pi pi-video';
    if (mimeType.startsWith('audio/')) return 'pi pi-volume-up';
    if (mimeType.startsWith('image/')) return 'pi pi-image';
    return 'pi pi-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  onSearch(): void {
    // Implement search functionality
    this.loadAVCommunications();
  }

  exportData(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Export functionality coming soon'
    });
  }

  getFileIconBgClass(mimeType: string): string {
    if (mimeType.startsWith('video/')) return 'bg-blue-100';
    if (mimeType.startsWith('audio/')) return 'bg-green-100';
    if (mimeType.startsWith('image/')) return 'bg-purple-100';
    return 'bg-gray-100';
  }

  getFileIconClass(mimeType: string): string {
    if (mimeType.startsWith('video/')) return 'text-blue-600';
    if (mimeType.startsWith('audio/')) return 'text-green-600';
    if (mimeType.startsWith('image/')) return 'text-purple-600';
    return 'text-gray-600';
  }
}
