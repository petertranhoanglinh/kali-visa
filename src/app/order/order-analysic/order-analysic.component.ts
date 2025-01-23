import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-order-analysic',
  templateUrl: './order-analysic.component.html',
  styleUrls: ['./order-analysic.component.css']
})
export class OrderAnalysicComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.renderOrderChart();
    this.renderRevenueChart();
    this.renderCustomerTrendChart();
  }

  renderOrderChart(): void {
    const lastSixMonths = this.getLastSixMonths(); // Lấy tên 6 tháng gần nhất

    new Chart('orderChart', {
      type: 'line',
      data: {
        labels: lastSixMonths, // Sử dụng tên tháng
        datasets: [{
          label: 'Orders',
          data: [65, 59, 80, 81, 56, 55], // Dữ liệu có thể được lấy từ API hoặc nguồn dữ liệu khác
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }


  renderRevenueChart(): void {
    new Chart('revenueChart', {
      type: 'bar',
      data: {
        labels: this.getLastSixMonths(),
        datasets: [{
          label: 'Revenue',
          data: [20000, 25000, 30000, 40000, 50000, 55000],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }]
      }
    });
  }

  renderCustomerTrendChart(): void {
    new Chart('customerTrendChart', {
      type: 'pie',
      data: {
        labels: ['Clothing', 'Electronics', 'Home Appliances', 'Books', 'Others'],
        datasets: [{
          label: 'Customer Trends',
          data: [45, 25, 15, 10, 5],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ]
        }]
      }
    });
  }

  getLastSixMonths(): string[] {
    const months: string[] = [];
    const currentDate = new Date();

    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentDate.getMonth() - i + 12) % 12; // Tính chỉ số tháng
      months.unshift(currentDate.toLocaleString('default', { month: 'long' })); // Lấy tên tháng
      currentDate.setMonth(currentDate.getMonth() - 1); // Giảm tháng
    }

    return months;
  }


}
