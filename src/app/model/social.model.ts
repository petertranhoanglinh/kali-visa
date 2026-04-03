export interface PostModel {
  id?: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
  likes?: string[];
  createdAt?: string;
  comments?: CommentModel[]; // For frontend convenience
  showComments?: boolean;    // For UI toggle
}

export interface CommentModel {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: string;
}
