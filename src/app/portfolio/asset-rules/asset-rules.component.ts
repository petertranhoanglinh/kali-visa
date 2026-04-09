import { Component, OnInit } from '@angular/core';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { CommonUtils } from 'src/app/common/util/common-utils';
import { AssetRule, RebalanceAnalysis } from 'src/app/model/asset-rule.model';
import { AssetRuleService } from 'src/app/service/asset-rule.service';

@Component({
  selector: 'app-asset-rules',
  templateUrl: './asset-rules.component.html',
  styleUrls: ['./asset-rules.component.css']
})
export class AssetRulesComponent implements OnInit {

  rules: AssetRule[] = [];
  analysisResult: RebalanceAnalysis | null = null;
  isPremium: boolean = false;
  
  // Form State
  showAddModal = false;
  newRule: AssetRule = {
    assetType: 'STOCK',
    targetPercentage: 10,
    thresholdPercent: 5,
    ruleName: '',
    operator: 'DEVIATION',
    isActive: true
  };

  constructor(private ruleService: AssetRuleService) { }

  ngOnInit(): void {
      this.isPremium = CommonUtils.checkPremiumStatus( AuthDetail.getLoginedInfo());
      if (this.isPremium) {
        this.loadData();
      }
  }

  loadData() {
    this.ruleService.getMyRules().subscribe(res => this.rules = res);
    this.ruleService.analyzePortfolio().subscribe(res => this.analysisResult = res);
  }

  toggleAddModal() {
    this.showAddModal = !this.showAddModal;
  }

  saveRule() {
    if (!this.newRule.ruleName) return;

    // Fix: Đảm bảo dữ liệu gửi đi là kiểu Number để Backend (Double) không bị lỗi map JSON
    const ruleToSave = {
      ...this.newRule,
      targetPercentage: Number(this.newRule.targetPercentage),
      thresholdPercent: Number(this.newRule.thresholdPercent)
    };

    this.ruleService.saveRule(ruleToSave).subscribe({
      next: () => {
        this.loadData();
        this.showAddModal = false;
        this.newRule.ruleName = '';
      },
      error: (err) => alert(err.error || 'Lỗi khi lưu quy tắc. Vui lòng kiểm tra lại kết nối hoặc phân quyền.')
    });
  }

  // --- TÍNH NĂNG CHIẾN LƯỢC HUYỀN THOẠI ---
  applyTemplate(templateType: string) {
    if (!this.isPremium) return;
    
    let templateRules: any[] = [];
    
    if (templateType === 'GRAHAM') {
      templateRules = [
        { ruleName: 'Graham: Tăng trưởng', assetType: 'STOCK', targetPercentage: 50, thresholdPercent: 5, isActive: true },
        { ruleName: 'Graham: An toàn', assetType: 'GOLD', targetPercentage: 50, thresholdPercent: 5, isActive: true }
      ];
    } else if (templateType === 'DALIO') {
      templateRules = [
        { ruleName: 'Dalio: Cổ phiếu', assetType: 'STOCK', targetPercentage: 30, thresholdPercent: 5, isActive: true },
        { ruleName: 'Dalio: Vàng & Trái phiếu', assetType: 'GOLD', targetPercentage: 50, thresholdPercent: 5, isActive: true },
        { ruleName: 'Dalio: Chống lạm phát', assetType: 'CRYPTO', targetPercentage: 20, thresholdPercent: 5, isActive: true }
      ];
    } else if (templateType === 'BUFFETT') {
      templateRules = [
        { ruleName: 'Buffett: Giá trị', assetType: 'STOCK', targetPercentage: 90, thresholdPercent: 5, isActive: true },
        { ruleName: 'Buffett: Tiền mặt', assetType: 'CASH', targetPercentage: 10, thresholdPercent: 5, isActive: true }
      ];
    }

    if (templateRules.length === 0) return;

    // Kiểm tra giới hạn 5 quy tắc của gói PRO
    if (this.rules.length + templateRules.length > 5) {
      alert("Chiến lược này vượt quá giới hạn 5 quy tắc của bạn. Vui lòng xóa bớt quy tắc cũ.");
      return;
    }

    // Lưu tuần tự các quy tắc trong template
    let completed = 0;
    templateRules.forEach(r => {
      this.ruleService.saveRule(r).subscribe(() => {
        completed++;
        if (completed === templateRules.length) {
          alert(`Đã áp dụng chiến lược ${templateType} thành công!`);
          this.loadData();
        }
      });
    });
  }

  deleteRule(id: string) {
    if (confirm('Bạn có chắc chắn muốn xóa quy tắc này?')) {
      this.ruleService.deleteRule(id).subscribe(() => this.loadData());
    }
  }
}
