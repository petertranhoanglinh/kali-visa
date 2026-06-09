import { Component, OnInit } from '@angular/core';
import { SystemConfigService, SystemConfig } from 'src/app/service/system-config.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-setting',
  templateUrl: "./admin-setting.component.html",
  styleUrls: ["./admin-setting.component.css"]
})
export class AdminSettingComponent implements OnInit {
  // System configurations
  exchangeRate: number = 25400;
  premiumCost: number = 199000;
  maintenanceMode: 'ON' | 'OFF' = 'OFF';
  maintenanceMessage: string = 'Hệ thống đang được bảo trì để nâng cấp dịch vụ. Vui lòng quay lại sau.';
  maxAssetsBasic: number = 10;
  aiLimitBasic: number = 3;
  telegramAlertEnabled: 'ON' | 'OFF' = 'ON';
  geminiApiKeys: string = '';

  isLoading = false;

  constructor(
    private configService: SystemConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadAllSettings();
  }

  loadAllSettings() {
    this.isLoading = true;
    
    // Define helper to catch error and return null so forkJoin doesn't fail
    const loadKey = (key: string) => this.configService.getConfig(key).pipe(
      catchError(() => of(null))
    );

    forkJoin({
      rate: loadKey('USD_VND_RATE'),
      cost: loadKey('PREMIUM_TIER_COST'),
      maintenance: loadKey('MAINTENANCE_MODE'),
      message: loadKey('MAINTENANCE_MESSAGE'),
      maxAssets: loadKey('MAX_ASSETS_PER_USER_BASIC'),
      aiLimit: loadKey('AI_ANALYSIS_DAILY_LIMIT_BASIC'),
      telegramAlert: loadKey('TELEGRAM_ALERT_ENABLED'),
      apiKeys: loadKey('GEMINI_API_KEYS')
    }).subscribe({
      next: (res) => {
        if (res.rate && res.rate.configValue) {
          this.exchangeRate = Number(res.rate.configValue);
        }
        if (res.cost && res.cost.configValue) {
          this.premiumCost = Number(res.cost.configValue);
        }
        if (res.maintenance && res.maintenance.configValue) {
          this.maintenanceMode = res.maintenance.configValue as 'ON' | 'OFF';
        }
        if (res.message && res.message.configValue) {
          this.maintenanceMessage = res.message.configValue;
        }
        if (res.maxAssets && res.maxAssets.configValue) {
          this.maxAssetsBasic = Number(res.maxAssets.configValue);
        }
        if (res.aiLimit && res.aiLimit.configValue) {
          this.aiLimitBasic = Number(res.aiLimit.configValue);
        }
        if (res.telegramAlert && res.telegramAlert.configValue) {
          this.telegramAlertEnabled = res.telegramAlert.configValue as 'ON' | 'OFF';
        }
        if (res.apiKeys && res.apiKeys.configValue) {
          this.geminiApiKeys = res.apiKeys.configValue;
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error("Có lỗi xảy ra khi tải cài đặt!");
        this.isLoading = false;
      }
    });
  }

  saveSettings() {
    // Validations
    if (this.exchangeRate <= 0) {
      this.toastr.warning("Tỷ giá phải lớn hơn 0");
      return;
    }
    if (this.premiumCost < 0) {
      this.toastr.warning("Phí premium không được âm");
      return;
    }
    if (this.maxAssetsBasic <= 0) {
      this.toastr.warning("Số lượng tài sản Basic tối đa phải lớn hơn 0");
      return;
    }
    if (this.aiLimitBasic < 0) {
      this.toastr.warning("Giới hạn lượt phân tích AI không được âm");
      return;
    }

    this.isLoading = true;

    // Create array of requests
    const configs: SystemConfig[] = [
      { configKey: 'USD_VND_RATE', configValue: this.exchangeRate.toString(), description: 'Tỷ giá hối đoái USD sang VND (Nhập tay)' },
      { configKey: 'PREMIUM_TIER_COST', configValue: this.premiumCost.toString(), description: 'Giá tiền nâng cấp Premium hàng tháng (VND)' },
      { configKey: 'MAINTENANCE_MODE', configValue: this.maintenanceMode, description: 'Trạng thái bảo trì toàn hệ thống (ON/OFF)' },
      { configKey: 'MAINTENANCE_MESSAGE', configValue: this.maintenanceMessage, description: 'Thông báo hiển thị khi bảo trì hệ thống' },
      { configKey: 'MAX_ASSETS_PER_USER_BASIC', configValue: this.maxAssetsBasic.toString(), description: 'Số lượng tài sản tối đa của tài khoản Basic' },
      { configKey: 'AI_ANALYSIS_DAILY_LIMIT_BASIC', configValue: this.aiLimitBasic.toString(), description: 'Số lượt phân tích AI tối đa hàng ngày của tài khoản Basic' },
      { configKey: 'TELEGRAM_ALERT_ENABLED', configValue: this.telegramAlertEnabled, description: 'Bật/tắt gửi thông báo biến động qua Telegram (ON/OFF)' },
      { configKey: 'GEMINI_API_KEYS', configValue: this.geminiApiKeys, description: 'Danh sách Gemini API Keys xoay vòng (cách nhau bởi dấu phẩy hoặc dòng mới)' }
    ];

    const saveRequests = configs.map(c => this.configService.updateConfig(c));

    forkJoin(saveRequests).subscribe({
      next: () => {
        this.toastr.success("Cấu hình hệ thống đã được cập nhật thành công!");
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error("Lỗi khi lưu cấu hình!");
        this.isLoading = false;
      }
    });
  }
}
