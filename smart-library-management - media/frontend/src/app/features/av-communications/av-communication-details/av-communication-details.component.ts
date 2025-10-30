import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AVCommunicationService } from '../../../core/services/av-communication.service';
import { AVCommunication } from '../../../core/models/av-communication.model';

@Component({
  selector: 'app-av-communication-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './av-communication-details.component.html',
  styleUrl: './av-communication-details.component.css'
})
export class AVCommunicationDetailsComponent implements OnInit {
  private avService = inject(AVCommunicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;

  communication = signal<AVCommunication | null>(null);
  loading = signal<boolean>(false);
  fileUrl = signal<string>('');
  showMediaModal = signal<boolean>(false);
  isPlaying = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCommunicationDetails(id);
    }
  }

  loadCommunicationDetails(id: string): void {
    this.loading.set(true);
    this.avService.getAVCommunicationById(id).subscribe({
      next: (response) => {
        this.communication.set(response.data);
        this.fileUrl.set(this.avService.getFileUrl(response.data.filePath));
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to load communication details'
        });
        this.loading.set(false);
        this.router.navigate(['/app/av-communications']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/av-communications']);
  }

  editCommunication(): void {
    const comm = this.communication();
    if (comm) {
      this.router.navigate(['/app/av-communications/edit', comm._id]);
    }
  }

  deleteCommunication(): void {
    const comm = this.communication();
    if (!comm) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${comm.fileName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.avService.deleteAVCommunication(comm._id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Communication deleted successfully'
            });
            setTimeout(() => {
              this.router.navigate(['/app/av-communications']);
            }, 1000);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to delete communication'
            });
          }
        });
      }
    });
  }

  playMedia(): void {
    // Play video directly in the details page
    if (this.videoElement?.nativeElement) {
      this.isPlaying.set(true);
      this.videoElement.nativeElement.play().catch(error => {
        console.error('Error playing video:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Playback Error',
          detail: 'Unable to play video. Please try again.'
        });
        this.isPlaying.set(false);
      });
    }
  }

  closeModal(): void {
    this.showMediaModal.set(false);
    this.isPlaying.set(false);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  isAudio(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }
}
