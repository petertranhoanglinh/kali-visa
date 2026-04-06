import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { UpgradeService } from 'src/app/service/upgrade.service';
import { MemberModel } from 'src/app/model/member.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  @Input() selectedPlan: any;
  @Output() cancel = new EventEmitter<void>();

  selectedFile: File | null = null;
  currentUser: MemberModel | null = null;
  loading = false;
  selectedMonths = 1;
  monthOptions = [1, 3, 6, 12];

  constructor(
    private upgradeService: UpgradeService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (AuthDetail.isLogin()) {
      this.currentUser = AuthDetail.getLoginedInfo();
    }
    
    const planJson = localStorage.getItem('selectedPlan');
    if (planJson) {
      this.selectedPlan = JSON.parse(planJson);
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  processPayment() {
    if (!this.selectedFile) {
      alert('Vui lòng tải ảnh screenshot thanh toán!');
      return;
    }

    if (!this.currentUser) {
      alert('Bạn cần đăng nhập để tiếp tục!');
      return;
    }

    this.loading = true;
    this.upgradeService.submitRequest(
      this.currentUser.id,
      this.currentUser.username || this.currentUser.email,
      this.selectedPlan.name,
      this.selectedMonths,
      this.selectedFile
    ).subscribe({
      next: (res) => {
        alert('Yêu cầu đã được gửi! Vui lòng chờ Admin xác nhận.');
        this.loading = false;
        if (this.cancel) {
          this.cancel.emit();
        }
      },
      error: (err) => {
        alert('Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
        this.loading = false;
      }
    });
  }
}
