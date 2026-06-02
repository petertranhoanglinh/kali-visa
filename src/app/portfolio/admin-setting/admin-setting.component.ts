import { Component, OnInit } from '@angular/core';
import { SystemConfigService, SystemConfig } from 'src/app/service/system-config.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-setting',
  templateUrl:"./admin-setting.component.html",
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
