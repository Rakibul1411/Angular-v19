import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AVCommunicationService } from '../../../core/services/av-communication.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { BrandService } from '../../../core/services/brand.service';
import { Campaign } from '../../../core/models/campaign.model';
import { Brand } from '../../../core/models/brand.model';

@Component({
  selector: 'app-av-communication-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    FileUploadModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './av-communication-form.component.html',
  styleUrl: './av-communication-form.component.css'
})
export class AVCommunicationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private avService = inject(AVCommunicationService);
  private campaignService = inject(CampaignService);
  private brandService = inject(BrandService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  communicationForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  communicationId = signal<string | null>(null);

  campaigns = signal<Campaign[]>([]);
  brands = signal<Brand[]>([]);
  selectedFile = signal<File | null>(null);
  filePreview = signal<string | null>(null);

  ngOnInit(): void {
    this.initializeForm();
    this.loadCampaigns();
    this.loadBrands();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.communicationId.set(id);
      this.loadCommunicationData(id);
    }
  }

  initializeForm(): void {
    this.communicationForm = this.fb.group({
      campaign: ['', Validators.required],
      brand: ['', Validators.required],
      description: [''],
      file: [null, !this.isEditMode() ? Validators.required : null]
    });
  }

  loadCampaigns(): void {
    this.campaignService.getAllCampaigns().subscribe({
      next: (response) => {
        this.campaigns.set(response.data);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to load campaigns'
        });
      }
    });
  }

  loadBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (response) => {
        this.brands.set(response.data);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to load brands'
        });
      }
    });
  }

  loadCommunicationData(id: string): void {
    this.loading.set(true);
    this.avService.getAVCommunicationById(id).subscribe({
      next: (response) => {
        const data = response.data;
        this.communicationForm.patchValue({
          campaign: data.campaign,
          brand: data.brand,
          description: data.description
        });
        this.filePreview.set(this.avService.getFileUrl(data.filePath));
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to load communication data'
        });
        this.loading.set(false);
        this.router.navigate(['/app/av-communications']);
      }
    });
  }

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.communicationForm.patchValue({ file: file });

      // Create preview for video/audio
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onFileSelectNative(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Check file size (30MB for video/audio)
      const maxSize = 30 * 1024 * 1024;
      if (file.size > maxSize) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'File size should not exceed 30MB'
        });
        return;
      }

      this.selectedFile.set(file);
      this.communicationForm.patchValue({ file: file });

      // Create preview for video/audio
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onFileRemove(): void {
    this.selectedFile.set(null);
    this.communicationForm.patchValue({ file: null });
    if (!this.isEditMode()) {
      this.filePreview.set(null);
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.filePreview.set(null);
    this.communicationForm.patchValue({ file: null });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.communicationForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields'
      });
      return;
    }

    this.submitting.set(true);
    const formData = this.communicationForm.value;

    if (this.isEditMode() && this.communicationId()) {
      // Update existing communication
      const updateData = {
        campaign: formData.campaign,
        brand: formData.brand,
        description: formData.description,
        ...(this.selectedFile() && { file: this.selectedFile()! })
      };

      this.avService.updateAVCommunication(this.communicationId()!, updateData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Communication updated successfully'
          });
          this.submitting.set(false);
          this.router.navigate(['/app/av-communications']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update communication'
          });
          this.submitting.set(false);
        }
      });
    } else {
      // Create new communication
      const createData = {
        campaign: formData.campaign,
        brand: formData.brand,
        description: formData.description,
        file: this.selectedFile()!
      };

      this.avService.createAVCommunication(createData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Communication created successfully'
          });
          this.submitting.set(false);
          this.router.navigate(['/app/av-communications']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to create communication'
          });
          this.submitting.set(false);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/app/av-communications']);
  }
}
