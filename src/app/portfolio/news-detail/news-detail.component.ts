import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from 'src/app/service/news.service';
import { MarketNews } from 'src/app/model/market-news.model';
import { CommentModel } from 'src/app/model/social.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.css']
})
export class NewsDetailComponent implements OnInit {

  news: MarketNews | null = null;
  comments: CommentModel[] = [];
  newCommentContent: string = '';
  isLoading: boolean = true;

  currentUserId: string = '';
  currentUserName: string = 'Khách';

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private toastr: ToastrService,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    const user = AuthDetail.getLoginedInfo();
    if (user) {
      this.currentUserId = user.id;
      this.currentUserName = user.email || 'Nhà Đầu Tư';
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.newsService.getNewsById(id).subscribe({
        next: (data) => {
          this.news = data;
          this.isLoading = false;
          this.updateSeoTags(data);
          this.loadComments(id);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  loadComments(id: string) {
    this.newsService.getComments(id).subscribe(res => {
      this.comments = res;
    });
  }

  submitComment() {
    if (!this.newCommentContent.trim()) return;
    if (!this.currentUserId) {
      this.toastr.warning("Vui lòng đăng nhập để bình luận.");
      return;
    }

    const comment: CommentModel = {
      postId: this.news!.id!,
      authorId: this.currentUserId,
      authorName: this.currentUserName,
      content: this.newCommentContent
    };

    this.newsService.addComment(this.news!.id!, comment).subscribe({
      next: (res) => {
        this.comments.push(res);
        this.newCommentContent = '';
        this.toastr.success("Đã đăng bình luận!");
      },
      error: () => this.toastr.error("Không thể gửi bình luận.")
    });
  }

  updateSeoTags(news: MarketNews) {
    const title = `${news.title} | T'L Wealth`;
    const description = news.summary || (news.content ? news.content.substring(0, 160) + '...' : 'Tin tức thị trường mới nhất từ T\'L Wealth Management');
    const imageUrl = news.imageUrl || 'https://quanlydautucanhan.web.app/assets/images/logo.png';
    const url = `https://quanlydautucanhan.web.app/news/${news.id}`;

    this.titleService.setTitle(title);

    // Standard SEO
    this.metaService.updateTag({ name: 'description', content: description });

    // Open Graph / Facebook / Zalo
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ property: 'og:url', content: url });
  }

}
