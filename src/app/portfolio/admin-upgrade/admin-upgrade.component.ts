import { Component, OnInit } from '@angular/core';
import { UpgradeService } from 'src/app/service/upgrade.service';
import { environment } from 'src/environments/environment';
import { AuthDetail } from 'src/app/common/util/auth-detail';

@Component({
  selector: 'app-admin-upgrade',
  templateUrl: './admin-upgrade.component.html',
  styleUrls: ['./admin-upgrade.component.css']
})
export class AdminUpgradeComponent implements OnInit {
  pendingRequests: any[] = [];
  loading = false;
  apiBase = environment.apiUrl;

  constructor(private upgradeService: UpgradeService) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    const jwt = AuthDetail.getCookie("jwt") || '';
    this.upgradeService.getPendingRequests(jwt).subscribe({
      next: (res) => {
        this.pendingRequests = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  approve(req: any) {
    const suggestedDays = (req.durationMonths || 1) * 30;
    const days = prompt(`Xác nhận số ngày gia hạn cho gói ${req.targetTier} (${req.durationMonths} tháng):`, suggestedDays.toString());
    if (days === null) return;

    const jwt = AuthDetail.getCookie("jwt") || '';
    this.upgradeService.approveRequest(req.id, parseInt(days), jwt).subscribe({
      next: (res) => {
        alert('Đã phê duyệt thành công!');
        this.loadRequests();
      },
      error: (err) => alert('Lỗi: ' + err.message)
    });
  }

  reject(id: string) {
    const note = prompt('Lý do từ chối:');
    if (note === null) return;

    const jwt = AuthDetail.getCookie("jwt") || '';
    this.upgradeService.rejectRequest(id, note, jwt).subscribe({
      next: (res) => {
        alert('Đã từ chối yêu cầu.');
        this.loadRequests();
      },
      error: (err) => alert('Lỗi: ' + err.message)
    });
  }
}
