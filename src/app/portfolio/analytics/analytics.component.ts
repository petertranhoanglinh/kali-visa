import { Component, OnInit } from '@angular/core';
import { ChartData, ChartType, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  // Premium State
  isPremium = false; // Set to false to show paywall

  // 1. Whale Tracker Chart (Bar Chart)
  public whaleChartType: 'bar' = 'bar';
  public whaleChartData: ChartData<'bar'> = {
    labels: ['VCB', 'SSI', 'HSG', 'Hpg', 'VHM', 'MWG'],
    datasets: [
      {
        label: 'Tự Doanh Bán Ròng (Tỷ VNĐ)',
        data: [-120, -50, -32, 0, 0, 0],
        backgroundColor: '#ef4444',
      },
      {
        label: 'Khối Ngoại Mua Ròng (Tỷ VNĐ)',
        data: [0, 0, 0, 85, 150, 310],
        backgroundColor: '#10b981',
      }
    ]
  };
  public whaleChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
      x: { grid: { display: false } }
    },
    plugins: { legend: { position: 'top' } }
  };

  // 2. Stress Test Chart (Line Chart)
  public stressChartType: 'line' = 'line';
  public stressChartData: ChartData<'line'> = {
    labels: ['T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'Today', 'T+1 (Sập Covid)', 'T+2', 'T+3'],
    datasets: [
      {
        label: 'Dự báo Bình thường (Net Worth)',
        data: [1200, 1220, 1250, 1240, 1260, 1250, 1265, 1280, 1300],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Giả lập Khủng hoảng (Rớt 20%)',
        data: [1200, 1220, 1250, 1240, 1260, 1250, 1000, 950, 880],
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };
  public stressChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { title: { display: true, text: 'Triệu VNĐ' } }
    },
    plugins: {
      tooltip: { mode: 'index', intersect: false }
    }
  };

  constructor() { }

  ngOnInit(): void {
  }
}
