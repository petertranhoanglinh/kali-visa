import { Component, OnInit } from '@angular/core';

export interface NewsItem {
  id: string;
  source: string;
  title: string;
  summary: string;
  time: string;
  aiScore: number;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  category: 'Macro' | 'Crypto' | 'Stock';
}

@Component({
  selector: 'app-news-summary',
  templateUrl: './news-summary.component.html',
  styleUrls: ['./news-summary.component.css']
})
export class NewsSummaryComponent implements OnInit {

  // Tin khẩn cấp (Hot News - Score >= 8)
  hotNews: NewsItem[] = [
    {
      id: 'n1',
      source: 'Bloomberg (Crawl)',
      title: 'FED bất ngờ đánh tiếng giữ nguyên lãi suất trong tháng tới',
      summary: 'Các quan chức Fed báo hiệu lạm phát cốt lõi vẫn còn dai dẳng. Xác suất giảm lãi suất tháng 11 rơi xuống mức 15%.',
      time: '15 phút trước',
      aiScore: 9,
      sentiment: 'Bearish',
      category: 'Macro'
    },
    {
      id: 'n2',
      source: 'CafeF',
      title: 'Khối ngoại bán ròng kỷ lục 2.000 tỷ trên HOSE phiên cuối tuần',
      summary: 'Quỹ ETF ngoại xả hàng mạnh ở các nhóm trụ VN30. Tiêu điểm là VHM và MSN bị bán tháo không thương tiếc.',
      time: '1 giờ trước',
      aiScore: 8.5,
      sentiment: 'Bearish',
      category: 'Stock'
    }
  ];

  // Tin Vĩ Mô / Thường quy
  dailyNews: NewsItem[] = [
    {
      id: 'n3',
      source: 'CryptoPanic',
      title: 'Cá voi thức giấc: 15,000 BTC vừa được chuyển lên sàn Binance',
      summary: 'Biến động lớn on-chain ngụ ý một áp lực bán tiềm tàng trên thị trường Crypto trong 24h tới.',
      time: '4 giờ trước',
      aiScore: 7,
      sentiment: 'Bearish',
      category: 'Crypto'
    },
    {
      id: 'n4',
      source: 'VnEconomy',
      title: 'Giá vàng miếng SJC bất ngờ quay đầu giảm nửa triệu đồng',
      summary: 'Ảnh hưởng từ nhịp điều chỉnh của vàng thế giới, vàng SJC trong nước sáng nay lùi về mốc 89 triệu đồng/lượng.',
      time: '5 giờ trước',
      aiScore: 6,
      sentiment: 'Neutral',
      category: 'Macro'
    },
    {
      id: 'n5',
      source: 'Reuters',
      title: 'Apple báo cáo doanh thu vượt kỳ vọng, cổ phiếu công nghệ bay cao',
      summary: 'Cú huých lớn cho Nasdaq khi gã khổng lồ Apple đưa ra kỳ vọng doanh số bùng nổ cuối năm. Lực cầu lan tỏa thị trường chứng khoán toàn cầu.',
      time: '12 giờ trước',
      aiScore: 8,
      sentiment: 'Bullish',
      category: 'Stock'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
