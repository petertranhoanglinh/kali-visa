import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from 'src/app/service/news.service';
import { MarketNews } from 'src/app/model/market-news.model';
import { CommentModel } from 'src/app/model/social.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService
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

}
