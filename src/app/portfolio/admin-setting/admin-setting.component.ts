import { Component, OnInit } from '@angular/core';
import { SystemConfigService, SystemConfig } from 'src/app/service/system-config.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-setting',
  template: `
    <div class="container mt-5">
      <div class="card shadow-sm border-0 rounded-lg">
        <div class="card-header bg-primary text-white py-3">
          <h4 class="mb-0"><i class="fas fa-cogs me-2"></i> CÀI ĐẶT HỆ THỐNG</h4>
        </div>
        <div class="card-body p-4">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group mb-4">
                <label class="form-label fw-bold text-uppercase small text-muted">Tỷ giá USD/VND</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">1 USD =</span>
                  <input type="number" class="form-control form-control-lg border-start-0" 
                         [(ngModel)]="exchangeRate" placeholder="Ví dụ: 25450">
                  <span class="input-group-text bg-light">VND</span>
                </div>
                <div class="form-text mt-2">Tỷ giá này sẽ được dùng để tính toán toàn bộ tài sản USD sang VND cho người dùng.</div>
              </div>
              
              <button class="btn btn-primary btn-lg px-5 text-uppercase fw-bold" 
                      (click)="saveRate()" [disabled]="isLoading">
                {{ isLoading ? 'ĐANG LƯU...' : 'LƯU GIÁ TRỊ PRO' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { transition: transform 0.2s; }
    .form-control:focus { box-shadow: none; border-color: #3b82f6; }
    .input-group-text { border-color: #dee2e6; }
  `]
})
export class AdminSettingComponent implements OnInit {
  exchangeRate: number = 25000;
  isLoading = false;

  constructor(
    private configService: SystemConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCurrentRate();
  }

  loadCurrentRate() {
    this.isLoading = true;
    this.configService.getConfig('USD_VND_RATE').subscribe({
      next: (res) => {
        if (res && res.configValue) {
          this.exchangeRate = Number(res.configValue);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  saveRate() {
    if (this.exchangeRate <= 0) {
      this.toastr.warning("Tỷ giá phải lớn hơn 0");
      return;
    }

    this.isLoading = true;
    const config: SystemConfig = {
      configKey: 'USD_VND_RATE',
      configValue: this.exchangeRate.toString(),
      description: 'Tỷ giá hối đoái USD sang VND toàn hệ thống'
    };

    this.configService.updateConfig(config).subscribe({
      next: () => {
        this.toastr.success("Đã cập nhật tỷ giá thành công!");
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error("Không thể cập nhật tỷ giá");
        this.isLoading = false;
      }
    });
  }
}
